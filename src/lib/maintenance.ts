"use server";

import { revalidatePath } from "next/cache";

import { currentUser } from "@/lib/auth";
import { all, count, one, run } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { PURGE_PHRASE, type PurgePreview } from "@/lib/maintenance-shared";

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
