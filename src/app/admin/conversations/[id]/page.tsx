import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { all, one } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { canStaffSee, markRead, messagesFor } from "@/lib/chat";
import { staffReplyAction, staffSetConversationStatusAction } from "@/lib/chat-actions";
import { signalsForRider, SIGNAL_LABEL, type SignalKind } from "@/lib/signals";
import { PageHeader } from "@/components/admin";
import { Pill, timeAgo } from "@/components/ui";
import { ChatPoller, Composer, ScrollToLatest } from "@/components/chat";

export const dynamic = "force-dynamic";

export default async function StaffThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!(await canStaffSee(user, id))) notFound();

  const conversation = await one<{
    id: string;
    subject: string;
    status: string;
    riderId: string;
    leadId: string | null;
    partnerName: string | null;
    riderName: string;
    msisdn: string;
    language: string;
    literacyScore: number;
    stageName: string | null;
    dailyIncomeBand: string | null;
    hasInsurance: number;
    hasBankAccount: number;
    saccoMember: number;
    ownsMotorbike: number;
    riderStatus: string;
  }>(
    `SELECT c.id, c.subject, c.status, c.riderId, c.leadId, p.name AS partnerName,
            r.firstName || ' ' || r.lastName AS riderName, r.msisdn, r.language, r.literacyScore,
            r.dailyIncomeBand, r.hasInsurance, r.hasBankAccount, r.saccoMember, r.ownsMotorbike,
            r.status AS riderStatus,
            st.name AS stageName
       FROM Conversation c
       JOIN Rider r ON r.id = c.riderId
       LEFT JOIN Stage st ON st.id = r.stageId
       LEFT JOIN Partner p ON p.id = c.partnerId
      WHERE c.id = ?`,
    [id],
  );
  if (!conversation) notFound();

  const messages = await messagesFor(conversation.id);
  await markRead(conversation.id, "STAFF");

  const signals = await signalsForRider(conversation.riderId, 8);
  const lessons = await all<{ n: number }>(
    "SELECT COUNT(*) AS n FROM LessonProgress WHERE riderId = ? AND completedAt IS NOT NULL",
    [conversation.riderId],
  );

  const facts = [
    conversation.stageName,
    conversation.dailyIncomeBand ? `KSh ${conversation.dailyIncomeBand}/day` : null,
    Number(conversation.ownsMotorbike) === 1 ? "Owns the bike" : "Does not own the bike",
    Number(conversation.hasInsurance) === 1 ? "Has cover" : "No cover",
    Number(conversation.hasBankAccount) === 1 ? "Banked" : "Unbanked",
    Number(conversation.saccoMember) === 1 ? "SACCO member" : null,
    `${Number(lessons[0]?.n ?? 0)} lessons done`,
    `Literacy ${conversation.literacyScore}/100`,
  ].filter(Boolean) as string[];

  return (
    <div>
      <ChatPoller intervalMs={8000} />

      <PageHeader
        title={conversation.riderName}
        subtitle={`${conversation.subject} · ${conversation.partnerName ?? "Platform team"} · ${conversation.msisdn}`}
        back="/admin/conversations"
        backLabel="Conversations"
        actions={
          <div className="flex items-center gap-2">
            {conversation.leadId ? (
              <Link href="/admin/leads" className="btn btn-ghost btn-sm">
                View the lead
              </Link>
            ) : null}
            <form action={staffSetConversationStatusAction}>
              <input type="hidden" name="conversationId" value={conversation.id} />
              <input
                type="hidden"
                name="status"
                value={conversation.status === "RESOLVED" ? "OPEN" : "RESOLVED"}
              />
              <button type="submit" className="btn btn-ghost btn-sm">
                {conversation.status === "RESOLVED" ? "Reopen" : "Mark resolved"}
              </button>
            </form>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* ── the thread ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: "50vh" }}>
          <div style={{ flex: 1, display: "grid", gap: "0.9rem", alignContent: "start" }}>
            {messages.map((m) => {
              const fromUs = m.senderType !== "RIDER";
              return (
                <div
                  key={m.id}
                  style={{ justifySelf: fromUs ? "end" : "start", maxWidth: "80%", display: "grid", gap: "0.3rem" }}
                >
                  <span className="stat-label">{m.senderName}</span>
                  <div
                    style={{
                      padding: "0.8rem 1rem",
                      background: fromUs ? "var(--accent)" : "var(--surface)",
                      color: fromUs ? "#fff" : "var(--text)",
                      border: `1px solid ${fromUs ? "var(--accent)" : "var(--border)"}`,
                      fontSize: "0.88rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {m.body}
                  </div>
                  <span className="stat-label" style={{ justifySelf: fromUs ? "end" : "start" }}>
                    {timeAgo(m.createdAt)}
                  </span>
                </div>
              );
            })}
            <ScrollToLatest dep={messages[messages.length - 1]?.id ?? "none"} />
          </div>

          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
            <Composer
              action={staffReplyAction}
              conversationId={conversation.id}
              placeholder={`Reply to ${conversation.riderName.split(" ")[0]}…`}
              label="Reply"
            />
            <p className="stat-label" style={{ marginTop: "0.75rem" }}>
              Replies are written in {conversation.language === "SW" ? "Kiswahili" : conversation.language === "SH" ? "Sheng" : "English"} by this rider — answer in the same language.
            </p>
          </div>
        </div>

        {/* ── who you are talking to ────────────────────────────────────── */}
        <aside style={{ display: "grid", gap: "1.75rem", alignContent: "start" }}>
          <div>
            <p className="stat-label" style={{ marginBottom: "0.75rem" }}>
              This rider
            </p>
            <div className="flex flex-wrap gap-1.5">
              {facts.map((f) => (
                <Pill key={f} tone="neutral">
                  {f}
                </Pill>
              ))}
            </div>
          </div>

          {signals.length ? (
            <div>
              <p className="stat-label" style={{ marginBottom: "0.75rem" }}>
                What they have been doing
              </p>
              <div style={{ borderTop: "1px solid var(--border)" }}>
                {signals.map((s, i) => (
                  <div
                    key={`${s.kind}-${s.createdAt}-${i}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "0.6rem 0",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span>
                      {SIGNAL_LABEL[s.kind as SignalKind] ?? s.kind}
                      {s.productName ? ` · ${s.productName}` : ""}
                    </span>
                    <span style={{ color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                      {timeAgo(s.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
