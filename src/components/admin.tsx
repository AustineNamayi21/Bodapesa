"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, Trash2 } from "lucide-react";
import type { FormState } from "@/lib/form-state";

/**
 * Form building blocks for the admin console.
 *
 * Every create/edit screen is assembled from these, so a new managed table
 * needs a page and a field list rather than a fresh set of markup and its
 * own idea of what a label or an error looks like.
 */

export type CrudState = FormState;

/**
 * Carries the last submission back into the field components.
 *
 * React resets an uncontrolled form once its action resolves. Without this,
 * a single failed validation would blank every other field the user had
 * already filled in. The actions echo the submission back in `state.values`;
 * wrapping a form in `<Keep>` makes each field re-seed its default from that,
 * so React's reset restores what the user typed instead of clearing it.
 */
const KeptValues = createContext<Record<string, string> | null>(null);

export function Keep({ state, children }: { state: CrudState; children: ReactNode }) {
  // Only an error keeps the old input: after a successful save the form
  // should settle on whatever the server now holds.
  return (
    <KeptValues.Provider value={state?.error ? (state.values ?? null) : null}>{children}</KeptValues.Provider>
  );
}

/** The value a field should fall back to: the last submission, else the record. */
function useKept(name: string, fallback: string | number | null | undefined): string {
  const values = useContext(KeptValues);
  if (values && name in values) return values[name];
  return fallback === null || fallback === undefined ? "" : String(fallback);
}

function useKeptChecked(name: string, fallback: boolean | undefined): boolean {
  const values = useContext(KeptValues);
  // An unticked checkbox is simply absent from the submission, so the presence
  // of any key tells us the echo is real, and absence of this one means off.
  if (values && Object.keys(values).length) return name in values;
  return Boolean(fallback);
}

// ------------------------------------------------------------------ layout --

