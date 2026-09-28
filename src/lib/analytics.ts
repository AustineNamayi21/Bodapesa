import { all, count, one } from "./db";

export interface Kpis {
  riders: number;
  consented: number;
  reached: number;
  onboarded: number;
  messagesSent: number;
  deliveryRate: number;
  avgLiteracy: number;
  learners: number;
  proficientShare: number;
  leads: number;
  converted: number;
  conversionRate: number;
  costKes: number;
  costPerOnboard: number;
  lessonsCompleted: number;
}

export async function kpis(): Promise<Kpis> {
  const riders = await count("SELECT COUNT(*) AS n FROM Rider");
  const consented = await count("SELECT COUNT(*) AS n FROM Rider WHERE consent = 1");
  const reached = await count("SELECT COUNT(DISTINCT riderId) AS n FROM Message WHERE direction = 'OUT'");
  const onboarded = await count("SELECT COUNT(*) AS n FROM Rider WHERE status = 'ONBOARDED'");
  const messagesSent = await count("SELECT COUNT(*) AS n FROM Message WHERE direction = 'OUT'");
  const delivered = await count("SELECT COUNT(*) AS n FROM Message WHERE status IN ('DELIVERED','READ')");
  const leads = await count("SELECT COUNT(*) AS n FROM Lead");
  const converted = await count("SELECT COUNT(*) AS n FROM Lead WHERE status = 'CONVERTED'");
  const costRow = await one<{ n: number }>("SELECT COALESCE(SUM(costKes),0) AS n FROM Message");
  const costKes = Number(costRow?.n ?? 0);

  // The literacy score is only meaningful for riders who have actually started
  // the curriculum — averaging in riders who have never received a lesson would
  // flatter or deflate the figure depending only on how fast the register grows.
  const learners = await count("SELECT COUNT(DISTINCT riderId) AS n FROM LessonProgress");
  const avgRow = await one<{ n: number }>(
    `SELECT COALESCE(AVG(literacyScore),0) AS n FROM Rider
      WHERE id IN (SELECT riderId FROM LessonProgress)`,
  );
  const proficient = await count(
    `SELECT COUNT(*) AS n FROM Rider
      WHERE literacyScore >= 50 AND id IN (SELECT riderId FROM LessonProgress)`,
  );

  const avgLiteracy = Math.round(Number(avgRow?.n ?? 0));

  return {
    riders,
    consented,
    reached,
    onboarded,
    messagesSent,
    deliveryRate: messagesSent ? Math.round((delivered / messagesSent) * 1000) / 10 : 0,
    avgLiteracy,
    learners,
    proficientShare: learners ? Math.round((proficient / learners) * 100) : 0,
    leads,
    converted,
    conversionRate: leads ? Math.round((converted / leads) * 1000) / 10 : 0,
    costKes: Math.round(costKes * 100) / 100,
    costPerOnboard: onboarded ? Math.round((costKes / onboarded) * 100) / 100 : 0,
    lessonsCompleted: await count("SELECT COUNT(*) AS n FROM LessonProgress"),
  };
}

/** The onboarding funnel, from registered rider to converted customer. */
export async function funnel() {
  const registered = await count("SELECT COUNT(*) AS n FROM Rider");
  const consented = await count("SELECT COUNT(*) AS n FROM Rider WHERE consent = 1");
  const reached = await count("SELECT COUNT(DISTINCT riderId) AS n FROM Message WHERE direction = 'OUT'");
  const learning = await count("SELECT COUNT(DISTINCT riderId) AS n FROM LessonProgress");
  const enquired = await count("SELECT COUNT(DISTINCT riderId) AS n FROM Lead");
  const onboarded = await count("SELECT COUNT(DISTINCT riderId) AS n FROM Lead WHERE status = 'CONVERTED'");
  return [
    { stage: "Registered", value: registered },
    { stage: "Consented", value: consented },
    { stage: "Reached", value: reached },
    { stage: "Learning", value: learning },
    { stage: "Enquired", value: enquired },
    { stage: "Onboarded", value: onboarded },
  ];
}

export async function channelBreakdown() {
  return await all<{ channel: string; sent: number; delivered: number; failed: number; cost: number }>(
    `SELECT channel,
            COUNT(*) AS sent,
            SUM(CASE WHEN status IN ('DELIVERED','READ') THEN 1 ELSE 0 END) AS delivered,
            SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed,
            COALESCE(SUM(costKes),0) AS cost
       FROM Message WHERE direction = 'OUT'
      GROUP BY channel ORDER BY sent DESC`,
  );
}

export async function languageBreakdown() {
  return await all<{ language: string; n: number }>(
    "SELECT language, COUNT(*) AS n FROM Rider GROUP BY language ORDER BY n DESC",
  );
}

export async function statusBreakdown() {
  return await all<{ status: string; n: number }>(
    "SELECT status, COUNT(*) AS n FROM Rider GROUP BY status",
  );
}

