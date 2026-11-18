import type { Lang } from "../types";

/**
 * The structured lesson model.
 *
 * The original curriculum stored each lesson as one block of prose. That
 * reads as a wall of text on a phone, and it gives a rider no way to find
 * the part they came back for. A lesson is now a sequence of typed
 * sections, each of which the renderer draws differently:
 *
 *   intro    — the hook: why this matters to someone riding every day
 *   points   — the idea broken into numbered, titled steps
 *   example  — a worked example in shillings, as a ledger
 *   terms    — the words a rider will meet at a SACCO counter, defined
 *   warn     — the mistake that costs people money
 *   do       — three things to do before closing the app
 *   recap    — the whole lesson in one sentence
 *
 * Sections are stored as JSON on the Lesson row (sectionsEn / sectionsSw /
 * sectionsSh). A lesson with no sections still renders from its prose body,
 * so nothing breaks for a lesson that has not been enriched — including one
 * an administrator creates from the console.
 */
export type SectionKind = "intro" | "points" | "example" | "terms" | "warn" | "do" | "recap";

export interface LedgerRow {
  label: string;
  value: string;
  /** Draws the row as a sum: rule above, filled ground, bold. */
  total?: boolean;
}

export interface KeyPoint {
  title: string;
  detail: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface LessonSection {
  kind: SectionKind;
  /** The section heading, e.g. "Why this matters". */
  heading: string;
  /** Prose. Paragraphs are separated by a blank line. */
  body?: string;
  points?: KeyPoint[];
  ledger?: LedgerRow[];
  terms?: GlossaryTerm[];
  steps?: string[];
  /** A closing line under a ledger, e.g. what the total actually buys. */
  note?: string;
}

/** One lesson's sections in all three registers. */
export interface LessonSectionSet {
  En: LessonSection[];
  Sw: LessonSection[];
  Sh: LessonSection[];
}

/** A one-line summary shown on lesson cards and in the console. */
export interface LessonSummarySet {
  En: string;
  Sw: string;
  Sh: string;
}

export interface LessonEnrichment {
  /** Matches Lesson.code, e.g. "SAV-1". */
  code: string;
  summary: LessonSummarySet;
  sections: LessonSectionSet;
  /** Minutes to read the enriched lesson; replaces the original estimate. */
  durationMin: number;
}

const SUFFIX: Record<Lang, keyof LessonSectionSet> = { EN: "En", SW: "Sw", SH: "Sh" };

/**
 * Parse the stored JSON for one language, falling back the same way the rest
 * of the application does: Sheng → Kiswahili → English.
 *
 * Never throws. A lesson whose sections column holds something unparseable
 * (hand-edited in the console, say) simply renders from its prose body.
 */
export function readSections(
  row: { sectionsEn?: string | null; sectionsSw?: string | null; sectionsSh?: string | null },
  lang: Lang,
): LessonSection[] {
  const order: (keyof LessonSectionSet)[] = [SUFFIX[lang], "Sw", "En"];
  for (const key of order) {
    const raw = row[`sections${key}` as "sectionsEn" | "sectionsSw" | "sectionsSh"];
    if (!raw || typeof raw !== "string" || !raw.trim()) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed as LessonSection[];
    } catch {
      // fall through to the next language
    }
  }
  return [];
}
