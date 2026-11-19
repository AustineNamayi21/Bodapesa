import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, MessageCircle } from "lucide-react";

import { currentUser } from "@/lib/auth";
import { warmRiders, SIGNAL_LABEL, type SignalKind } from "@/lib/signals";
import { PageHeader } from "@/components/admin";
import { Pill, timeAgo } from "@/components/ui";
import { displayMsisdn } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * Who to call today.
 *
 * The lead queue holds riders who raised a hand. This page holds the ones who
 * did not — who finished the insurance module last night, or have been paying
 * into a goal for three weeks. Nothing in the old console could see them.
 */
export default async function WarmRidersPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { days: daysRaw } = await searchParams;
  const days = [7, 14, 30, 90].includes(Number(daysRaw)) ? Number(daysRaw) : 30;

  const riders = await warmRiders({ days, limit: 40, partnerId: user.partnerId });

  return (
    <div>
      <PageHeader
        title="Warm riders"
        subtitle={
          user.partnerName
            ? `Riders showing interest in ${user.partnerName} territory who have not been asked yet.`
            : "Riders acting like they want a product, ranked by what they have actually been doing."
        }
      />

      <nav style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        {[7, 14, 30, 90].map((d) => (
          <Link
            key={d}
            href={`/admin/warm?days=${d}`}
            className="stat-label"
            style={{
              padding: "0.9rem 0",
              textDecoration: "none",
              color: d === days ? "var(--text)" : "var(--text-faint)",
              borderBottom: `2px solid ${d === days ? "var(--accent)" : "transparent"}`,
              marginBottom: "-1px",
            }}
          >
            Last {d} days
          </Link>
        ))}
      </nav>

      {riders.length ? (
        <div className="stagger">
          {riders.map((r) => (
            <div
              key={r.riderId}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1.25rem",
                padding: "1.15rem 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                className="figure-sm"
                style={{ minWidth: "3rem", textAlign: "right", fontVariantNumeric: "tabular-nums" }}
              >
                {r.score}
              </p>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/admin/riders/${r.riderId}`}
                    style={{ fontSize: "0.95rem", fontWeight: 700, textDecoration: "none" }}
                  >
                    {r.firstName} {r.lastName}
                  </Link>
                  <Pill tone="neutral">{SIGNAL_LABEL[r.topKind as SignalKind] ?? r.topKind}</Pill>
                  {r.hasOpenLead > 0 ? (
                    <Pill tone="danger">
                      <AlertTriangle size={11} /> Lead already open
                    </Pill>
                  ) : null}
                </div>

                <p style={{ fontSize: "0.84rem", marginTop: "0.35rem", color: "var(--text-muted)" }}>
                  {r.productName ? (
                    <>Interested in <strong style={{ color: "var(--text)" }}>{r.productName}</strong></>
                  ) : (
                    "No single product yet — worth asking what they are saving for."
                  )}
                </p>

                <p className="stat-label" style={{ marginTop: "0.45rem" }}>
                  {displayMsisdn(r.msisdn)} · {r.language} · {r.stageName ?? "No stage"} · literacy{" "}
                  {r.literacyScore}/100 · {r.signals} signals · last {timeAgo(r.lastSignalAt)}
                </p>
              </div>

              <Link
                href={`/admin/riders/${r.riderId}`}
                className="btn btn-ghost btn-sm"
                style={{ flexShrink: 0 }}
              >
                <MessageCircle size={13} /> Open
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ padding: "2.5rem 0", color: "var(--text-faint)", fontSize: "0.88rem", maxWidth: "52ch" }}>
          No signals in this window yet. Signals are recorded as riders finish lessons, set goals, save, and ask
          questions — so this fills up as the programme runs.
        </p>
      )}
    </div>
  );
}
