import Link from "next/link";
import { Check, ChevronRight, Clock, Hash } from "lucide-react";
import { all } from "@/lib/db";
import { completedLessonIds, requireRider } from "@/lib/rider";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import { MODULE_PHOTO, MODULE_THEME } from "@/lib/photos";
import { USSD_CODE } from "@/lib/ussd-code";
import { IconBadge, Photo } from "@/components/brand";
import { ModuleIcon } from "@/components/rider";
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
  const pct = lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="animate-rise">
        <h1 className="text-[1.9rem] leading-tight">{t("learn", lang)}</h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div className="h-full rounded-full bar-fill progress-stripes" style={{ width: `${pct}%`, backgroundColor: "var(--sunset)" }} />
          </div>
          <span className="text-[0.8rem] font-bold tabular-nums">
            {lessonsDone}/{lessonsTotal}
          </span>
        </div>
        <p className="text-[0.76rem] text-[var(--text-faint)] mt-1">{t("lessonsDone", lang)}</p>
      </div>

      {MODULES.map((moduleKey, mi) => {
        const items = lessons.filter((l) => l.moduleKey === moduleKey);
        if (!items.length) return null;
        const moduleDone = items.filter((l) => done.has(l.id)).length;
        const theme = MODULE_THEME[moduleKey];
        const complete = moduleDone === items.length;

        return (
          <section key={moduleKey} className="animate-rise" style={{ animationDelay: `${mi * 90}ms` }}>
            <div className="relative rounded-[20px] overflow-hidden h-28 photo-zoom" style={{ boxShadow: "var(--shadow)" }}>
              <Photo name={MODULE_PHOTO[moduleKey]} sizes="420px" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(95deg, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.15) 90%)" }} />
              <div className="absolute inset-0 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <IconBadge fill="var(--surface)" size={44} rotate={-6}>
                    <ModuleIcon moduleKey={moduleKey} size={21} />
                  </IconBadge>
                  <div className="min-w-0">
                    <h2 className="text-2xl leading-none text-white drop-shadow">{MODULE_LABELS[moduleKey]?.[lang]}</h2>
                    <p className="text-[0.72rem] text-white/90 mt-1 line-clamp-2 max-w-[210px] font-medium drop-shadow">
                      {MODULE_BLURB[moduleKey]?.[lang]}
                    </p>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.72rem] font-extrabold border-2 tabular-nums"
                  style={{ background: complete ? "var(--green-bright)" : "var(--surface)", borderColor: "transparent", color: "var(--ink)" }}
                >
                  {complete ? "★ " : ""}
                  {moduleDone}/{items.length}
                </span>
              </div>
            </div>

            <div className="mt-2.5 space-y-2 relative">
              <div className="absolute left-[27px] top-4 bottom-4 border-l-[3px] border-dotted" style={{ borderColor: theme.fill }} aria-hidden="true" />
              {items.map((l) => {
                const isDone = done.has(l.id);
                return (
                  <Link key={l.id} href={`/rider/learn/${l.code}`} className="card lift p-3 flex items-center gap-3 relative">
                    <span
                      className="w-8 h-8 rounded-full grid place-items-center text-[0.8rem] font-extrabold shrink-0 border-2 relative z-10"
                      style={{
                        background: isDone ? theme.fill : "var(--surface)",
                        borderColor: theme.fill,
                        color: isDone ? "#fff" : theme.text,
                      }}
                    >
                      {isDone ? <Check size={15} strokeWidth={3.5} /> : l.order}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9rem] font-semibold leading-snug">{pick(l, "title", lang)}</span>
                      <span className="flex items-center gap-1 text-[0.7rem] text-[var(--text-faint)] mt-0.5">
                        <Clock size={11} /> {l.durationMin} {t("minRead", lang)}
                        {isDone ? (
                          <span className="font-bold" style={{ color: theme.text }}>
                            · {t("done", lang)}
                          </span>
                        ) : null}
                      </span>
                    </span>
                    <ChevronRight size={18} className="text-[var(--text-faint)] shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="rounded-2xl p-4 flex items-center gap-3 border-2 border-dashed" style={{ borderColor: "var(--border-strong)" }}>
        <IconBadge fill="var(--mpesa)" size={38}>
          <Hash size={18} />
        </IconBadge>
        <p className="text-[0.8rem] text-[var(--text-muted)] leading-relaxed">
          {lang === "EN"
            ? `Every lesson here is also on ${USSD_CODE} — any phone, no data bundle.`
            : lang === "SH"
              ? `Kila lesson hapa iko pia kwa ${USSD_CODE} — simu yoyote, bila bundle.`
              : `Kila somo hapa linapatikana pia kwa ${USSD_CODE} — simu yoyote, bila bando.`}
        </p>
      </div>
    </div>
  );
}
