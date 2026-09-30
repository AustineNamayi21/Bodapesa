import Link from "next/link";
import { all } from "@/lib/db";
import { completedLessonIds, requireRider } from "@/lib/rider";
import { Card } from "@/components/ui";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import type { Lang, Lesson } from "@/lib/types";

export const dynamic = "force-dynamic";

const MODULES = ["SAVINGS", "CREDIT", "INVESTMENT", "INSURANCE"];

const MODULE_BLURB: Record<string, Record<Lang, string>> = {
  SAVINGS: {
    EN: "How to keep money that does not disappear by evening.",
    SW: "Jinsi ya kuweka pesa isipotee ifikapo jioni.",
    SH: "Vile unaweza keep doo isipotee by evening.",
  },
  CREDIT: {
    EN: "What loans really cost, and which ones build rather than eat.",
    SW: "Gharama halisi za mikopo, na ipi hujenga badala ya kula.",
    SH: "Loan inacost ngapi kwa ukweli, na ipi inajenga si kukula.",
  },
  INVESTMENT: {
    EN: "Making money work instead of sitting still — and spotting scams.",
    SW: "Kufanya pesa ifanye kazi badala ya kukaa — na kutambua ulaghai.",
    SH: "Kumake doo ifanye kazi badala ya kukaa — na kuspot scam.",
  },
  INSURANCE: {
    EN: "The covers that stop one bad afternoon from ending your business.",
    SW: "Bima zinazozuia mchana mmoja mbaya kumaliza biashara yako.",
    SH: "Bima zinazuia mchana mmoja mbaya kumaliza biz yako.",
  },
};

export default async function LearnPage() {
  const { rider, lang, lessonsDone, lessonsTotal } = await requireRider();
  const lessons = await all<Lesson>(`SELECT * FROM Lesson WHERE active = 1 ORDER BY moduleKey, "order"`);
  const done = await completedLessonIds(rider.id);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t("learn", lang)}</h1>
        <p className="text-[0.8rem] text-[var(--text-muted)]">
          {lessonsDone}/{lessonsTotal} · {t("lessonsDone", lang)}
        </p>
      </div>

      {MODULES.map((moduleKey) => {
        const items = lessons.filter((l) => l.moduleKey === moduleKey);
        if (!items.length) return null;
        const moduleDone = items.filter((l) => done.has(l.id)).length;

        return (
          <section key={moduleKey}>
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h2 className="text-[0.9rem] font-semibold tracking-tight">{MODULE_LABELS[moduleKey]?.[lang]}</h2>
              <span className="text-[0.7rem] text-[var(--text-faint)] tabular-nums shrink-0">
                {moduleDone}/{items.length}
              </span>
            </div>
            <p className="text-[0.76rem] text-[var(--text-faint)] mb-2.5">{MODULE_BLURB[moduleKey]?.[lang]}</p>

            <div className="space-y-2">
              {items.map((l) => {
                const complete = done.has(l.id);
                return (
                  <Link key={l.id} href={`/rider/learn/${l.code}`} className="card p-3.5 flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-full grid place-items-center text-[0.75rem] font-semibold shrink-0"
                      style={{
                        background: complete ? "var(--brand-soft)" : "var(--surface-2)",
                        color: complete ? "var(--brand-strong)" : "var(--text-faint)",
                      }}
                    >
                      {complete ? "✓" : l.order}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.85rem] font-medium leading-snug">{pick(l, "title", lang)}</span>
                      <span className="block text-[0.68rem] text-[var(--text-faint)] mt-0.5">
                        {l.durationMin} {t("minRead", lang)}
                        {complete ? ` · ${t("done", lang)}` : ""}
                      </span>
                    </span>
                    <span className="text-[var(--text-faint)] shrink-0">›</span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <Card>
        <p className="text-[0.78rem] text-[var(--text-muted)] leading-relaxed">
          {lang === "EN"
            ? "Every lesson here is also available by dialling *384*14791# on any phone, with no data bundle."
            : lang === "SH"
              ? "Kila lesson hapa unaweza pata kwa kudial *384*14791# kwa simu yoyote, bila bundle."
              : "Kila somo hapa linapatikana pia kwa kupiga *384*14791# kwa simu yoyote, bila bando."}
        </p>
      </Card>
    </div>
  );
}
