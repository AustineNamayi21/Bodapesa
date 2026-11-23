"use server";

import { revalidatePath } from "next/cache";

import { currentUser } from "@/lib/auth";
import { all, count, id, insert, now, one, run, update } from "@/lib/db";
import { CATALOGUE } from "@/lib/catalogue";
import { CAMPAIGNS } from "@/lib/catalogue/campaigns";
import type { FormState } from "@/lib/form-state";
import { PURGE_PHRASE, RESTOCK_PHRASE, type PurgePreview } from "@/lib/maintenance-shared";
import { seedDemoData } from "@/lib/seed";

/**
 * Removing the demonstration data.
 *
 * The seed fills a fresh database with 240 invented riders so the console has
 * something to show before anyone has signed up. Their messages were never
 * actually sent and their leads were never actually raised, so every figure
 * computed from them is fiction — and the dashboard reports it with the same
 * confidence as a real number.
 *
 * This is the one place in the application that deletes people's records in
 * bulk, so it is deliberately awkward: platform admins only, a preview of
 * exactly what will go, and a typed confirmation.
 */

export async function purgePreview(keep: number): Promise<PurgePreview> {
  const keepN = Math.max(0, Math.min(100, Math.floor(keep)));

  const kept = await all<{
    id: string;
    name: string;
    msisdn: string;
    createdAt: string;
    isSynthetic: number;
  }>(
    `SELECT id, firstName || ' ' || lastName AS name, msisdn, createdAt, isSynthetic
       FROM Rider ORDER BY createdAt DESC LIMIT ?`,
    [keepN],
  );

  const ridersTotal = await count("SELECT COUNT(*) AS n FROM Rider");

  return {
    ridersTotal,
    ridersSynthetic: await count("SELECT COUNT(*) AS n FROM Rider WHERE isSynthetic = 1"),
    ridersToDelete: Math.max(0, ridersTotal - kept.length),
    ridersKept: kept,
    messages: await count("SELECT COUNT(*) AS n FROM Message"),
    leads: await count("SELECT COUNT(*) AS n FROM Lead"),
    conversations: await count("SELECT COUNT(*) AS n FROM Conversation"),
    signals: await count("SELECT COUNT(*) AS n FROM RiderSignal"),
    lessonProgress: await count("SELECT COUNT(*) AS n FROM LessonProgress"),
    goals: await count("SELECT COUNT(*) AS n FROM SavingsGoal"),
    campaigns: await count("SELECT COUNT(*) AS n FROM Campaign"),
  };
}

/**
 * Deletes every rider except the most recently registered `keep`, and
 * everything hanging off them.
 *
 * Most dependent tables declare ON DELETE CASCADE, so removing the rider row
 * takes their progress, quiz attempts, messages, leads, goals, conversations
 * and signals with it. UssdSession is the exception — it references Rider
 * without a cascade — so those rows are cleared first or the delete fails on
 * a foreign key.
 *
 * Deliberately not wrapped in one transaction across the whole set: on a
 * large register that would hold a long write lock. Each step is independent
 * and re-runnable, so a failure part way leaves a consistent database that
 * running it again will finish.
 */
