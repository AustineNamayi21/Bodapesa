import Link from "next/link";
import { all, count } from "@/lib/db";
import { Card, Pill, STATUS_TONE, timeAgo } from "@/components/ui";
import { displayMsisdn } from "@/lib/i18n";
import type { RiderWithStage } from "@/lib/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function RidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "";
  const stageId = sp.stage ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (q) {
    clauses.push("(r.firstName LIKE ? OR r.lastName LIKE ? OR r.msisdn LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q.replace(/^0/, "")}%`);
  }
  if (status) {
    clauses.push("r.status = ?");
    params.push(status);
  }
  if (stageId) {
    clauses.push("r.stageId = ?");
    params.push(stageId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const total = await count(`SELECT COUNT(*) AS n FROM Rider r ${where}`, params);
  const riders = await all<RiderWithStage>(
    `SELECT r.*, s.name AS stageName, s.subCounty
       FROM Rider r LEFT JOIN Stage s ON s.id = r.stageId
       ${where}
      ORDER BY r.createdAt DESC LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );
  const stages = await all<{ id: string; name: string }>("SELECT id, name FROM Stage ORDER BY name");

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (patch: Record<string, string | number>) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (status) u.set("status", status);
    if (stageId) u.set("stage", stageId);
    Object.entries(patch).forEach(([k, v]) => (v ? u.set(k, String(v)) : u.delete(k)));
    return `?${u.toString()}`;
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[2rem] leading-tight">Rider registry</h1>
          <p className="text-xs text-[var(--text-faint)] mt-0.5">
            {total.toLocaleString()} rider{total === 1 ? "" : "s"}
            {q || status || stageId ? " matching your filters" : " registered across all stages"}
          </p>
        </div>
        <Link href="/admin/riders/new" className="btn btn-primary btn-sm">
          Register a rider
        </Link>
      </header>

      {/* filters — one row above the table */}
      <Card padded={false}>
        <form className="p-3 flex flex-wrap gap-2 items-end border-b">
          <div className="flex-1 min-w-[180px]">
            <label className="label" htmlFor="q">
              Search
            </label>
            <input id="q" name="q" defaultValue={q} className="input" placeholder="Name or phone number" />
          </div>
          <div className="min-w-[140px]">
            <label className="label" htmlFor="status">
              Status
            </label>
            <select id="status" name="status" defaultValue={status} className="select">
              <option value="">All statuses</option>
              {["PROSPECT", "ENROLLED", "ACTIVE", "ONBOARDED", "DORMANT", "OPTED_OUT"].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="label" htmlFor="stage">
              Stage
            </label>
            <select id="stage" name="stage" defaultValue={stageId} className="select">
              <option value="">All stages</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-ghost btn-sm">Apply</button>
          {q || status || stageId ? (
            <Link href="/admin/riders" className="btn btn-ghost btn-sm">
              Clear
            </Link>
          ) : null}
        </form>

        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Stage</th>
                <th>Lang</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Score</th>
                <th>Holdings</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/riders/${r.id}`} className="font-medium hover:underline">
                      {r.firstName} {r.lastName}
                    </Link>
                    <div className="text-[0.72rem] text-[var(--text-faint)] tabular-nums">{displayMsisdn(r.msisdn)}</div>
                  </td>
                  <td className="text-[0.8rem]">
                    {r.stageName ?? "—"}
                    <div className="text-[0.7rem] text-[var(--text-faint)]">{r.subCounty ?? ""}</div>
                  </td>
                  <td className="text-[0.8rem]">{r.language}</td>
                  <td className="text-[0.8rem]">{r.channelPref}</td>
                  <td>
                    <Pill tone={STATUS_TONE[r.status]}>{r.status.replace("_", " ")}</Pill>
                  </td>
                  <td className="tabular-nums text-[0.82rem]">{r.literacyScore}</td>
                  <td>
                    <div className="flex gap-1">
                      {r.saccoMember ? <Pill tone="brand">SACCO</Pill> : null}
                      {r.hasInsurance ? <Pill tone="info">Insured</Pill> : null}
                      {!r.saccoMember && !r.hasInsurance ? (
                        <span className="text-[0.72rem] text-[var(--text-faint)]">None</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="text-[0.78rem] text-[var(--text-muted)]">{timeAgo(r.lastActiveAt)}</td>
                </tr>
              ))}
              {!riders.length ? (
                <tr>
                  <td colSpan={8} className="text-center text-[var(--text-faint)] py-8">
                    No riders match those filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {pages > 1 ? (
          <div className="p-3 flex items-center justify-between border-t text-[0.8rem]">
            <span className="text-[var(--text-faint)]">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={qs({ page: page - 1 })} className="btn btn-ghost btn-sm">
                  Previous
                </Link>
              ) : null}
              {page < pages ? (
                <Link href={qs({ page: page + 1 })} className="btn btn-ghost btn-sm">
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
