"use client";

/**
 * Catches a failure in the root layout itself, which `error.tsx` cannot —
 * at that point no layout has rendered, so this file supplies its own
 * <html> and <body> and cannot rely on the stylesheet having loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#000",
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p style={{ fontSize: "0.6875rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#e8341f" }}>
            BodaPesa
          </p>
          <h1 style={{ fontSize: "2.25rem", lineHeight: 1.05, margin: "1rem 0 0" }}>
            The application didn&rsquo;t start
          </h1>
          <p style={{ color: "#c4c4c4", lineHeight: 1.6, marginTop: "1rem" }}>
            This is on our side. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.8rem 1.4rem",
              background: "#e8341f",
              color: "#fff",
              border: 0,
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ marginTop: "2rem", fontSize: "0.6875rem", letterSpacing: "0.18em", color: "#6b6b6b" }}>
              REFERENCE {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
