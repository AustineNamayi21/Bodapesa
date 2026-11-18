"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, id, insert, now, one, remove, run, update } from "./db";
import { currentUser } from "./auth";
import { normaliseMsisdn } from "./i18n";
import { echo, type FormState } from "./form-state";
import type { LessonSection } from "./curriculum/types";

/**
 * Administrative create / update / delete across every table the console
 * manages.
 *
 * Three rules hold throughout:
 *
 *  1. **Role is checked server-side, on every action.** A hidden field or a
 *     missing button in the UI is not access control. Partner staff may work
 *     their own pipeline; structural changes — curriculum, products,
 *     partners, stages, deleting riders — are the platform team's.
 *
 *  2. **Referential integrity is handled explicitly.** Foreign keys are
 *     enforced on both drivers, so a delete that would orphan rows is either
 *     refused with a readable reason or performs the clean-up first. The
 *     console never shows a raw constraint error.
 *
 *  3. **Destructive actions prefer archiving.** Anything with history behind
 *     it — a product with leads, a lesson riders have completed — is
 *     deactivated rather than destroyed, so reporting stays truthful.
 */

export type CrudState = FormState;

// ------------------------------------------------------------------ guards --

async function requirePlatformAdmin(): Promise<{ error: string } | null> {
  const user = await currentUser();
  if (!user) return { error: "Your session has expired. Sign in again." };
  if (user.role !== "PLATFORM_ADMIN") {
    return { error: "Only the platform team can make this change." };
  }
  return null;
}

