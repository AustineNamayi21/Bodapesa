import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { one } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { markRead, messagesFor } from "@/lib/chat";
import { riderSendMessageAction } from "@/lib/chat-actions";
import { ChatPoller, Composer, ScrollToLatest } from "@/components/chat";
import { timeAgo } from "@/components/ui";

export const dynamic = "force-dynamic";

const T = {
  back: { EN: "Messages", SW: "Ujumbe", SH: "Messages" },
  placeholder: { EN: "Write a message…", SW: "Andika ujumbe…", SH: "Andika message…" },
  send: { EN: "Send", SW: "Tuma", SH: "Tuma" },
  platform: { EN: "BodaPesa team", SW: "Timu ya BodaPesa", SH: "Team ya BodaPesa" },
  closed: {
    EN: "This conversation was closed. Write again to reopen it.",
    SW: "Mazungumzo haya yalifungwa. Andika tena kuyafungua.",
    SH: "Story hii ilifungwa. Andika tena ifunguke.",
  },
  waiting: {
    EN: "Someone from the team will reply here.",
    SW: "Mtu kutoka timu atajibu hapa.",
    SH: "Mtu wa team atareply hapa.",
  },
} as const;

type Lang = "EN" | "SW" | "SH";
const t = (k: keyof typeof T, lang: string) => T[k][(lang as Lang) in T[k] ? (lang as Lang) : "EN"];

export default async function RiderThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { rider, lang } = await requireRider();

  const conversation = await one<{
    id: string;
    subject: string;
    status: string;
    productId: string | null;
    partnerName: string | null;
  }>(
    `SELECT c.id, c.subject, c.status, c.productId, p.name AS partnerName
       FROM Conversation c LEFT JOIN Partner p ON p.id = c.partnerId
      WHERE c.id = ? AND c.riderId = ?`,
    [id, rider.id],
  );
  if (!conversation) notFound();

  const messages = await messagesFor(conversation.id);
  // Reading the thread is what clears the badge, not opening the hub.
  await markRead(conversation.id, "RIDER");

  return (
    <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", flexDirection: "column", minHeight: "70vh" }}>
      <ChatPoller intervalMs={8000} />

      <Link
        href="/rider/inbox"
        className="cta"
        style={{ fontSize: "0.625rem", color: "var(--text-faint)", textDecoration: "none" }}
      >
        <ArrowLeft size={14} /> <span>{t("back", lang)}</span>
      </Link>

      <div style={{ marginTop: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
        <h1 className="display-sm">{conversation.subject}</h1>
        <p className="stat-label" style={{ marginTop: "0.4rem" }}>
          {conversation.partnerName ?? t("platform", lang)}
        </p>
      </div>

      <div style={{ flex: 1, display: "grid", gap: "0.9rem", paddingBlock: "1.25rem", alignContent: "start" }}>
        {messages.map((m) => {
          const mine = m.senderType === "RIDER";
          const system = m.senderType === "SYSTEM";
          return (
            <div
              key={m.id}
              style={{
                justifySelf: mine ? "end" : "start",
                maxWidth: "85%",
                display: "grid",
                gap: "0.3rem",
              }}
            >
              {!mine ? (
                <span className="stat-label" style={{ color: system ? "var(--accent)" : undefined }}>
                  {m.senderName}
                </span>
              ) : null}
              <div
                style={{
                  padding: "0.75rem 0.95rem",
                  background: mine ? "var(--accent)" : "var(--surface)",
                  color: mine ? "#fff" : "var(--text)",
                  border: mine ? "1px solid var(--accent)" : "1px solid var(--border)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {m.body}
              </div>
              <span className="stat-label" style={{ justifySelf: mine ? "end" : "start" }}>
                {timeAgo(m.createdAt)}
              </span>
            </div>
          );
        })}
        {messages.length === 1 && messages[0]?.senderType === "RIDER" ? (
          <p style={{ fontSize: "0.78rem", color: "var(--text-faint)", justifySelf: "start" }}>
            {t("waiting", lang)}
          </p>
        ) : null}
        <ScrollToLatest dep={messages[messages.length - 1]?.id ?? "none"} />
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--ground)",
          borderTop: "1px solid var(--border)",
          paddingBlock: "0.9rem",
        }}
      >
        {conversation.status === "RESOLVED" ? (
          <p className="stat-label" style={{ marginBottom: "0.6rem" }}>
            {t("closed", lang)}
          </p>
        ) : null}
        <Composer
          action={riderSendMessageAction}
          conversationId={conversation.id}
          placeholder={t("placeholder", lang)}
          label={t("send", lang)}
        />
      </div>
    </div>
  );
}
