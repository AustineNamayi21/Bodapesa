"use client";

import { useActionState } from "react";
import { DatabaseBackup } from "lucide-react";

import { restockDemoDataAction } from "@/lib/maintenance";
import type { FormState } from "@/lib/form-state";

/**
 * Adding demonstration data.
 *
 * For the case where the seed script cannot be run — a deployed database whose
 * connection string the operator does not hold. Unlike the purge below it this
 * is additive: it only ever removes rows an earlier run generated, so riders
 * who actually signed up keep everything. That is why it asks for a tick
 * rather than a typed phrase.
 */
export function RestockForm({
  ridersReal,
  ridersDemo,
}: {
  ridersReal: number;
  ridersDemo: number;
}) {
  const [state, action] = useActionState(restockDemoDataAction, null as FormState);

  if (state?.ok) {
    return (
      <div style={{ border: "1px solid var(--success)", padding: "1.25rem" }}>
        <p className="stat-label" style={{ color: "var(--success)" }}>Demonstration data added</p>
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", lineHeight: 1.6 }}>{state.ok}</p>
      </div>
    );
  }

  return (
    <form
      action={action}
      style={{ border: "1px solid var(--border-strong)", padding: "1.5rem", display: "grid", gap: "1.1rem" }}
    >
      <div>
        <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          Add about 30 demonstration riders
        </p>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
          Generates riders at every stage of the programme, with the enquiries, conversations, messages,
          savings goals, signals and donations to match — so each screen in the console has something to
          show without waiting for a real register to fill.
        </p>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.9rem" }}>
        <p className="stat-label" style={{ marginBottom: "0.5rem" }}>What this leaves alone</p>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          {ridersReal > 0 ? (
            <>
              The <strong style={{ color: "var(--text)" }}>{ridersReal} rider{ridersReal === 1 ? "" : "s"} who
              signed up for real</strong>, with every message, enquiry and lesson of theirs. Partners, staff
              accounts, stages, products and the curriculum too — so your own sign-in and the verified
              catalogue survive.
            </>
          ) : (
            <>
              Partners, staff accounts, stages, products and the curriculum — so your own sign-in and the
              verified catalogue survive. Any rider who signs up for real would be left alone as well.
            </>
          )}
        </p>
      </div>

      {ridersDemo > 0 ? (
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          There {ridersDemo === 1 ? "is" : "are"} already {ridersDemo} generated rider
          {ridersDemo === 1 ? "" : "s"} here. They will be replaced rather than added to, so running this
          twice does not leave two copies.
        </p>
      ) : null}

      <label className="stat-label" style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" }}>
        <input type="checkbox" name="confirm" value="1" required style={{ marginTop: 2 }} />
        <span style={{ lineHeight: 1.6 }}>
          I understand these riders are invented, that their messages were never sent, and that any figure
          computed from them is a demonstration rather than a result.
        </span>
      </label>

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.84rem", color: "var(--danger)", lineHeight: 1.6 }}>
          {state.error}
        </p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary btn-sm">
          <DatabaseBackup size={13} /> Add demonstration data
        </button>
      </div>
    </form>
  );
}