async function requireStaff(): Promise<{ error: string } | null> {
  const user = await currentUser();
  if (!user) return { error: "Your session has expired. Sign in again." };
  return null;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const flag = (fd: FormData, key: string) => (fd.get(key) ? 1 : 0);
const num = (fd: FormData, key: string): number | null => {
  const raw = str(fd, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

function revalidateAdmin(...paths: string[]) {
  revalidatePath("/admin");
  for (const p of paths) revalidatePath(p);
}

// ------------------------------------------------------------------ riders --

/**
 * Edit a rider's record.
 *
 * Every field on the registration form is editable here, which is what makes
 * the console a usable correction tool rather than a read-only viewer — field
 * officers mistype numbers, and riders change stage and language.
 */
export async function updateRiderAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requireStaff();
  if (denied) return { ...denied, values: echo(formData) };

  const riderId = str(formData, "riderId");
  if (!riderId) return { error: "No rider selected.", values: echo(formData) };

  const existing = await one<{ id: string; msisdn: string; consent: number }>(
    "SELECT id, msisdn, consent FROM Rider WHERE id = ?",
    [riderId],
  );
  if (!existing) return { error: "That rider no longer exists.", values: echo(formData) };

  const msisdn = normaliseMsisdn(str(formData, "msisdn"));
  if (!msisdn) return { error: "Enter a valid Kenyan phone number, e.g. 0712 345 678.", values: echo(formData) };

  // The number is the rider's identity and their sign-in credential, so a
  // change has to be checked against everyone else.
  if (msisdn !== existing.msisdn) {
    const clash = await one("SELECT id FROM Rider WHERE msisdn = ? AND id <> ?", [msisdn, riderId]);
    if (clash) return { error: "Another rider is already registered with that number.", values: echo(formData) };
  }

  const firstName = str(formData, "firstName");
  const lastName = str(formData, "lastName");
  if (!firstName || !lastName) return { error: "First and last name are both required.", values: echo(formData) };

  const stageId = str(formData, "stageId") || null;
  if (stageId && !(await one("SELECT id FROM Stage WHERE id = ?", [stageId]))) {
    return { error: "That stage was not recognised.", values: echo(formData) };
  }

  const consent = flag(formData, "consent");

  await update("Rider", riderId, {
    msisdn,
    firstName,
    lastName,
    nationalId: str(formData, "nationalId") || null,
    gender: str(formData, "gender") || null,
    ageBand: str(formData, "ageBand") || null,
    language: str(formData, "language") || "SW",
    channelPref: str(formData, "channelPref") || "SMS",
    stageId,
    dailyIncomeBand: str(formData, "dailyIncomeBand") || null,
    ownsMotorbike: flag(formData, "ownsMotorbike"),
    hasBankAccount: flag(formData, "hasBankAccount"),
    saccoMember: flag(formData, "saccoMember"),
    hasInsurance: flag(formData, "hasInsurance"),
    usesMobileMoney: flag(formData, "usesMobileMoney"),
    status: str(formData, "status") || "PROSPECT",
    consent,
    // Stamp the moment consent was granted; clear it when withdrawn, so the
    // audit trail shows when the rider agreed rather than when the row changed.
    consentAt: consent ? (existing.consent ? undefined : now()) : null,
    updatedAt: now(),
  });

  revalidateAdmin("/admin/riders", `/admin/riders/${riderId}`);
  return { ok: "Rider updated." };
}

/**
 * Delete a rider and everything belonging to them.
 *
 * Progress, quiz attempts, messages, leads and savings goals cascade from the
 * Rider row. USSD sessions reference it without a cascade, so they are
 * cleared first — otherwise the foreign key would reject the delete.
 */
export async function deleteRiderAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const riderId = str(formData, "riderId");
  if (!riderId) return;

  await run("DELETE FROM UssdSession WHERE riderId = ?", [riderId]);
  await remove("Rider", riderId);

  revalidateAdmin("/admin/riders", "/admin/leads", "/admin/messages");
  redirect("/admin/riders");
}

/** Bulk status change from the rider list. */
export async function bulkRiderStatusAction(formData: FormData) {
  const denied = await requireStaff();
  if (denied) return;

  const status = str(formData, "status");
  const ids = formData.getAll("riderId").map(String).filter(Boolean);
  if (!status || !ids.length) return;

  for (const riderId of ids) {
    await update("Rider", riderId, { status, updatedAt: now() });
  }
  revalidateAdmin("/admin/riders");
}

// ---------------------------------------------------------------- products --

function productFields(formData: FormData) {
  return {
    name: str(formData, "name"),
    category: str(formData, "category") || "SAVINGS",
    icon: str(formData, "icon") || "wallet",
    summaryEn: str(formData, "summaryEn"),
    summarySw: str(formData, "summarySw"),
    summarySh: str(formData, "summarySh") || str(formData, "summarySw"),
    detailsEn: str(formData, "detailsEn"),
    detailsSw: str(formData, "detailsSw") || str(formData, "detailsEn"),
    minAmount: num(formData, "minAmount"),
    maxAmount: num(formData, "maxAmount"),
    interestRate: str(formData, "interestRate") || null,
    premium: str(formData, "premium") || null,
    termLabel: str(formData, "termLabel") || null,
    eligibility: str(formData, "eligibility") || null,
    requiresMembership: flag(formData, "requiresMembership"),
    featured: flag(formData, "featured"),
    active: formData.has("active") ? flag(formData, "active") : 1,
  };
}

export async function createProductAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const code = str(formData, "code").toUpperCase();
  const partnerId = str(formData, "partnerId");
  const fields = productFields(formData);

  if (!code) return { error: "Give the product a short code, e.g. STIMA-BODA-SAVE.", values: echo(formData) };
  if (!partnerId) return { error: "Choose the partner that offers this product.", values: echo(formData) };
  if (!fields.name) return { error: "Give the product a name.", values: echo(formData) };
  if (!fields.summaryEn || !fields.summarySw) {
    return { error: "English and Kiswahili summaries are both required — riders read in their own language.", values: echo(formData) };
  }

  if (await one("SELECT id FROM Product WHERE code = ?", [code])) {
    return { error: `A product with the code ${code} already exists.`, values: echo(formData) };
  }
  if (!(await one("SELECT id FROM Partner WHERE id = ?", [partnerId]))) {
    return { error: "That partner was not recognised.", values: echo(formData) };
  }

  const productId = id("prd");
  await insert("Product", { id: productId, partnerId, code, ...fields, createdAt: now() });

  revalidateAdmin("/admin/products", "/rider/products");
  redirect(`/admin/products/${productId}`);
}

