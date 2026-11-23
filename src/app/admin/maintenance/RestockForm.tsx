"use client";

import { useActionState } from "react";
import { DatabaseBackup } from "lucide-react";

import { restockDemoDataAction } from "@/lib/maintenance";
import { RESTOCK_PHRASE } from "@/lib/maintenance-shared";
import type { FormState } from "@/lib/form-state";

/**
 * Rebuilding the demonstration dataset.
 *
 * The counterpart to the purge above it, for the case where the seed script
 * cannot be run — a deployed database whose connection string the operator
 * does not hold. It asks for a typed phrase because it deletes every rider
 * first, and it refuses outright if any of them turn out to be real.
 */
export function RestockForm({
  ridersTotal,
  ridersReal,
}: {
  ridersTotal: number;
  ridersReal: number;
}) {
  const [state, action] = useActionState(restockDemoDataAction, null as FormState);

  if (state?.ok) {
    return (
      <div style={{ border: "1px solid var(--success)", padding: "1.25rem" }}>
        <p className="stat-label" style={{ color: "var(--success)" }}>Demonstration data rebuilt</p>
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", lineHeight: 1.6 }}>{state.ok}</p>
      </div>
    );
  }

  const blocked = ridersReal > 0;

  return (
    <form
      action={action}
      style={{ border: "1px solid var(--border-strong)", padding: "1.5rem", display: "grid", gap: "1.1rem" }}
    >
      <div>
        <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Rebuild the demonstration dataset</p>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
          Replaces every rider, campaign, message, enquiry, conversation, signal and donation with a freshly
          generated set — about 30 riders at every stage of the programme, so each screen in the console has
          something to show.
        </p>
      </div>

      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        Partners, staff accounts, stages, products and the curriculum are left alone, so your own sign-in and
        the verified catalogue survive untouched. Only data that was invented in the first place is replaced.
      </p>

      {blocked ? (
        <p role="alert" style={{ fontSize: "0.84rem", color: "var(--danger)", lineHeight: 1.6 }}>
          {ridersReal} of the {ridersTotal} riders in this register were not generated. Rebuilding would delete
          them, so it is refused — remove them deliberately with the purge above if that is really what you want.
        </p>
      ) : (
        <label style={{ display: "grid", gap: "0.4rem" }}>
          <span className="stat-label">
            Type {RESTOCK_PHRASE} to confirm — this deletes all {ridersTotal} riders first
          </span>
          <input
            name="confirm"
            required
            autoComplete="off"
            spellCheck={false}
            placeholder={RESTOCK_PHRASE}
            style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.04em" }}
          />
        </label>
      )}

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.84rem", color: "var(--danger)", lineHeight: 1.6 }}>
          {state.error}
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={blocked}>
          <DatabaseBackup size={13} /> Rebuild demonstration data
        </button>
      </div>
    </form>
  );
}
