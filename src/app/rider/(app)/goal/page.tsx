import { all, count, one } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { ArrowDownToLine, CalendarDays, Coins, Flame, Target, Trophy } from "lucide-react";
import { daysUntil, formatKes, timeAgo } from "@/components/ui";
import { SavingsJar } from "@/components/rider";
import { CountUp } from "@/components/motion";
import { t } from "@/lib/i18n";
import GoalForms from "./GoalForms";

export const dynamic = "force-dynamic";

export default async function GoalPage() {
  const { rider, lang } = await requireRider();

  const goal = await one<{ id: string; title: string; targetAmount: number; dailyTarget: number; targetDate: string | null; createdAt: string }>(
    "SELECT * FROM SavingsGoal WHERE riderId = ? ORDER BY createdAt DESC LIMIT 1",
    [rider.id],
  );

  const deposits = goal
    ? await all<{ id: string; amount: number; note: string | null; createdAt: string }>(
        "SELECT * FROM SavingsDeposit WHERE goalId = ? ORDER BY createdAt DESC LIMIT 20",
        [goal.id],
      )
    : [];
  const saved = goal
    ? await count("SELECT COALESCE(SUM(amount),0) AS n FROM SavingsDeposit WHERE goalId = ?", [goal.id])
    : 0;

  const daysLeft = daysUntil(goal?.targetDate ?? null);
  const remaining = goal ? Math.max(0, goal.targetAmount - saved) : 0;
  const neededPerDay = daysLeft && daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null;

  const pct = goal ? Math.min(100, Math.round((saved / goal.targetAmount) * 100)) : 0;

  return (
    <div className="space-y-5">
      <h1 className="text-[1.9rem] leading-tight animate-rise">{t("myGoals", lang)}</h1>

      {goal ? (
        <>
          <section
            className="rounded-[24px] p-5 relative overflow-hidden animate-pop border-2"
            style={{ background: "var(--success-soft)", borderColor: "transparent", boxShadow: "var(--shadow)" }}
          >
            <div className="flex items-center gap-5">
              <SavingsJar pct={pct} size={132} />
              <div className="min-w-0">
                <div className="eyebrow" style={{ color: "var(--success)" }}>
                  <Target size={13} /> {goal.title}
                </div>
                <div className="font-display font-extrabold text-[2.1rem] leading-none mt-2 tabular-nums" style={{ color: "var(--success)" }}>
                  <CountUp value={saved} prefix="KSh " />
                </div>
                <div className="text-[0.8rem] text-[var(--text-muted)] mt-1">
                  {t("target", lang)} {formatKes(goal.targetAmount)}
                </div>
                <div className="mt-3 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(16,178,108,0.18)" }}>
                  <div className="h-full rounded-full bar-fill progress-stripes" style={{ width: `${pct}%`, backgroundColor: "var(--mpesa)" }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5">
              {[
                { v: `${pct}%`, l: lang === "EN" ? "complete" : "imekamilika", i: <Trophy size={15} /> },
                { v: String(daysLeft ?? "—"), l: lang === "EN" ? "days left" : "siku zimebaki", i: <CalendarDays size={15} /> },
                {
                  v: neededPerDay ? formatKes(neededPerDay).replace("KSh ", "") : "—",
                  l: lang === "EN" ? "KSh per day" : "KSh kwa siku",
                  i: <Flame size={15} />,
                },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl p-2.5 text-center" style={{ background: "var(--surface)" }}>
                  <div className="flex justify-center" style={{ color: "var(--success)" }}>
                    {x.i}
                  </div>
                  <div className="font-display font-extrabold text-lg tabular-nums leading-tight mt-0.5">{x.v}</div>
                  <div className="text-[0.64rem] font-semibold text-[var(--text-faint)]">{x.l}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="card p-4 animate-rise d-2">
            <div className="text-lg font-display font-bold mb-3 flex items-center gap-2">
              <Coins size={18} style={{ color: "var(--accent)" }} /> {t("addDeposit", lang)}
            </div>
            <GoalForms mode="deposit" goalId={goal.id} riderId={rider.id} lang={lang} />
          </div>

          {deposits.length ? (
            <div className="card p-4 animate-rise d-3">
              <div className="stat-label mb-3">{lang === "EN" ? "Recent deposits" : "Akiba ya hivi karibuni"}</div>
              <ul className="space-y-2">
                {deposits.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 text-[0.85rem]">
                    <span className="w-8 h-8 rounded-full grid place-items-center shrink-0" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
                      <ArrowDownToLine size={15} />
                    </span>
                    <span className="flex-1 font-bold tabular-nums">+ {formatKes(d.amount)}</span>
                    <span className="text-[0.72rem] text-[var(--text-faint)]">{timeAgo(d.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-[0.76rem] text-[var(--text-faint)] leading-relaxed">
            {lang === "EN"
              ? "This tracker records what you have set aside. Moving the money into a SACCO account is what makes it earn — and what turns it into loan collateral."
              : lang === "SH"
                ? "Hii tracker inarecord ulichoweka pembeni. Kuipeleka kwa SACCO account ndio inaifanya ipate interest — na kuibadilisha kuwa collateral ya loan."
                : "Kifuatiliaji hiki hurekodi ulichoweka kando. Kuipeleka kwenye akaunti ya SACCO ndiko kunakoifanya ipate riba — na kuibadilisha kuwa dhamana ya mkopo."}
          </p>
        </>
      ) : (
        <div className="card-pop p-5 animate-pop">
          <div className="flex items-center gap-4 mb-4">
            <SavingsJar pct={10} size={96} />
            <p className="text-[0.88rem] text-[var(--text-muted)] leading-relaxed">
              {lang === "EN"
                ? "Pick something specific to save toward. A goal with a name and a date is kept far more often than one without."
                : lang === "SH"
                  ? "Chagua kitu specific ya kusavia. Goal iko na jina na date inakeepiwa zaidi kuliko isiyo na."
                  : "Chagua kitu maalum cha kuwekea akiba. Lengo lenye jina na tarehe hutunzwa mara nyingi zaidi kuliko lisilo na."}
            </p>
          </div>
          <GoalForms mode="create" riderId={rider.id} lang={lang} />
        </div>
      )}
    </div>
  );
}
