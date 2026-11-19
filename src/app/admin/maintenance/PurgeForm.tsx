"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";

import { purgeDemoDataAction } from "@/lib/maintenance";
import { PURGE_PHRASE } from "@/lib/maintenance-shared";
import type { FormState } from "@/lib/form-state";

/**
 * The destructive control.
 *
 * Three things stand between a stray click and an empty register: the number
 * kept is visible and adjustable, the exact phrase has to be typed, and the
 * submit button stays disabled until it matches. The action re-checks the
 * phrase server-side, because none of this is worth anything on its own.
 */
export function PurgeForm({
  keep,
  toDelete,
  campaigns,
}: {
  keep: number;
  toDelete: number;
  campaigns: number;
}) {
  const [state, action] = useActionState(purgeDemoDataAction, null as FormState);
  const [phrase, setPhrase] = useState("");
  const [keepValue, setKeepValue] = useState(keep);
  const router = useRouter();

  if (state?.ok) {
    return (
      <div style={{ border: "1px solid var(--success)", padding: "1.25rem" }}>
        <p className="stat-label" style={{ color: "var(--success)" }}>
          Done
        </p>
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", lineHeight: 1.6 }}>{state.ok}</p>
        <p style={{ marginTop: "0.9rem", fontSize: "0.82rem", color: "var(--text-faint)" }}>
          Every report now counts only what actually happened.
        </p>
      </div>
    );
  }

  return (
    <form action={action} style={{ border: "1px solid var(--danger)", padding: "1.5rem", display: "grid", gap: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <AlertTriangle size={18} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            This removes {toDelete.toLocaleString()} riders and cannot be undone
          </p>
          <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
            Their lessons, quiz attempts, messages, enquiries, savings goals, conversations and signals go
            with them. There is no backup inside the application — if you want one, take it from your
            database host first.
          </p>
        </div>
      </div>

      <label style={{ display: "grid", gap: "0.35rem", maxWidth: "16rem" }}>
        <span className="stat-label">Keep this many most recent riders</span>
        <input
          name="keep"
          type="number"
          min={0}
          max={100}
          value={keepValue}
          onChange={(e) => {
            const n = Number(e.target.value);
            setKeepValue(n);
            // Re-run the preview so the list of who survives always matches
            // the number in the box.
            router.replace(`/admin/maintenance?keep=${n}`, { scroll: false });
          }}
          className="input"
        />
      </label>

      {campaigns > 0 ? (
        <label className="stat-label" style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" }}>
          <input type="checkbox" name="campaigns" value="1" defaultChecked style={{ marginTop: 2 }} />
          <span style={{ lineHeight: 1.6 }}>
            Also remove the {campaigns} seeded campaigns. Their sends disappear with the riders, so leaving
            them would show campaigns reporting zero delivery for ever.
          </span>
        </label>
      ) : null}

      <label style={{ display: "grid", gap: "0.35rem", maxWidth: "22rem" }}>
        <span className="stat-label">
          Type <strong style={{ color: "var(--danger)" }}>{PURGE_PHRASE}</strong> to confirm
        </span>
        <input
          name="confirm"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          autoComplete="off"
          className="input"
          placeholder={PURGE_PHRASE}
        />
      </label>

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.84rem", color: "var(--danger)" }}>
          {state.error}
        </p>
      ) : null}

      <div>
        <button
          type="submit"
          className="btn btn-sm"
          disabled={phrase !== PURGE_PHRASE}
          style={{
            background: phrase === PURGE_PHRASE ? "var(--danger)" : "transparent",
            color: phrase === PURGE_PHRASE ? "#fff" : "var(--text-faint)",
            borderColor: phrase === PURGE_PHRASE ? "var(--danger)" : "var(--border)",
            cursor: phrase === PURGE_PHRASE ? "pointer" : "not-allowed",
          }}
        >
          <Trash2 size={13} /> Remove the demonstration data
        </button>
      </div>
    </form>
  );
}
