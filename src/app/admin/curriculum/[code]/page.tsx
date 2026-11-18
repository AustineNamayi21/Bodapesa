import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { all, count, one } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { deleteLessonAction } from "@/lib/crud";
import { readSections } from "@/lib/curriculum/types";
import { DangerButton, PageHeader } from "@/components/admin";
import { Pill } from "@/components/ui";
import LessonForm from "../LessonForm";
import QuestionEditor from "../QuestionEditor";
import type { Lesson, QuizQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const user = await currentUser();
  if (user?.role !== "PLATFORM_ADMIN") redirect("/admin/curriculum");

  const lesson = await one<Lesson>("SELECT * FROM Lesson WHERE code = ?", [code]);
  if (!lesson) notFound();

  const questions = await all<QuizQuestion>(`SELECT * FROM QuizQuestion WHERE lessonId = ? ORDER BY "order"`, [
    lesson.id,
  ]);
  const completions = await count("SELECT COUNT(*) AS n FROM LessonProgress WHERE lessonId = ?", [lesson.id]);

  const sectionCount = readSections(lesson, "EN").length;

  return (
    <div>
      <PageHeader
        title={lesson.titleEn}
        subtitle={`${lesson.code} · ${lesson.moduleKey.toLowerCase()} · ${completions} completion${completions === 1 ? "" : "s"}`}
        back="/admin/curriculum"
        backLabel="Curriculum"
        actions={
          <>
            {Number(lesson.active) === 1 ? <Pill tone="success">Live</Pill> : <Pill tone="neutral">Hidden</Pill>}
            <Pill tone={sectionCount ? "accent" : "neutral"}>
              {sectionCount ? `${sectionCount} sections` : "Prose only"}
            </Pill>
            <Link href={`/rider/learn/${lesson.code}`} className="btn btn-ghost btn-sm" target="_blank">
              <ExternalLink size={12} /> Preview
            </Link>
          </>
        }
      />

      <LessonForm lesson={lesson} />

      <section className="mt-12">
        <div className="rule-head mb-4">
          <h2 className="text-[1.1rem] leading-none">Quiz</h2>
          <span className="eyebrow">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="text-[0.82rem] mb-4 max-w-prose" style={{ color: "var(--text-muted)" }}>
          Quiz answers feed the rider&rsquo;s literacy score, so changing which option is correct changes scores on
          future attempts. Attempts already recorded are not recalculated.
        </p>
        <QuestionEditor lessonId={lesson.id} code={lesson.code} questions={questions} />
      </section>

      <div className="mt-12 pt-5 max-w-3xl" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="eyebrow">Remove</span>
        <p className="text-[0.82rem] my-3 max-w-prose" style={{ color: "var(--text-muted)" }}>
          {completions > 0
            ? "Riders have completed this lesson, so removing it hides it rather than deleting it. Their completions and literacy scores stay intact."
            : "No rider has completed this lesson, so it can be deleted outright along with its quiz."}
        </p>
        <DangerButton
          action={deleteLessonAction}
          hidden={{ lessonId: lesson.id }}
          label={completions > 0 ? "Hide lesson" : "Delete lesson"}
          confirmLabel={completions > 0 ? "Hide it" : "Delete permanently"}
          warning={
            completions > 0
              ? `${lesson.titleEn} will disappear from the rider portal. The ${completions} rider${completions === 1 ? "" : "s"} who completed it keep their progress.`
              : `${lesson.titleEn} and its ${questions.length} quiz question${questions.length === 1 ? "" : "s"} will be removed completely. This cannot be undone.`
          }
        />
      </div>
    </div>
  );
}
