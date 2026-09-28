import Link from "next/link";
import { all } from "@/lib/db";
import { Card, Pill, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { describeSegment, parseSegment } from "@/lib/segments";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const campaigns = await all<{
    id: string;
    name: string;
    objective: string;
    channels: string;
    segmentJson: string;
    status: string;
    sentAt: string | null;
    createdAt: string;
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
    productName: string | null;
  }>(
    `SELECT c.*, p.name AS productName,
            (SELECT COUNT(*) FROM Message m WHERE m.campaignId = c.id) AS sent,
            (SELECT COUNT(*) FROM Message m WHERE m.campaignId = c.id AND m.status IN ('DELIVERED','READ')) AS delivered,
            (SELECT COUNT(*) FROM Message m WHERE m.campaignId = c.id AND m.status = 'FAILED') AS failed,
            (SELECT COALESCE(SUM(m.costKes),0) FROM Message m WHERE m.campaignId = c.id) AS cost
       FROM Campaign c LEFT JOIN Product p ON p.id = c.productId
      ORDER BY COALESCE(c.sentAt, c.createdAt) DESC`,
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-xs text-[var(--text-faint)] mt-0.5">
            Mass messaging to segmented audiences, in the language and on the channel each rider prefers.
          </p>
        </div>
        <Link href="/admin/campaigns/new" className="btn btn-primary btn-sm">
          New campaign
        </Link>
      </header>

      <div className="grid gap-3">
        {campaigns.map((c) => {
          const deliveryRate = c.sent ? Math.round((c.delivered / c.sent) * 100) : 0;
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link href={`/admin/campaigns/${c.id}`} className="font-semibold tracking-tight hover:underline">
                      {c.name}
                    </Link>
                    <Pill tone={STATUS_TONE[c.status]}>{c.status}</Pill>
                    <Pill tone="neutral">{c.objective.replace("_", " ").toLowerCase()}</Pill>
                  </div>
                  <p className="text-[0.78rem] text-[var(--text-faint)]">
                    {describeSegment(parseSegment(c.segmentJson))} · {c.channels.split(",").join(" · ")}
                    {c.productName ? ` · promoting ${c.productName}` : ""}
                  </p>
                </div>

                <div className="flex gap-5 text-right shrink-0">
                  <div>
                    <div className="stat-label">Sent</div>
                    <div className="text-sm font-semibold tabular-nums">{c.sent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="stat-label">Delivered</div>
                    <div className="text-sm font-semibold tabular-nums">{deliveryRate}%</div>
                  </div>
                  <div>
                    <div className="stat-label">Cost</div>
                    <div className="text-sm font-semibold tabular-nums">{formatKes(c.cost)}</div>
                  </div>
                  <div>
                    <div className="stat-label">{c.status === "SENT" ? "Sent" : "Created"}</div>
                    <div className="text-sm font-semibold">{timeAgo(c.sentAt ?? c.createdAt)}</div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {!campaigns.length ? (
          <Card>
            <p className="text-sm text-[var(--text-faint)] py-6 text-center">
              No campaigns yet.{" "}
              <Link href="/admin/campaigns/new" className="underline">
                Compose the first one.
              </Link>
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
