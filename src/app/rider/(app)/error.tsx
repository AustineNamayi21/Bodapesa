"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

/**
 * Scoped to the rider app so the bottom navigation survives. Written plainly
 * and without jargon: the people reading it are riders, and many are reading
 * in a second language.
 */
export default function RiderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bodapesa] rider app error", error);
  }, [error]);

  return (
    <div style={{ padding: "2.5rem 1.25rem" }}>
      <h1 className="display-sm">Hatukuweza kupakia</h1>
      <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
        We couldn&rsquo;t load this page. Jaribu tena — hakuna kitu chako kilichopotea.
      </p>
      <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
        <button type="button" onClick={reset} className="btn btn-primary btn-sm">
          <RotateCw size={13} /> Jaribu tena
        </button>
        <Link href="/rider/home" className="btn btn-ghost btn-sm">Nyumbani</Link>
      </div>
    </div>
  );
}
