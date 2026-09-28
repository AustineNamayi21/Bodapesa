import { all, count } from "@/lib/db";
import { Bar, Card, Pill } from "@/components/ui";
import { MODULE_LABELS } from "@/lib/i18n";
import { smsParts } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const MODULES = ["SAVINGS", "CREDIT", "INVESTMENT", "INSURANCE"];

export default async function CurriculumPage() {
  const lessons = await all<{
    id: string;
    code: string;
    moduleKey: string;
    order: number;
    titleEn: string;
    titleSw: string;
    titleSh: string;
    bodyEn: string;
    smsEn: string;
    smsSw: string;
    smsSh: string;
    durationMin: number;
    completions: number;
    questions: number;
    accuracy: number | null;
  }>(
    `SELECT l.*,
            (SELECT COUNT(*) FROM LessonProgress lp WHERE lp.lessonId = l.id) AS completions,
            (SELECT COUNT(*) FROM QuizQuestion q WHERE q.lessonId = l.id) AS questions,
            (SELECT ROUND(100.0 * SUM(qa.score) / NULLIF(SUM(qa.total),0)) FROM QuizAttempt qa WHERE qa.lessonId = l.id) AS accuracy
       FROM Lesson l WHERE l.active = 1 ORDER BY l.moduleKey, l."order"`,
  );

  const riderCount = await count("SELECT COUNT(*) AS n FROM Rider WHERE status NOT IN ('PROSPECT','OPTED_OUT')") || 1;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Financial literacy curriculum</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          Twelve lessons across four modules. Each exists in English, Kiswahili and Sheng, in a full version
          for the rider portal and a condensed version that fits one SMS or USSD screen.
        </p>
      </header>

      {MODULES.map((moduleKey) => {
        const items = lessons.filter((l) => l.moduleKey === moduleKey);
        if (!items.length) return null;
        return (
          <section key={moduleKey}>
            <h2 className="text-[0.95rem] font-semibold tracking-tight mb-3">
              {MODULE_LABELS[moduleKey]?.EN ?? moduleKey}
              <span className="text-[0.75rem] font-normal text-[var(--text-faint)] ml-2">
                {MODULE_LABELS[moduleKey]?.SW} · {MODULE_LABELS[moduleKey]?.SH}
              </span>
            </h2>

            <div className="grid gap-3">
              {items.map((l) => {
                const sms = smsParts(l.smsSw);
                return (
                  <Card key={l.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Pill tone="neutral">{l.code}</Pill>
                          <h3 className="text-[0.9rem] font-semibold tracking-tight">{l.titleEn}</h3>
                        </div>
                        <p className="text-[0.75rem] text-[var(--text-faint)]">
                          {l.titleSw} · {l.titleSh} · {l.durationMin} min read · {l.questions} quiz questions
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-semibold tabular-nums">{l.completions.toLocaleString()}</div>
                        <div className="text-[0.68rem] text-[var(--text-faint)]">
                          completions · {l.accuracy ?? "—"}% accuracy
                        </div>
                      </div>
                    </div>

                    <Bar value={l.completions} max={riderCount} />

                    <details className="mt-3">
                      <summary className="text-[0.78rem] cursor-pointer text-[var(--text-muted)]">
                        Preview the lesson and its SMS versions
                      </summary>
                      <div className="mt-3 space-y-3">
                        <div>
                          <div className="stat-label mb-1">Full lesson (English)</div>
                          <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)] whitespace-pre-line p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                            {l.bodyEn}
                          </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {(
                            [
                              ["Kiswahili SMS", l.smsSw],
                              ["English SMS", l.smsEn],
                              ["Sheng SMS", l.smsSh],
                            ] as [string, string][]
                          ).map(([label, body]) => (
                            <div key={label}>
                              <div className="stat-label mb-1">
                                {label} <span className="tabular-nums">({smsParts(body).chars})</span>
                              </div>
                              <p className="text-[0.76rem] leading-relaxed p-2.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
                                {body}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-[0.7rem] text-[var(--text-faint)]">
                          The Kiswahili version fits {sms.parts} SMS part{sms.parts === 1 ? "" : "s"}
                          {sms.unicode ? " and uses unicode characters, which halves the per-part allowance" : ""}.
                        </p>
                      </div>
                    </details>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