export async function stageLeaderboard(limit = 8) {
  return await all<{ name: string; subCounty: string; riders: number; onboarded: number; avgScore: number }>(
    `SELECT s.name, s.subCounty,
            COUNT(r.id) AS riders,
            SUM(CASE WHEN r.status = 'ONBOARDED' THEN 1 ELSE 0 END) AS onboarded,
            COALESCE(AVG(r.literacyScore),0) AS avgScore
       FROM Stage s LEFT JOIN Rider r ON r.stageId = s.id
      GROUP BY s.id ORDER BY riders DESC LIMIT ?`,
    [limit],
  );
}

/** Weekly reach and engagement, for the trend chart. */
export async function weeklyActivity(weeks = 12) {
  const rows: { week: string; messages: number; lessons: number; leads: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(Date.now() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const label = `${start.getDate()}/${start.getMonth() + 1}`;
    rows.push({
      week: label,
      messages: await count(
        "SELECT COUNT(*) AS n FROM Message WHERE direction = 'OUT' AND createdAt >= ? AND createdAt < ?",
        [start.toISOString(), end.toISOString()],
      ),
      lessons: await count(
        "SELECT COUNT(*) AS n FROM LessonProgress WHERE completedAt >= ? AND completedAt < ?",
        [start.toISOString(), end.toISOString()],
      ),
      leads: await count("SELECT COUNT(*) AS n FROM Lead WHERE createdAt >= ? AND createdAt < ?", [
        start.toISOString(),
        end.toISOString(),
      ]),
    });
  }
  return rows;
}

export async function moduleCompletion() {
  return await all<{ moduleKey: string; completions: number; accuracy: number }>(
    `SELECT l.moduleKey,
            COUNT(DISTINCT lp.id) AS completions,
            COALESCE(
              (SELECT ROUND(100.0 * SUM(qa.score) / NULLIF(SUM(qa.total),0))
                 FROM QuizAttempt qa JOIN Lesson l2 ON l2.id = qa.lessonId
                WHERE l2.moduleKey = l.moduleKey), 0) AS accuracy
       FROM Lesson l LEFT JOIN LessonProgress lp ON lp.lessonId = l.id
      GROUP BY l.moduleKey ORDER BY completions DESC`,
  );
}

export async function partnerPerformance() {
  return await all<{ name: string; code: string; accent: string; leads: number; converted: number; value: number }>(
    `SELECT p.name, p.code, p.accent,
            COUNT(l.id) AS leads,
            SUM(CASE WHEN l.status = 'CONVERTED' THEN 1 ELSE 0 END) AS converted,
            COALESCE(SUM(l.valueKes),0) AS value
       FROM Partner p LEFT JOIN Lead l ON l.partnerId = p.id
      GROUP BY p.id ORDER BY leads DESC`,
  );
}

export async function topProducts(limit = 6) {
  return await all<{ name: string; partnerName: string; category: string; leads: number; converted: number }>(
    // HAVING cannot reference a SELECT alias in Postgres, and every non-aggregated
    // column from a joined table must appear in GROUP BY — so both are spelled out.
    `SELECT pr.name, pt.name AS partnerName, pr.category,
            COUNT(l.id) AS leads,
            SUM(CASE WHEN l.status = 'CONVERTED' THEN 1 ELSE 0 END) AS converted
       FROM Product pr
       JOIN Partner pt ON pt.id = pr.partnerId
       LEFT JOIN Lead l ON l.productId = pr.id
      GROUP BY pr.id, pr.name, pr.category, pt.name
     HAVING COUNT(l.id) > 0
      ORDER BY COUNT(l.id) DESC LIMIT ?`,
    [limit],
  );
}

/** Baseline financial-inclusion indicators — the project's impact metrics. */
export async function inclusionIndicators() {
  const total = await count("SELECT COUNT(*) AS n FROM Rider") || 1;
  const engagedTotal = await count("SELECT COUNT(*) AS n FROM Rider WHERE status IN ('ACTIVE','ONBOARDED')") || 1;
  const metric = async (column: string) => ({
    all: Math.round(((await count(`SELECT COUNT(*) AS n FROM Rider WHERE ${column} = 1`)) / total) * 100),
    engaged: Math.round(
      ((await count(
        `SELECT COUNT(*) AS n FROM Rider WHERE ${column} = 1 AND status IN ('ACTIVE','ONBOARDED')`,
      )) /
        engagedTotal) *
        100,
    ),
  });
  return [
    { label: "SACCO membership", ...(await metric("saccoMember")) },
    { label: "Holds insurance", ...(await metric("hasInsurance")) },
    { label: "Bank account", ...(await metric("hasBankAccount")) },
    { label: "Owns their motorbike", ...(await metric("ownsMotorbike")) },
  ];
}
