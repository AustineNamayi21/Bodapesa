"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { riderSelfRegisterAction, type RiderRegisterState } from "@/lib/actions";
import { Keep, KeptInput, KeptSelect } from "@/components/admin";

export interface StageOption {
  id: string;
  name: string;
  subCounty: string;
}

/**
 * Rider self-registration.
 *
 * Three steps, but one form and one submit. The steps only show and hide
 * fieldsets on the client — every field stays mounted, so nothing is lost
 * when moving back and forth, and the whole thing posts in a single server
 * action. That keeps a multi-step feel without multi-step failure modes.
 */

const STEPS = [
  { n: 1, en: "You", sw: "Wewe" },
  { n: 2, en: "Your stage", sw: "Kituo chako" },
  { n: 3, en: "Money today", sw: "Pesa leo" },
] as const;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-accent w-full" disabled={pending}>
      {pending ? "Inasajili…" : "Maliza · Finish"}
      {pending ? null : <ArrowRight size={15} />}
    </button>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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

export default function RegisterForm({ stages }: { stages: StageOption[] }) {
  const [state, action] = useActionState(riderSelfRegisterAction, null as RiderRegisterState);
  const [step, setStep] = useState(1);

  // An error always belongs to a specific step; jump the rider to it rather
  // than leaving them staring at a message about a field they cannot see.
  const errorStep = state?.field
    ? ["firstName", "lastName", "msisdn"].includes(state.field)
      ? 1
      : state.field === "consent"
        ? 3
        : 2
    : null;
  const shown = errorStep ?? step;

  const subCounties = [...new Set(stages.map((s) => s.subCounty))].sort();

  // React blanks an uncontrolled form once the action resolves, so the
  // checkboxes re-seed from whatever the rider last submitted.
  const echoed = state?.error ? state.values : undefined;
  const keptChecked = (name: string, fallback?: boolean) =>
    echoed && Object.keys(echoed).length ? name in echoed : Boolean(fallback);

  return (
    <Keep state={state}>
      <form action={action} className="space-y-6">
        {/* ── progress ───────────────────────────────────────────────────── */}
        <ol className="flex items-stretch gap-0" aria-label="Registration steps">
          {STEPS.map((s) => {
            const state_ = s.n < shown ? "done" : s.n === shown ? "current" : "todo";
            return (
              <li key={s.n} className="flex-1">
                <div
                  style={{
                    height: "3px",
                    background:
                      state_ === "todo"
                        ? "var(--border)"
                        : state_ === "current"
                          ? "var(--ember)"
                          : "var(--ink)",
                    transition: "background 0.3s var(--ease-soft)",
                  }}
                />
                <div className="pt-2 flex items-center gap-1.5">
                  <span
                    className="grid place-items-center shrink-0"
                    style={{
                      width: "1.1rem",
                      height: "1.1rem",
                      background:
                        state_ === "todo"
                          ? "transparent"
                          : state_ === "current"
                            ? "var(--ember)"
                            : "var(--ink)",
                      border: state_ === "todo" ? "1.5px solid var(--border-strong)" : "none",
                      color: state_ === "current" ? "#000" : "#fff",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.56rem",
                      fontWeight: 700,
                    }}
                  >
                    {state_ === "done" ? <Check size={9} strokeWidth={3.5} /> : s.n}
                  </span>
                  <span
                    className="text-[0.56rem] uppercase truncate"
                    style={{
                      letterSpacing: "0.12em",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      color: state_ === "todo" ? "var(--text-faint)" : "var(--text)",
                    }}
                  >
                    {s.sw}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* ── step 1: who you are ────────────────────────────────────────── */}
        <fieldset hidden={shown !== 1} className="space-y-4 animate-fade">
          <legend className="sr-only">About you</legend>

          <div className="grid grid-cols-2 gap-3">
            <Field id="firstName" label="Jina la kwanza · First name">
              <KeptInput id="firstName" name="firstName" autoComplete="given-name" required />
            </Field>
            <Field id="lastName" label="Jina la pili · Last name">
              <KeptInput id="lastName" name="lastName" autoComplete="family-name" required />
            </Field>
          </div>

          <Field
            id="msisdn"
            label="Nambari ya simu · Phone number"
            hint="Hii ndiyo utakayotumia kuingia. This is the number you will sign in with."
          >
            <KeptInput
              id="msisdn"
              name="msisdn"
              className="input"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0712 345 678"
              required
            />
          </Field>

          <Field id="language" label="Lugha · Language">
            <KeptSelect id="language" name="language" defaultValue="SW">
              <option value="SW">Kiswahili</option>
              <option value="EN">English</option>
              <option value="SH">Sheng</option>
            </KeptSelect>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="gender" label="Jinsia · Gender">
              <KeptSelect id="gender" name="gender">
                <option value="">—</option>
                <option value="M">Mwanaume · Male</option>
                <option value="F">Mwanamke · Female</option>
                <option value="OTHER">Nyingine · Other</option>
              </KeptSelect>
            </Field>
            <Field id="ageBand" label="Umri · Age">
              <KeptSelect id="ageBand" name="ageBand">
                <option value="">—</option>
                {["18-24", "25-34", "35-44", "45+"].map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </KeptSelect>
            </Field>
          </div>
        </fieldset>

        {/* ── step 2: where you ride ─────────────────────────────────────── */}
        <fieldset hidden={shown !== 2} className="space-y-4 animate-fade">
          <legend className="sr-only">Your stage</legend>

          <Field
            id="stageId"
            label="Kituo chako · Your stage"
            hint="Hiari. Inatusaidia kukuunganisha na waendeshaji wenzako. Optional — it helps us connect you with riders nearby."
          >
            <KeptSelect id="stageId" name="stageId" defaultValue="">
              <option value="">Sijachagua · Not listed</option>
              {subCounties.map((sc) => (
                <optgroup key={sc} label={sc}>
                  {stages
                    .filter((s) => s.subCounty === sc)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </KeptSelect>
          </Field>

          <Field
            id="nationalId"
            label="Nambari ya kitambulisho · National ID"
            hint="Hiari. Inahitajika tu ukijiunga na SACCO baadaye. Optional — only needed if you join a SACCO later."
          >
            <KeptInput id="nationalId" name="nationalId" inputMode="numeric" />
          </Field>

          <Field id="channelPref" label="Tupate wapi · Where should we reach you">
            <KeptSelect id="channelPref" name="channelPref" defaultValue="SMS">
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="APP">Hapa tu · In the app only</option>
            </KeptSelect>
          </Field>
        </fieldset>

        {/* ── step 3: baseline and consent ───────────────────────────────── */}
        <fieldset hidden={shown !== 3} className="space-y-4 animate-fade">
          <legend className="sr-only">Your money today</legend>

          <Field
            id="dailyIncomeBand"
            label="Unabaki na ngapi kwa siku · Daily take-home"
            hint="Haitaonekana kwa mtu mwingine. Inatusaidia kukupa masomo yanayokufaa. Never shown to anyone else — it helps us pick the right lessons."
          >
            <KeptSelect id="dailyIncomeBand" name="dailyIncomeBand">
              <option value="">—</option>
              <option value="<500">Chini ya KSh 500</option>
              <option value="500-1000">KSh 500 – 1,000</option>
              <option value="1000-1500">KSh 1,000 – 1,500</option>
              <option value=">1500">Zaidi ya KSh 1,500</option>
            </KeptSelect>
          </Field>

          <div>
            <span className="label">Hali yako leo · Where you are today</span>
            <div className="grid gap-2">
              {[
                { name: "ownsMotorbike", label: "Pikipiki ni yangu · I own the bike I ride" },
                { name: "usesMobileMoney", label: "Natumia M-Pesa · I use mobile money", checked: true },
                { name: "hasBankAccount", label: "Nina akaunti ya benki · I have a bank account" },
                { name: "saccoMember", label: "Niko kwenye SACCO · I am in a SACCO" },
                { name: "hasInsurance", label: "Nina bima · I have insurance" },
              ].map((f) => (
                <label key={f.name} className="choice">
                  <input
                    key={String(keptChecked(f.name, f.checked))}
                    type="checkbox"
                    name={f.name}
                    defaultChecked={keptChecked(f.name, f.checked)}
                    className="check"
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label
            className="flex items-start gap-3 p-3.5 cursor-pointer"
            style={{
              border: state?.field === "consent" ? "2px solid var(--danger)" : "2px solid var(--ink)",
              background: "var(--surface)",
            }}
          >
            <input
              key={String(keptChecked("consent", false))}
              type="checkbox"
              name="consent"
              defaultChecked={keptChecked("consent", false)}
              className="check mt-0.5"
            />
            <span className="text-[0.84rem] leading-relaxed">
              <strong>Nakubali kupokea masomo na taarifa za bidhaa.</strong>
              <span className="block mt-1" style={{ color: "var(--text-muted)" }}>
                I agree to receive financial literacy lessons and product information. You can stop at any
                time by replying STOP. We never sell your number.
              </span>
            </span>
          </label>
        </fieldset>

        {/* ── error ──────────────────────────────────────────────────────── */}
        {state?.error ? (
          <p
            role="alert"
            className="text-[0.84rem] p-3 animate-shake"
            style={{
              background: "var(--danger-soft)",
              color: "var(--danger)",
              borderLeft: "4px solid var(--danger)",
            }}
          >
            {state.error}
          </p>
        ) : null}

        {/* ── navigation ─────────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {shown > 1 ? (
            <button type="button" className="btn btn-ghost" onClick={() => setStep(shown - 1)}>
              <ArrowLeft size={15} /> Nyuma
            </button>
          ) : null}

          {shown < 3 ? (
            <button type="button" className="btn btn-primary flex-1" onClick={() => setStep(shown + 1)}>
              Endelea · Continue <ArrowRight size={15} />
            </button>
          ) : (
            <div className="flex-1">
              <Submit />
            </div>
          )}
        </div>
      </form>
    </Keep>
  );
}
