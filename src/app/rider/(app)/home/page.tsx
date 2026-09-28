import Link from "next/link";
import { all, count, one } from "@/lib/db";
import { requireRider, nextLesson } from "@/lib/rider";
import { Bar, Card, formatKes } from "@/components/ui";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

const GREETING: Record<Lang, (name: string) => string> = {
  SW: (n) => `Habari ${n}`,
  EN: (n) => `Hello ${n}`,
  SH: (n) => `Niaje ${n}`,
};

const COPY: Record<string, Record<Lang, string>> = {
  keepGoing: { EN: "Continue where you left off", SW: "Endelea ulipoishia", SH: "Endelea ulipoishia" },
  yourProgress: { EN: "Your progress", SW: "Maendeleo yako", SH: "Progress yako" },
  lessons: { EN: "lessons done", SW: "masomo yamekamilika", SH: "masomo umemaliza" },
  noGoalYet: {
    EN: "You have not set a savings goal yet. Even KSh 50 a day adds up.",
    SW: "Bado hujaweka lengo la akiba. Hata KSh 50 kwa siku hujilimbikiza.",
    SH: "Bado haujaweka savings goal. Hata KSh 50 kwa siku inajilimbikiza.",
  },
  setGoal: { EN: "Set a goal", SW: "Weka lengo", SH: "Weka goal" },
  forYou: { EN: "Suggested for you", SW: "Zinazokufaa", SH: "Zinakufaa" },
  why: {
    EN: "Because you have not yet told us you hold this",
    SW: "Kwa sababu bado hujatuambia una hii",
    SH: "Kwa sababu bado haujatuambia uko na hii",
  },
};

export default async function RiderHomePage() {
  const { rider, lang, lessonsDone, lessonsTotal } = await requireRider();
  const next = await nextLesson(rider.id);

  const goal = await one<{ id: string; title: string; targetAmount: number; dailyTarget: number }>(
    "SELECT * FROM SavingsGoal WHERE riderId = ? ORDER BY createdAt DESC LIMIT 1",
    [rider.id],
  );
  const saved = goal
    ? await count("SELECT COALESCE(SUM(amount),0) AS n FROM SavingsDeposit WHERE goalId = ?", [goal.id])
    : 0;

  // Suggestions are driven by the gaps in this rider's own inclusion baseline.
  const gaps: string[] = [];
  if (!rider.hasInsurance) gaps.push("INSURANCE");
  if (!rider.saccoMember) gaps.push("SAVINGS");
  if (!rider.ownsMotorbike) gaps.push("CREDIT");
  const suggested = gaps.length
    ? await all<{ id: string; name: string; category: string; summaryEn: string; summarySw: string; summarySh: string; partnerName: string; accent: string }>(
        `SELECT p.id, p.name, p.category, p.summaryEn, p.summarySw, p.summarySh, pt.name AS partnerName, pt.accent
           FROM Product p JOIN Partner pt ON pt.id = p.partnerId
          WHERE p.active = 1 AND p.featured = 1 AND p.category IN (${gaps.map(() => "?").join(",")})
          ORDER BY p.category LIMIT 3`,
        gaps,
      )
    : [];

  const latest = await one<{ body: string; createdAt: string }>(
    "SELECT body, createdAt FROM Message WHERE riderId = ? AND direction = 'OUT' ORDER BY createdAt DESC LIMIT 1",
    [rider.id],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{GREETING[lang](rider.firstName)}</h1>
        <p className="text-[0.8rem] text-[var(--text-muted)]">{t("tagline", lang)}</p>
      </div>

      {/* ---------------------------------------------------- progress */}
      <Card>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="stat-label">{COPY.yourProgress[lang]}</div>
            <div className="stat-value mt-0.5" style={{ color: "var(--brand)" }}>
              {rider.literacyScore}
              <span className="text-[0.9rem] font-normal text-[var(--text-faint)]">/100</span>
            </div>
          </div>
          <div className="text-right text-[0.78rem] text-[var(--text-muted)]">
            {lessonsDone}/{lessonsTotal}
            <div className="text-[0.68rem] text-[var(--text-faint)]">{COPY.lessons[lang]}</div>
          </div>
        </div>
        <Bar value={rider.literacyScore} max={100} />
      </Card>

      {/* ------------------------------------------------- next lesson */}
      {next ? (
        <Link href={`/rider/learn/${next.code}`} className="card p-4 block hover:border-[var(--brand)] transition-colors">
          <div className="text-[0.68rem] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
            {COPY.keepGoing[lang]}
          </div>
          <h2 className="font-semibold tracking-tight text-[0.95rem]">{pick(next, "title", lang)}</h2>
          <p className="text-[0.75rem] text-[var(--text-faint)] mt-0.5">
            {MODULE_LABELS[next.moduleKey]?.[lang]} · {next.durationMin} {t("minRead", lang)}
          </p>
          <span className="btn btn-primary btn-sm mt-3">{t("startLesson", lang)}</span>
        </Link>
      ) : (
        <Card>
          <p className="text-[0.85rem]">
            {lang === "EN"
              ? "You have completed every lesson. Well done — revisit any module any time."
              : lang === "SH"
                ? "Umemaliza masomo yote. Poa sana — unaweza rudia module yoyote."
                : "Umekamilisha masomo yote. Hongera — unaweza kurudia somo lolote wakati wowote."}
          </p>
        </Card>
      )}

      {/* -------------------------------------------------------- goal */}
      {goal ? (
        <Link href="/rider/goal" className="card p-4 block">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[0.85rem] font-medium">{goal.title}</span>
            <span className="text-[0.75rem] text-[var(--text-faint)]">
              {Math.round((saved / goal.targetAmount) * 100)}%
            </span>
          </div>
          <Bar value={saved} max={goal.targetAmount} tone="accent" />
          <div className="flex justify-between mt-1.5 text-[0.75rem]">
            <span className="font-semibold">{formatKes(saved)}</span>
            <span className="text-[var(--text-faint)]">
              {t("target", lang)} {formatKes(goal.targetAmount)}
            </span>
          </div>
        </Link>
      ) : (
        <Card>
          <p className="text-[0.85rem] text-[var(--text-muted)] mb-3">{COPY.noGoalYet[lang]}</p>
          <Link href="/rider/goal" className="btn btn-accent btn-sm">
            {COPY.setGoal[lang]}
          </Link>
        </Card>
      )}

      {/* -------------------------------------------------- suggestions */}
      {suggested.length ? (
        <section>
          <h2 className="text-[0.82rem] font-semibold tracking-tight mb-2">{COPY.forYou[lang]}</h2>
          <div className="space-y-2">
            {suggested.map((p) => (
              <Link key={p.id} href={`/rider/products#${p.id}`} className="card p-3.5 block">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.accent }} />
                  <span className="text-[0.85rem] font-medium">{p.name}</span>
                </div>
                <p className="text-[0.78rem] leading-relaxed text-[var(--text-muted)]">{pick(p, "summary", lang)}</p>
                <p className="text-[0.68rem] text-[var(--text-faint)] mt-1.5">
                  {p.partnerName} · {COPY.why[lang]}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------ latest message */}
      {latest ? (
        <Link href="/rider/inbox" className="card p-3.5 block">
          <div className="stat-label mb-1">{lang === "EN" ? "Latest message" : "Ujumbe wa hivi karibuni"}</div>
          <p className="text-[0.8rem] leading-relaxed text-[var(--text-muted)] line-clamp-2">{latest.body}</p>
        </Link>
      ) : null}
    </div>
  );
}
