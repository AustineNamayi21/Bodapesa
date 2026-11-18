"use client";

import { useActionState } from "react";
import { createLessonAction, updateLessonAction } from "@/lib/crud";
import {
  Area,
  FieldSet,
  Keep,
  Result,
  Select,
  Submit,
  Text,
  Toggle,
  type CrudState,
} from "@/components/admin";
import { smsParts } from "@/lib/i18n";
import type { Lesson } from "@/lib/types";

const MODULES = [
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT", label: "Credit & Debt" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "INSURANCE", label: "Insurance" },
];

const SECTIONS_HINT =
  'A JSON array of sections. Each needs "kind" (intro, points, example, terms, warn, do or recap) and "heading". ' +
  'Then: "body" for prose, "points" for [{title, detail}], "ledger" for [{label, value, total}], ' +
  '"terms" for [{term, definition}], "steps" for a list of strings, and "note" for a closing line. ' +
  "Leave empty and the lesson falls back to its prose body.";

const SECTIONS_EXAMPLE = `[
  {
    "kind": "intro",
    "heading": "Why this matters",
    "body": "First paragraph.\\n\\nSecond paragraph."
  },
  {
    "kind": "points",
    "heading": "The idea, broken down",
    "points": [
      { "title": "Do this first", "detail": "Because of this." }
    ]
  },
  {
    "kind": "example",
    "heading": "Worked example",
    "ledger": [
      { "label": "Per day", "value": "KSh 100" },
      { "label": "Per year", "value": "KSh 31,200", "total": true }
    ],
    "note": "What that buys."
  },
  {
    "kind": "do",
    "heading": "Do this today",
    "steps": ["First step", "Second step", "Third step"]
  },
  {
    "kind": "recap",
    "heading": "In one line",
    "body": "The whole lesson in a sentence."
  }
]`;

export default function LessonForm({ lesson }: { lesson?: Lesson }) {
  const editing = Boolean(lesson);
  const [state, action] = useActionState(
    editing ? updateLessonAction : createLessonAction,
    null as CrudState,
  );

  const smsSw = lesson?.smsSw ?? "";
  const parts = smsSw ? smsParts(smsSw) : null;

  return (
    <Keep state={state}>
      <form action={action} className="space-y-6 max-w-4xl">
        {lesson ? <input type="hidden" name="lessonId" value={lesson.id} /> : null}

        <FieldSet legend="Placement" cols={3}>
          <Text
            name="code"
            label="Lesson code"
            defaultValue={lesson?.code}
            placeholder="SAV-4"
            required={!editing}
            hint={
              editing
                ? "Fixed — progress rows and the USSD menu key off it."
                : "Short and unique, e.g. SAV-4."
            }
          />
          <Select
            name="moduleKey"
            label="Module"
            options={MODULES}
            defaultValue={lesson?.moduleKey ?? "SAVINGS"}
          />
          <Text
            name="order"
            label="Order within module"
            defaultValue={lesson?.order ?? 1}
            inputMode="numeric"
            required
          />
          <Text
            name="durationMin"
            label="Reading time (minutes)"
            defaultValue={lesson?.durationMin ?? 6}
            inputMode="numeric"
          />
        </FieldSet>

        <FieldSet legend="Titles" cols={3}>
          <Text name="titleEn" label="Title — English" defaultValue={lesson?.titleEn} required />
          <Text name="titleSw" label="Title — Kiswahili" defaultValue={lesson?.titleSw} required />
          <Text
            name="titleSh"
            label="Title — Sheng"
            defaultValue={lesson?.titleSh}
            hint="Falls back to Kiswahili."
          />
        </FieldSet>

        <FieldSet
          legend="One-line summary"
          hint="Shown under the lesson title in the portal and on the lesson card. One sentence that says what the rider will walk away with."
          cols={1}
        >
          <Area name="summaryEn" label="Summary — English" defaultValue={lesson?.summaryEn} rows={2} />
          <Area name="summarySw" label="Summary — Kiswahili" defaultValue={lesson?.summarySw} rows={2} />
          <Area name="summarySh" label="Summary — Sheng" defaultValue={lesson?.summarySh} rows={2} />
        </FieldSet>

        <FieldSet legend="Structured sections" hint={SECTIONS_HINT} cols={1}>
          <Area
            name="sectionsEn"
            label="Sections — English (JSON)"
            defaultValue={lesson?.sectionsEn}
            rows={14}
            mono
          />
          <Area
            name="sectionsSw"
            label="Sections — Kiswahili (JSON)"
            defaultValue={lesson?.sectionsSw}
            rows={10}
            mono
          />
          <Area
            name="sectionsSh"
            label="Sections — Sheng (JSON)"
            defaultValue={lesson?.sectionsSh}
            rows={10}
            mono
          />

          <details className="sm:col-span-full">
            <summary className="text-[0.76rem] cursor-pointer" style={{ color: "var(--text-muted)" }}>
              Show the shape of a sections array
            </summary>
            <pre
              className="mt-2 p-3 overflow-x-auto text-[0.7rem] leading-relaxed scroll-thin"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {SECTIONS_EXAMPLE}
            </pre>
          </details>
        </FieldSet>

        <FieldSet
          legend="Prose body"
          hint="The fallback a rider sees when the lesson has no structured sections, and the version the USSD reader pages through. Separate paragraphs with a blank line."
          cols={1}
        >
          <Area name="bodyEn" label="Body — English" defaultValue={lesson?.bodyEn} rows={7} required />
          <Area name="bodySw" label="Body — Kiswahili" defaultValue={lesson?.bodySw} rows={7} required />
          <Area name="bodySh" label="Body — Sheng" defaultValue={lesson?.bodySh} rows={7} />
        </FieldSet>

        <FieldSet
          legend="Condensed SMS version"
          hint={
            parts
              ? `This is what reaches a feature phone. The current Kiswahili version is ${parts.chars} characters — ${parts.parts} SMS part${parts.parts === 1 ? "" : "s"}${parts.unicode ? ", and it uses unicode characters, which halves the per-part allowance" : ""}.`
              : "This is what reaches a feature phone. Keep each under 160 characters to stay in one SMS part."
          }
          cols={1}
        >
          <Area
            name="smsEn"
            label="SMS — English"
            defaultValue={lesson?.smsEn}
            rows={3}
            required={!editing}
          />
          <Area
            name="smsSw"
            label="SMS — Kiswahili"
            defaultValue={lesson?.smsSw}
            rows={3}
            required={!editing}
          />
          <Area name="smsSh" label="SMS — Sheng" defaultValue={lesson?.smsSh} rows={3} />
        </FieldSet>

        <FieldSet legend="Visibility" cols={1}>
          <Toggle
            name="active"
            label="Active — included in the curriculum riders see"
            defaultChecked={lesson ? Boolean(lesson.active) : true}
          />
        </FieldSet>

        <Result state={state} />

        <div className="pt-4" style={{ borderTop: "2px solid var(--ink)" }}>
          <Submit label={editing ? "Save lesson" : "Create lesson"} />
        </div>
      </form>
    </Keep>
  );
}
