import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { all, one } from "@/lib/db";
import { completedLessonIds, requireRider } from "@/lib/rider";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import { MODULE_PHOTO } from "@/lib/photos";
import { readSections } from "@/lib/curriculum/types";
import { Photo } from "@/components/brand";
import { LessonBody } from "@/components/lesson";
import Quiz from "./Quiz";
import type { Lang, Lesson, QuizQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

const CONTENTS_LABEL: Record<Lang, string> = {
  EN: "In this lesson",
  SW: "Katika somo hili",
  SH: "Kwa lesson hii",
};

export default async function LessonPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { rider, lang } = await requireRider();

  const lesson = await one<Lesson>("SELECT * FROM Lesson WHERE code = ? AND active = 1", [code]);
  if (!lesson) notFound();

  const questions = await all<QuizQuestion>(`SELECT * FROM QuizQuestion WHERE lessonId = ? ORDER BY "order"`, [
    lesson.id,
  ]);

  const done = (await completedLessonIds(rider.id)).has(lesson.id);

  const next = await one<{ code: string; titleEn: string; titleSw: string; titleSh: string }>(
    `SELECT code, titleEn, titleSw, titleSh FROM Lesson
      WHERE active = 1 AND moduleKey = ? AND "order" > ?
      ORDER BY "order" LIMIT 1`,
    [lesson.moduleKey, lesson.order],
  );

  // Structured sections where the lesson has been enriched; the original
  // prose body otherwise, so every lesson renders either way.
  const sections = readSections(lesson, lang);
  const paragraphs = sections.length ? [] : pick(lesson, "body", lang).split("\n\n").filter(Boolean);
  const summary = pick(lesson, "summary", lang);

  return (
    <article>
      {/* ── the masthead carries the module photograph at full bleed ──── */}
      <header className="frame-hero" style={{ minHeight: "clamp(300px, 44vh, 400px)" }}>
        <div className="frame-media animate-kenburns">
          <Photo name={MODULE_PHOTO[lesson.moduleKey] ?? "stage"} sizes="448px" priority />
        </div>
        <div className="scrim" />

        <div style={{ position: "absolute", top: "1rem", left: "1.25rem", zIndex: 1 }}>
          <Link href="/rider/learn" className="cta" style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.8)" }}>
            <ArrowLeft size={13} />
            <span>{t("learn", lang)}</span>
          </Link>
        </div>

        <div style={{ width: "100%", padding: "0 1.25rem 1.5rem" }}>
          <p className="eyebrow eyebrow-rule animate-rise" style={{ color: "#fff" }}>
            {MODULE_LABELS[lesson.moduleKey]?.[lang] ?? lesson.moduleKey}
          </p>
          <h1 className="display-lg animate-rise d-1" style={{ marginTop: "0.9rem", color: "#fff" }}>
            {pick(lesson, "title", lang)}
          </h1>
          <p
            className="animate-rise d-2"
            style={{
              marginTop: "0.9rem",
              display: "flex",
              gap: "1.25rem",
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.62)",
            }}
          >
            <span>
              {lesson.durationMin} {t("minRead", lang)}
            </span>
            {done ? <span style={{ color: "var(--accent)" }}>{t("done", lang)}</span> : null}
          </p>
        </div>
      </header>

      <div style={{ padding: "1.75rem 1.25rem 0" }}>
        {summary ? (
          <p
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.6,
              color: "#fff",
              fontWeight: 500,
              paddingBottom: "1.75rem",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            {summary}
          </p>
        ) : null}

        {/* ── contents ─────────────────────────────────────────────────── */}
        {sections.length >= 3 ? (
          <details style={{ marginTop: "1.75rem", borderBottom: "1px solid var(--rule)", paddingBottom: "1rem" }}>
            <summary className="lesson-kicker" style={{ cursor: "pointer", listStyle: "none", paddingBottom: "0.5rem" }}>
              {CONTENTS_LABEL[lang]} — {sections.length}
            </summary>
            <ol style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0", display: "grid", gap: "0.6rem" }}>
              {sections.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: "0.8rem", fontSize: "0.875rem" }}>
                  <span
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      paddingTop: "0.15rem",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a href={`#s-${i}`} className="underline-wipe" style={{ color: "var(--text-muted)" }}>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        {/* ── the lesson ───────────────────────────────────────────────── */}
        <div style={{ marginTop: "2rem" }}>
          {sections.length ? (
            <LessonBody sections={sections} />
          ) : (
            <div className="prose-body">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
        </div>

        {/* ── check your understanding ─────────────────────────────────── */}
        {questions.length ? (
          <div style={{ marginTop: "2.5rem", borderTop: "1px solid var(--border-strong)", paddingTop: "1.75rem" }}>
            <Quiz riderId={rider.id} lessonId={lesson.id} questions={questions} lang={lang} />
          </div>
        ) : null}
      </div>

      {/* ── next ───────────────────────────────────────────────────────── */}
      {next ? (
        <Link
          href={`/rider/learn/${next.code}`}
          className="lift"
          style={{
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            padding: "1.5rem 1.25rem",
            borderTop: "1px solid var(--border-strong)",
            textDecoration: "none",
          }}
        >
          <span style={{ minWidth: 0 }}>
            <span className="eyebrow" style={{ color: "var(--accent)" }}>
              {t("continue", lang)}
            </span>
            <span className="display-sm" style={{ display: "block", marginTop: "0.5rem", color: "var(--text)" }}>
              {pick(next, "title", lang)}
            </span>
          </span>
          <span className="cta-ring" style={{ flexShrink: 0, borderColor: "var(--accent)", color: "var(--accent)" }}>
            <ArrowRight size={15} />
          </span>
        </Link>
      ) : null}
    </article>
  );
}
