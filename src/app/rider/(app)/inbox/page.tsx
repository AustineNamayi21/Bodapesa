import { all, run } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { timeAgo } from "@/components/ui";
import { LogoMark } from "@/components/brand";
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

  const CHANNEL: Record<string, { fill: string; label: string }> = {
    SMS: { fill: "var(--green)", label: "SMS" },
    WHATSAPP: { fill: "var(--green)", label: "WhatsApp" },
    USSD: { fill: "var(--ink)", label: "USSD" },
    APP: { fill: "var(--green)", label: "App" },
  };

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <h1 className="text-[1.9rem] leading-tight">
          {lang === "EN" ? "Messages" : lang === "SH" ? "Messages" : "Ujumbe"}
        </h1>
        <p className="text-[0.84rem] text-[var(--text-muted)]">
          {lang === "EN"
            ? "Everything BodaPesa has sent you, on any channel."
            : "Kila kitu BodaPesa imekutumia, kwa njia yoyote."}
        </p>
      </div>

      {messages.length ? (
        <div className="space-y-3 stagger">
          {messages.map((m) => {
            const ch = CHANNEL[m.channel] ?? CHANNEL.SMS;
            return (
              <div key={m.id} className="flex items-end gap-2">
                <LogoMark size={30} className="shrink-0 mb-1" />
                <div className="min-w-0 flex-1">
                  <div
                    className="rounded-2xl rounded-bl-sm p-3.5 border-2 relative"
                    style={{
                      background: "var(--surface)",
                      borderColor: m.readAt ? "var(--border)" : "var(--green)",
                      boxShadow: "var(--shadow)",
                    }}
                  >
                    {!m.readAt ? (
                      <span className="absolute -top-2 -right-2 pill animate-pop" style={{ background: "var(--green)", color: "#fff" }}>
                        {lang === "EN" ? "New" : "Mpya"}
                      </span>
                    ) : null}
                    <p className="text-[0.88rem] leading-relaxed">{m.body}</p>
                    {m.campaignName ? (
                      <p className="text-[0.68rem] text-[var(--text-faint)] mt-2">
                        {m.productName ? `${m.productName} · ` : ""}
                        {m.campaignName}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-1 text-[0.68rem] text-[var(--text-faint)]">
                    <span className="w-2 h-2 rounded-full" style={{ background: ch.fill }} />
                    <span className="font-bold">{ch.label}</span>
                    <span>· {timeAgo(m.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center">
                    <p className="text-[0.88rem] text-[var(--text-muted)]">{lang === "EN" ? "No messages yet." : "Hakuna ujumbe bado."}</p>
        </div>
      )}
    </div>
  );
}