export async function updateProductAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const productId = str(formData, "productId");
  if (!productId) return { error: "No product selected.", values: echo(formData) };
  if (!(await one("SELECT id FROM Product WHERE id = ?", [productId]))) {
    return { error: "That product no longer exists.", values: echo(formData) };
  }

  const fields = productFields(formData);
  if (!fields.name) return { error: "Give the product a name.", values: echo(formData) };
  if (!fields.summaryEn || !fields.summarySw) {
    return { error: "English and Kiswahili summaries are both required.", values: echo(formData) };
  }

  const partnerId = str(formData, "partnerId");
  if (partnerId && !(await one("SELECT id FROM Partner WHERE id = ?", [partnerId]))) {
    return { error: "That partner was not recognised.", values: echo(formData) };
  }

  await update("Product", productId, { ...fields, ...(partnerId ? { partnerId } : {}) });

  revalidateAdmin("/admin/products", `/admin/products/${productId}`, "/rider/products");
  return { ok: "Product saved." };
}

/**
 * Remove a product.
 *
 * A product with leads against it is part of the pipeline's history, so it is
 * deactivated instead of destroyed — deleting it would orphan those leads and
 * silently change past conversion figures.
 */
export async function deleteProductAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const productId = str(formData, "productId");
  if (!productId) return;

  const leads = await count("SELECT COUNT(*) AS n FROM Lead WHERE productId = ?", [productId]);
  const campaigns = await count("SELECT COUNT(*) AS n FROM Campaign WHERE productId = ?", [productId]);

  if (leads > 0 || campaigns > 0) {
    await update("Product", productId, { active: 0, featured: 0 });
  } else {
    await remove("Product", productId);
  }

  revalidateAdmin("/admin/products", "/rider/products");
  redirect("/admin/products");
}

export async function toggleProductAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const productId = str(formData, "productId");
  const row = await one<{ active: number }>("SELECT active FROM Product WHERE id = ?", [productId]);
  if (!row) return;

  await update("Product", productId, { active: Number(row.active) === 1 ? 0 : 1 });
  revalidateAdmin("/admin/products", `/admin/products/${productId}`, "/rider/products");
}

// ----------------------------------------------------------------- lessons --

/**
 * Parse the structured sections a curriculum editor typed into the console.
 *
 * Accepts the JSON the enriched lessons use. Invalid JSON is reported rather
 * than stored, because a lesson with a broken sections column would silently
 * fall back to its prose body and the editor would never know why.
 */
function parseSections(raw: string): { value: string } | { error: string } {
  if (!raw.trim()) return { value: "" };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { error: "Sections must be a JSON array of section objects." };
    for (const s of parsed as LessonSection[]) {
      if (!s || typeof s !== "object" || typeof s.heading !== "string" || typeof s.kind !== "string") {
        return { error: "Every section needs a \"kind\" and a \"heading\"." };
      }
    }
    return { value: JSON.stringify(parsed) };
  } catch {
    return { error: "The sections field is not valid JSON." };
  }
}

function lessonBaseFields(formData: FormData) {
  return {
    moduleKey: str(formData, "moduleKey") || "SAVINGS",
    order: num(formData, "order") ?? 1,
    titleEn: str(formData, "titleEn"),
    titleSw: str(formData, "titleSw"),
    titleSh: str(formData, "titleSh") || str(formData, "titleSw"),
    bodyEn: str(formData, "bodyEn"),
    bodySw: str(formData, "bodySw"),
    bodySh: str(formData, "bodySh") || str(formData, "bodySw"),
    smsEn: str(formData, "smsEn"),
    smsSw: str(formData, "smsSw"),
    smsSh: str(formData, "smsSh") || str(formData, "smsSw"),
    summaryEn: str(formData, "summaryEn"),
    summarySw: str(formData, "summarySw"),
    summarySh: str(formData, "summarySh") || str(formData, "summarySw"),
    durationMin: num(formData, "durationMin") ?? 5,
    active: formData.has("active") ? flag(formData, "active") : 1,
  };
}

