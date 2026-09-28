import Link from "next/link";
import { all, count } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Card, Pill, Stat, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { displayMsisdn } from "@/lib/i18n";
import { updateLeadAction } from "@/lib/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "DECLINED"];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await currentUser();
  const status = sp.status ?? "";
  const partnerFilter = sp.partner ?? "";

  const clauses: string[] = [];
  const params: unknown[] = [];

  // Partner staff only ever see their own institution's pipeline.
  if (user?.partnerId) {
    clauses.push("l.partnerId = ?");
    params.push(user.partnerId);
  } else if (partnerFilter) {
    clauses.push("pt.code = ?");
    params.push(partnerFilter);
  }
  if (status) {
    clauses.push("l.status = ?");
    params.push(status);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const leads = await all<{
    id: string;
    status: string;
    source: string;
    createdAt: string;
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
    accent: string;
  }>(
    `SELECT l.id, l.status, l.source, l.createdAt, l.valueKes, l.riderId,
            r.firstName, r.lastName, r.msisdn, r.literacyScore,
            s.name AS stageName,
            p.name AS productName, p.category,
            pt.name AS partnerName, pt.accent
       FROM Lead l
       JOIN Rider r ON r.id = l.riderId
       LEFT JOIN Stage s ON s.id = r.stageId
       JOIN Product p ON p.id = l.productId
       JOIN Partner pt ON pt.id = l.partnerId
       ${where}
      ORDER BY CASE l.status WHEN 'NEW' THEN 0 WHEN 'CONTACTED' THEN 1 WHEN 'QUALIFIED' THEN 2 ELSE 3 END,
               l.createdAt DESC
      LIMIT 100`,
    params,
  );

  const totals = Object.fromEntries(
    await Promise.all(
      STATUSES.map(async (s) => [
        s,
        await count(
          `SELECT COUNT(*) AS n FROM Lead l JOIN Partner pt ON pt.id = l.partnerId ${where ? `${where} AND` : "WHERE"} l.status = ?`,
          [...params, s],
        ),
      ]),
    ),
  );
  const convertedValue = await count(
    `SELECT COALESCE(SUM(l.valueKes),0) AS n FROM Lead l JOIN Partner pt ON pt.id = l.partnerId ${where ? `${where} AND` : "WHERE"} l.status = 'CONVERTED'`,
    params,
  );

  const partners = await all<{ code: string; name: string }>("SELECT code, name FROM Partner ORDER BY name");

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Lead pipeline</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          {user?.partnerName
            ? `Riders who have asked to be contacted about a ${user.partnerName} product.`
            : "Riders who have asked to be contacted about a partner product, routed to the institution that owns it."}
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-6">
        {STATUSES.map((s) => (
          <Stat
            key={s}
            label={s.toLowerCase()}
            value={(totals[s] ?? 0).toLocaleString()}
            tone={s === "CONVERTED" ? "brand" : s === "DECLINED" ? "danger" : "default"}
          />
        ))}
        <Stat label="Converted value" value={formatKes(convertedValue)} tone="brand" />
      </div>

      <Card padded={false}>
        <form className="p-3 flex flex-wrap gap-2 items-end border-b">
          <div className="min-w-[150px]">
            <label className="label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={status} className="select">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {!user?.partnerId ? (
            <div className="min-w-[160px]">
              <label className="label" htmlFor="partner">Institution</label>
              <select id="partner" name="partner" defaultValue={partnerFilter} className="select">
                <option value="">Both partners</option>
                {partners.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
          ) : null}
          <button className="btn btn-ghost btn-sm">Apply</button>
          {status || partnerFilter ? (
            <Link href="/admin/leads" className="btn btn-ghost btn-sm">Clear</Link>
          ) : null}
        </form>

        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Product</th>
                <th>Source</th>
                <th>Raised</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/admin/riders/${l.riderId}`} className="font-medium hover:underline">
                      {l.firstName} {l.lastName}
                    </Link>
                    <div className="text-[0.7rem] text-[var(--text-faint)] tabular-nums">
                      {displayMsisdn(l.msisdn)} · {l.stageName ?? "no stage"} · score {l.literacyScore}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: l.accent }} />
                      <span className="text-[0.82rem]">{l.productName}</span>
                    </div>
                    <div className="text-[0.7rem] text-[var(--text-faint)]">
                      {l.partnerName} · {l.category.toLowerCase()}
                    </div>
                  </td>
                  <td className="text-[0.8rem]">{l.source}</td>
                  <td className="text-[0.78rem] text-[var(--text-muted)]">{timeAgo(l.createdAt)}</td>
                  <td>
                    <Pill tone={STATUS_TONE[l.status]}>{l.status}</Pill>
                    {l.valueKes ? (
                      <div className="text-[0.7rem] mt-0.5" style={{ color: "var(--brand)" }}>
                        {formatKes(l.valueKes)}
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <form action={updateLeadAction} className="flex gap-1.5 items-center">
                      <input type="hidden" name="leadId" value={l.id} />
                      <select name="status" defaultValue={l.status} className="select !py-1 !text-[0.78rem] w-[118px]">
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <input
                        name="valueKes"
                        type="number"
                        placeholder="KSh"
                        className="input !py-1 !text-[0.78rem] w-[80px]"
                      />
                      <button className="btn btn-ghost btn-sm">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
              {!leads.length ? (
                <tr>
                  <td colSpan={6} className="text-center text-[var(--text-faint)] py-8">
                    No leads match those filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
