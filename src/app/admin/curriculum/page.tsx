import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { all, count } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { toggleLessonAction } from "@/lib/crud";
import { MODULE_LABELS, smsParts } from "@/lib/i18n";
import { Bar, Pill } from "@/components/ui";
import { MiniForm, PageHeader } from "@/components/admin";

export const dynamic = "force-dynamic";

const MODULES = ["SAVINGS", "CREDIT", "INVESTMENT", "INSURANCE"];

interface Row {
  id: string;
  code: string;
  moduleKey: string;
  order: number;
  titleEn: string;
  titleSw: string;
  titleSh: string;
  summaryEn: string | null;
  sectionsEn: string | null;
  smsSw: string;
  durationMin: number;
  active: number;
  completions: number;
  questions: number;
  accuracy: number | null;
}

/** How many structured sections a stored JSON column holds. */
function sectionCount(raw: string | null): number {
  if (!raw) return 0;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default async function CurriculumPage() {
  const user = await currentUser();
  const canEdit = user?.role === "PLATFORM_ADMIN";

  const lessons = await all<Row>(
    `SELECT l.*,
            (SELECT COUNT(*) FROM LessonProgress lp WHERE lp.lessonId = l.id) AS completions,
            (SELECT COUNT(*) FROM QuizQuestion q WHERE q.lessonId = l.id) AS questions,
            (SELECT ROUND(100.0 * SUM(qa.score) / NULLIF(SUM(qa.total),0)) FROM QuizAttempt qa WHERE qa.lessonId = l.id) AS accuracy
       FROM Lesson l ORDER BY l.moduleKey, l."order"`,
  );

  const riderCount =
    (await count("SELECT COUNT(*) AS n FROM Rider WHERE status NOT IN ('PROSPECT','OPTED_OUT')")) || 1;

  const live = lessons.filter((l) => Number(l.active) === 1).length;
  const structured = lessons.filter((l) => sectionCount(l.sectionsEn) > 0).length;

  return (
    <div>
      <PageHeader
        title="Financial literacy curriculum"
        subtitle="Four modules. Every lesson exists in English, Kiswahili and Sheng, as a structured portal lesson and as a condensed version that fits one SMS screen."
        actions={
          canEdit ? (
            <Link href="/admin/curriculum/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> New lesson
            </Link>
          ) : null
        }
      />

      {/* ── at a glance ───────────────────────────────────────────────────── */}
      <div className="grid gap-0 sm:grid-cols-3 mb-9">
        {[
          { label: "Lessons live", value: String(live) },
          { label: "Fully structured", value: `${structured} / ${lessons.length}` },
          {
            label: "Quiz questions",
            value: String(lessons.reduce((n, l) => n + Number(l.questions), 0)),
          },
        ].map((s) => (
          <div key={s.label} className="py-4 pr-6" style={{ borderTop: "2px solid var(--ink)" }}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label mt-1.5">{s.label}</div>
          </div>
        ))}
      </div>

      {MODULES.map((moduleKey) => {
        const items = lessons.filter((l) => l.moduleKey === moduleKey);
        if (!items.length) return null;
        return (
          <section key={moduleKey} className="mb-9">
            <div className="rule-head mb-4">
              <h2 className="text-[1.1rem] leading-none">{MODULE_LABELS[moduleKey]?.EN ?? moduleKey}</h2>
              <span className="eyebrow">
                {MODULE_LABELS[moduleKey]?.SW} · {MODULE_LABELS[moduleKey]?.SH}
              </span>
            </div>

            <div className="grid gap-3">
              {items.map((l) => {
                const sms = smsParts(l.smsSw);
                const sections = sectionCount(l.sectionsEn);
                const hidden = Number(l.active) !== 1;

                return (
                  <article key={l.id} className="card p-4" style={hidden ? { opacity: 0.6 } : undefined}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <Pill tone="neutral">{l.code}</Pill>
                          {sections ? (
                            <Pill tone="accent">{sections} sections</Pill>
                          ) : (
                            <Pill tone="neutral">Prose only</Pill>
                          )}
                          {hidden ? <Pill tone="danger">Hidden</Pill> : null}
                        </div>
                        <h3 className="text-[1rem] leading-snug" style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                          {l.titleEn}
                        </h3>
                        {l.summaryEn ? (
                          <p className="text-[0.84rem] mt-1.5 max-w-prose leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {l.summaryEn}
                          </p>
                        ) : null}
                        <p className="text-[0.74rem] mt-2" style={{ color: "var(--text-faint)" }}>
                          {l.titleSw} · {l.titleSh} · {l.durationMin} min · {l.questions} quiz question
                          {Number(l.questions) === 1 ? "" : "s"} · Kiswahili SMS fits {sms.parts} part
                          {sms.parts === 1 ? "" : "s"}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="stat-value text-[1.3rem]">{Number(l.completions).toLocaleString()}</div>
                        <div className="text-[0.66rem] mt-0.5" style={{ color: "var(--text-faint)" }}>
                          completions · {l.accuracy ?? "—"}% accuracy
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Bar value={Number(l.completions)} max={riderCount} />
                    </div>

                    {canEdit ? (
                      <div className="mt-3 flex items-center gap-2">
                        <Link href={`/admin/curriculum/${l.code}`} className="btn btn-ghost btn-sm">
                          <Pencil size={12} /> Edit
                        </Link>
                        <MiniForm action={toggleLessonAction} hidden={{ lessonId: l.id }}>
                          <button type="submit" className="btn btn-ghost btn-sm">
                            {hidden ? "Publish" : "Hide"}
                          </button>
                        </MiniForm>
                        <Link
                          href={`/rider/learn/${l.code}`}
                          target="_blank"
                          className="text-[0.72rem] ml-auto underline-wipe"
                          style={{ color: "var(--text-faint)" }}
                        >
                          Preview as a rider
                        </Link>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