export function PageHeader({
  title,
  subtitle,
  back,
  backLabel,
  actions,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7">
      {back ? (
        <Link
          href={back}
          className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase mb-4"
          style={{ letterSpacing: "0.16em", fontFamily: "var(--font-display)", color: "var(--text-faint)" }}
        >
          <ArrowLeft size={12} /> {backLabel ?? "Back"}
        </Link>
      ) : null}
      <div
        className="flex flex-wrap items-end justify-between gap-4"
        style={{ borderTop: "2px solid var(--ink)", paddingTop: "0.9rem" }}
      >
        <div className="min-w-0">
          <h1 className="display-md">{title}</h1>
          {subtitle ? (
            <p className="copy-sm mt-3" style={{ maxWidth: "58ch" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}

/** A titled group of fields inside a form. */
export function FieldSet({
  legend,
  hint,
  children,
  cols = 2,
}: {
  legend: string;
  hint?: string;
  children: ReactNode;
  cols?: 1 | 2 | 3;
}) {
  return (
    <fieldset className="field-boxed pt-5" style={{ borderTop: "1px solid var(--border)" }}>
      <legend className="sr-only">{legend}</legend>
      <div className="mb-3">
        <span className="eyebrow">{legend}</span>
        {hint ? (
          <p className="text-[0.76rem] mt-1.5 max-w-prose" style={{ color: "var(--text-faint)" }}>
            {hint}
          </p>
        ) : null}
      </div>
      <div className={`grid gap-3 ${cols === 1 ? "" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {children}
      </div>
    </fieldset>
  );
}

export function Field({
  id,
  label,
  hint,
  wide,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-full" : undefined}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-[0.72rem] mt-1.5" style={{ color: "var(--text-faint)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Text({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  required,
  wide,
  type = "text",
  inputMode,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "decimal" | "email" | "url";
}) {
  const value = useKept(name, defaultValue);
  return (
    <Field id={name} label={label} hint={hint} wide={wide}>
      <input
        key={value}
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        className="input"
        defaultValue={value}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}

export function Area({
  name,
  label,
  defaultValue,
  hint,
  rows = 4,
  required,
  mono,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  rows?: number;
  required?: boolean;
  mono?: boolean;
}) {
  const value = useKept(name, defaultValue);
  return (
    <Field id={name} label={label} hint={hint} wide>
      <textarea
        key={value}
        id={name}
        name={name}
        rows={rows}
        className="textarea"
        defaultValue={value}
        required={required}
        style={
          mono ? { fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: "0.78rem" } : undefined
        }
      />
    </Field>
  );
}

export function Select({
  name,
  label,
  options,
  defaultValue,
  hint,
  wide,
  placeholder,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  hint?: string;
  wide?: boolean;
  placeholder?: string;
}) {
  const value = useKept(name, defaultValue);
  return (
    <Field id={name} label={label} hint={hint} wide={wide}>
      <select key={value} id={name} name={name} className="select" defaultValue={value}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * Bare controls with the same keep-on-error behaviour, for the inline
 * editors that lay out their own labels rather than using `Text`/`Select`.
 */
export function KeptInput({
  name,
  defaultValue,
  ...rest
}: { name: string; defaultValue?: string | number | null } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "defaultValue"
>) {
  const value = useKept(name, defaultValue);
  return <input key={value} name={name} defaultValue={value} className="input" {...rest} />;
}

export function KeptTextarea({
  name,
  defaultValue,
  ...rest
}: { name: string; defaultValue?: string | null } & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "defaultValue"
>) {
  const value = useKept(name, defaultValue);
  return <textarea key={value} name={name} defaultValue={value} className="textarea" {...rest} />;
}

export function KeptSelect({
  name,
  defaultValue,
  children,
  ...rest
}: { name: string; defaultValue?: string | null; children: ReactNode } & Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "name" | "defaultValue"
>) {
  const value = useKept(name, defaultValue);
  return (
    <select key={value} name={name} defaultValue={value} className="select" {...rest}>
      {children}
    </select>
  );
}

export function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  const checked = useKeptChecked(name, defaultChecked);
  return (
    <label className="choice">
      <input key={String(checked)} type="checkbox" name={name} defaultChecked={checked} className="check" />
      <span>{label}</span>
    </label>
  );
}

// ------------------------------------------------------------- submit / UX --

export function Submit({
  label,
  busyLabel,
  tone = "primary",
}: {
  label: string;
  busyLabel?: string;
  tone?: "primary" | "accent";
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`btn btn-${tone}`} disabled={pending}>
      {pending ? (busyLabel ?? "Saving…") : label}
    </button>
  );
}

/** Inline result banner for a server action's return value. */
export function Result({ state }: { state: CrudState }) {
  if (!state?.error && !state?.ok) return null;
  const bad = Boolean(state?.error);
  return (
    <p
      role="status"
      className="text-[0.84rem] p-3 animate-fade"
      style={{
        background: bad ? "var(--danger-soft)" : "var(--success-soft)",
        color: bad ? "var(--danger)" : "var(--success)",
        borderLeft: `4px solid ${bad ? "var(--danger)" : "var(--success)"}`,
      }}
    >
      {bad ? null : <Check size={13} className="inline -mt-0.5 mr-1.5" />}
      {state.error ?? state.ok}
    </p>
  );
}

/**
 * A delete control that makes the consequence explicit before it fires.
 *
 * The first click reveals the warning and the real button; nothing is
 * submitted until the second. Deliberately not `window.confirm`, because the
 * warning needs to say what will actually happen to related records — and a
 * native dialog cannot be read at a glance during a demo.
 */
export function DangerButton({
  action,
  hidden,
  label = "Delete",
  confirmLabel = "Yes, delete",
  warning,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  label?: string;
  confirmLabel?: string;
  warning: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" className="btn btn-danger btn-sm" onClick={() => setArmed(true)}>
        <Trash2 size={13} /> {label}
      </button>
    );
  }

  return (
    <div
      className="p-3 animate-fade"
      style={{ border: "2px solid var(--danger)", background: "var(--danger-soft)", maxWidth: "26rem" }}
    >
      <p className="text-[0.82rem] leading-relaxed flex gap-2" style={{ color: "var(--danger)" }}>
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <span>{warning}</span>
      </p>
      <div className="flex gap-2 mt-3">
        <form action={action}>
          {Object.entries(hidden).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <ConfirmSubmit label={confirmLabel} />
        </form>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setArmed(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ConfirmSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-sm"
      disabled={pending}
      style={{ background: "var(--danger)", color: "#fff", borderColor: "var(--danger)" }}
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}

/** A small inline form that posts a single hidden value — used for toggles. */
export function MiniForm({
  action,
  hidden,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  children: ReactNode;
}) {
  return (
    <form action={action} className="inline-flex">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {children}
    </form>
  );
}