export async function purgeDemoDataAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await currentUser();
  if (!admin || admin.role !== "PLATFORM_ADMIN") {
    return { error: "Only a platform admin can remove data." };
  }

  const phrase = String(formData.get("confirm") ?? "").trim();
  if (phrase !== PURGE_PHRASE) {
    return { error: `Type ${PURGE_PHRASE} exactly to confirm.`, field: "confirm" };
  }

  const keep = Math.max(0, Math.min(100, Number(formData.get("keep") ?? 3) || 0));
  const alsoCampaigns = String(formData.get("campaigns") ?? "") === "1";

  const kept = await all<{ id: string }>("SELECT id FROM Rider ORDER BY createdAt DESC LIMIT ?", [keep]);
  const keptIds = kept.map((r) => r.id);

  const before = {
    riders: await count("SELECT COUNT(*) AS n FROM Rider"),
    messages: await count("SELECT COUNT(*) AS n FROM Message"),
    leads: await count("SELECT COUNT(*) AS n FROM Lead"),
  };

  // An empty keep list would make `NOT IN ()` invalid SQL, so the two cases
  // are spelled out rather than built by string concatenation.
  if (keptIds.length) {
    const marks = keptIds.map(() => "?").join(",");
    await run(`DELETE FROM UssdSession WHERE riderId IS NOT NULL AND riderId NOT IN (${marks})`, keptIds);
    await run(`DELETE FROM Rider WHERE id NOT IN (${marks})`, keptIds);
  } else {
    await run("DELETE FROM UssdSession WHERE riderId IS NOT NULL", []);
    await run("DELETE FROM Rider", []);
  }

  // Campaigns are not tied to a rider, so they survive the cascade. Their
  // sends are gone with the riders, which would leave them reporting zero
  // delivery for ever — misleading in a different way.
  let campaignsRemoved = 0;
  if (alsoCampaigns) {
    campaignsRemoved = await count("SELECT COUNT(*) AS n FROM Campaign");
    await run("DELETE FROM Message WHERE campaignId IS NOT NULL", []);
    await run("DELETE FROM Campaign", []);
  }

  const after = {
    riders: await count("SELECT COUNT(*) AS n FROM Rider"),
    messages: await count("SELECT COUNT(*) AS n FROM Message"),
    leads: await count("SELECT COUNT(*) AS n FROM Lead"),
  };

  // Anything left pointing at a rider that no longer exists would quietly
  // skew the reports, so say so rather than assume the cascades fired.
  const orphans = await one<{ n: number }>(
    `SELECT (SELECT COUNT(*) FROM LessonProgress lp WHERE NOT EXISTS (SELECT 1 FROM Rider r WHERE r.id = lp.riderId))
          + (SELECT COUNT(*) FROM Message m WHERE NOT EXISTS (SELECT 1 FROM Rider r WHERE r.id = m.riderId))
          + (SELECT COUNT(*) FROM Lead l WHERE NOT EXISTS (SELECT 1 FROM Rider r WHERE r.id = l.riderId))
          + (SELECT COUNT(*) FROM Conversation c WHERE NOT EXISTS (SELECT 1 FROM Rider r WHERE r.id = c.riderId))
          AS n`,
  );

  for (const path of [
    "/admin",
    "/admin/riders",
    "/admin/leads",
    "/admin/warm",
    "/admin/conversations",
    "/admin/campaigns",
    "/admin/messages",
    "/admin/stages",
    "/admin/maintenance",
    "/",
  ]) {
    revalidatePath(path);
  }

  const removed = [
    `${before.riders - after.riders} riders`,
    `${before.messages - after.messages} messages`,
    `${before.leads - after.leads} enquiries`,
    campaignsRemoved ? `${campaignsRemoved} campaigns` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const orphanCount = Number(orphans?.n ?? 0);
  return {
    ok:
      `Removed ${removed}. ${after.riders} riders remain.` +
      (orphanCount ? ` ${orphanCount} orphaned rows were left behind — tell your developer.` : ""),
  };
}

/* ═══════════════════════════════════════════════ verified catalogue ══ */

/**
 * Replaces the seeded demonstration products with the researched ones.
 *
 * Matching is by product code, so this is an upsert: run it again after a
 * partner changes its terms and the existing rows are updated in place,
 * keeping their ids and therefore the enquiries and conversations already
 * attached to them.
 *
 * Seeded products not in the catalogue are deactivated rather than deleted.
 * A deleted product would take its enquiry history with it; a deactivated
 * one disappears from the rider's list but the record of who asked about
 * what survives.
 */
