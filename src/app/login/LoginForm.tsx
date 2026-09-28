"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/lib/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ prefill = false }: { prefill?: boolean }) {
  const [state, action] = useActionState(loginAction, null as { error?: string } | null);

  return (
    <form action={action} className="space-y-3">
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" className="input" defaultValue={prefill ? "admin@bodapesa.ke" : ""} required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input id="password" name="password" type="password" className="input" defaultValue={prefill ? "bodapesa2026" : ""} required />
      </div>
      {state?.error ? (
        <p className="text-[0.78rem]" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      ) : null}
      <Submit />
    </form>
  );
}
