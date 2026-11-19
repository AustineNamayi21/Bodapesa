/** Keeps the rider shell and its navigation in place during a slow fetch. */
export default function RiderLoading() {
  return (
    <div style={{ padding: "1.5rem 1.25rem", display: "grid", gap: "1rem" }}>
      <div className="skeleton" style={{ height: "2.25rem", maxWidth: "12rem" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton" style={{ height: "5rem" }} />
      ))}
    </div>
  );
}