export async function installCatalogueAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await currentUser();
  if (!admin || admin.role !== "PLATFORM_ADMIN") {
    return { error: "Only a platform admin can change the catalogue." };
  }
  if (String(formData.get("confirm") ?? "") !== "1") {
    return { error: "Tick the box to confirm." };
  }

  const partners = await all<{ id: string; code: string }>("SELECT id, code FROM Partner");
  const byCode = new Map(partners.map((p) => [p.code.toUpperCase(), p.id]));

  let created = 0;
  let updated = 0;
  const missing: string[] = [];
  const installedCodes: string[] = [];

  for (const [partnerCode, entries] of Object.entries(CATALOGUE)) {
    const partnerId = byCode.get(partnerCode);
    if (!partnerId) {
      missing.push(partnerCode);
      continue;
    }

    for (const e of entries) {
      installedCodes.push(e.code);
      const row = {
        partnerId,
        name: e.name,
        category: e.category,
        icon: e.icon,
        summaryEn: e.summaryEn,
        summarySw: e.summarySw,
        summarySh: e.summarySh,
        detailsEn: e.detailsEn,
        detailsSw: e.detailsSw,
        minAmount: e.minAmount ?? null,
        maxAmount: e.maxAmount ?? null,
        interestRate: e.interestRate ?? null,
        premium: e.premium ?? null,
        termLabel: e.termLabel ?? null,
        eligibility: e.eligibility ?? null,
        requiresMembership: e.requiresMembership,
        featured: e.featured,
        active: 1,
        sourceUrl: e.sourceUrl,
        verifiedOn: e.verifiedOn,
      };

      const existing = await one<{ id: string }>("SELECT id FROM Product WHERE code = ?", [e.code]);
      if (existing) {
        await update("Product", existing.id, row);
        updated++;
      } else {
        await insert("Product", { id: id("prd"), code: e.code, createdAt: now(), ...row });
        created++;
      }
    }
  }

  // Anything left over is seeded demonstration stock. Retire it quietly.
  let retired = 0;
  if (installedCodes.length) {
    const marks = installedCodes.map(() => "?").join(",");
    retired = await count(
      `SELECT COUNT(*) AS n FROM Product WHERE active = 1 AND code NOT IN (${marks})`,
      installedCodes,
    );
    await run(`UPDATE Product SET active = 0 WHERE code NOT IN (${marks})`, installedCodes);
  }

  for (const path of ["/admin/products", "/admin/maintenance", "/rider/products", "/admin", "/"]) {
    revalidatePath(path);
  }

  const parts = [
    `${created} products added`,
    `${updated} updated`,
    retired ? `${retired} demonstration products retired` : null,
    missing.length ? `No partner found with code ${missing.join(" or ")} — those products were skipped.` : null,
  ].filter(Boolean);

  return { ok: parts.join(", ") + "." };
}

/**
 * Installs one draft campaign per product.
 *
 * Everything lands as a DRAFT. Nothing here sends a message: an operator
 * still has to open the campaign, look at the audience count the segment
 * resolves to, and press send. That is deliberate — these go to real
 * phones, cost real money per rider, and a bulk installer that also
 * dispatched would be a loaded gun.
 *
 * Campaigns are matched to products by product code and skipped if the
 * product is not installed, so running the catalogue installer first is a
 * prerequisite rather than an assumption.
 */
