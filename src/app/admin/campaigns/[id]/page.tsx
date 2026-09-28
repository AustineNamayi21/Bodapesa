import Link from "next/link";
import { notFound } from "next/navigation";
import { all, count, one } from "@/lib/db";
import { Card, Pill, SectionTitle, Stat, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { BarList } from "@/components/charts";
import { describeSegment, parseSegment, segmentRiders, segmentSize } from "@/lib/segments";
import { smsParts } from "@/lib/i18n";
import { deleteCampaignAction, sendCampaignAction } from "@/lib/actions";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await one<Campaign & { productName: string | null; partnerName: string | null }>(
    `SELECT c.*, p.name AS productName, pt.name AS partnerName
       FROM Campaign c LEFT JOIN Product p ON p.id = c.productId
       LEFT JOIN Partner pt ON pt.id = p.partnerId
      WHERE c.id = ?`,
    [id],
  );
  if (!campaign) notFound();

  const segment = parseSegment(campaign.segmentJson);
  const isDraft = campaign.status === "DRAFT";
  const audience = isDraft ? await segmentSize(segment) : await count("SELECT COUNT(*) AS n FROM Message WHERE campaignId = ?", [id]);
  const syntheticInAudience = isDraft
    ? (await segmentRiders(segment)).filter((r) => Number(r.isSynthetic) === 1).length
    : 0;

  const stats = await one<{ sent: number; delivered: number; read: number; failed: number; cost: number }>(
    `SELECT COUNT(*) AS sent,
            SUM(CASE WHEN status IN ('DELIVERED','READ') THEN 1 ELSE 0 END) AS delivered,
            SUM(CASE WHEN status = 'READ' THEN 1 ELSE 0 END) AS read,
            SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed,
            COALESCE(SUM(costKes),0) AS cost
       FROM Message WHERE campaignId = ?`,
    [id],
  );

  const byChannel = await all<{ channel: string; n: number; delivered: number }>(
    `SELECT channel, COUNT(*) AS n, SUM(CASE WHEN status IN ('DELIVERED','READ') THEN 1 ELSE 0 END) AS delivered
       FROM Message WHERE campaignId = ? GROUP BY channel ORDER BY n DESC`,
    [id],
  );

  const byLanguage = await all<{ language: string; n: number }>(
    "SELECT language, COUNT(*) AS n FROM Message WHERE campaignId = ? GROUP BY language ORDER BY n DESC",
    [id],
  );

  const sample = await all<{ id: string; body: string; channel: string; status: string; createdAt: string; firstName: string; lastName: string; msisdn: string; riderId: string }>(
    `SELECT m.id, m.body, m.channel, m.status, m.createdAt, m.riderId, r.firstName, r.lastName, r.msisdn
       FROM Message m JOIN Rider r ON r.id = m.riderId
      WHERE m.campaignId = ? ORDER BY m.createdAt DESC LIMIT 12`,
    [id],
  );

  // Leads attributable to this campaign: enquiries raised after it was sent.
  const attributedLeads = campaign.sentAt
    ? await count(
        `SELECT COUNT(*) AS n FROM Lead l
          WHERE l.createdAt >= ?
            AND l.riderId IN (SELECT riderId FROM Message WHERE campaignId = ?)
            ${campaign.productId ? "AND l.productId = ?" : ""}`,
        campaign.productId ? [campaign.sentAt, id, campaign.productId] : [campaign.sentAt, id],
      )
    : 0;

  const bodies: [string, string][] = [
    ["Kiswahili", campaign.bodySw],
    ["English", campaign.bodyEn],
    ["Sheng", campaign.bodySh],
  ];

  const LANG_NAMES: Record<string, string> = { EN: "English", SW: "Kiswahili", SH: "Sheng" };

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/campaigns" className="text-[0.78rem] text-[var(--text-faint)] hover:underline">
          ← Campaigns
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{campaign.name}</h1>
            <Pill tone={STATUS_TONE[campaign.status]}>{campaign.status}</Pill>
          </div>

          {isDraft ? (
            <div className="flex gap-2">
              <form action={deleteCampaignAction}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <button className="btn btn-ghost btn-sm">Discard draft</button>
              </form>
              <form action={sendCampaignAction}>
                <input type="hidden" name="campaignId" value={campaign.id} />
                <button className="btn btn-primary btn-sm">Send to {audience.toLocaleString()} riders</button>
              </form>
            </div>
          ) : null}
        </div>
        <p className="text-xs text-[var(--text-faint)] mt-1">
          {describeSegment(segment)} · {campaign.channels.split(",").join(" · ")}
          {campaign.productName ? ` · promoting ${campaign.productName} (${campaign.partnerName})` : ""}
          {campaign.sentAt ? ` · sent ${timeAgo(campaign.sentAt)}` : ""}
        </p>
      </header>

      {!isDraft ? (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Stat label="Messages sent" value={(stats?.sent ?? 0).toLocaleString()} />
          <Stat
            label="Delivered"
            value={`${stats?.sent ? Math.round(((stats.delivered ?? 0) / stats.sent) * 100) : 0}%`}
            hint={`${(stats?.delivered ?? 0).toLocaleString()} confirmed`}
            tone="brand"
          />
          <Stat label="Failed" value={(stats?.failed ?? 0).toLocaleString()} tone={stats?.failed ? "danger" : "default"} />
          <Stat label="Cost" value={formatKes(stats?.cost ?? 0)} />
          <Stat label="Enquiries after send" value={attributedLeads.toLocaleString()} tone="accent" />
        </div>
      ) : (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="stat-label">Audience</div>
              <div className="stat-value" style={{ color: "var(--brand)" }}>
                {audience.toLocaleString()}
              </div>
              <p className="text-[0.75rem] text-[var(--text-faint)] mt-1">
                riders match this segment and have given messaging consent
              </p>
              {syntheticInAudience > 0 ? (
                <p className="text-[0.75rem] mt-1">
                  <strong>{(audience - syntheticInAudience).toLocaleString()}</strong> real ·{" "}
                  <span className="text-[var(--text-faint)]">
                    {syntheticInAudience.toLocaleString()} demo riders, simulated
                  </span>
                </p>
              ) : null}
            </div>
            <p className="text-[0.78rem] text-[var(--text-muted)] max-w-sm">
              Nothing has been dispatched yet. Review the three language versions below, then send — every
              message is written to the log before the provider is called, so delivery can be audited afterwards.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Message content" subtitle="What each rider receives, by their chosen language" />
          <div className="space-y-3">
            {bodies.map(([label, body]) => {
              const { chars, parts } = smsParts(body);
              return (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="stat-label">{label}</span>
                    <span className="text-[0.68rem] text-[var(--text-faint)] tabular-nums">
                      {chars} chars · {parts} part{parts === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p
                    className="text-[0.82rem] leading-relaxed p-3 rounded-lg"
                    style={{ background: "var(--surface-2)" }}
                  >
                    {body}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          {!isDraft ? (
            <>
              <Card>
                <SectionTitle title="Delivery by channel" />
                <BarList
                  data={byChannel.map((c) => ({
                    label: c.channel,
                    value: c.n,
                    sub: `${c.n ? Math.round((c.delivered / c.n) * 100) : 0}% delivered`,
                  }))}
                  tooltipLabel="messages"
                />
              </Card>
              <Card>
                <SectionTitle title="Delivery by language" />
                <BarList
                  data={byLanguage.map((l) => ({ label: LANG_NAMES[l.language] ?? l.language, value: l.n }))}
                  tone="info"
                  tooltipLabel="messages"
                />
              </Card>
            </>
          ) : (
            <Card>
              <SectionTitle title="Audience definition" />
              <pre className="text-[0.72rem] p-3 rounded-lg overflow-x-auto scroll-thin" style={{ background: "var(--surface-2)" }}>
                {JSON.stringify(segment, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>

      {!isDraft ? (
        <Card padded={false}>
          <div className="p-4 sm:p-5 pb-0">
            <SectionTitle title="Sample of dispatched messages" subtitle="The most recent twelve" />
          </div>
          <div className="overflow-x-auto scroll-thin">
            <table className="table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/admin/riders/${m.riderId}`} className="font-medium hover:underline">
                        {m.firstName} {m.lastName}
                      </Link>
                    </td>
                    <td className="text-[0.8rem]">{m.channel}</td>
                    <td>
                      <Pill tone={STATUS_TONE[m.status]}>{m.status}</Pill>
                    </td>
                    <td className="text-[0.78rem] text-[var(--text-muted)] max-w-md">{m.body}</td>
                    <td className="text-[0.78rem] text-[var(--text-muted)]">{timeAgo(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