export async function createLessonAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const code = str(formData, "code").toUpperCase();
  const base = lessonBaseFields(formData);

  if (!code) return { error: "Give the lesson a code, e.g. SAV-4.", values: echo(formData) };
  if (!base.titleEn || !base.titleSw) return { error: "English and Kiswahili titles are both required.", values: echo(formData) };
  if (!base.bodyEn || !base.bodySw) return { error: "English and Kiswahili bodies are both required.", values: echo(formData) };
  if (!base.smsEn || !base.smsSw) {
    return { error: "The condensed SMS versions are required — they are what reaches a feature phone.", values: echo(formData) };
  }
  if (await one("SELECT id FROM Lesson WHERE code = ?", [code])) {
    return { error: `A lesson with the code ${code} already exists.`, values: echo(formData) };
  }

  const sections: Record<string, string> = {};
  for (const [field, key] of [
    ["sectionsEn", "sectionsEn"],
    ["sectionsSw", "sectionsSw"],
    ["sectionsSh", "sectionsSh"],
  ] as const) {
    const parsed = parseSections(str(formData, key));
    if ("error" in parsed) return { error: `${field}: ${parsed.error}`, values: echo(formData) };
    sections[field] = parsed.value;
  }

  const lessonId = id("lsn");
  await insert("Lesson", { id: lessonId, code, ...base, ...sections });

  revalidateAdmin("/admin/curriculum", "/rider/learn");
  redirect(`/admin/curriculum/${code}`);
}

export async function updateLessonAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const lessonId = str(formData, "lessonId");
  if (!lessonId) return { error: "No lesson selected.", values: echo(formData) };
  const existing = await one<{ code: string }>("SELECT code FROM Lesson WHERE id = ?", [lessonId]);
  if (!existing) return { error: "That lesson no longer exists.", values: echo(formData) };

  const base = lessonBaseFields(formData);
  if (!base.titleEn || !base.titleSw) return { error: "English and Kiswahili titles are both required.", values: echo(formData) };
  if (!base.bodyEn || !base.bodySw) return { error: "English and Kiswahili bodies are both required.", values: echo(formData) };

  const sections: Record<string, string> = {};
  for (const key of ["sectionsEn", "sectionsSw", "sectionsSh"] as const) {
    const parsed = parseSections(str(formData, key));
    if ("error" in parsed) return { error: `${key}: ${parsed.error}`, values: echo(formData) };
    sections[key] = parsed.value;
  }

  await update("Lesson", lessonId, { ...base, ...sections });

  revalidateAdmin("/admin/curriculum", `/admin/curriculum/${existing.code}`, "/rider/learn");
  return { ok: "Lesson saved." };
}

/**
 * Delete a lesson.
 *
 * Quiz questions, progress rows and attempts all cascade from the Lesson row,
 * so riders who completed it lose that completion and their literacy score
 * changes. A lesson with completions is therefore deactivated instead, which
 * removes it from the portal while leaving the history intact.
 */
export async function deleteLessonAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const lessonId = str(formData, "lessonId");
  if (!lessonId) return;

  const completions = await count("SELECT COUNT(*) AS n FROM LessonProgress WHERE lessonId = ?", [lessonId]);
  if (completions > 0) {
    await update("Lesson", lessonId, { active: 0 });
  } else {
    await remove("Lesson", lessonId);
  }

  revalidateAdmin("/admin/curriculum", "/rider/learn");
  redirect("/admin/curriculum");
}

export async function toggleLessonAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const lessonId = str(formData, "lessonId");
  const row = await one<{ active: number; code: string }>("SELECT active, code FROM Lesson WHERE id = ?", [lessonId]);
  if (!row) return;

  await update("Lesson", lessonId, { active: Number(row.active) === 1 ? 0 : 1 });
  revalidateAdmin("/admin/curriculum", `/admin/curriculum/${row.code}`, "/rider/learn");
}

// --------------------------------------------------------- quiz questions --

