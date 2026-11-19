import Link from "next/link";
import { AlertTriangle, MessageCircle } from "lucide-react";

import { all, count } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Pill, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { PageHeader } from "@/components/admin";
import { displayMsisdn } from "@/lib/i18n";
import { updateLeadAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "DECLINED"];
const OPEN = "('NEW','CONTACTED','QUALIFIED')";

/** Anything open and untouched for longer than this is overdue. */
const SLA_DAYS = 2;

/**
 * The SLA cutoff as an ISO timestamp, computed here rather than in SQL.
 *
 * `julianday()` is SQLite-only and this application runs Postgres in
 * production, so date arithmetic stays in JavaScript and the query only ever
 * compares two ISO strings — which sort correctly in both engines.
 */
function slaCutoff(): string {
  return new Date(Date.now() - SLA_DAYS * 86_400_000).toISOString();
}

type Row = {
  id: string;
  status: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  firstContactedAt: string | null;
  nextActionAt: string | null;
  outcomeReason: string | null;
  valueKes: number | null;
  riderId: string;
  firstName: string;
  lastName: string;
  msisdn: string;
  literacyScore: number;
  stageName: string | null;
  productName: string;
  category: string;
  partnerName: string;
  ownerName: string | null;
  conversationId: string | null;
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await currentUser();
  const { view = "queue" } = await searchParams;

  const scoped = user?.partnerId ? "l.partnerId = ?" : "1 = 1";
  const scopeParams: unknown[] = user?.partnerId ? [user.partnerId] : [];

  const cutoff = slaCutoff();
  const clause =
    view === "all"
      ? "1 = 1"
      : view === "overdue"
        ? `l.status IN ${OPEN} AND COALESCE(l.firstContactedAt, l.createdAt) < ?`
        : view === "mine"
          ? `l.ownerId = ? AND l.status IN ${OPEN}`
          : view === "closed"
            ? "l.status IN ('CONVERTED','DECLINED')"
            : `l.status IN ${OPEN}`;
  const clauseParams: unknown[] =
    view === "mine" ? [user?.id ?? ""] : view === "overdue" ? [cutoff] : [];

  const leads = await all<Row>(
    `SELECT l.id, l.status, l.source, l.createdAt, l.updatedAt, l.firstContactedAt,
            l.nextActionAt, l.outcomeReason, l.valueKes, l.riderId, l.conversationId,
            r.firstName, r.lastName, r.msisdn, r.literacyScore,
            s.name AS stageName, p.name AS productName, p.category,
            pt.name AS partnerName, u.name AS ownerName
       FROM Lead l
       JOIN Rider r ON r.id = l.riderId
       LEFT JOIN Stage s ON s.id = r.stageId
       JOIN Product p ON p.id = l.productId
       JOIN Partner pt ON pt.id = l.partnerId
       LEFT JOIN AppUser u ON u.id = l.ownerId
      WHERE ${scoped} AND ${clause}
      ORDER BY
        CASE WHEN l.status IN ${OPEN} THEN 0 ELSE 1 END,
        COALESCE(l.nextActionAt, l.createdAt) ASC
      LIMIT 150`,
    [...scopeParams, ...clauseParams],
  );

  const openCount = await count(
    `SELECT COUNT(*) AS n FROM Lead l WHERE ${scoped} AND l.status IN ${OPEN}`,
    scopeParams,
  );
  const overdue = await count(
    `SELECT COUNT(*) AS n FROM Lead l WHERE ${scoped} AND l.status IN ${OPEN}
      AND COALESCE(l.firstContactedAt, l.createdAt) < ?`,
    [...scopeParams, cutoff],
  );
  const unowned = await count(
    `SELECT COUNT(*) AS n FROM Lead l WHERE ${scoped} AND l.status IN ${OPEN} AND l.ownerId IS NULL`,
    scopeParams,
  );
  const convertedValue = await count(
    `SELECT COALESCE(SUM(l.valueKes),0) AS n FROM Lead l WHERE ${scoped} AND l.status = 'CONVERTED'`,
    scopeParams,
  );

  const VIEWS = [
    { key: "queue", label: `Open · ${openCount}` },
    { key: "overdue", label: `Overdue · ${overdue}` },
    { key: "mine", label: "Mine" },
    { key: "closed", label: "Closed" },
    { key: "all", label: "Everything" },
  ];

  return (
    <div>
      <PageHeader
        title="Lead queue"
        subtitle={
          user?.partnerName
            ? `Riders waiting to hear from ${user.partnerName}. ${overdue} past the ${SLA_DAYS}-day mark, ${unowned} with nobody's name on them.`
            : `${openCount} open. ${overdue} past the ${SLA_DAYS}-day mark, ${unowned} with nobody's name on them. ${formatKes(convertedValue)} converted.`
        }
      />

      <nav style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}>
        {VIEWS.map((v) => {
          const active = v.key === view;
          return (
            <Link
              key={v.key}
              href={`/admin/leads?view=${v.key}`}
              className="stat-label"
              style={{
                padding: "0.9rem 0",
                textDecoration: "none",
                color: active ? "var(--text)" : "var(--text-faint)",
                borderBottom: `2px solid ${active ? "var(--accent)" : "transparent"}`,
                marginBottom: "-1px",
              }}
            >
              {v.label}
            </Link>
          );
        })}
      </nav>

      {leads.length ? (
        <div className="stagger">
          {leads.map((l) => {
            const open = ["NEW", "CONTACTED", "QUALIFIED"].includes(l.status);
            const sinceTouch = l.firstContactedAt ?? l.createdAt;
            const late = open && sinceTouch < cutoff;
            const ageDays = Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86_400_000);

            return (
              <div key={l.id} style={{ padding: "1.25rem 0", borderBottom: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {late ? (
                        <AlertTriangle size={15} style={{ color: "var(--danger)", flexShrink: 0 }} />
                      ) : null}
                      <Link
                        href={`/admin/riders/${l.riderId}`}
                        style={{ fontSize: "0.95rem", fontWeight: 700, textDecoration: "none" }}
                      >
                        {l.firstName} {l.lastName}
                      </Link>
                      <Pill tone={STATUS_TONE[l.status]}>{l.status}</Pill>
                      {late ? <Pill tone="danger">{ageDays} days</Pill> : null}
                      {l.conversationId ? (
                        <Link
                          href={`/admin/conversations/${l.conversationId}`}
                          className="stat-label"
                          style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: "var(--accent)" }}
                        >
                          <MessageCircle size={12} /> Read the thread
                        </Link>
                      ) : null}
                    </div>

                    <p style={{ fontSize: "0.86rem", marginTop: "0.35rem" }}>
                      {l.productName} <span style={{ color: "var(--text-faint)" }}>· {l.partnerName}</span>
                    </p>

                    <p className="stat-label" style={{ marginTop: "0.45rem" }}>
                      {displayMsisdn(l.msisdn)} · {l.stageName ?? "No stage"} · raised {timeAgo(l.createdAt)} ·{" "}
                      {l.firstContactedAt ? `first contact ${timeAgo(l.firstContactedAt)}` : "never contacted"} ·{" "}
                      {l.ownerName ? `owned by ${l.ownerName}` : "unowned"}
                      {l.nextActionAt ? ` · next action ${new Date(l.nextActionAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}` : ""}
                    </p>

                    {l.outcomeReason ? (
                      <p style={{ fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>
                        “{l.outcomeReason}”
                      </p>
                    ) : null}
                    {l.valueKes ? (
                      <p className="stat-label" style={{ marginTop: "0.4rem", color: "var(--success)" }}>
                        {formatKes(l.valueKes)}
                      </p>
                    ) : null}
                  </div>

                  {open ? <LeadControls leadId={l.id} status={l.status} owned={Boolean(l.ownerName)} /> : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ padding: "2.5rem 0", color: "var(--text-faint)", fontSize: "0.88rem" }}>
          {view === "overdue"
            ? "Nothing overdue. That is the number to keep at zero."
            : "No leads match this view."}
        </p>
      )}
    </div>
  );
}

/**
 * The row's controls.
 *
 * Declining asks for a reason in the same breath, because a decline without
 * one is a lost lesson — and the reason box is the cheapest product research
 * the programme will ever run.
 */
function LeadControls({ leadId, status, owned }: { leadId: string; status: string; owned: boolean }) {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  return (
    <form
      action={updateLeadAction}
      style={{ display: "grid", gap: "0.5rem", minWidth: "19rem" }}
    >
      <input type="hidden" name="leadId" value={leadId} />

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <select name="status" defaultValue={status} className="select" style={{ flex: "1 1 8rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="nextActionAt"
          defaultValue={tomorrow}
          className="input"
          style={{ flex: "1 1 8rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
          aria-label="Next action"
        />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <input
          name="outcomeReason"
          placeholder="Reason, if declined"
          className="input"
          style={{ flex: "2 1 10rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
        />
        <input
          name="valueKes"
          type="number"
          placeholder="KSh"
          className="input"
          style={{ flex: "1 1 5rem", padding: "0.4rem 0.6rem", fontSize: "0.78rem" }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {!owned ? (
          <label className="stat-label" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
            <input type="checkbox" name="claim" value="1" defaultChecked />
            Put my name on it
          </label>
        ) : null}
        <button type="submit" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
          Save
        </button>
      </div>
    </form>
  );
}
