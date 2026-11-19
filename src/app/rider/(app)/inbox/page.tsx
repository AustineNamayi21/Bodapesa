import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";

import { all, run } from "@/lib/db";
import { now } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { timeAgo } from "@/components/ui";
import { LogoMark } from "@/components/brand";
import { ChatPoller } from "@/components/chat";

export const dynamic = "force-dynamic";

const T = {
  title: { EN: "Messages", SW: "Ujumbe", SH: "Messages" },
  convos: { EN: "Your conversations", SW: "Mazungumzo yako", SH: "Story zako" },
  updates: { EN: "Updates from BodaPesa", SW: "Taarifa kutoka BodaPesa", SH: "Updates za BodaPesa" },
  ask: { EN: "Ask a question", SW: "Uliza swali", SH: "Uliza swali" },
  none: {
    EN: "No conversations yet. Ask us anything — about a product, a lesson, or your money.",
    SW: "Hakuna mazungumzo bado. Tuulize chochote — kuhusu bidhaa, somo, au pesa yako.",
    SH: "Hakuna story bado. Tuulize chochote — kuhusu product, lesson, ama doo yako.",
  },
  noUpdates: { EN: "No updates yet.", SW: "Hakuna taarifa bado.", SH: "Hakuna updates bado." },
  waiting: { EN: "Waiting for you", SW: "Inakusubiri", SH: "Inakungoja" },
  closed: { EN: "Closed", SW: "Imefungwa", SH: "Imefungwa" },
  platform: { EN: "BodaPesa team", SW: "Timu ya BodaPesa", SH: "Team ya BodaPesa" },
} as const;

type Lang = "EN" | "SW" | "SH";
const t = (k: keyof typeof T, lang: string) => T[k][(lang as Lang) in T[k] ? (lang as Lang) : "EN"];

export default async function InboxPage() {
  const { rider, lang } = await requireRider();

  const conversations = await all<{
    id: string;
    subject: string;
    status: string;
    riderUnread: number;
    lastMessageAt: string;
    lastMessageFrom: string;
    partnerName: string | null;
    preview: string | null;
  }>(
    `SELECT c.id, c.subject, c.status, c.riderUnread, c.lastMessageAt, c.lastMessageFrom,
            p.name AS partnerName,
            (SELECT m.body FROM ChatMessage m WHERE m.conversationId = c.id
              ORDER BY m.createdAt DESC LIMIT 1) AS preview
       FROM Conversation c
       LEFT JOIN Partner p ON p.id = c.partnerId
      WHERE c.riderId = ?
      ORDER BY c.lastMessageAt DESC LIMIT 30`,
    [rider.id],
  );

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
      ORDER BY m.createdAt DESC LIMIT 30`,
    [rider.id],
  );

  // Opening the hub marks the broadcast updates as read. Conversations are
  // only cleared when the rider actually opens the thread.
  await run("UPDATE Message SET readAt = ? WHERE riderId = ? AND direction = 'OUT' AND readAt IS NULL", [
    now(),
    rider.id,
  ]);

  return (
    <div className="space-y-8" style={{ padding: "1.5rem 1.25rem 0" }}>
      <ChatPoller intervalMs={15000} />

      <div className="animate-rise">
        <h1 className="display-lg">{t("title", lang)}</h1>
      </div>

      {/* ── conversations ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between gap-3" style={{ marginBottom: "1rem" }}>
          <p className="stat-label">{t("convos", lang)}</p>
          <Link href="/rider/inbox/new" className="btn btn-primary btn-sm">
            <Plus size={13} /> {t("ask", lang)}
          </Link>
        </div>

        {conversations.length ? (
          <div className="stagger" style={{ borderTop: "1px solid var(--border)" }}>
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/rider/inbox/${c.id}`}
                className="lift"
                style={{
                  display: "block",
                  padding: "1rem 0",
                  borderBottom: "1px solid var(--border)",
                  textDecoration: "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.subject}
                      </span>
                      {c.riderUnread > 0 ? (
                        <span
                          className="shrink-0"
                          style={{
                            minWidth: "1.1rem",
                            height: "1.1rem",
                            background: "var(--accent)",
                            color: "#fff",
                            fontSize: "0.56rem",
                            fontWeight: 700,
                            display: "grid",
                            placeItems: "center",
                            padding: "0 4px",
                          }}
                        >
                          {c.riderUnread}
                        </span>
                      ) : null}
                    </div>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-faint)",
                        marginTop: "0.3rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.lastMessageFrom === "RIDER" ? "→ " : ""}
                      {c.preview ?? ""}
                    </p>
                    <p className="stat-label" style={{ marginTop: "0.45rem" }}>
                      {c.partnerName ?? t("platform", lang)} · {timeAgo(c.lastMessageAt)}
                      {c.status === "RESOLVED" ? ` · ${t("closed", lang)}` : ""}
                    </p>
                  </div>
                  <MessageCircle size={15} style={{ color: "var(--text-faint)", flexShrink: 0, marginTop: 3 }} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
            <p style={{ fontSize: "0.86rem", color: "var(--text-muted)", maxWidth: "32ch" }}>
              {t("none", lang)}
            </p>
          </div>
        )}
      </section>

      {/* ── broadcast updates ──────────────────────────────────────────── */}
      <section>
        <p className="stat-label" style={{ marginBottom: "1rem" }}>
          {t("updates", lang)}
        </p>

        {messages.length ? (
          <div className="space-y-3 stagger">
            {messages.map((m) => (
              <div key={m.id} className="flex items-end gap-2">
                <LogoMark size={28} className="shrink-0 mb-1" />
                <div className="min-w-0 flex-1">
                  <div
                    style={{
                      padding: "0.85rem 1rem",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <p style={{ fontSize: "0.86rem", lineHeight: 1.6 }}>{m.body}</p>
                    {m.campaignName ? (
                      <p className="stat-label" style={{ marginTop: "0.6rem" }}>
                        {m.productName ? `${m.productName} · ` : ""}
                        {m.campaignName}
                      </p>
                    ) : null}
                  </div>
                  <p className="stat-label" style={{ marginTop: "0.4rem" }}>
                    {m.channel} · {timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: "0.86rem", color: "var(--text-faint)" }}>{t("noUpdates", lang)}</p>
        )}
      </section>
    </div>
  );
}
