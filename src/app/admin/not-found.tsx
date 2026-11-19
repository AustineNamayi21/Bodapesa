import Link from "next/link";

/** Keeps the console shell and its navigation around a missing record. */
export default function AdminNotFound() {
  return (
    <div style={{ paddingBlock: "3rem", maxWidth: "40rem" }}>
      <p className="eyebrow eyebrow-rule" style={{ color: "var(--accent)" }}>Not found</p>
      <h1 className="display-sm" style={{ marginTop: "1rem" }}>That record isn&rsquo;t here</h1>
      <p className="copy-sm" style={{ marginTop: "0.9rem", color: "var(--text-muted)" }}>
        It may have been deleted, or it may belong to another partner.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
        <Link href="/admin" className="btn btn-primary btn-sm">Dashboard</Link>
        <Link href="/admin/conversations" className="btn btn-ghost btn-sm">Conversations</Link>
      </div>
    </div>
  );
}
