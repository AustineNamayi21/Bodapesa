"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

/**
 * Scoped to the console, so the sidebar and the way out stay on screen: a
 * failing report should not cost the operator their navigation.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bodapesa] console error", error);
  }, [error]);

  return (
    <div style={{ paddingBlock: "3rem", maxWidth: "40rem" }}>
      <p className="eyebrow eyebrow-rule" style={{ color: "var(--accent)" }}>
        This screen failed
      </p>
      <h1 className="display-sm" style={{ marginTop: "1rem" }}>
        We couldn&rsquo;t load this
      </h1>
      <p className="copy-sm" style={{ marginTop: "0.9rem", color: "var(--text-muted)" }}>
        The rest of the console is still working — use the menu to carry on elsewhere.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
        <button type="button" onClick={reset} className="btn btn-primary btn-sm">
          <RotateCw size={13} /> Try again
        </button>
        <Link href="/admin" className="btn btn-ghost btn-sm">Dashboard</Link>
      </div>
      {error.digest ? (
        <p className="stat-label" style={{ marginTop: "1.75rem" }}>Reference {error.digest}</p>
      ) : null}
    </div>
  );
}
