import { all, id, insert, now, one, run, update } from "../db";
import { SEED_LESSONS } from "../seed-lessons";
import { SAVINGS_LESSONS } from "./savings";
import { CREDIT_LESSONS } from "./credit";
import { INVESTMENT_LESSONS } from "./investment";
import { INSURANCE_LESSONS } from "./insurance";
import type { LessonEnrichment } from "./types";

export * from "./types";

/**
 * The enriched curriculum.
 *
 * `seed-lessons.ts` still holds the canonical lesson list — codes, titles,
 * prose bodies, the condensed SMS/USSD versions and the quiz questions — and
 * is untouched, so the USSD menu engine and the SMS dispatcher behave exactly
 * as before. What this module adds is the structured teaching material that
 * the rider portal renders: sections, worked examples, glossaries and action
 * steps, in all three registers.
 *
 * Keeping the two separate is deliberate. A lesson's SMS version has to fit
 * 160 characters; its portal version should not be limited by that.
 */
export const LESSON_ENRICHMENTS: LessonEnrichment[] = [
  ...SAVINGS_LESSONS,
  ...CREDIT_LESSONS,
  ...INVESTMENT_LESSONS,
  ...INSURANCE_LESSONS,
];

const BY_CODE = new Map(LESSON_ENRICHMENTS.map((e) => [e.code, e]));

export function enrichmentFor(code: string): LessonEnrichment | undefined {
  return BY_CODE.get(code);
}

/** Every lesson code the curriculum defines, in teaching order. */
export const CURRICULUM_CODES = SEED_LESSONS.map((l) => l.code);

interface LessonRow {
  id: string;
  code: string;
  sectionsEn: string | null;
  summaryEn: string | null;
  durationMin: number;
}

/**
 * Brings an existing database up to date with the curriculum in the code.
 *
 * `ensureSeeded` only seeds a database that is completely empty, so a
 * deployment that was seeded before this module existed would never receive
 * the enriched content. This walks the curriculum and, for each lesson:
 *
 *   • inserts it if the code is missing entirely (a new lesson);
 *   • fills in the structured sections if they are absent or out of date.
 *
 * It never overwrites a title or body, so a lesson an administrator has
 * edited in the console keeps their wording. It is idempotent and cheap —
 * after the first run every lesson matches and nothing is written.
 */
export async function syncCurriculum(): Promise<{ created: number; enriched: number }> {
  let created = 0;
  let enriched = 0;

  const existing = await all<LessonRow>("SELECT id, code, sectionsEn, summaryEn, durationMin FROM Lesson");
  const byCode = new Map(existing.map((r) => [r.code, r]));

  for (const seed of SEED_LESSONS) {
    let row = byCode.get(seed.code);

    // A lesson defined in code but absent from the database — a new lesson
    // added to the curriculum after this deployment was first seeded.
    if (!row) {
      const lessonId = id("lsn");
      await insert("Lesson", {
        id: lessonId,
        moduleKey: seed.moduleKey,
        order: seed.order,
        code: seed.code,
        titleEn: seed.titleEn,
        titleSw: seed.titleSw,
        titleSh: seed.titleSh,
        bodyEn: seed.bodyEn,
        bodySw: seed.bodySw,
        bodySh: seed.bodySh,
        smsEn: seed.smsEn,
        smsSw: seed.smsSw,
        smsSh: seed.smsSh,
        sectionsEn: "",
        sectionsSw: "",
        sectionsSh: "",
        summaryEn: "",
        summarySw: "",
        summarySh: "",
        durationMin: seed.durationMin,
        active: 1,
      });
      for (const [index, q] of seed.questions.entries()) {
        await insert("QuizQuestion", {
          id: id("qst"),
          lessonId,
          order: index + 1,
          promptEn: q.promptEn,
          promptSw: q.promptSw,
          promptSh: q.promptSh,
          optionsJson: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          explanationEn: q.explanationEn,
          explanationSw: q.explanationSw,
        });
      }
      created++;
      row = { id: lessonId, code: seed.code, sectionsEn: "", summaryEn: "", durationMin: seed.durationMin };
    }

    const enrichment = BY_CODE.get(seed.code);
    if (!enrichment) continue;

    // Only write when the stored sections differ from the ones in the code,
    // so the common case — an up-to-date database — does no writes at all.
    const nextSections = JSON.stringify(enrichment.sections.En);
    if ((row.sectionsEn ?? "") === nextSections) continue;

    await update("Lesson", row.id, {
      sectionsEn: nextSections,
      sectionsSw: JSON.stringify(enrichment.sections.Sw),
      sectionsSh: JSON.stringify(enrichment.sections.Sh),
      summaryEn: enrichment.summary.En,
      summarySw: enrichment.summary.Sw,
      summarySh: enrichment.summary.Sh,
      durationMin: enrichment.durationMin,
    });
    enriched++;
  }

  return { created, enriched };
}

/**
 * Runs the sync once per server instance, in the background.
 *
 * Deliberately not awaited by request handlers: a rider opening the portal
 * should never wait on a maintenance task, and if it fails the lessons still
 * render from their prose bodies.
 */
let syncStarted = false;
export function syncCurriculumOnce(): void {
  if (syncStarted) return;
  syncStarted = true;
  void syncCurriculum().catch((err) => {
    console.error("[bodapesa] curriculum sync failed", err);
  });
}

/** Used by the admin console to show what the curriculum currently holds. */
export async function curriculumStatus(): Promise<{
  total: number;
  enrichedCount: number;
  missingCodes: string[];
}> {
  const rows = await all<{ code: string; sectionsEn: string | null }>("SELECT code, sectionsEn FROM Lesson");
  const present = new Set(rows.map((r) => r.code));
  return {
    total: rows.length,
    enrichedCount: rows.filter((r) => (r.sectionsEn ?? "").length > 2).length,
    missingCodes: CURRICULUM_CODES.filter((c) => !present.has(c)),
  };
}

/** Exported for the admin "rebuild curriculum" action. */
export async function lessonIdForCode(code: string): Promise<string | null> {
  const row = await one<{ id: string }>("SELECT id FROM Lesson WHERE code = ?", [code]);
  return row?.id ?? null;
}

/** Keeps `run` and `now` re-exported for callers that already import from here. */
export { run, now };
