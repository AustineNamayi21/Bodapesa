import { all, run } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { Card, Pill, timeAgo } from "@/components/ui";
import { now } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { rider, lang } = await requireRider();

  const messages = await all<{
    id: string;
    body: string;
    channel: string;
    createdAt: string;
    readAt: string | null;
    campaignName: string | null;
    productName: string | null;
  }>(
    `SELECT m.id, m.body, m.channel, m.createdAt, m.readAt, c.name AS campaignName, p.name AS productName
       FROM Message m
       LEFT JOIN Campaign c ON c.id = m.campaignId
       LEFT JOIN Product p ON p.id = c.productId
      WHERE m.riderId = ? AND m.direction = 'OUT'
      ORDER BY m.createdAt DESC LIMIT 40`,
    [rider.id],
  );

  // Opening the inbox marks everything as read.
  await run("UPDATE Message SET readAt = ? WHERE riderId = ? AND direction = 'OUT' AND readAt IS NULL", [
    now(),
    rider.id,
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          {lang === "EN" ? "Messages" : lang === "SH" ? "Messages" : "Ujumbe"}
        </h1>
        <p className="text-[0.78rem] text-[var(--text-muted)]">
          {lang === "EN"
            ? "Everything BodaPesa has sent you, on any channel."
            : "Kila kitu BodaPesa imekutumia, kwa njia yoyote."}
        </p>
      </div>

      {messages.length ? (
        <div className="space-y-2.5">
          {messages.map((m) => (
            <Card key={m.id}>
              <div className="flex items-center gap-2 mb-1.5">
                <Pill tone={m.readAt ? "neutral" : "accent"} dot={!m.readAt}>
                  {m.channel}
                </Pill>
                <span className="text-[0.68rem] text-[var(--text-faint)]">{timeAgo(m.createdAt)}</span>
              </div>
              <p className="text-[0.84rem] leading-relaxed">{m.body}</p>
              {m.campaignName ? (
                <p className="text-[0.66rem] text-[var(--text-faint)] mt-1.5">
                  {m.productName ? `${m.productName} · ` : ""}
                  {m.campaignName}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-[0.85rem] text-[var(--text-muted)]">
            {lang === "EN" ? "No messages yet." : "Hakuna ujumbe bado."}
          </p>
        </Card>
      )}
    </div>
  );
}
