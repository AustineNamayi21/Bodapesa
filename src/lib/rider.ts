import { redirect } from "next/navigation";
import { all, count, one } from "./db";
import { currentRiderId } from "./auth";
import type { Lang, Rider } from "./types";

export interface RiderContext {
  rider: Rider;
  lang: Lang;
  lessonsDone: number;
  lessonsTotal: number;
  unread: number;
}

/** Loads the signed-in rider or sends them back to the portal entry screen. */
export async function requireRider(): Promise<RiderContext> {
  const riderId = await currentRiderId();
  if (!riderId) redirect("/rider");

  const rider = await one<Rider>("SELECT * FROM Rider WHERE id = ?", [riderId]);
  if (!rider) redirect("/rider");

  return {
    rider,
    lang: rider.language,
    lessonsDone: await count("SELECT COUNT(*) AS n FROM LessonProgress WHERE riderId = ?", [riderId]),
    lessonsTotal: await count("SELECT COUNT(*) AS n FROM Lesson WHERE active = 1"),
    unread: await count(
      "SELECT COUNT(*) AS n FROM Message WHERE riderId = ? AND direction = 'OUT' AND readAt IS NULL",
      [riderId],
    ),
  };
}

export async function completedLessonIds(riderId: string): Promise<Set<string>> {
  const rows = await all<{ lessonId: string }>(
    "SELECT lessonId FROM LessonProgress WHERE riderId = ?",
    [riderId],
  );
  return new Set(rows.map((r) => r.lessonId));
}

/** The next lesson the rider has not yet completed, in curriculum order. */
export async function nextLesson(riderId: string) {
  return await one<{ id: string; code: string; moduleKey: string; titleEn: string; titleSw: string; titleSh: string; durationMin: number }>(
    `SELECT l.id, l.code, l.moduleKey, l.titleEn, l.titleSw, l.titleSh, l.durationMin
       FROM Lesson l
      WHERE l.active = 1
        AND l.id NOT IN (SELECT lessonId FROM LessonProgress WHERE riderId = ?)
      ORDER BY CASE l.moduleKey
                 WHEN 'SAVINGS' THEN 0 WHEN 'CREDIT' THEN 1
                 WHEN 'INVESTMENT' THEN 2 ELSE 3 END, l."order"
      LIMIT 1`,
    [riderId],
  );
}
