import type { Metadata } from "next";
import Link from "next/link";
import DonateForm from "./DonateForm";
import { Bar, formatKes, timeAgo } from "@/components/ui";
import {
  MAX_DONATION_KES,
  MIN_DONATION_KES,
  PRESET_AMOUNTS_KES,
  beneficiaryName,
  cardMode,
  cardProviderLabel,
  donationGoalKes,
  methodAvailable,
  mpesaMode,
} from "@/lib/payments/config";
import { publicStats, recentSupporters } from "@/lib/payments/donations";
import { IMPACT_TIERS } from "@/lib/payments/impact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support BodaPesa — donate to financial literacy for boda boda riders",
  description: "Give by M-Pesa or card to help boda boda riders in Nairobi learn to save, borrow and insure wisely.",
};

export default async function DonatePage() {
  const [stats, supporters] = await Promise.all([publicStats(), recentSupporters(6)]);
  const goal = donationGoalKes();
  const mp = mpesaMode();
  const cd = cardMode();

  return (
    <main className="min-h-screen">
      <header className="border-b" style={{ background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg grid place-items-center text-xs font-bold" style={{ background: "var(--brand)", color: "#fff" }}>
              B
            </div>
            <span className="font-semibold tracking-tight text-sm">BodaPesa</span>
          </Link>
          <Link href="/" className="text-[0.82rem] text-[var(--text-muted)] hover:text-[var(--text)]">
            ← Back to the platform
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid gap-8 lg:grid-cols-5">
        {/* ------------------------------------------------------ story */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              Support our movement
            </span>
            <h1 className="mt-3 text-3xl sm:text-[2.4rem] font-semibold tracking-tight leading-[1.12]">
              Help a boda boda rider build a financial future.
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--text-muted)] max-w-xl">
              Riders handle cash every day yet sit almost entirely outside the formal financial system. BodaPesa teaches
              savings, credit, investment and insurance over SMS, USSD, WhatsApp and an in-app portal — in English,
              Kiswahili and Sheng — so a rider doesn&rsquo;t need a smartphone or data to learn.
            </p>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--text-muted)] max-w-xl">
              Your gift goes to {beneficiaryName()}, and helps cover the cost of reaching more riders with free lessons.
            </p>
          </div>

          {stats.donors > 0 || goal ? (
            <div className="card p-4 sm:p-5">
              <div className="flex items-end justify-between gap-3 mb-2">
                <div>
                  <div className="stat-value">{formatKes(stats.raisedKes)}</div>
                  <div className="stat-label">
                    raised from {stats.donors.toLocaleString()} {stats.donors === 1 ? "supporter" : "supporters"}
                  </div>
                </div>
                {goal ? <div className="text-xs text-[var(--text-faint)]">goal {formatKes(goal)}</div> : null}
              </div>
              {goal ? <Bar value={stats.raisedKes} max={goal} tone="accent" /> : null}
            </div>
          ) : null}

          <div className="card p-4 sm:p-5">
            <h2 className="text-[0.95rem] font-semibold tracking-tight mb-3">What your gift can do</h2>
            <ul className="space-y-2.5">
              {IMPACT_TIERS.map((t) => (
                <li key={t.amountKes} className="flex gap-3 text-[0.85rem]">
                  <span className="font-semibold shrink-0 w-24" style={{ color: "var(--brand)" }}>
                    {formatKes(t.amountKes)}
                  </span>
                  <span className="text-[var(--text-muted)]">{t.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {supporters.length ? (
            <div>
              <h2 className="text-[0.95rem] font-semibold tracking-tight mb-3">Recent supporters</h2>
              <ul className="space-y-2">
                {supporters.map((s, i) => (
                  <li key={i} className="text-[0.85rem] flex flex-wrap gap-x-2 text-[var(--text-muted)]">
                    <strong className="text-[var(--text)] font-semibold">{s.name}</strong>
                    <span className="text-[var(--text-faint)]">{timeAgo(s.paidAt)}</span>
                    {s.note ? <span className="basis-full">&ldquo;{s.note}&rdquo;</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {/* ------------------------------------------------------ form */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <DonateForm
              methods={{
                MPESA: { available: methodAvailable(mp), mode: mp },
                CARD: { available: methodAvailable(cd), mode: cd },
              }}
              presets={PRESET_AMOUNTS_KES}
              impact={IMPACT_TIERS}
              min={MIN_DONATION_KES}
              max={MAX_DONATION_KES}
              cardProvider={cardProviderLabel()}
            />
          </div>
        </div>
      </section>

      <footer className="border-t py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-[0.75rem] text-[var(--text-faint)]">
          Payments are processed by Safaricom M-Pesa and {cardProviderLabel()}. We never see your M-Pesa PIN or card details,
          and your phone number and email are never shown publicly.
        </div>
      </footer>
    </main>
  );
}