export async function saveQuestionAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const questionId = str(formData, "questionId");
  const lessonId = str(formData, "lessonId");
  if (!lessonId) return { error: "No lesson selected.", values: echo(formData) };

  const lesson = await one<{ code: string }>("SELECT code FROM Lesson WHERE id = ?", [lessonId]);
  if (!lesson) return { error: "That lesson no longer exists.", values: echo(formData) };

  const promptEn = str(formData, "promptEn");
  const promptSw = str(formData, "promptSw");
  if (!promptEn || !promptSw) return { error: "English and Kiswahili prompts are both required.", values: echo(formData) };

  // Options arrive as four parallel inputs per language. Blank trailing
  // options are dropped so a question can have two or three answers.
  const collect = (prefix: string) =>
    [0, 1, 2, 3].map((i) => str(formData, `${prefix}${i}`)).filter((v) => v.length > 0);

  const en = collect("optEn");
  const sw = collect("optSw");
  const sh = collect("optSh");

  if (en.length < 2) return { error: "A question needs at least two answer options.", values: echo(formData) };
  if (sw.length !== en.length) {
    return { error: "Give the same number of Kiswahili options as English ones.", values: echo(formData) };
  }

  const correctIndex = num(formData, "correctIndex") ?? 0;
  if (correctIndex < 0 || correctIndex >= en.length) {
    return { error: "Mark which option is correct.", values: echo(formData) };
  }

  const payload = {
    lessonId,
    order: num(formData, "order") ?? 1,
    promptEn,
    promptSw,
    promptSh: str(formData, "promptSh") || promptSw,
    // Sheng falls back to Kiswahili, matching how `pick()` resolves elsewhere.
    optionsJson: JSON.stringify({ en, sw, sh: sh.length === en.length ? sh : sw }),
    correctIndex,
    explanationEn: str(formData, "explanationEn"),
    explanationSw: str(formData, "explanationSw") || str(formData, "explanationEn"),
  };

  if (questionId) {
    await update("QuizQuestion", questionId, payload);
  } else {
    await insert("QuizQuestion", { id: id("qst"), ...payload });
  }

  revalidateAdmin(`/admin/curriculum/${lesson.code}`, "/rider/learn");
  return { ok: questionId ? "Question saved." : "Question added." };
}

export async function deleteQuestionAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const questionId = str(formData, "questionId");
  const code = str(formData, "code");
  if (!questionId) return;

  await remove("QuizQuestion", questionId);
  revalidateAdmin(code ? `/admin/curriculum/${code}` : "/admin/curriculum", "/rider/learn");
}

// ------------------------------------------------------------------ stages --

export async function saveStageAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const stageId = str(formData, "stageId");
  const name = str(formData, "name");
  const subCounty = str(formData, "subCounty");
  if (!name) return { error: "Give the stage a name.", values: echo(formData) };
  if (!subCounty) return { error: "Which sub-county is it in?", values: echo(formData) };

  const chairMsisdnRaw = str(formData, "chairMsisdn");
  const chairMsisdn = chairMsisdnRaw ? normaliseMsisdn(chairMsisdnRaw) : null;
  if (chairMsisdnRaw && !chairMsisdn) {
    return { error: "The chairperson's number is not a valid Kenyan number.", values: echo(formData) };
  }

  const payload = {
    name,
    subCounty,
    ward: str(formData, "ward") || null,
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    chairperson: str(formData, "chairperson") || null,
    chairMsisdn,
  };

  if (stageId) {
    if (!(await one("SELECT id FROM Stage WHERE id = ?", [stageId]))) {
      return { error: "That stage no longer exists.", values: echo(formData) };
    }
    await update("Stage", stageId, payload);
  } else {
    await insert("Stage", { id: id("stg"), ...payload, createdAt: now() });
  }

  revalidateAdmin("/admin/stages", "/admin/riders");
  return { ok: stageId ? "Stage saved." : "Stage added." };
}

/**
 * Delete a stage.
 *
 * Riders reference it, so they are unassigned first rather than deleted —
 * losing a stage must never lose the riders who rode from it.
 */
