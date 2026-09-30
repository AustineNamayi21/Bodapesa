import Link from "next/link";
import { all, count } from "@/lib/db";
import { Card, ModePill, Pill, Stat, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { displayMsisdn } from "@/lib/i18n";
import { providerStatus } from "@/lib/channels/providers";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const channel = sp.channel ?? "";
  const status = sp.status ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (channel) {
    clauses.push("m.channel = ?");
    params.push(channel);
  }
  if (status) {
    clauses.push("m.status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const total = await count(`SELECT COUNT(*) AS n FROM Message m ${where}`, params);
  const messages = await all<{
    id: string;
    channel: string;
    language: string;
    body: string;
    status: string;
    direction: string;
    costKes: number;
    error: string | null;
    createdAt: string;
    providerRef: string | null;
    riderId: string;
    firstName: string;
    lastName: string;
    msisdn: string;
    campaignName: string | null;
  }>(
    `SELECT m.*, r.firstName, r.lastName, r.msisdn, c.name AS campaignName
       FROM Message m JOIN Rider r ON r.id = m.riderId
       LEFT JOIN Campaign c ON c.id = m.campaignId
       ${where}
      ORDER BY m.createdAt DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );

  const failed = await count("SELECT COUNT(*) AS n FROM Message WHERE status = 'FAILED'");
  const spend = await count("SELECT COALESCE(SUM(costKes),0) AS n FROM Message");
  const delivered = await count("SELECT COUNT(*) AS n FROM Message WHERE status IN ('DELIVERED','READ')");
  const all_ = await count("SELECT COUNT(*) AS n FROM Message");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (patch: Record<string, string | number>) => {
    const u = new URLSearchParams();
    if (channel) u.set("channel", channel);
    if (status) u.set("status", status);
    Object.entries(patch).forEach(([k, v]) => (v ? u.set(k, String(v)) : u.delete(k)));
    return `?${u.toString()}`;
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[2rem] leading-tight">Message log</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          Every message the platform has attempted, with its provider reference, cost and delivery outcome.
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat label="Total messages" value={all_.toLocaleString()} />
        <Stat
          label="Delivery rate"
          value={`${all_ ? Math.round((delivered / all_) * 100) : 0}%`}
          tone="brand"
        />
        <Stat label="Failed" value={failed.toLocaleString()} tone={failed ? "danger" : "default"} />
        <Stat label="Total spend" value={formatKes(spend)} />
      </div>

      <Card>
        <div className="stat-label mb-2">Provider status</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {providerStatus().map((p) => (
            <span key={p.channel} className="inline-flex items-center gap-1.5 text-[0.78rem]">
              <span className="text-[var(--text-muted)]">{p.name}</span>
              <ModePill mode={p.mode} />
            </span>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <form className="p-3 flex flex-wrap gap-2 items-end border-b">
          <div className="min-w-[140px]">
            <label className="label" htmlFor="channel">Channel</label>
            <select id="channel" name="channel" defaultValue={channel} className="select">
              <option value="">All channels</option>
              {["SMS", "WHATSAPP", "USSD", "APP"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status} className="select">
              <option value="">All statuses</option>
              {["QUEUED", "SENT", "DELIVERED", "READ", "FAILED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-ghost btn-sm">Apply</button>
          {channel || status ? (
            <Link href="/admin/messages" className="btn btn-ghost btn-sm">Clear</Link>
          ) : null}
        </form>

        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Channel</th>
                <th>Lang</th>
                <th>Message</th>
                <th>Campaign</th>
                <th>Status</th>
                <th>Cost</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Link href={`/admin/riders/${m.riderId}`} className="font-medium hover:underline">
                      {m.firstName} {m.lastName}
                    </Link>
                    <div className="text-[0.7rem] text-[var(--text-faint)] tabular-nums">
                      {displayMsisdn(m.msisdn)}
                    </div>
                  </td>
                  <td className="text-[0.8rem]">
                    {m.channel}
                    {m.direction === "IN" ? <Pill tone="neutral">in</Pill> : null}
                  </td>
                  <td className="text-[0.8rem]">{m.language}</td>
                  <td className="text-[0.78rem] text-[var(--text-muted)] max-w-sm">{m.body}</td>
                  <td className="text-[0.76rem] text-[var(--text-faint)] max-w-[150px] truncate">
                    {m.campaignName ?? "—"}
                  </td>
                  <td>
                    <Pill tone={STATUS_TONE[m.status]}>{m.status}</Pill>
                    {m.error ? (
                      <div className="text-[0.66rem] mt-0.5" style={{ color: "var(--danger)" }}>
                        {m.error}
                      </div>
                    ) : null}
                  </td>
                  <td className="tabular-nums text-[0.78rem]">{m.costKes ? m.costKes.toFixed(2) : "—"}</td>
                  <td className="text-[0.78rem] text-[var(--text-muted)]">{timeAgo(m.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 ? (
          <div className="p-3 flex items-center justify-between border-t text-[0.8rem]">
            <span className="text-[var(--text-faint)]">
              Page {page} of {pages} · {total.toLocaleString()} messages
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={qs({ page: page - 1 })} className="btn btn-ghost btn-sm">Previous</Link>
              ) : null}
              {page < pages ? (
                <Link href={qs({ page: page + 1 })} className="btn btn-ghost btn-sm">Next</Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
