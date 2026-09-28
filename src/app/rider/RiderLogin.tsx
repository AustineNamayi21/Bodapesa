"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { riderLoginAction, type RiderLoginState } from "@/lib/actions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Inapakia…" : label}
    </button>
  );
}

export default function RiderLogin() {
  const [state, action] = useActionState(riderLoginAction, null as RiderLoginState);

  if (state?.step === "code") {
    return (
      <form action={action} className="space-y-3">
        <p className="text-[0.8rem] text-[var(--text-muted)] leading-relaxed">
          Tumetuma nambari ya siri kwa <strong className="text-[var(--text)]">{state.display}</strong>.
          <br />
          We have sent a code to that number.
        </p>
        <div>
          <label className="label" htmlFor="code">
            Nambari ya siri · Code
          </label>
          <input
            id="code"
            name="code"
            className="input tracking-[0.3em] text-center tabular-nums"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            placeholder="••••••"
            required
            autoFocus
          />
        </div>
        {state.note ? <p className="text-[0.74rem] text-[var(--text-faint)]">{state.note}</p> : null}
        {state.error ? (
          <p className="text-[0.78rem]" style={{ color: "var(--danger)" }}>
            {state.error}
          </p>
        ) : null}
        <Submit label="Thibitisha / Confirm" />
        <a href="/rider" className="block text-center text-[0.75rem] text-[var(--text-faint)] hover:underline">
          Tumia nambari nyingine · Use a different number
        </a>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="msisdn">
          Nambari ya simu · Phone number
        </label>
        <input
          id="msisdn"
          name="msisdn"
          className="input"
          inputMode="tel"
          placeholder="0712 345 678"
          autoComplete="tel"
          required
        />
      </div>
      {state?.error ? (
        <p className="text-[0.78rem]" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      ) : null}
      <Submit label="Ingia / Sign in" />
    </form>
  );
}
