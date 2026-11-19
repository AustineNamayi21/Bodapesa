import Link from "next/link";
import { redirect } from "next/navigation";

import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import { Pill } from "@/components/ui";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  name: string;
  subCounty: string;
  riders: number;
  reached: number;
  enquired: number;
  converted: number;
  lessonsDone: number;
};

/**
 * Coverage by stage.
 *
 * Boda riders are organised by stage, with a chairman and a membership that
 * talks to each other all day. That makes the stage, not the individual, the
 * natural unit for this programme — and it makes a stage with forty riders
 * and no conversions a field visit rather than a statistic.
 */
export default async function StageCoveragePage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const rows = await all<Row>(
    `SELECT st.id, st.name, st.subCounty,
            COUNT(r.id) AS riders,
            SUM(CASE WHEN r.consent = 1 THEN 1 ELSE 0 END) AS reached,
            SUM(CASE WHEN EXISTS (SELECT 1 FROM Lead l WHERE l.riderId = r.id) THEN 1 ELSE 0 END) AS enquired,
            SUM(CASE WHEN EXISTS (SELECT 1 FROM Lead l WHERE l.riderId = r.id AND l.status = 'CONVERTED') THEN 1 ELSE 0 END) AS converted,
            (SELECT COUNT(*) FROM LessonProgress lp JOIN Rider r2 ON r2.id = lp.riderId WHERE r2.stageId = st.id) AS lessonsDone
       FROM Stage st
       LEFT JOIN Rider r ON r.stageId = st.id AND r.status <> 'OPTED_OUT'
      GROUP BY st.id
      HAVING COUNT(r.id) > 0
      ORDER BY converted ASC, riders DESC`,
  );

  const cold = rows.filter((r) => Number(r.converted) === 0);
  const coldRiders = cold.reduce((n, r) => n + Number(r.riders), 0);
  const best = [...rows].sort(
    (a, b) => Number(b.converted) / Number(b.riders) - Number(a.converted) / Number(a.riders),
  )[0];

  return (
    <div>
      <PageHeader
        title="Stage coverage"
        subtitle={
          cold.length
            ? `${cold.length} stages hold ${coldRiders} riders between them and have never converted one. Those are visits, not numbers.`
            : "Every stage with riders on it has converted at least one."
        }
        back="/admin/stages"
        backLabel="Stages"
      />

      {best && Number(best.converted) > 0 ? (
        <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", marginBottom: "2rem", maxWidth: "60ch" }}>
          The strongest stage is <strong style={{ color: "var(--text)" }}>{best.name}</strong> in {best.subCounty} —{" "}
          {best.converted} of {best.riders} riders onboarded. Worth knowing what is different there before
          spending on more messaging everywhere else.
        </p>
      ) : null}

      <div style={{ borderTop: "1px solid var(--border)" }}>
        {rows.map((r) => {
          const riders = Number(r.riders);
          const converted = Number(r.converted);
          const enquired = Number(r.enquired);
          const rate = riders ? converted / riders : 0;
          return (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "1rem",
                alignItems: "center",
                padding: "1rem 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "0.92rem", fontWeight: 700 }}>{r.name}</span>
                  <span className="stat-label">{r.subCounty}</span>
                  {converted === 0 && riders >= 10 ? <Pill tone="danger">No conversions</Pill> : null}
                  {converted === 0 && enquired > 0 ? <Pill tone="neutral">{enquired} asked, none closed</Pill> : null}
                </div>

                {/* The bar is the share of this stage's riders who onboarded. */}
                <div
                  style={{
                    marginTop: "0.6rem",
                    height: "3px",
                    background: "var(--border)",
                    maxWidth: "26rem",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, rate * 100 * 4)}%`,
                      height: "100%",
                      background: converted ? "var(--accent)" : "transparent",
                    }}
                  />
                </div>

                <p className="stat-label" style={{ marginTop: "0.5rem" }}>
                  {riders} riders · {enquired} enquired · {converted} onboarded · {Number(r.lessonsDone)} lessons
                </p>
              </div>

              <Link href={`/admin/riders?stage=${r.id}`} className="btn btn-ghost btn-sm">
                Riders
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
