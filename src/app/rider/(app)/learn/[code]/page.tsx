import Link from "next/link";
import { notFound } from "next/navigation";
import { all, one } from "@/lib/db";
import { completedLessonIds, requireRider } from "@/lib/rider";
import { Card } from "@/components/ui";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import Quiz from "./Quiz";
import type { Lesson, QuizQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

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
      WHERE active = 1
        AND (moduleKey = ? AND "order" > ?)
      ORDER BY "order" LIMIT 1`,
    [lesson.moduleKey, lesson.order],
  );

  const paragraphs = pick(lesson, "body", lang).split("\n\n");

  return (
    <div className="space-y-4">
      <Link href="/rider/learn" className="text-[0.78rem] text-[var(--text-faint)] hover:underline">
        ← {t("learn", lang)}
      </Link>

      <header>
        <div className="text-[0.68rem] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
          {MODULE_LABELS[lesson.moduleKey]?.[lang]} · {lesson.durationMin} {t("minRead", lang)}
        </div>
        <h1 className="text-lg font-semibold tracking-tight leading-snug">{pick(lesson, "title", lang)}</h1>
      </header>

      <article className="prose-body text-[0.88rem]">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      {questions.length ? (
        <Card>
          <Quiz riderId={rider.id} lessonId={lesson.id} questions={questions} lang={lang} />
        </Card>
      ) : null}

      {done ? (
        <div
          className="text-[0.8rem] p-3 rounded-lg"
          style={{ background: "var(--brand-soft)", color: "var(--brand-strong)" }}
        >
          ✓ {t("done", lang)}
        </div>
      ) : null}

      {next ? (
        <Link href={`/rider/learn/${next.code}`} className="card p-3.5 flex items-center justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[0.68rem] text-[var(--text-faint)]">{t("continue", lang)}</span>
            <span className="block text-[0.85rem] font-medium truncate">{pick(next, "title", lang)}</span>
          </span>
          <span className="text-[var(--text-faint)] shrink-0">›</span>
        </Link>
      ) : null}
    </div>
  );
}
