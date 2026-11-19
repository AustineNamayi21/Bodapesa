import Link from "next/link";

/**
 * Reached when a rider opens a thread or lesson that is not theirs or no
 * longer exists. Inside the app segment so the bottom navigation stays put —
 * a dead end with no way onward is how people abandon an app.
 */
export default function RiderNotFound() {
  return (
    <div style={{ padding: "2.5rem 1.25rem" }}>
      <h1 className="display-sm">Hatukuipata</h1>
      <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
        We couldn&rsquo;t find that. It may have been closed, or it may belong to someone else.
      </p>
      <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
        <Link href="/rider/inbox" className="btn btn-primary btn-sm">Ujumbe</Link>
        <Link href="/rider/home" className="btn btn-ghost btn-sm">Nyumbani</Link>
      </div>
    </div>
  );
}