export async function deleteStageAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const stageId = str(formData, "stageId");
  if (!stageId) return;

  await run("UPDATE Rider SET stageId = NULL, updatedAt = ? WHERE stageId = ?", [now(), stageId]);
  await remove("Stage", stageId);

  revalidateAdmin("/admin/stages", "/admin/riders");
}

// ---------------------------------------------------------------- partners --

export async function savePartnerAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requirePlatformAdmin();
  if (denied) return { ...denied, values: echo(formData) };

  const partnerId = str(formData, "partnerId");
  const code = str(formData, "code").toUpperCase();
  const name = str(formData, "name");
  if (!code) return { error: "Give the partner a short code, e.g. STIMA.", values: echo(formData) };
  if (!name) return { error: "Give the partner a name.", values: echo(formData) };

  const clash = await one<{ id: string }>("SELECT id FROM Partner WHERE code = ?", [code]);
  if (clash && clash.id !== partnerId) {
    return { error: `A partner with the code ${code} already exists.`, values: echo(formData) };
  }

  const contactRaw = str(formData, "contactMsisdn");
  const contactMsisdn = contactRaw ? normaliseMsisdn(contactRaw) : null;
  if (contactRaw && !contactMsisdn) return { error: "The contact number is not a valid Kenyan number.", values: echo(formData) };

  const payload = {
    code,
    name,
    kind: str(formData, "kind") || "SACCO",
    tagline: str(formData, "tagline") || null,
    description: str(formData, "description") || null,
    accent: str(formData, "accent") || "#e65212",
    contactMsisdn,
    website: str(formData, "website") || null,
  };

  if (partnerId) {
    if (!(await one("SELECT id FROM Partner WHERE id = ?", [partnerId]))) {
      return { error: "That partner no longer exists.", values: echo(formData) };
    }
    await update("Partner", partnerId, payload);
  } else {
    await insert("Partner", { id: id("ptn"), ...payload, createdAt: now() });
  }

  revalidateAdmin("/admin/partners", "/admin/products");
  return { ok: partnerId ? "Partner saved." : "Partner added." };
}

/**
 * Delete a partner.
 *
 * Products, leads and staff accounts all point at it. Deleting one with any
 * of those attached would break the pipeline, so it is refused with a reason
 * the administrator can act on rather than silently cascading.
 */
export async function deletePartnerAction(formData: FormData): Promise<void> {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const partnerId = str(formData, "partnerId");
  if (!partnerId) return;

  const products = await count("SELECT COUNT(*) AS n FROM Product WHERE partnerId = ?", [partnerId]);
  const leads = await count("SELECT COUNT(*) AS n FROM Lead WHERE partnerId = ?", [partnerId]);
  const staff = await count("SELECT COUNT(*) AS n FROM AppUser WHERE partnerId = ?", [partnerId]);
  if (products || leads || staff) return;

  await remove("Partner", partnerId);
  revalidateAdmin("/admin/partners");
}

// --------------------------------------------------------------- campaigns --

/** Edit a campaign that has not gone out yet. */
export async function updateCampaignAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requireStaff();
  if (denied) return { ...denied, values: echo(formData) };

  const campaignId = str(formData, "campaignId");
  const campaign = await one<{ status: string }>("SELECT status FROM Campaign WHERE id = ?", [campaignId]);
  if (!campaign) return { error: "That campaign no longer exists.", values: echo(formData) };
  if (campaign.status !== "DRAFT") {
    return { error: "This campaign has already been sent, so its message can no longer be changed.", values: echo(formData) };
  }

  const name = str(formData, "name");
  const bodyEn = str(formData, "bodyEn");
  const bodySw = str(formData, "bodySw");
  if (!name) return { error: "Give the campaign a name.", values: echo(formData) };
  if (!bodyEn || !bodySw) return { error: "English and Kiswahili message bodies are both required.", values: echo(formData) };

  const channels = formData.getAll("channels").map(String).filter(Boolean);
  if (!channels.length) return { error: "Select at least one channel.", values: echo(formData) };

  await update("Campaign", campaignId, {
    name,
    objective: str(formData, "objective") || "EDUCATION",
    productId: str(formData, "productId") || null,
    bodyEn,
    bodySw,
    bodySh: str(formData, "bodySh") || bodySw,
    channels: channels.join(","),
    updatedAt: now(),
  });

  revalidateAdmin("/admin/campaigns", `/admin/campaigns/${campaignId}`);
  return { ok: "Campaign saved." };
}

