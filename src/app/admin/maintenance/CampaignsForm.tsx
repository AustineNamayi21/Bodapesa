"use client";

import { useActionState } from "react";
import { Megaphone } from "lucide-react";

import { installCampaignsAction } from "@/lib/maintenance";
import type { FormState } from "@/lib/form-state";

/**
 * Drafting the campaigns.
 *
 * The cost line is shown rather than buried: at KES 0.80 a part, a campaign
 * to the whole register is a real spend, and an operator about to create
 * thirty-two of them should see that before clicking.
 */
export function CampaignsForm({ total, existing }: { total: number; existing: number }) {
  const [state, action] = useActionState(installCampaignsAction, null as FormState);

  if (state?.ok) {
    return (
      <div style={{ border: "1px solid var(--success)", padding: "1.25rem" }}>
        <p className="stat-label" style={{ color: "var(--success)" }}>Campaigns drafted</p>
        <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", lineHeight: 1.6 }}>{state.ok}</p>
      </div>
    );
  }

  return (
    <form action={action} style={{ border: "1px solid var(--border-strong)", padding: "1.5rem", display: "grid", gap: "1.1rem" }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>Draft {total} campaigns, one per product</p>
        <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "0.4rem", lineHeight: 1.6 }}>
          Each is written in English, Kiswahili and Sheng, and every message fits inside a single
          160-character SMS part — so each one costs KES 0.80 per rider, not KES 1.60.
        </p>
      </div>

      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        Each campaign carries its own audience. Insurance goes to riders with no cover, savings to riders
        with no bank account, SACCO credit to members. That targeting is what keeps this from being spam —
        check the audience count on each campaign before sending it.
        {existing > 0 ? ` There are already ${existing} campaigns; matching names will be updated, and anything already sent is left untouched.` : ""}
      </p>

      <label className="stat-label" style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" }}>
        <input type="checkbox" name="confirm" value="1" required style={{ marginTop: 2 }} />
        <span style={{ lineHeight: 1.6 }}>
          I understand these install as drafts and that nothing is sent until I open each campaign and send it.
        </span>
      </label>

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.84rem", color: "var(--danger)" }}>{state.error}</p>
      ) : null}

      <div>
        <button type="submit" className="btn btn-primary btn-sm">
          <Megaphone size={13} /> Draft the campaigns
        </button>
      </div>
    </form>
  );
}
