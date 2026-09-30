import Link from "next/link";
import { ArrowRight, Clock, MessageSquareText, Sparkles } from "lucide-react";
import { all, count, one } from "@/lib/db";
import { requireRider, nextLesson } from "@/lib/rider";
import { formatKes } from "@/components/ui";
import { IconBadge, Photo } from "@/components/brand";
import { JourneyBar, ModuleIcon, SavingsJar, ScoreRing } from "@/components/rider";
import { MODULE_PHOTO, MODULE_THEME } from "@/lib/photos";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export const dynamic = "force-dynamic";

const GREETING: Record<Lang, (name: string) => string> = {
  SW: (n) => `Habari ${n}`,
  EN: (n) => `Hello ${n}`,
  SH: (n) => `Niaje ${n}`,
};

const COPY: Record<string, Record<Lang, string>> = {
  keepGoing: { EN: "Up next", SW: "Endelea ulipoishia", SH: "Next up" },
  yourProgress: { EN: "Your journey", SW: "Safari yako", SH: "Safari yako" },
  lessons: { EN: "lessons done", SW: "masomo yamekamilika", SH: "masomo umemaliza" },
  score: { EN: "score", SW: "alama", SH: "score" },
  noGoalYet: {
    EN: "No savings goal yet. Even KSh 50 a day grows into something real.",
    SW: "Bado hujaweka lengo la akiba. Hata KSh 50 kwa siku hujilimbikiza.",
    SH: "Bado haujaweka savings goal. Hata KSh 50 kwa siku inajilimbikiza.",
  },
  setGoal: { EN: "Set a goal", SW: "Weka lengo", SH: "Weka goal" },
  forYou: { EN: "Picked for you", SW: "Zinazokufaa", SH: "Zinakufaa" },
  why: {
    EN: "You haven't told us you have this yet",
    SW: "Bado hujatuambia una hii",
    SH: "Bado haujatuambia uko na hii",
  },
  latest: { EN: "Latest message", SW: "Ujumbe wa karibuni", SH: "Message ya mwisho" },
  allDone: {
    EN: "You've finished every lesson. Hongera! Revisit any module whenever you like.",
    SW: "Umekamilisha masomo yote. Hongera! Rudia somo lolote wakati wowote.",
    SH: "Umemaliza masomo yote. Poa sana! Rudia module yoyote ukitaka.",
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
  const goalPct = goal ? Math.min(100, Math.round((saved / goal.targetAmount) * 100)) : 0;

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

  const latest = await one<{ body: string; createdAt: string; channel: string }>(
    "SELECT body, createdAt, channel FROM Message WHERE riderId = ? AND direction = 'OUT' ORDER BY createdAt DESC LIMIT 1",
    [rider.id],
  );

  const theme = next ? MODULE_THEME[next.moduleKey] : null;

  return (
    <div className="space-y-5">
      <div className="animate-rise">
        <h1 className="text-[1.9rem] leading-tight">
          {GREETING[lang](rider.firstName)} <span className="inline-block animate-wiggle">👋</span>
        </h1>
        <p className="text-[0.85rem] text-[var(--text-muted)]">{t("tagline", lang)}</p>
      </div>

      {/* ───────────────────────────────────────────────── journey card ── */}
      <section
        className="rounded-[24px] p-5 relative overflow-hidden animate-pop"
        style={{ background: "var(--ink)", color: "var(--cream)", boxShadow: "6px 6px 0 var(--sunset)" }}
      >
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-25 blur-2xl" style={{ background: "var(--kanga)" }} aria-hidden="true" />
        <div className="relative flex items-center gap-4">
          <ScoreRing value={rider.literacyScore} label={COPY.score[lang]} />
          <div className="min-w-0">
            <div className="eyebrow" style={{ color: "var(--matatu)" }}>
              {COPY.yourProgress[lang]}
            </div>
            <div className="font-display font-extrabold text-[2rem] leading-none mt-1.5 tabular-nums">
              {lessonsDone}
              <span className="text-[1rem] opacity-60">/{lessonsTotal}</span>
            </div>
            <div className="text-[0.76rem] opacity-70 mt-0.5">{COPY.lessons[lang]}</div>
          </div>
        </div>
        <div className="relative mt-3">
          <JourneyBar done={lessonsDone} total={lessonsTotal} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── next lesson ── */}
      {next && theme ? (
        <Link href={`/rider/learn/${next.code}`} className="card-pop lift block overflow-hidden animate-rise d-2">
          <div className="relative h-28 photo-zoom overflow-hidden border-b-2" style={{ borderColor: "var(--ink)" }}>
            <Photo name={MODULE_PHOTO[next.moduleKey] ?? "stage"} sizes="420px" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${theme.fill} 0%, transparent 75%)`, opacity: 0.85 }} />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <IconBadge fill="var(--surface)" size={42} rotate={-6}>
                <ModuleIcon moduleKey={next.moduleKey} />
              </IconBadge>
              <span className="font-display font-extrabold text-xl text-white drop-shadow">{MODULE_LABELS[next.moduleKey]?.[lang]}</span>
            </div>
          </div>
          <div className="p-4">
            <div className="eyebrow" style={{ color: theme.text }}>
              <Sparkles size={13} /> {COPY.keepGoing[lang]}
            </div>
            <h2 className="mt-1 text-xl leading-snug">{pick(next, "title", lang)}</h2>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[0.76rem] text-[var(--text-faint)] inline-flex items-center gap-1">
                <Clock size={13} /> {next.durationMin} {t("minRead", lang)}
              </span>
              <span className="btn btn-primary btn-sm">
                {t("startLesson", lang)} <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      ) : (
        <div className="card p-4 animate-rise d-2">
          <p className="text-[0.9rem]">🎉 {COPY.allDone[lang]}</p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── goal ── */}
      {goal ? (
        <Link href="/rider/goal" className="card lift p-4 flex items-center gap-4 animate-rise d-3">
          <SavingsJar pct={goalPct} size={96} />
          <div className="min-w-0 flex-1">
            <div className="eyebrow" style={{ color: "var(--success)" }}>
              {t("myGoals", lang)}
            </div>
            <div className="font-semibold mt-1 truncate">{goal.title}</div>
            <div className="font-display font-extrabold text-2xl mt-1" style={{ color: "var(--success)" }}>
              {formatKes(saved)}
            </div>
            <div className="text-[0.74rem] text-[var(--text-faint)]">
              {goalPct}% · {t("target", lang)} {formatKes(goal.targetAmount)}
            </div>
          </div>
        </Link>
      ) : (
        <div className="card p-4 flex items-center gap-4 animate-rise d-3">
          <SavingsJar pct={8} size={84} />
          <div>
            <p className="text-[0.85rem] text-[var(--text-muted)] mb-3">{COPY.noGoalYet[lang]}</p>
            <Link href="/rider/goal" className="btn btn-accent btn-sm">
              {COPY.setGoal[lang]}
            </Link>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────── suggestions ── */}
      {suggested.length ? (
        <section className="animate-rise d-4">
          <h2 className="text-lg mb-2.5">{COPY.forYou[lang]}</h2>
          <div className="flex gap-3 overflow-x-auto scroll-thin -mx-4 px-4 pb-2 snap-x">
            {suggested.map((p) => {
              const th = MODULE_THEME[p.category] ?? MODULE_THEME.SAVINGS;
              return (
                <Link
                  key={p.id}
                  href={`/rider/products#${p.id}`}
                  className="card lift p-4 block shrink-0 w-[250px] snap-start relative overflow-hidden"
                >
                  <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: p.accent }} />
                  <div className="flex items-center gap-2">
                    <IconBadge fill={th.fill} size={34}>
                      <ModuleIcon moduleKey={p.category} size={17} />
                    </IconBadge>
                    <span className="text-[0.7rem] font-bold text-[var(--text-faint)]">{p.partnerName}</span>
                  </div>
                  <div className="mt-2.5 font-display font-bold text-[1.05rem] leading-snug">{p.name}</div>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--text-muted)] line-clamp-3">{pick(p, "summary", lang)}</p>
                  <p className="text-[0.66rem] mt-2 font-semibold" style={{ color: th.text }}>
                    {COPY.why[lang]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ────────────────────────────────────────────────── latest message ── */}
      {latest ? (
        <Link href="/rider/inbox" className="block animate-rise d-5">
          <div className="eyebrow mb-2 text-[var(--text-faint)]">
            <MessageSquareText size={13} /> {COPY.latest[lang]}
          </div>
          <div
            className="rounded-2xl rounded-tl-sm p-3.5 text-[0.84rem] leading-relaxed border-2 lift"
            style={{ background: "var(--surface)", borderColor: "var(--ink)", boxShadow: "3px 3px 0 var(--mpesa)" }}
          >
            <span className="pill mb-1.5" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
              {latest.channel}
            </span>
            <p className="line-clamp-3">{latest.body}</p>
          </div>
        </Link>
      ) : null}
    </div>
  );
}
