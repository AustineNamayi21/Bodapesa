import { redirect } from "next/navigation";

import { currentUser } from "@/lib/auth";
import { purgePreview } from "@/lib/maintenance";
import { PageHeader } from "@/components/admin";
import { Pill } from "@/components/ui";
import { PurgeForm } from "./PurgeForm";
import { CatalogueForm } from "./CatalogueForm";
import { CampaignsForm } from "./CampaignsForm";
import { CAMPAIGNS } from "@/lib/catalogue/campaigns";
import { CATALOGUE, catalogueSize } from "@/lib/catalogue";
import { all, count } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Where demonstration data gets removed.
 *
 * Separated from everything else in the console because it is the only screen
 * that destroys records in bulk, and it should not sit one mis-click away
 * from the reports.
 */
export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ keep?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "PLATFORM_ADMIN") {
    return (
      <div>
        <PageHeader title="Maintenance" subtitle="Platform team only." />
        <p style={{ color: "var(--text-faint)", fontSize: "0.88rem" }}>
          This screen is restricted to the BodaPesa platform team.
        </p>
      </div>
    );
  }

  const { keep: keepRaw } = await searchParams;
  const keep = Number.isFinite(Number(keepRaw)) ? Math.max(0, Math.min(100, Number(keepRaw))) : 3;
  const preview = await purgePreview(keep);

  const nothingToDo = preview.ridersToDelete === 0;

  const partnerNames = await all<{ code: string; name: string }>("SELECT code, name FROM Partner");
  const byPartner = Object.entries(CATALOGUE).map(([code, list]) => ({
    partner: partnerNames.find((p) => p.code.toUpperCase() === code)?.name ?? code,
    count: list.length,
  }));
  const activeProducts = await count("SELECT COUNT(*) AS n FROM Product WHERE active = 1");

  return (
    <div>
      <PageHeader
        title="Remove demonstration data"
        subtitle="The seed fills a new database with invented riders so the console has something to show. Their messages were never sent and their enquiries were never raised, so every figure built on them is fiction."
      />

      <div style={{ display: "grid", gap: "2.5rem", maxWidth: "46rem" }}>
        <section>
          <p className="stat-label" style={{ marginBottom: "1rem" }}>
            The product catalogue
          </p>
          <CatalogueForm
            total={catalogueSize()}
            byPartner={byPartner}
            currentActive={activeProducts}
          />
        </section>

        <section>
          <p className="stat-label" style={{ marginBottom: "1rem" }}>
            Campaigns
          </p>
          <CampaignsForm total={CAMPAIGNS.length} existing={preview.campaigns} />
        </section>

        <section>
          <p className="stat-label" style={{ marginBottom: "1rem" }}>
            What is in the database now
          </p>
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {[
              ["Riders", preview.ridersTotal, `${preview.ridersSynthetic} marked as demo`],
              ["Messages", preview.messages, "sends recorded against riders"],
              ["Enquiries", preview.leads, "leads raised"],
              ["Conversations", preview.conversations, "chat threads"],
              ["Lesson progress", preview.lessonProgress, "completions"],
              ["Savings goals", preview.goals, null],
              ["Signals", preview.signals, null],
              ["Campaigns", preview.campaigns, "not tied to any rider"],
            ].map(([label, value, hint]) => (
              <div
                key={String(label)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1rem",
                  padding: "0.7rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: "0.86rem" }}>
                  {label}
                  {hint ? (
                    <span className="stat-label" style={{ marginLeft: "0.6rem" }}>
                      {hint}
                    </span>
                  ) : null}
                </span>
                <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {Number(value).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="stat-label" style={{ marginBottom: "0.75rem" }}>
            These {preview.ridersKept.length} would be kept — the most recently registered
          </p>
          {preview.ridersKept.length ? (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {preview.ridersKept.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.7rem 0",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "0.86rem",
                  }}
                >
                  <span>
                    {r.name}{" "}
                    {Number(r.isSynthetic) === 1 ? (
                      <Pill tone="danger">Demo rider</Pill>
                    ) : (
                      <Pill tone="neutral">Real sign-up</Pill>
                    )}
                  </span>
                  <span className="stat-label">
                    {r.msisdn} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.86rem", color: "var(--text-faint)" }}>
              Nothing would be kept — every rider would be removed.
            </p>
          )}
          {preview.ridersKept.some((r) => Number(r.isSynthetic) === 1) ? (
            <p style={{ fontSize: "0.82rem", color: "var(--danger)", marginTop: "0.9rem", lineHeight: 1.6 }}>
              At least one of the riders being kept is a demo rider. Check the list above before
              continuing — the most recent registrations are not necessarily the real ones.
            </p>
          ) : null}
        </section>

        {nothingToDo ? (
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
            There is nothing to remove at this setting.
          </p>
        ) : (
          <PurgeForm keep={keep} toDelete={preview.ridersToDelete} campaigns={preview.campaigns} />
        )}
      </div>
    </div>
  );
}