export async function installCampaignsAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await currentUser();
  if (!admin || admin.role !== "PLATFORM_ADMIN") {
    return { error: "Only a platform admin can add campaigns." };
  }
  if (String(formData.get("confirm") ?? "") !== "1") {
    return { error: "Tick the box to confirm." };
  }

  const products = await all<{ id: string; code: string }>("SELECT id, code FROM Product");
  const byCode = new Map(products.map((p) => [p.code, p.id]));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const c of CAMPAIGNS) {
    const productId = byCode.get(c.productCode);
    if (!productId) {
      skipped++;
      continue;
    }

    const row = {
      name: c.name,
      objective: c.objective,
      productId,
      bodyEn: c.bodyEn,
      bodySw: c.bodySw,
      bodySh: c.bodySh,
      channels: c.channels,
      segmentJson: JSON.stringify(c.segment),
      updatedAt: now(),
    };

    // Matched on name so a re-run updates the wording rather than stacking
    // a second copy. A campaign already sent is left alone — rewriting the
    // body of something riders have received would falsify the record.
    const existing = await one<{ id: string; status: string }>(
      "SELECT id, status FROM Campaign WHERE name = ?",
      [c.name],
    );
    if (existing) {
      if (existing.status === "SENT") continue;
      await update("Campaign", existing.id, row);
      updated++;
    } else {
      await insert("Campaign", {
        id: id("cmp"),
        status: "DRAFT",
        scheduledAt: null,
        sentAt: null,
        createdById: admin.id,
        createdAt: now(),
        ...row,
      });
      created++;
    }
  }

  for (const path of ["/admin/campaigns", "/admin/maintenance", "/admin"]) {
    revalidatePath(path);
  }

  const parts = [
    `${created} campaigns drafted`,
    updated ? `${updated} updated` : null,
    skipped ? `${skipped} skipped — install the product catalogue first` : null,
  ].filter(Boolean);

  return {
    ok: `${parts.join(", ")}. Nothing has been sent — open each one, check the audience, then send.`,
  };
}


/**
 * Rebuilds the synthetic demonstration dataset.
 *
 * Written for the case the seed script cannot reach: a deployed database whose
 * connection string the operator does not hold. It clears the previous
 * demonstration rows and writes a fresh set in their place.
 *
 * Deliberately narrow about what it touches. Partners, staff accounts, stages,
 * products and the curriculum are left alone — so the administrator running it
 * keeps their own login and the verified catalogue survives. Only rider-side
 * data is replaced, which is the only data that was ever invented.
 *
 * Platform admins only, behind a typed confirmation, and refuses outright if
 * the register holds anyone real: synthetic rows are fair game, a real rider's
 * record is not.
 */
export async function restockDemoDataAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await currentUser();
  if (!admin || admin.role !== "PLATFORM_ADMIN") {
    return { error: "Only a platform admin can rebuild demonstration data." };
  }

  const phrase = String(formData.get("confirm") ?? "").trim();
  if (phrase !== RESTOCK_PHRASE) {
    return { error: `Type ${RESTOCK_PHRASE} exactly to confirm.`, field: "confirm" };
  }

  // A rider who signed up for real is not demonstration data. Refusing here
  // rather than deleting is the whole reason this is safe to expose.
  const real = await count("SELECT COUNT(*) AS n FROM Rider WHERE isSynthetic = 0");
  if (real > 0) {
    return {
      error:
        `${real} rider${real === 1 ? "" : "s"} in this register ${real === 1 ? "was" : "were"} not generated. ` +
        "Rebuilding would delete them, so it has been refused — remove them deliberately first if that is what you want.",
      field: "confirm",
    };
  }

  const before = await count("SELECT COUNT(*) AS n FROM Rider");

  // Riders cascade to progress, attempts, messages, leads, conversations,
  // signals, goals and deposits. Campaigns and donations hang off no rider, so
  // they are cleared by hand or the next run would double them.
  await run("DELETE FROM UssdSession WHERE riderId IS NOT NULL", []);
  await run("DELETE FROM Rider", []);
  await run("DELETE FROM Message", []);
  await run("DELETE FROM Campaign", []);
  await run("DELETE FROM Donation", []);

  let result;
  try {
    result = await seedDemoData();
  } catch (e) {
    return { error: `Could not rebuild: ${e instanceof Error ? e.message : String(e)}` };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/maintenance");
  revalidatePath("/admin/riders");
  revalidatePath("/admin/conversations");
  revalidatePath("/admin/warm");

  return {
    ok:
      `Replaced ${before} rider${before === 1 ? "" : "s"} with ${result.riders}. ` +
      `${result.leads} leads, ${result.conversations} conversations, ${result.messages} messages, ` +
      `${result.signals} signals, ${result.donations} donations.`,
  };
}
