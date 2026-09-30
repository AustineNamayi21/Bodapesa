"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Sparkles, Trophy, X } from "lucide-react";
import { submitQuizAction } from "@/lib/actions";
import { pick, t } from "@/lib/i18n";
import { Confetti } from "@/components/motion";
import type { Lang, QuizQuestion } from "@/lib/types";

interface Result {
  score: number;
  total: number;
  results: { questionId: string; correct: boolean; chosen: number }[];
  literacyScore: number;
}

const LETTERS = ["A", "B", "C", "D", "E"];

function Submit({ lang }: { lang: Lang }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending}>
      {pending ? (
        <span className="inline-block w-5 h-5 rounded-full border-[3px] border-current border-t-transparent animate-spin" />
      ) : (
        <>
          <Sparkles size={17} />
          {lang === "EN" ? "Check my answers" : lang === "SH" ? "Check answers zangu" : "Angalia majibu yangu"}
        </>
      )}
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

  const passed = state ? state.score / Math.max(1, state.total) >= 0.5 : false;

  return (
    <form action={action} className="space-y-5 relative">
      {state && passed ? <Confetti /> : null}
      <input type="hidden" name="riderId" value={riderId} />
      <input type="hidden" name="lessonId" value={lessonId} />

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl grid place-items-center border-2" style={{ background: "var(--matatu)", borderColor: "var(--ink)" }}>
            ?
          </span>
          {t("quiz", lang)}
        </h2>
        {state ? (
          <span
            className="pill text-[0.8rem] border-2 animate-pop"
            style={{ background: passed ? "var(--success-soft)" : "var(--accent-soft)", color: passed ? "var(--success)" : "var(--accent)", borderColor: "currentColor" }}
          >
            {t("score", lang)}: {state.score}/{state.total}
          </span>
        ) : null}
      </div>

      {questions.map((q, qi) => {
        const result = state?.results.find((r) => r.questionId === q.id);
        return (
          <fieldset key={q.id} className={`space-y-2 ${state && result && !result.correct ? "animate-shake" : ""}`}>
            <input type="hidden" name="questionId" value={q.id} />
            <legend className="text-[0.95rem] font-semibold mb-2 leading-snug">
              <span className="text-[var(--text-faint)] mr-1">{qi + 1}.</span>
              {pick(q, "prompt", lang)}
            </legend>

            {optionsFor(q).map((opt, i) => {
              const chosen = result?.chosen === i;
              const isCorrect = state ? i === q.correctIndex : false;
              let background = "var(--surface)";
              let border = "var(--border-strong)";
              let colour = "var(--text)";
              if (state && isCorrect) {
                background = "var(--success-soft)";
                border = "var(--success)";
                colour = "var(--success)";
              } else if (state && chosen && !isCorrect) {
                background = "var(--danger-soft)";
                border = "var(--danger)";
                colour = "var(--danger)";
              }

              return (
                <label
                  key={i}
                  className={`relative flex items-center gap-3 p-3 rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-[var(--brand)] text-[0.86rem] leading-snug border-2 transition-all ${
                    state ? "" : "cursor-pointer hover:-translate-y-0.5 has-[:checked]:!border-[var(--ink)] has-[:checked]:!bg-[var(--accent-soft)] has-[:checked]:shadow-[3px_3px_0_var(--ink)]"
                  }`}
                  style={{ background, color: colour, borderColor: border }}
                >
                  <input
                    type="radio"
                    name={`answer_${q.id}`}
                    value={i}
                    required
                    disabled={Boolean(state)}
                    className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default m-0"
                  />
                  <span
                    className="w-7 h-7 rounded-lg grid place-items-center text-[0.75rem] font-extrabold shrink-0 border-2 peer-checked:bg-[var(--sunset)] peer-checked:text-[var(--ink)] peer-checked:border-[var(--ink)]"
                    style={{ borderColor: "currentColor" }}
                  >
                    {state && isCorrect ? <Check size={15} strokeWidth={3} /> : state && chosen ? <X size={15} strokeWidth={3} /> : LETTERS[i]}
                  </span>
                  <span className="font-medium">{opt}</span>
                </label>
              );
            })}

            {state ? (
              <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)] pt-1 animate-rise">
                <strong style={{ color: result?.correct ? "var(--success)" : "var(--danger)" }}>
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
          className="rounded-2xl p-4 flex items-center gap-3 border-2 animate-pop"
          style={{ background: "var(--ink)", color: "var(--cream)", borderColor: "var(--ink)" }}
        >
          <span className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: "var(--matatu)", color: "var(--ink)" }}>
            <Trophy size={24} />
          </span>
          <div>
            <div className="text-[0.72rem] font-bold uppercase tracking-wider" style={{ color: "var(--matatu)" }}>
              {t("literacyScore", lang)}
            </div>
            <div className="font-display font-extrabold text-2xl leading-tight">{state.literacyScore}/100</div>
            <div className="text-[0.76rem] opacity-75">
              {passed
                ? lang === "EN"
                  ? "Hongera! Keep riding forward."
                  : "Hongera! Endelea mbele."
                : lang === "EN"
                  ? "Read it once more — you'll get it next time."
                  : "Soma tena — utaweza wakati ujao."}
            </div>
          </div>
        </div>
      ) : (
        <Submit lang={lang} />
      )}
    </form>
  );
}
