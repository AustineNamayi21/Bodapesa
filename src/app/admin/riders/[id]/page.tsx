import Link from "next/link";
import { notFound } from "next/navigation";
import { all, count, one } from "@/lib/db";
import { Bar, Card, Pill, SectionTitle, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { displayMsisdn } from "@/lib/i18n";
import { updateRiderStatusAction } from "@/lib/actions";
import DirectMessage from "./DirectMessage";
import type { RiderWithStage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RiderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rider = await one<RiderWithStage>(
    `SELECT r.*, s.name AS stageName, s.subCounty
       FROM Rider r LEFT JOIN Stage s ON s.id = r.stageId WHERE r.id = ?`,
    [id],
  );
  if (!rider) notFound();

  const messages = await all<{ id: string; channel: string; body: string; status: string; direction: string; createdAt: string; campaignName: string | null }>(
    `SELECT m.id, m.channel, m.body, m.status, m.direction, m.createdAt, c.name AS campaignName
       FROM Message m LEFT JOIN Campaign c ON c.id = m.campaignId
      WHERE m.riderId = ? ORDER BY m.createdAt DESC LIMIT 12`,
    [id],
  );

  const leads = await all<{ id: string; status: string; source: string; createdAt: string; productName: string; partnerName: string; valueKes: number | null }>(
    `SELECT l.id, l.status, l.source, l.createdAt, l.valueKes, p.name AS productName, pt.name AS partnerName
       FROM Lead l JOIN Product p ON p.id = l.productId JOIN Partner pt ON pt.id = l.partnerId
      WHERE l.riderId = ? ORDER BY l.createdAt DESC`,
    [id],
  );

  const progress = await all<{ code: string; titleEn: string; moduleKey: string; completedAt: string; channel: string }>(
    `SELECT l.code, l.titleEn, l.moduleKey, lp.completedAt, lp.channel
       FROM LessonProgress lp JOIN Lesson l ON l.id = lp.lessonId
      WHERE lp.riderId = ? ORDER BY lp.completedAt DESC`,
    [id],
  );

  const attempts = await one<{ s: number; t: number; n: number }>(
    "SELECT COALESCE(SUM(score),0) AS s, COALESCE(SUM(total),0) AS t, COUNT(*) AS n FROM QuizAttempt WHERE riderId = ?",
    [id],
  );

  const goal = await one<{ id: string; title: string; targetAmount: number; dailyTarget: number }>(
    "SELECT * FROM SavingsGoal WHERE riderId = ? ORDER BY createdAt DESC LIMIT 1",
    [id],
  );
  const saved = goal
    ? await count("SELECT COALESCE(SUM(amount),0) AS n FROM SavingsDeposit WHERE goalId = ?", [goal.id])
    : 0;

  const totalLessons = await count("SELECT COUNT(*) AS n FROM Lesson WHERE active = 1");

  const facts: [string, string][] = [
    ["Phone", displayMsisdn(rider.msisdn)],
    ["Stage", rider.stageName ? `${rider.stageName}, ${rider.subCounty}` : "Not assigned"],
    ["Language", rider.language === "EN" ? "English" : rider.language === "SH" ? "Sheng" : "Kiswahili"],
    ["Preferred channel", rider.channelPref],
    ["Daily take-home", rider.dailyIncomeBand ? `KSh ${rider.dailyIncomeBand}` : "Not given"],
    ["Age band", rider.ageBand ?? "Not given"],
    ["Registered via", rider.registeredVia],
    ["Registered", new Date(rider.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })],
  ];

  const holdings: [string, boolean][] = [
    ["Owns their motorbike", Boolean(rider.ownsMotorbike)],
    ["SACCO member", Boolean(rider.saccoMember)],
    ["Holds insurance", Boolean(rider.hasInsurance)],
    ["Bank account", Boolean(rider.hasBankAccount)],
    ["Uses mobile money", Boolean(rider.usesMobileMoney)],
  ];

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/riders" className="text-[0.78rem] text-[var(--text-faint)] hover:underline">
          ← Rider registry
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="text-xl font-semibold tracking-tight">
            {rider.firstName} {rider.lastName}
          </h1>
          <Pill tone={STATUS_TONE[rider.status]}>{rider.status.replace("_", " ")}</Pill>
          {rider.consent ? <Pill tone="brand">Consented</Pill> : <Pill tone="danger">No consent</Pill>}
          {Number(rider.isSynthetic) === 1 ? <Pill tone="neutral">Demo rider · messages simulated</Pill> : null}
          {rider.registeredVia === "TEST" ? <Pill tone="info">Test number</Pill> : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ------------------------------------------------------- profile */}
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Profile" />
            <dl className="space-y-2">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[0.82rem]">
                  <dt className="text-[var(--text-faint)] shrink-0">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <SectionTitle title="Financial holdings" subtitle="Captured at registration, updated on conversion" />
            <ul className="space-y-1.5">
              {holdings.map(([label, has]) => (
                <li key={label} className="flex items-center gap-2 text-[0.82rem]">
                  <span
                    className="w-4 h-4 rounded grid place-items-center text-[0.6rem] shrink-0"
                    style={{
                      background: has ? "var(--brand-soft)" : "var(--surface-2)",
                      color: has ? "var(--brand-strong)" : "var(--text-faint)",
                    }}
                  >
                    {has ? "✓" : "–"}
                  </span>
                  <span className={has ? "" : "text-[var(--text-faint)]"}>{label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle title="Programme status" />
            <form action={updateRiderStatusAction} className="flex gap-2">
              <input type="hidden" name="riderId" value={rider.id} />
              <select name="status" defaultValue={rider.status} className="select">
                {["PROSPECT", "ENROLLED", "ACTIVE", "ONBOARDED", "DORMANT", "OPTED_OUT"].map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm shrink-0">Update</button>
            </form>
          </Card>
        </div>

        {/* ------------------------------------------------------ learning */}
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Financial literacy" />
            <div className="flex items-end gap-3 mb-3">
              <div className="stat-value" style={{ color: "var(--brand)" }}>
                {rider.literacyScore}
              </div>
              <div className="text-[0.75rem] text-[var(--text-faint)] pb-2">/ 100</div>
            </div>
            <Bar value={rider.literacyScore} max={100} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="stat-label">Lessons completed</div>
                <div className="text-sm font-semibold mt-0.5">
                  {progress.length} of {totalLessons}
                </div>
              </div>
              <div>
                <div className="stat-label">Quiz accuracy</div>
                <div className="text-sm font-semibold mt-0.5">
                  {attempts && attempts.t > 0 ? `${Math.round((attempts.s / attempts.t) * 100)}%` : "—"}
                  <span className="text-[0.7rem] font-normal text-[var(--text-faint)] ml-1">
                    ({attempts?.n ?? 0} attempts)
                  </span>
                </div>
              </div>
            </div>

            {progress.length ? (
              <ul className="mt-4 space-y-1.5 max-h-56 overflow-y-auto scroll-thin">
                {progress.map((p) => (
                  <li key={p.code} className="flex items-center justify-between gap-2 text-[0.78rem]">
                    <span className="truncate">{p.titleEn}</span>
                    <span className="text-[0.68rem] text-[var(--text-faint)] shrink-0">
                      {p.channel} · {timeAgo(p.completedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8rem] text-[var(--text-faint)] mt-4">No lessons completed yet.</p>
            )}
          </Card>

          {goal ? (
            <Card>
              <SectionTitle title="Savings goal" subtitle={goal.title} />
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-semibold">{formatKes(saved)}</span>
                <span className="text-[0.75rem] text-[var(--text-faint)]">of {formatKes(goal.targetAmount)}</span>
              </div>
              <Bar value={saved} max={goal.targetAmount} tone="accent" />
              <p className="text-[0.72rem] text-[var(--text-faint)] mt-2">
                Daily target {formatKes(goal.dailyTarget)} · {Math.round((saved / goal.targetAmount) * 100)}% of the way there
              </p>
            </Card>
          ) : null}
        </div>

        {/* ------------------------------------------------ messages/leads */}
        <div className="space-y-4">
          <Card>
            <SectionTitle title="Send a message" subtitle="Ad-hoc, outside any campaign" />
            <DirectMessage riderId={rider.id} defaultChannel={rider.channelPref} consented={Boolean(rider.consent)} />
          </Card>

          <Card>
            <SectionTitle title="Product enquiries" />
            {leads.length ? (
              <ul className="space-y-2">
                {leads.map((l) => (
                  <li key={l.id} className="p-2.5 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[0.82rem] font-medium truncate">{l.productName}</div>
                        <div className="text-[0.7rem] text-[var(--text-faint)]">
                          {l.partnerName} · via {l.source} · {timeAgo(l.createdAt)}
                        </div>
                      </div>
                      <Pill tone={STATUS_TONE[l.status]}>{l.status}</Pill>
                    </div>
                    {l.valueKes ? (
                      <div className="text-[0.72rem] mt-1" style={{ color: "var(--brand)" }}>
                        Converted at {formatKes(l.valueKes)}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[0.8rem] text-[var(--text-faint)]">No product enquiries yet.</p>
            )}
          </Card>

          <Card>
            <SectionTitle title="Message history" />
            <ul className="space-y-2 max-h-96 overflow-y-auto scroll-thin">
              {messages.map((m) => (
                <li key={m.id} className="text-[0.78rem]">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Pill tone={m.direction === "IN" ? "neutral" : STATUS_TONE[m.status]}>
                      {m.direction === "IN" ? "Inbound" : m.status}
                    </Pill>
                    <span className="text-[0.68rem] text-[var(--text-faint)]">
                      {m.channel} · {timeAgo(m.createdAt)}
                    </span>
                  </div>
                  <p className="text-[var(--text-muted)] leading-relaxed">{m.body}</p>
                  {m.campaignName ? (
                    <div className="text-[0.66rem] text-[var(--text-faint)] mt-0.5">{m.campaignName}</div>
                  ) : null}
                </li>
              ))}
              {!messages.length ? (
                <li className="text-[0.8rem] text-[var(--text-faint)]">No messages sent yet.</li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
