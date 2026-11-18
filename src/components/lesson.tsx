import { AlertTriangle, BookMarked, ListChecks, Quote, Receipt, Sparkles, Target } from "lucide-react";
import type { LessonSection } from "@/lib/curriculum/types";

const KIND_META: Record<
  LessonSection["kind"],
  { kicker: string; icon: typeof Target }
> = {
  intro: { kicker: "Start here", icon: Sparkles },
  points: { kicker: "Broken down", icon: ListChecks },
  example: { kicker: "Worked example", icon: Receipt },
  terms: { kicker: "Key words", icon: BookMarked },
  warn: { kicker: "Watch out", icon: AlertTriangle },
  do: { kicker: "Take action", icon: Target },
  recap: { kicker: "Recap", icon: Quote },
};

/** Prose with blank-line paragraph breaks. */
function Prose({ body }: { body: string }) {
  return (
    <>
      {body
        .split("\n\n")
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </>
  );
}

function SectionHead({ kind }: { kind: LessonSection["kind"] }) {
  const meta = KIND_META[kind] ?? KIND_META.intro;
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} strokeWidth={2.4} className="shrink-0" style={{ color: "var(--ember-deep)" }} />
      <span className="lesson-kicker">{meta.kicker}</span>
    </div>
  );
}

/**
 * Renders one structured lesson section.
 *
 * Each kind gets its own layout rather than a generic block, because the
 * whole point of the structure is that a rider can tell at a glance whether
 * they are looking at the idea, the numbers, or the thing to do today.
 */
function Section({ section, index }: { section: LessonSection; index: number }) {
  const anchor = `s-${index}`;

  return (
    <section id={anchor} className="lesson-section scroll-mt-20 animate-rise" style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}>
      <SectionHead kind={section.kind} />
      <h2 className="lesson-h">{section.heading}</h2>

      {section.body && section.kind !== "warn" && section.kind !== "recap" ? (
        <div className="prose-body mt-3 text-[0.98rem]">
          <Prose body={section.body} />
        </div>
      ) : null}

      {section.kind === "warn" && section.body ? (
        <div className="lesson-warn mt-3 prose-body text-[0.92rem] max-w-none">
          <Prose body={section.body} />
        </div>
      ) : null}

      {section.kind === "recap" && section.body ? (
        <blockquote className="lesson-recap mt-3">{section.body}</blockquote>
      ) : null}

      {section.points?.length ? (
        <ol className="lesson-points mt-4">
          {section.points.map((p, i) => (
            <li key={i}>
              <div>
                <h3 className="text-[0.95rem] font-semibold leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                  {p.title}
                </h3>
                <p className="text-[0.9rem] leading-relaxed mt-1" style={{ color: "var(--text-muted)" }}>
                  {p.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {section.ledger?.length ? (
        <div className="lesson-ledger mt-4">
          {section.ledger.map((r, i) => (
            <div key={i} className="lesson-ledger-row" data-total={r.total ? "true" : "false"}>
              <span>{r.label}</span>
              {r.value ? <span>{r.value}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      {section.terms?.length ? (
        <dl className="lesson-terms mt-4">
          {section.terms.map((t, i) => (
            <div key={i} className="lesson-term">
              <dt>{t.term}</dt>
              <dd>{t.definition}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {section.steps?.length ? (
        <div className="lesson-do mt-4">
          <span className="lesson-kicker">Three things</span>
          <ol>
            {section.steps.map((s, i) => (
              <li key={i}>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {section.note ? (
        <p className="mt-3 text-[0.84rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {section.note}
        </p>
      ) : null}
    </section>
  );
}

/**
 * The full structured lesson body.
 *
 * Falls back to nothing if there are no sections — the caller then renders
 * the lesson's prose body instead, which is what keeps an unenriched or
 * console-authored lesson working.
 */
export function LessonBody({ sections }: { sections: LessonSection[] }) {
  if (!sections.length) return null;
  return (
    <div className="space-y-7">
      {sections.map((s, i) => (
        <Section key={i} section={s} index={i} />
      ))}
    </div>
  );
}

/** A compact index of the lesson's sections, so a long read stays navigable. */
export function LessonContents({ sections, label }: { sections: LessonSection[]; label: string }) {
  if (sections.length < 3) return null;
  return (
    <nav aria-label={label} className="lesson-toc">
      <div className="lesson-kicker mb-2">{label}</div>
      {sections.map((s, i) => (
        <a key={i} href={`#s-${i}`}>
          {s.heading}
        </a>
      ))}
    </nav>
  );
}
