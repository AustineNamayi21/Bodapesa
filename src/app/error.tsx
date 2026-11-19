"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

/**
 * The last line of defence for the whole application.
 *
 * Without this, a server error reaches the host's own error page — a black
 * screen reading "This page couldn't load" with no way back, no indication of
 * which part failed, and nothing an operator can quote when reporting it.
 *
 * The digest is the one thing worth surfacing: it is the id the platform logs
 * the stack trace under, so quoting it turns "a page broke" into something
 * findable. The underlying message is deliberately not shown — it can carry
 * table and column names.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bodapesa] unhandled error", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "var(--gutter)",
        background: "var(--ground)",
      }}
    >
      <div style={{ maxWidth: "34rem" }}>
        <p className="eyebrow eyebrow-rule" style={{ color: "var(--accent)" }}>
          Something broke
        </p>
        <h1 className="display-md" style={{ marginTop: "1rem" }}>
          This page didn&rsquo;t load
        </h1>
        <p className="copy" style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
          The problem is on our side, not yours. Nothing you entered has been lost.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <button type="button" onClick={reset} className="btn btn-primary btn-sm">
            <RotateCw size={13} /> Try again
          </button>
          <Link href="/" className="btn btn-ghost btn-sm">
            Back to the start
          </Link>
        </div>

        {error.digest ? (
          <p className="stat-label" style={{ marginTop: "2rem" }}>
            Reference {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
