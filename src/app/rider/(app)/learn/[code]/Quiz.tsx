"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitQuizAction } from "@/lib/actions";
import { pick, t } from "@/lib/i18n";
import type { Lang, QuizQuestion } from "@/lib/types";

interface Result {
  score: number;
  total: number;
  results: { questionId: string; correct: boolean; chosen: number }[];
  literacyScore: number;
}

function Submit({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending
        ? "…"
        : lang === "EN"
          ? "Check my answers"
          : lang === "SH"
            ? "Check answers zangu"
            : "Angalia majibu yangu"}
    </button>
  );
}

export default function Quiz({
  riderId,
  lessonId,
  questions,
  lang,
}: {
  riderId: string;
  lessonId: string;
  questions: QuizQuestion[];
  lang: Lang;
}) {
  const [state, action] = useActionState(submitQuizAction, null as Result | null);

  const optionsFor = (q: QuizQuestion): string[] => {
    const parsed = JSON.parse(q.optionsJson) as Record<string, string[]>;
    const key = lang === "EN" ? "en" : lang === "SH" ? "sh" : "sw";
    return parsed[key] ?? parsed.en;
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="riderId" value={riderId} />
      <input type="hidden" name="lessonId" value={lessonId} />

      <div className="flex items-baseline justify-between">
        <h2 className="text-[0.9rem] font-semibold tracking-tight">{t("quiz", lang)}</h2>
        {state ? (
          <span className="text-[0.8rem] font-semibold" style={{ color: "var(--brand)" }}>
            {t("score", lang)}: {state.score}/{state.total}
          </span>
        ) : null}
      </div>

      {questions.map((q) => {
        const result = state?.results.find((r) => r.questionId === q.id);
        return (
          <fieldset key={q.id} className="space-y-1.5">
            <input type="hidden" name="questionId" value={q.id} />
            <legend className="text-[0.85rem] font-medium mb-1.5 leading-snug">{pick(q, "prompt", lang)}</legend>

            {optionsFor(q).map((opt, i) => {
              const chosen = result?.chosen === i;
              const isCorrect = state ? i === q.correctIndex : false;
              let background = "var(--surface-2)";
              let colour = "var(--text)";
              if (state && isCorrect) {
                background = "var(--brand-soft)";
                colour = "var(--brand-strong)";
              } else if (state && chosen && !isCorrect) {
                background = "var(--danger-soft)";
                colour = "var(--danger)";
              }

              return (
                <label
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer text-[0.82rem] leading-snug"
                  style={{ background, color: colour }}
                >
                  <input
                    type="radio"
                    name={`answer_${q.id}`}
                    value={i}
                    required
                    disabled={Boolean(state)}
                    className="mt-0.5 accent-[var(--brand)] shrink-0"
                  />
                  <span>{opt}</span>
                  {state && isCorrect ? <span className="ml-auto shrink-0">✓</span> : null}
                </label>
              );
            })}

            {state ? (
              <p className="text-[0.76rem] leading-relaxed text-[var(--text-muted)] pt-1">
                <strong style={{ color: result?.correct ? "var(--brand)" : "var(--accent)" }}>
                  {result?.correct ? t("correct", lang) : t("wrong", lang)}
                </strong>{" "}
                {lang === "EN" ? q.explanationEn : q.explanationSw}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      {state ? (
        <div
          className="text-[0.82rem] p-3 rounded-lg text-center"
          style={{ background: "var(--brand-soft)", color: "var(--brand-strong)" }}
        >
          {t("literacyScore", lang)}: <strong>{state.literacyScore}/100</strong>
        </div>
      ) : (
        <Submit lang={lang} />
      )}
    </form>
  );
}
