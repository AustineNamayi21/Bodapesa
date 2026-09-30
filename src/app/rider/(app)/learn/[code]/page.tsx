import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock } from "lucide-react";
import { all, one } from "@/lib/db";
import { completedLessonIds, requireRider } from "@/lib/rider";
import { MODULE_LABELS, pick, t } from "@/lib/i18n";
import { MODULE_PHOTO, MODULE_THEME } from "@/lib/photos";
import { IconBadge, Photo } from "@/components/brand";
import { ModuleIcon } from "@/components/rider";
import Quiz from "./Quiz";
import type { Lesson, QuizQuestion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { rider, lang } = await requireRider();

  const lesson = await one<Lesson>("SELECT * FROM Lesson WHERE code = ? AND active = 1", [code]);
  if (!lesson) notFound();

  const questions = await all<QuizQuestion>(`SELECT * FROM QuizQuestion WHERE lessonId = ? ORDER BY "order"`, [
    lesson.id,
  ]);

  const done = (await completedLessonIds(rider.id)).has(lesson.id);

  const next = await one<{ code: string; titleEn: string; titleSw: string; titleSh: string }>(
    `SELECT code, titleEn, titleSw, titleSh FROM Lesson
      WHERE active = 1
        AND (moduleKey = ? AND "order" > ?)
      ORDER BY "order" LIMIT 1`,
    [lesson.moduleKey, lesson.order],
  );

  const paragraphs = pick(lesson, "body", lang).split("\n\n");
  const theme = MODULE_THEME[lesson.moduleKey] ?? MODULE_THEME.SAVINGS;

  return (
    <div className="space-y-5 -mt-5 -mx-4">
      {/* hero */}
      <header className="relative h-56 overflow-hidden border-b-2" style={{ borderColor: "var(--ink)" }}>
        <Photo name={MODULE_PHOTO[lesson.moduleKey] ?? "stage"} sizes="448px" priority />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(26,18,11,0.25), rgba(26,18,11,0.88))` }} />
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: theme.fill }} />
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <Link
            href="/rider/learn"
            className="self-start inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.75rem] font-bold backdrop-blur-md"
            style={{ background: "rgba(255,243,228,0.18)", color: "var(--cream)" }}
          >
            <ArrowLeft size={14} /> {t("learn", lang)}
          </Link>
          <div className="animate-rise">
            <div className="flex items-center gap-2">
              <IconBadge fill={theme.fill} size={34} rotate={-6}>
                <ModuleIcon moduleKey={lesson.moduleKey} size={17} />
              </IconBadge>
              <span className="text-[0.72rem] font-bold uppercase tracking-wider text-white/85">
                {MODULE_LABELS[lesson.moduleKey]?.[lang]} · <Clock size={11} className="inline -mt-0.5" /> {lesson.durationMin}{" "}
                {t("minRead", lang)}
              </span>
            </div>
            <h1 className="mt-2 text-[1.7rem] leading-[1.1] text-white">{pick(lesson, "title", lang)}</h1>
          </div>
        </div>
        {done ? (
          <span className="absolute top-4 right-4 sticker animate-pop" style={{ background: "var(--mpesa)", color: "#fff" }}>
            <BadgeCheck size={15} /> {t("done", lang)}
          </span>
        ) : null}
      </header>

      <div className="px-4 space-y-5">
        <article className="prose-body text-[0.95rem] animate-rise d-2">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {questions.length ? (
          <div className="card-pop p-4 relative animate-rise d-3" style={{ boxShadow: `4px 4px 0 ${theme.fill}` }}>
            <Quiz riderId={rider.id} lessonId={lesson.id} questions={questions} lang={lang} />
          </div>
        ) : null}

        {next ? (
          <Link
            href={`/rider/learn/${next.code}`}
            className="flex items-center justify-between gap-3 rounded-2xl p-4 lift"
            style={{ background: "var(--ink)", color: "var(--cream)" }}
          >
            <span className="min-w-0">
              <span className="block text-[0.68rem] font-bold uppercase tracking-wider" style={{ color: "var(--matatu)" }}>
                {t("continue", lang)}
              </span>
              <span className="block font-display font-bold text-[1.05rem] truncate">{pick(next, "title", lang)}</span>
            </span>
            <span className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: "var(--sunset)", color: "var(--ink)" }}>
              <ArrowRight size={18} />
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
