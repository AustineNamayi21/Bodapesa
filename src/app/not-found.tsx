import Link from "next/link";

/**
 * Reached by `notFound()` as well as by an unknown URL — so a rider opening
 * someone else's conversation lands here rather than on a blank error.
 */
export default function NotFound() {
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
          Not found
        </p>
        <h1 className="display-md" style={{ marginTop: "1rem" }}>
          There&rsquo;s nothing here
        </h1>
        <p className="copy" style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
          The page may have moved, or it may belong to someone else.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary btn-sm">Back to the start</Link>
          <Link href="/rider/home" className="btn btn-ghost btn-sm">Rider app</Link>
        </div>
      </div>
    </main>
  );
}
