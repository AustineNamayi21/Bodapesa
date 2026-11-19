import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { staffScope } from "@/lib/chat";
import { PageHeader } from "@/components/admin";
import { Pill, timeAgo } from "@/components/ui";
import { ChatPoller } from "@/components/chat";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "waiting", label: "Waiting on us" },
  { key: "open", label: "All open" },
  { key: "mine", label: "Assigned to me" },
  { key: "resolved", label: "Resolved" },
] as const;

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { filter = "waiting" } = await searchParams;
  const scope = staffScope(user);

  // "Waiting on us" is the only one that matters day to day: a rider has
  // spoken and nobody has answered.
  const clause =
    filter === "open"
      ? "c.status <> 'RESOLVED'"
      : filter === "mine"
        ? "c.assignedToId = ? AND c.status <> 'RESOLVED'"
        : filter === "resolved"
          ? "c.status = 'RESOLVED'"
          : "c.staffUnread > 0 AND c.status <> 'RESOLVED'";
  const clauseParams = filter === "mine" ? [user.id] : [];

  const rows = await all<{
    id: string;
    subject: string;
    status: string;
    staffUnread: number;
    lastMessageAt: string;
    lastMessageFrom: string;
    riderName: string;
    msisdn: string;
    language: string;
    literacyScore: number;
    stageName: string | null;
    partnerName: string | null;
    assignedName: string | null;
    leadStatus: string | null;
    preview: string | null;
    ageHours: number;
  }>(
    `SELECT c.id, c.subject, c.status, c.staffUnread, c.lastMessageAt, c.lastMessageFrom,
            r.firstName || ' ' || r.lastName AS riderName, r.msisdn, r.language, r.literacyScore,
            st.name AS stageName, p.name AS partnerName, u.name AS assignedName,
            l.status AS leadStatus,
            (SELECT m.body FROM ChatMessage m WHERE m.conversationId = c.id
              ORDER BY m.createdAt DESC LIMIT 1) AS preview
       FROM Conversation c
       JOIN Rider r ON r.id = c.riderId
       LEFT JOIN Stage st ON st.id = r.stageId
       LEFT JOIN Partner p ON p.id = c.partnerId
       LEFT JOIN AppUser u ON u.id = c.assignedToId
       LEFT JOIN Lead l ON l.id = c.leadId
      WHERE ${scope.where} AND ${clause}
      ORDER BY c.staffUnread DESC, c.lastMessageAt ASC
      LIMIT 100`,
    [...scope.params, ...clauseParams],
  );

  const counts = await all<{ key: string; n: number }>(
    `SELECT 'waiting' AS key, COUNT(*) AS n FROM Conversation c
       WHERE ${scope.where} AND c.staffUnread > 0 AND c.status <> 'RESOLVED'
     UNION ALL
     SELECT 'open', COUNT(*) FROM Conversation c WHERE ${scope.where} AND c.status <> 'RESOLVED'`,
    [...scope.params, ...scope.params],
  );
  const waiting = Number(counts.find((c) => c.key === "waiting")?.n ?? 0);

  return (
    <div>
      <ChatPoller intervalMs={20000} />

      <PageHeader
        title="Conversations"
        subtitle={
          user.partnerName
            ? `Riders asking about ${user.partnerName} products. ${waiting} waiting on a reply.`
            : `Every thread across the platform. ${waiting} waiting on a reply.`
        }
      />

      <nav
        style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <Link
              key={f.key}
              href={`/admin/conversations?filter=${f.key}`}
              className="stat-label"
              style={{
                padding: "0.9rem 0",
                textDecoration: "none",
                color: active ? "var(--text)" : "var(--text-faint)",
                borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                marginBottom: "-1px",
              }}
            >
              {f.label}
              {f.key === "waiting" && waiting > 0 ? ` · ${waiting}` : ""}
            </Link>
          );
        })}
      </nav>

      {rows.length ? (
        <div className="stagger">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/admin/conversations/${c.id}`}
              className="lift"
              style={{
                display: "block",
                padding: "1.15rem 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
              }}
            >
              <div className="flex items-start gap-4">
                <MessageCircle
                  size={16}
                  style={{ color: c.staffUnread ? "var(--accent)" : "var(--text-faint)", marginTop: 3, flexShrink: 0 }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>{c.riderName}</span>
                    <span className="stat-label">{c.subject}</span>
                    {c.staffUnread > 0 ? <Pill tone="danger">{c.staffUnread} new</Pill> : null}
                    {c.leadStatus ? <Pill tone="neutral">Lead · {c.leadStatus}</Pill> : null}
                  </div>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-muted)",
                      marginTop: "0.4rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "70ch",
                    }}
                  >
                    {c.lastMessageFrom === "RIDER" ? "" : "↩ "}
                    {c.preview ?? ""}
                  </p>
                  <p className="stat-label" style={{ marginTop: "0.5rem" }}>
                    {c.msisdn} · {c.language} · {c.stageName ?? "No stage"} ·{" "}
                    {c.partnerName ?? "Platform team"} · {timeAgo(c.lastMessageAt)}
                    {c.assignedName ? ` · ${c.assignedName}` : " · unassigned"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ padding: "2.5rem 0", color: "var(--text-faint)", fontSize: "0.88rem" }}>
          {filter === "waiting"
            ? "Nothing waiting on a reply. That is the number to keep at zero."
            : "No conversations here yet."}
        </p>
      )}
    </div>
  );
}
