import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { displayMsisdn } from "@/lib/i18n";
import { Card, Empty, ModePill, Pill, SectionTitle, Stat, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { cardMode, cardProvider, cardProviderLabel, mpesaMode } from "@/lib/payments/config";
import type { Donation } from "@/lib/payments/donations";
import CopyField from "../integrations/CopyField";

export const dynamic = "force-dynamic";

export default async function DonationsPage() {
  const user = await currentUser();
  if (user?.role !== "PLATFORM_ADMIN") redirect("/admin");

  const rows = await all<Donation>("SELECT * FROM Donation ORDER BY createdAt DESC LIMIT 100");
  const totals = await all<{ method: string; total: number; n: number }>(
    "SELECT method, COALESCE(SUM(amountKes), 0) AS total, COUNT(*) AS n FROM Donation WHERE status = 'SUCCESS' AND live = 1 GROUP BY method",
  );
  const sum = (m?: string) => totals.filter((t) => !m || t.method === m).reduce((a, t) => a + Number(t.total), 0);
  const count = (m?: string) => totals.filter((t) => !m || t.method === m).reduce((a, t) => a + Number(t.n), 0);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = env.publicUrl || `${proto}://${host}`;
  const secret = env.webhookSecret ? `?secret=${encodeURIComponent(env.webhookSecret)}` : "";

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Donations"
        subtitle="Live-money donations only are counted in the totals. Test and simulated payments are listed but marked."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Raised (live)" value={formatKes(sum())} tone="brand" />
        <Stat label="Successful gifts" value={count()} />
        <Stat label="Via M-Pesa" value={formatKes(sum("MPESA"))} hint={`${count("MPESA")} gifts`} />
        <Stat label="Via card" value={formatKes(sum("CARD"))} hint={`${count("CARD")} gifts`} />
      </div>

      <Card>
        <SectionTitle title="Payment methods" />
        <div className="grid gap-2 sm:grid-cols-2 mb-4">
          {[
            { name: "M-Pesa (Daraja STK Push)", mode: mpesaMode() },
            { name: `Card (${cardProviderLabel()})`, mode: cardMode() },
          ].map((m) => (
            <div key={m.name} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
              <span className="text-sm font-medium">{m.name}</span>
              <ModePill mode={m.mode} />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">Daraja STK callback (sent automatically with each request)</span>
            <CopyField value={`${base}/api/donate/stk-callback${secret}`} />
          </div>
          {cardProvider() === "PAYSTACK" ? (
            <div>
              <span className="label">Paystack webhook (Dashboard → Settings → API Keys &amp; Webhooks)</span>
              <CopyField value={`${base}/api/donate/paystack-webhook`} />
            </div>
          ) : (
            <div>
              <span className="label">Flutterwave webhook (Dashboard → Settings → Webhooks)</span>
              <CopyField value={`${base}/api/donate/flutterwave-webhook`} />
            </div>
          )}
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-4 sm:p-5 pb-0">
          <SectionTitle title="Latest 100 donations" />
        </div>
        {rows.length === 0 ? (
          <div className="p-5">
            <Empty>No donations yet. Share the /donate page to get started.</Empty>
          </div>
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Donor</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap text-[var(--text-muted)]">{timeAgo(d.createdAt)}</td>
                    <td>
                      <div className="font-medium">{d.donorName || "—"}</div>
                      <div className="text-[0.72rem] text-[var(--text-faint)]">
                        {d.donorMsisdn ? displayMsisdn(d.donorMsisdn) : d.donorEmail || ""}
                        {d.anonymous ? " · anonymous" : ""}
                      </div>
                    </td>
                    <td>
                      {d.method === "MPESA" ? "M-Pesa" : "Card"}
                      {!d.live ? (
                        <span className="ml-1.5">
                          <Pill tone="neutral">{d.provider === "SIMULATED" ? "simulated" : "test"}</Pill>
                        </span>
                      ) : null}
                    </td>
                    <td className="tabular-nums">{formatKes(d.amountKes)}</td>
                    <td>
                      <Pill tone={STATUS_TONE[d.status === "SUCCESS" ? "CONVERTED" : d.status] ?? "neutral"}>{d.status}</Pill>
                      {d.failureReason ? <div className="text-[0.7rem] text-[var(--text-faint)] mt-0.5 max-w-[16rem]">{d.failureReason}</div> : null}
                    </td>
                    <td className="text-[0.75rem] text-[var(--text-faint)]">
                      {d.receipt || d.txRef}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
