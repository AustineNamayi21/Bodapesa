import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock, List } from "lucide-react";
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

  const questions = await all<QuizQuestion>(
    `SELECT * FROM QuizQuestion WHERE lessonId = ? ORDER BY "order"`,
    [lesson.id],
  );

  const done = (await completedLessonIds(rider.id)).has(lesson.id);

  const next = await one<{ code: string; titleEn: string; titleSw: string; titleSh: string }>(
    `SELECT code, titleEn, titleSw, titleSh FROM Lesson
      WHERE active = 1
        AND (moduleKey = ? AND "order" > ?)
      ORDER BY "order" LIMIT 1`,
    [lesson.moduleKey, lesson.order],
  );

  // Structured sections where the lesson has been enriched; the original
  // prose body otherwise, so every lesson renders either way.
  const sections = readSections(lesson, lang);
  const paragraphs = sections.length ? [] : pick(lesson, "body", lang).split("\n\n").filter(Boolean);
  const summary = pick(lesson, "summary", lang);

  return (
    <div className="-mt-5 -mx-4">
      {/* ── masthead ─────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden" style={{ background: "var(--ink)" }}>
        <div className="absolute inset-0">
          <Photo name={MODULE_PHOTO[lesson.moduleKey] ?? "stage"} sizes="448px" priority />
        </div>
        {/* The module photograph reads in full colour behind the title; the
            gradient only deepens where the type sits. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.88) 100%)",
          }}
        />
        <div className="relative px-4 pt-4 pb-7">
          <Link
            href="/rider/learn"
            className="inline-flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase"
            style={{
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "0.16em",
              fontFamily: "var(--font-display)",
            }}
          >
            <ArrowLeft size={13} /> {t("learn", lang)}
          </Link>

          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <span
              className="pill"
              style={{ background: "var(--ember)", color: "#000", borderColor: "transparent" }}
            >
              {MODULE_LABELS[lesson.moduleKey]?.[lang] ?? lesson.moduleKey}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase"
              style={{
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.14em",
                fontFamily: "var(--font-display)",
              }}
            >
              <Clock size={11} /> {lesson.durationMin} {t("minRead", lang)}
            </span>
            {done ? (
              <span
                className="inline-flex items-center gap-1 text-[0.62rem] font-semibold uppercase"
                style={{ color: "var(--jade)", letterSpacing: "0.14em", fontFamily: "var(--font-display)" }}
              >
                <BadgeCheck size={12} /> {t("done", lang)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 text-[1.85rem] leading-[1.12]" style={{ color: "#fff" }}>
            {pick(lesson, "title", lang)}
          </h1>

          {summary ? (
            <p
              className="mt-3 text-[0.95rem] leading-relaxed max-w-prose"
              style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-editorial)" }}
            >
              {summary}
            </p>
          ) : null}
        </div>
        <div style={{ height: "3px", background: "var(--ember)" }} />
      </header>

      <div className="px-4 py-6 space-y-7">
        {/* ── contents ───────────────────────────────────────────────────── */}
        {sections.length >= 3 ? (
          <details className="card p-0">
            <summary
              className="flex items-center gap-2 px-4 py-3 cursor-pointer text-[0.62rem] font-semibold uppercase select-none"
              style={{ letterSpacing: "0.16em", fontFamily: "var(--font-display)" }}
            >
              <List size={13} style={{ color: "var(--ember-deep)" }} />
              {CONTENTS_LABEL[lang]}
              <span className="ml-auto tabular-nums" style={{ color: "var(--text-faint)" }}>
                {sections.length}
              </span>
            </summary>
            <ol className="px-4 pb-3 pt-1 space-y-1.5">
              {sections.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[0.86rem]">
                  <span
                    className="tabular-nums shrink-0 font-semibold"
                    style={{
                      color: "var(--ember-deep)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.7rem",
                      paddingTop: "0.15rem",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a href={`#s-${i}`} className="underline-wipe">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        {/* ── the lesson ─────────────────────────────────────────────────── */}
        {sections.length ? (
          <LessonBody sections={sections} />
        ) : (
          <article className="prose-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </article>
        )}

        {/* ── check your understanding ───────────────────────────────────── */}
        {questions.length ? (
          <div className="card-pop p-4">
            <Quiz riderId={rider.id} lessonId={lesson.id} questions={questions} lang={lang} />
          </div>
        ) : null}

        {/* ── next ───────────────────────────────────────────────────────── */}
        {next ? (
          <Link
            href={`/rider/learn/${next.code}`}
            className="flex items-center justify-between gap-3 p-4 lift"
            style={{ background: "var(--ink)", color: "#fff", border: "2px solid var(--ink)" }}
          >
            <span className="min-w-0">
              <span
                className="block text-[0.6rem] font-semibold uppercase"
                style={{ color: "var(--ember)", letterSpacing: "0.18em", fontFamily: "var(--font-display)" }}
              >
                {t("continue", lang)}
              </span>
              <span
                className="block font-display text-[1.05rem] truncate mt-1"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {pick(next, "title", lang)}
              </span>
            </span>
            <ArrowRight size={20} className="shrink-0" style={{ color: "var(--ember)" }} />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
