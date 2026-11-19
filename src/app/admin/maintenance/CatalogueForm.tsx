"use client";

import { useActionState } from "react";
import { BookCheck } from "lucide-react";

import { installCatalogueAction } from "@/lib/maintenance";
import type { FormState } from "@/lib/form-state";

/**
 * Installing the researched catalogue.
 *
 * Far less destructive than the purge beside it — products are upserted by
 * code and anything left over is deactivated, not deleted — so this asks for
 * a tick rather than a typed phrase.
 */
export function CatalogueForm({
  total,
  byPartner,
  currentActive,
}: {
  total: number;
  byPartner: { partner: string; count: number }[];
  currentActive: number;
}) {
  const [state, action] = useActionState(installCatalogueAction, null as FormState);

  if (state?.ok) {
    return (
      <div style={{ border: "1px solid var(--success)", padding: "1.25rem" }}>
        <p className="stat-label" style={{ color: "var(--success)" }}>Catalogue installed</p>
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", lineHeight: 1.6 }}>{state.ok}</p>
      </div>
    );
  }

  return (
    <form action={action} style={{ border: "1px solid var(--border-strong)", padding: "1.5rem", display: "grid", gap: "1.1rem" }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
          Install {total} researched products
        </p>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
          {byPartner.map((p) => `${p.count} from ${p.partner}`).join(", ")}. Each carries the page its terms
          were read from and the date they were checked, so staff can see when a figure is going stale.
        </p>
      </div>

      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        Products are matched by code, so running this again updates them in place and keeps the enquiries
        already attached. The {currentActive} products currently active that are not in the catalogue will be
        deactivated, not deleted — their enquiry history survives.
      </p>

      <label className="stat-label" style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" }}>
        <input type="checkbox" name="confirm" value="1" required style={{ marginTop: 2 }} />
        <span style={{ lineHeight: 1.6 }}>
          I understand these are published terms that change, and that a rider must confirm the current
          premium or rate with the partner before committing.
        </span>
      </label>

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.84rem", color: "var(--danger)" }}>{state.error}</p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary btn-sm">
          <BookCheck size={13} /> Install the catalogue
        </button>
      </div>
    </form>
  );
}
