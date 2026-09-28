import { all, count, one } from "@/lib/db";
import { requireRider } from "@/lib/rider";
import { Bar, Card, daysUntil, formatKes, timeAgo } from "@/components/ui";
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

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold tracking-tight">{t("myGoals", lang)}</h1>

      {goal ? (
        <>
          <Card>
            <div className="text-[0.9rem] font-semibold mb-2">{goal.title}</div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="stat-value text-2xl" style={{ color: "var(--accent)" }}>
                {formatKes(saved)}
              </span>
              <span className="text-[0.78rem] text-[var(--text-faint)]">
                {t("target", lang)} {formatKes(goal.targetAmount)}
              </span>
            </div>
            <Bar value={saved} max={goal.targetAmount} tone="accent" />
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <div className="text-[0.95rem] font-semibold tabular-nums">
                  {Math.round((saved / goal.targetAmount) * 100)}%
                </div>
                <div className="text-[0.66rem] text-[var(--text-faint)]">
                  {lang === "EN" ? "complete" : "imekamilika"}
                </div>
              </div>
              <div>
                <div className="text-[0.95rem] font-semibold tabular-nums">{daysLeft ?? "—"}</div>
                <div className="text-[0.66rem] text-[var(--text-faint)]">
                  {lang === "EN" ? "days left" : "siku zimebaki"}
                </div>
              </div>
              <div>
                <div className="text-[0.95rem] font-semibold tabular-nums">
                  {neededPerDay ? formatKes(neededPerDay).replace("KSh ", "") : "—"}
                </div>
                <div className="text-[0.66rem] text-[var(--text-faint)]">
                  {lang === "EN" ? "per day now" : "kwa siku sasa"}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-label mb-2">{t("addDeposit", lang)}</div>
            <GoalForms mode="deposit" goalId={goal.id} riderId={rider.id} lang={lang} />
          </Card>

          {deposits.length ? (
            <Card>
              <div className="stat-label mb-2">{lang === "EN" ? "Recent deposits" : "Akiba ya hivi karibuni"}</div>
              <ul className="space-y-1.5">
                {deposits.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 text-[0.82rem]">
                    <span className="font-medium tabular-nums">{formatKes(d.amount)}</span>
                    <span className="text-[0.7rem] text-[var(--text-faint)]">{timeAgo(d.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <p className="text-[0.74rem] text-[var(--text-faint)] leading-relaxed">
            {lang === "EN"
              ? "This tracker records what you have set aside. Moving the money into a SACCO account is what makes it earn — and what turns it into loan collateral."
              : lang === "SH"
                ? "Hii tracker inarecord ulichoweka pembeni. Kuipeleka kwa SACCO account ndio inaifanya ipate interest — na kuibadilisha kuwa collateral ya loan."
                : "Kifuatiliaji hiki hurekodi ulichoweka kando. Kuipeleka kwenye akaunti ya SACCO ndiko kunakoifanya ipate riba — na kuibadilisha kuwa dhamana ya mkopo."}
          </p>
        </>
      ) : (
        <Card>
          <p className="text-[0.85rem] text-[var(--text-muted)] mb-4 leading-relaxed">
            {lang === "EN"
              ? "Pick something specific to save toward. A goal with a name and a date is kept far more often than one without."
              : lang === "SH"
                ? "Chagua kitu specific ya kusavia. Goal iko na jina na date inakeepiwa zaidi kuliko isiyo na."
                : "Chagua kitu maalum cha kuwekea akiba. Lengo lenye jina na tarehe hutunzwa mara nyingi zaidi kuliko lisilo na."}
          </p>
          <GoalForms mode="create" riderId={rider.id} lang={lang} />
        </Card>
      )}
    </div>
  );
}
