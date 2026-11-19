/** Keeps the console shell on screen while a data-heavy report resolves. */
export default function AdminLoading() {
  return (
    <div style={{ paddingBlock: "2rem", display: "grid", gap: "1.25rem" }}>
      <div className="skeleton" style={{ height: "2.5rem", maxWidth: "18rem" }} />
      <div className="skeleton" style={{ height: "1rem", maxWidth: "28rem" }} />
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: "3.5rem" }} />
        ))}
      </div>
    </div>
  );
}
