"use client";

import { useActionState, useState } from "react";
import { KeyRound, UserPlus } from "lucide-react";

import {
  createConsoleUserAction,
  resetConsolePasswordAction,
  setConsoleUserActiveAction,
} from "@/lib/users";
import type { ConsoleUser } from "@/lib/console-users";
import type { FormState } from "@/lib/form-state";
import { Pill } from "@/components/ui";

/**
 * A newly created or reset password is shown once, here, and never stored in
 * the clear. The admin passes it on and the holder changes it.
 */
function OneTimePassword({ value }: { value: string }) {
  return (
    <div
      role="status"
      style={{
        marginTop: "1rem",
        padding: "0.9rem 1.1rem",
        border: "1px solid var(--accent)",
        display: "grid",
        gap: "0.35rem",
      }}
    >
      <span className="stat-label" style={{ color: "var(--accent)" }}>
        Starting password — shown once
      </span>
      <code style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.04em" }}>{value}</code>
      <span style={{ fontSize: "0.76rem", color: "var(--text-faint)" }}>
        Pass this to them directly. It is not stored anywhere you can read it again.
      </span>
    </div>
  );
}

export function NewConsoleUserForm({
  partners,
  roles,
}: {
  partners: { id: string; name: string }[];
  roles: { value: string; label: string; hint: string }[];
}) {
  const [state, action] = useActionState(createConsoleUserAction, null as FormState);
  const [role, setRole] = useState("PARTNER_ADMIN");
  const v = state?.values ?? {};

  return (
    <form action={action} style={{ display: "grid", gap: "1rem", maxWidth: "44rem" }}>
      <p className="stat-label">Add an account</p>

      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))" }}>
        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span className="stat-label">Name</span>
          <input name="name" defaultValue={v.name ?? ""} required className="input" placeholder="Grace Mwangi" />
        </label>

        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span className="stat-label">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={v.email ?? ""}
            required
            className="input"
            placeholder="grace@britam.com"
          />
        </label>

        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span className="stat-label">Role</span>
          <select
            name="role"
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        {/* Only meaningful for partner staff; a platform admin is deliberately
            not tied to one partner. */}
        {role === "PARTNER_ADMIN" ? (
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span className="stat-label">Partner</span>
            <select name="partnerId" className="select" defaultValue={v.partnerId ?? ""} required>
              <option value="">Choose…</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label style={{ display: "grid", gap: "0.35rem" }}>
          <span className="stat-label">Starting password</span>
          <input
            name="password"
            className="input"
            minLength={8}
            placeholder="Leave blank to generate one"
          />
        </label>
      </div>

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.82rem", color: "var(--danger)" }}>
          {state.error}
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary btn-sm">
          <UserPlus size={13} /> Add account
        </button>
      </div>

      {state?.ok ? <OneTimePassword value={state.ok} /> : null}
    </form>
  );
}

export function ConsoleUserRow({ user, isSelf }: { user: ConsoleUser; isSelf: boolean }) {
  const [reset, resetAction] = useActionState(resetConsolePasswordAction, null as FormState);
  const active = Number(user.active) === 1;

  return (
    <div style={{ padding: "1.1rem 0", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "0.95rem", fontWeight: 700, opacity: active ? 1 : 0.5 }}>{user.name}</span>
            <Pill tone={user.role === "PLATFORM_ADMIN" ? "accent" : "neutral"}>
              {user.role === "PLATFORM_ADMIN" ? "Platform" : (user.partnerName ?? "No partner")}
            </Pill>
            {!active ? <Pill tone="danger">Switched off</Pill> : null}
            {isSelf ? <Pill tone="neutral">You</Pill> : null}
          </div>
          <p className="stat-label" style={{ marginTop: "0.4rem" }}>
            {user.email} · {Number(user.threads)} threads answered · {Number(user.openLeads)} open leads
          </p>
          {reset?.ok ? <OneTimePassword value={reset.ok} /> : null}
          {reset?.error ? (
            <p role="alert" style={{ fontSize: "0.8rem", color: "var(--danger)", marginTop: "0.5rem" }}>
              {reset.error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <form action={resetAction}>
            <input type="hidden" name="userId" value={user.id} />
            <button type="submit" className="btn btn-ghost btn-sm">
              <KeyRound size={13} /> Reset password
            </button>
          </form>

          {/* Switching off your own account, or the last platform account,
              is refused in the action as well as hidden here. */}
          {!isSelf ? (
            <form action={setConsoleUserActiveAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="active" value={active ? "0" : "1"} />
              <button type="submit" className="btn btn-ghost btn-sm">
                {active ? "Switch off" : "Switch on"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
