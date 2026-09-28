import Link from "next/link";
import { currentUser } from "@/lib/auth";
import {
  channelBreakdown,
  funnel,
  inclusionIndicators,
  kpis,
  languageBreakdown,
  moduleCompletion,
  partnerPerformance,
  stageLeaderboard,
  topProducts,
  weeklyActivity,
} from "@/lib/analytics";
import { all } from "@/lib/db";
import { Card, Pill, SectionTitle, Stat, STATUS_TONE, formatKes, timeAgo } from "@/components/ui";
import { BarList, Funnel, GroupedBars, TrendChart } from "@/components/charts";
import { MODULE_LABELS } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await currentUser();
  const k = await kpis();
  const activity = await weeklyActivity(12);
  const channels = await channelBreakdown();
  const stages = await stageLeaderboard(8);
  const modules = await moduleCompletion();
  const partners = await partnerPerformance();
  const products = await topProducts(6);
  const languages = await languageBreakdown();
  const indicators = await inclusionIndicators();

  const recentCampaigns = await all<{ id: string; name: string; status: string; sentAt: string | null; channels: string; reach: number }>(
    `SELECT c.id, c.name, c.status, c.sentAt, c.channels,
            (SELECT COUNT(*) FROM Message m WHERE m.campaignId = c.id) AS reach
       FROM Campaign c ORDER BY COALESCE(c.sentAt, c.createdAt) DESC LIMIT 5`,
  );

  const LANG_NAMES: Record<string, string> = { EN: "English", SW: "Kiswahili", SH: "Sheng" };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Programme dashboard</h1>
          <p className="text-xs text-[var(--text-faint)] mt-0.5">
            {user?.partnerName ? `Viewing as ${user.partnerName}` : "Platform-wide view"} · updated{" "}
            {new Date().toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <Link href="/admin/campaigns/new" className="btn btn-primary btn-sm">
          New campaign
        </Link>
      </header>

      {/* ------------------------------------------------------------ KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat label="Riders registered" value={k.riders.toLocaleString()} hint={`${k.consented.toLocaleString()} consented to messaging`} />
        <Stat label="Riders reached" value={k.reached.toLocaleString()} hint={`${k.deliveryRate}% delivery rate`} tone="brand" />
        <Stat
          label="Avg. literacy score"
          value={`${k.avgLiteracy}/100`}
          hint={`${k.proficientShare}% of ${k.learners.toLocaleString()} learners score 50+`}
          tone="accent"
        />
        <Stat
          label="Onboarded to a product"
          value={k.converted.toLocaleString()}
          hint={`${k.conversionRate}% of ${k.leads.toLocaleString()} enquiries`}
          tone="brand"
        />
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat label="Messages sent" value={k.messagesSent.toLocaleString()} />
        <Stat label="Messaging spend" value={formatKes(k.costKes)} hint="Sandbox pricing at KSh 0.80/SMS part" />
        <Stat label="Cost per rider onboarded" value={formatKes(k.costPerOnboard)} />
        <Stat label="Lessons completed" value={k.lessonsCompleted.toLocaleString()} />
      </div>

      {/* ----------------------------------------------------- trend chart */}
      <Card>
        <SectionTitle
          title="Programme activity, last 12 weeks"
          subtitle="Messages dispatched, lessons completed and product enquiries generated each week"
        />
        <TrendChart
          data={activity}
          xKey="week"
          series={[
            { key: "messages", label: "Messages sent" },
            { key: "lessons", label: "Lessons completed" },
            { key: "leads", label: "Product enquiries" },
          ]}
          caption="Hover the chart for weekly figures."
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------------------------------------------------------- funnel */}
        <Card>
          <SectionTitle
            title="Onboarding funnel"
            subtitle="From registration through to a converted product with a partner institution"
          />
          <Funnel data={await funnel()} />
        </Card>

        {/* -------------------------------------------- inclusion indicators */}
        <Card>
          <SectionTitle
            title="Financial inclusion indicators"
            subtitle="Share of riders holding each product, all riders vs. those actively engaged with the programme"
          />
          <GroupedBars
            data={indicators.map((i) => ({ label: i.label, a: i.all, b: i.engaged }))}
            seriesLabels={["All registered riders", "Engaged with programme"]}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* -------------------------------------------------------- channels */}
        <Card>
          <SectionTitle title="Delivery by channel" subtitle="Messages dispatched per channel" />
          <BarList
            data={channels.map((c) => ({
              label: c.channel,
              value: c.sent,
              sub: `${c.sent ? Math.round((c.delivered / c.sent) * 100) : 0}% delivered · ${formatKes(c.cost)}`,
            }))}
            tooltipLabel="messages"
          />
        </Card>

        {/* -------------------------------------------------------- modules */}
        <Card>
          <SectionTitle title="Curriculum engagement" subtitle="Lesson completions and quiz accuracy per module" />
          <BarList
            data={modules.map((m) => ({
              label: MODULE_LABELS[m.moduleKey]?.EN ?? m.moduleKey,
              value: m.completions,
              sub: `${m.accuracy}% quiz accuracy`,
            }))}
            tone="accent"
            tooltipLabel="completions"
          />
        </Card>

        {/* ------------------------------------------------------- languages */}
        <Card>
          <SectionTitle title="Language preference" subtitle="How riders have chosen to be spoken to" />
          <BarList
            data={languages.map((l) => ({ label: LANG_NAMES[l.language] ?? l.language, value: l.n }))}
            tone="info"
            tooltipLabel="riders"
          />
        </Card>
      </div>

      {/* --------------------------------------------------------- partners */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Partner pipeline" subtitle="Enquiries routed to each institution and their conversion" />
          <div className="space-y-3">
            {partners.map((p) => (
              <div key={p.code} className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.accent }} />
                    <span className="text-sm font-medium truncate">{p.name}</span>
                  </div>
                  <div className="text-[0.72rem] text-[var(--text-faint)] mt-0.5">
                    {p.leads.toLocaleString()} enquiries · {p.converted.toLocaleString()} converted
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tabular-nums">{formatKes(p.value)}</div>
                  <div className="text-[0.68rem] text-[var(--text-faint)]">premiums &amp; deposits</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="stat-label mb-2">Most requested products</div>
            <div className="space-y-1.5">
              {products.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-3 text-[0.8rem]">
                  <span className="truncate">
                    {p.name} <span className="text-[var(--text-faint)]">· {p.partnerName}</span>
                  </span>
                  <span className="tabular-nums shrink-0 text-[var(--text-muted)]">
                    {p.leads} / {p.converted} conv.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ---------------------------------------------------------- stages */}
        <Card>
          <SectionTitle title="Stage coverage" subtitle="Riders registered per stage and their average literacy score" />
          <div className="overflow-x-auto scroll-thin">
            <table className="table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Riders</th>
                  <th>Onboarded</th>
                  <th>Avg. score</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((s) => (
                  <tr key={s.name}>
                    <td>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-[0.7rem] text-[var(--text-faint)]">{s.subCounty}</div>
                    </td>
                    <td className="tabular-nums">{s.riders}</td>
                    <td className="tabular-nums">{s.onboarded}</td>
                    <td className="tabular-nums">{Math.round(s.avgScore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* -------------------------------------------------------- campaigns */}
      <Card>
        <SectionTitle
          title="Recent campaigns"
          action={
            <Link href="/admin/campaigns" className="btn btn-ghost btn-sm">
              All campaigns
            </Link>
          }
        />
        <div className="overflow-x-auto scroll-thin">
          <table className="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Channels</th>
                <th>Reach</th>
                <th>Status</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/campaigns/${c.id}`} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="text-[var(--text-muted)] text-[0.78rem]">{c.channels.split(",").join(" · ")}</td>
                  <td className="tabular-nums">{c.reach.toLocaleString()}</td>
                  <td>
                    <Pill tone={STATUS_TONE[c.status]}>{c.status}</Pill>
                  </td>
                  <td className="text-[var(--text-muted)] text-[0.78rem]">{timeAgo(c.sentAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