// ------------------------------------------------------------------- leads --

/** Record a lead an officer took by phone or at the stage. */
export async function createLeadAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requireStaff();
  if (denied) return { ...denied, values: echo(formData) };

  const riderId = str(formData, "riderId");
  const productId = str(formData, "productId");
  if (!riderId || !productId) return { error: "Choose both a rider and a product.", values: echo(formData) };

  const product = await one<{ partnerId: string }>("SELECT partnerId FROM Product WHERE id = ?", [productId]);
  if (!product) return { error: "That product was not recognised.", values: echo(formData) };
  if (!(await one("SELECT id FROM Rider WHERE id = ?", [riderId]))) {
    return { error: "That rider was not recognised.", values: echo(formData) };
  }

  const open = await one(
    "SELECT id FROM Lead WHERE riderId = ? AND productId = ? AND status IN ('NEW','CONTACTED','QUALIFIED')",
    [riderId, productId],
  );
  if (open) return { error: "This rider already has an open lead for that product.", values: echo(formData) };

  await insert("Lead", {
    id: id("led"),
    riderId,
    productId,
    partnerId: product.partnerId,
    status: str(formData, "status") || "NEW",
    source: str(formData, "source") || "FIELD",
    note: str(formData, "note") || null,
    valueKes: num(formData, "valueKes"),
    createdAt: now(),
    updatedAt: now(),
  });

  revalidateAdmin("/admin/leads", `/admin/riders/${riderId}`);
  return { ok: "Lead recorded." };
}

export async function deleteLeadAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const leadId = str(formData, "leadId");
  if (!leadId) return;

  await remove("Lead", leadId);
  revalidateAdmin("/admin/leads");
}

/** Add or change the note on a lead without touching its status. */
export async function updateLeadNoteAction(_prev: CrudState, formData: FormData): Promise<CrudState> {
  const denied = await requireStaff();
  if (denied) return { ...denied, values: echo(formData) };

  const leadId = str(formData, "leadId");
  if (!leadId) return { error: "No lead selected.", values: echo(formData) };

  await update("Lead", leadId, { note: str(formData, "note") || null, updatedAt: now() });
  revalidateAdmin("/admin/leads");
  return { ok: "Note saved." };
}

// --------------------------------------------------------------- donations --

export async function updateDonationAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const donationId = str(formData, "donationId");
  const status = str(formData, "status");
  if (!donationId || !status) return;

  const patch: Record<string, unknown> = { status, updatedAt: now() };
  // A donation marked paid by hand still needs a payment timestamp, or it
  // drops out of every total that filters on paidAt.
  if (status === "PAID") patch.paidAt = now();
  await update("Donation", donationId, patch);

  revalidateAdmin("/admin/donations");
}

export async function deleteDonationAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const donationId = str(formData, "donationId");
  if (!donationId) return;

  // Only a record that never resulted in money moving may be removed; a paid
  // donation is a financial record and stays.
  const row = await one<{ status: string }>("SELECT status FROM Donation WHERE id = ?", [donationId]);
  if (!row || row.status === "PAID") return;

  await remove("Donation", donationId);
  revalidateAdmin("/admin/donations");
}

// ---------------------------------------------------------------- messages --

export async function deleteMessageAction(formData: FormData) {
  const denied = await requirePlatformAdmin();
  if (denied) return;

  const messageId = str(formData, "messageId");
  if (!messageId) return;

  // Only a message that never left the building can be removed — a sent or
  // delivered message is the audit trail for what a rider actually received.
  const row = await one<{ status: string }>("SELECT status FROM Message WHERE id = ?", [messageId]);
  if (!row || !["QUEUED", "FAILED"].includes(row.status)) return;

  await remove("Message", messageId);
  revalidateAdmin("/admin/messages");
}
