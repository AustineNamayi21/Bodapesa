"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { deleteQuestionAction, saveQuestionAction } from "@/lib/crud";
import {
  DangerButton,
  Field,
  Keep,
  KeptInput,
  KeptTextarea,
  Result,
  Submit,
  type CrudState,
} from "@/components/admin";
import type { QuizQuestion } from "@/lib/types";

interface Options {
  en: string[];
  sw: string[];
  sh: string[];
}

function parseOptions(json: string): Options {
  try {
    const parsed = JSON.parse(json) as Partial<Options>;
    return {
      en: Array.isArray(parsed.en) ? parsed.en : [],
      sw: Array.isArray(parsed.sw) ? parsed.sw : [],
      sh: Array.isArray(parsed.sh) ? parsed.sh : [],
    };
  } catch {
    return { en: [], sw: [], sh: [] };
  }
}

/**
 * Add or edit one quiz question.
 *
 * Four option slots per language, blank ones dropped on save, with the
 * correct answer chosen by radio against the English column — so the person
 * writing the question marks the answer where they can read it, and the
 * translations line up by position.
 */
function QuestionForm({
  lessonId,
  code,
  question,
  order,
  onDone,
}: {
  lessonId: string;
  code: string;
  question?: QuizQuestion;
  order: number;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveQuestionAction, null as CrudState);
  const opts = question ? parseOptions(question.optionsJson) : { en: [], sw: [], sh: [] };
  const slots = [0, 1, 2, 3];
  // Which option was marked correct survives a failed save, like every other
  // field on the form.
  const echoed = state?.error ? state.values : undefined;
  const keptCorrect = echoed?.correctIndex ? Number(echoed.correctIndex) : (question?.correctIndex ?? 0);

  // Close the editor once a save has reported success. In an effect rather
  // than during render, so the parent's state update is not queued mid-render.
  const saved = state?.ok;
  useEffect(() => {
    if (saved && onDone) onDone();
  }, [saved, onDone]);

  return (
    <Keep state={state}>
      <form
        action={action}
        className="space-y-4 p-4"
        style={{ border: "2px solid var(--ink)", background: "var(--surface)" }}
      >
        {question ? <input type="hidden" name="questionId" value={question.id} /> : null}
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="order" value={question?.order ?? order} />

        <div className="grid gap-3">
          <Field id={`promptEn-${question?.id ?? "new"}`} label="Question — English">
            <KeptInput name="promptEn" defaultValue={question?.promptEn} required />
          </Field>
          <Field id={`promptSw-${question?.id ?? "new"}`} label="Question — Kiswahili">
            <KeptInput name="promptSw" defaultValue={question?.promptSw} required />
          </Field>
          <Field id={`promptSh-${question?.id ?? "new"}`} label="Question — Sheng">
            <KeptInput name="promptSh" defaultValue={question?.promptSh} />
          </Field>
        </div>

        <div>
          <span className="label">Answer options — tick the correct one</span>
          <div className="space-y-2">
            {slots.map((i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_1fr] items-center">
                <label
                  className="flex items-center justify-center shrink-0"
                  style={{ width: "2.2rem", height: "2.4rem", border: "1px solid var(--border)" }}
                  title={`Mark option ${i + 1} as correct`}
                >
                  <input
                    type="radio"
                    name="correctIndex"
                    value={i}
                    defaultChecked={keptCorrect === i}
                    className="check"
                    style={{ borderRadius: "999px" }}
                  />
                  <span className="sr-only">Option {i + 1} is correct</span>
                </label>
                <KeptInput
                  name={`optEn${i}`}
                  placeholder={`Option ${i + 1} — English`}
                  defaultValue={opts.en[i] ?? ""}
                />
                <KeptInput name={`optSw${i}`} placeholder="Kiswahili" defaultValue={opts.sw[i] ?? ""} />
                <KeptInput name={`optSh${i}`} placeholder="Sheng" defaultValue={opts.sh[i] ?? ""} />
              </div>
            ))}
          </div>
          <p className="text-[0.72rem] mt-2" style={{ color: "var(--text-faint)" }}>
            Leave the last rows blank for a two- or three-option question. Sheng falls back to Kiswahili if
            left empty.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field id={`explEn-${question?.id ?? "new"}`} label="Why that answer — English">
            <KeptTextarea name="explanationEn" rows={3} defaultValue={question?.explanationEn} />
          </Field>
          <Field id={`explSw-${question?.id ?? "new"}`} label="Why that answer — Kiswahili">
            <KeptTextarea name="explanationSw" rows={3} defaultValue={question?.explanationSw} />
          </Field>
        </div>

        <Result state={state} />

        <div className="flex items-center gap-2">
          <Submit label={question ? "Save question" : "Add question"} />
          {onDone ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
              Cancel
            </button>
          ) : null}
          {question ? (
            <div className="ml-auto">
              <DangerButton
                action={deleteQuestionAction}
                hidden={{ questionId: question.id, code }}
                label="Delete"
                confirmLabel="Delete question"
                warning="This question disappears from the quiz. Attempts already recorded keep their scores."
              />
            </div>
          ) : null}
        </div>
      </form>
    </Keep>
  );
}

export default function QuestionEditor({
  lessonId,
  code,
  questions,
}: {
  lessonId: string;
  code: string;
  questions: QuizQuestion[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4 max-w-4xl">
      {questions.map((q, i) => {
        const opts = parseOptions(q.optionsJson);
        if (editingId === q.id) {
          return (
            <QuestionForm
              key={q.id}
              lessonId={lessonId}
              code={code}
              question={q}
              order={q.order}
              onDone={() => setEditingId(null)}
            />
          );
        }
        return (
          <div key={q.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="lesson-kicker">Question {i + 1}</span>
                <p className="text-[0.95rem] mt-1 font-medium">{q.promptEn}</p>
                <ol className="mt-2 space-y-1">
                  {opts.en.map((o, oi) => (
                    <li
                      key={oi}
                      className="text-[0.82rem] flex items-start gap-2"
                      style={{ color: oi === q.correctIndex ? "var(--success)" : "var(--text-muted)" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.7rem",
                          paddingTop: "0.12rem",
                        }}
                      >
                        {oi === q.correctIndex ? "✓" : String.fromCharCode(65 + oi)}
                      </span>
                      {o}
                    </li>
                  ))}
                </ol>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm shrink-0"
                onClick={() => setEditingId(q.id)}
              >
                Edit
              </button>
            </div>
          </div>
        );
      })}

      {adding ? (
        <QuestionForm
          lessonId={lessonId}
          code={code}
          order={questions.length + 1}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
          <Plus size={13} /> Add a question
        </button>
      )}

      {!questions.length && !adding ? (
        <p className="text-[0.82rem]" style={{ color: "var(--text-faint)" }}>
          This lesson has no quiz. Riders can still complete it, but their literacy score will not move.
        </p>
      ) : null}
    </div>
  );
}
