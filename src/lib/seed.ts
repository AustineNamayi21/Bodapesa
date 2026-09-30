import { count, id, insert, now, run, bulkInsert, withLock, SEED_LOCK } from "./db";
import { SEED_PRODUCTS } from "./seed-products";
import { SEED_LESSONS } from "./seed-lessons";
import { hashPassword } from "./auth";
import { env } from "./env";
import { LEGACY_USSD_CODES, USSD_CODE } from "./ussd-code";

/** Deterministic PRNG so demo data is identical on every machine. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const rand = rng(20260922);
const pickOne = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length) % arr.length];
const chance = (p: number) => rand() < p;
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

const STAGES = [
  { name: "Kangemi Stage", subCounty: "Westlands", ward: "Kangemi", lat: -1.2673, lng: 36.7449 },
  { name: "Kawangware 46", subCounty: "Dagoretti North", ward: "Kawangware", lat: -1.2833, lng: 36.7333 },
  { name: "Githurai 45", subCounty: "Roysambu", ward: "Githurai", lat: -1.2, lng: 36.9167 },
  { name: "Zimmerman Base", subCounty: "Roysambu", ward: "Zimmerman", lat: -1.2167, lng: 36.8917 },
  { name: "Umoja Stage 3", subCounty: "Embakasi West", ward: "Umoja I", lat: -1.2833, lng: 36.8917 },
  { name: "Kayole Junction", subCounty: "Embakasi Central", ward: "Kayole North", lat: -1.2756, lng: 36.9203 },
  { name: "Dandora Phase 4", subCounty: "Embakasi North", ward: "Dandora Area IV", lat: -1.2467, lng: 36.9008 },
  { name: "Eastleigh 1st Avenue", subCounty: "Kamukunji", ward: "Eastleigh North", lat: -1.2739, lng: 36.8506 },
  { name: "Gikomba Market", subCounty: "Kamukunji", ward: "Bahati", lat: -1.2833, lng: 36.8375 },
  { name: "Ngara Riverside", subCounty: "Starehe", ward: "Ngara", lat: -1.2725, lng: 36.8283 },
  { name: "Olympic Kibera", subCounty: "Kibra", ward: "Sarang'ombe", lat: -1.3125, lng: 36.7897 },
  { name: "Ngong Road Junction", subCounty: "Dagoretti North", ward: "Kilimani", lat: -1.2989, lng: 36.7756 },
  { name: "Kasarani Mwiki", subCounty: "Kasarani", ward: "Mwiki", lat: -1.2206, lng: 36.9247 },
  { name: "Mathare North", subCounty: "Ruaraka", ward: "Mathare North", lat: -1.2567, lng: 36.8664 },
];

const FIRST_M = ["Brian","Kevin","Dennis","Collins","Erick","Victor","Felix","Moses","Samuel","Peter","Joseph","Duncan","Antony","Stephen","Geoffrey","Kelvin","Douglas","Maurice","Elias","Titus","Wycliffe","Amos","Isaac","Nicholas","Martin","Julius","Fredrick","Bernard","Charles","Oscar"];
const FIRST_F = ["Mercy","Faith","Grace","Caroline","Nancy","Jane","Esther","Lydia","Beatrice","Winnie","Sharon","Purity","Damaris","Christine"];
const LAST = ["Otieno","Kamau","Wanjiru","Mutiso","Kiprop","Odhiambo","Njoroge","Wafula","Mwangi","Omondi","Cheruiyot","Muriithi","Kariuki","Barasa","Nyambura","Ochieng","Kimani","Maina","Owino","Kiptoo","Mutua","Gitonga","Simiyu","Achieng","Waweru","Ndungu","Onyango","Chebet","Kilonzo","Mbugua"];

const INCOME_BANDS = ["<500", "500-1000", "1000-1500", ">1500"];
const AGE_BANDS = ["18-24", "25-34", "35-44", "45+"];

export async function isSeeded(): Promise<boolean> {
  return await count("SELECT COUNT(*) AS n FROM Partner") > 0;
}

export async function seed() {
  if (await isSeeded()) return { skipped: true };

  const ts = now();

  // ---------------------------------------------------------- partners ----
  const stimaId = id("ptn");
  await insert("Partner", {
    id: stimaId,
    code: "STIMA",
    name: "Stima DT SACCO",
    kind: "SACCO",
    tagline: "Towards a prosperous future together",
    description:
      "A deposit-taking SACCO regulated by SASRA, offering savings, credit and investment products. On BodaPesa, Stima provides the savings, credit and investment pathway that moves riders from daily cash handling into a formal financial record.",
    accent: "#0b6e4f",
    contactMsisdn: "+254709000000",
    website: "https://www.stima-sacco.com",
    createdAt: ts,
  });

  const britamId = id("ptn");
  await insert("Partner", {
    id: britamId,
    code: "BRITAM",
    name: "Britam",
    kind: "INSURER",
    tagline: "With you every step of the way",
    description:
      "A diversified financial services group regulated by the IRA and CMA, providing insurance, pensions and asset management. On BodaPesa, Britam covers the risk side: motor liability, personal accident, health and last expense, plus long-term savings vehicles.",
    accent: "#c8102e",
    contactMsisdn: "+254705100100",
    website: "https://ke.britam.com",
    createdAt: ts,
  });

  const partnerByCode: Record<string, string> = { STIMA: stimaId, BRITAM: britamId };

  // ------------------------------------------------------------- users ----
  const adminId = id("usr");
  await insert("AppUser", {
    id: adminId,
    email: env.adminEmail,
    name: "Platform Administrator",
    passwordHash: hashPassword(env.adminPassword),
    role: "PLATFORM_ADMIN",
    partnerId: null,
    createdAt: ts,
  });
  // Partner staff accounts are only created when a password is available.
  // In production that means STIMA_PASSWORD / BRITAM_PASSWORD must be set —
  // an account with a published password would expose rider data.
  const partnerAccounts = [
    { code: "STIMA", email: "sacco@stima.co.ke", name: "Stima SACCO Relationship Officer", partnerId: stimaId },
    { code: "BRITAM", email: "agent@britam.co.ke", name: "Britam Microinsurance Agent", partnerId: britamId },
  ];
  for (const account of partnerAccounts) {
    const password = env.partnerPasswords[account.code];
    if (!password) continue;
    await insert("AppUser", {
      id: id("usr"),
      email: account.email,
      name: account.name,
      passwordHash: hashPassword(password),
      role: "PARTNER_ADMIN",
      partnerId: account.partnerId,
      createdAt: ts,
    });
  }

  // ------------------------------------------------------------ stages ----
  const stageIds: string[] = [];
  const stageRows = STAGES.map((st) => {
    const sid = id("stg");
    stageIds.push(sid);
    return {
      id: sid,
      name: st.name,
      subCounty: st.subCounty,
      ward: st.ward,
      lat: st.lat,
      lng: st.lng,
      chairperson: `${pickOne(FIRST_M)} ${pickOne(LAST)}`,
      chairMsisdn: `+2547${Math.floor(10000000 + rand() * 89999999)}`,
      createdAt: ts,
    };
  });
  await bulkInsert("Stage", stageRows);

  // ---------------------------------------------------------- products ----
  const productIdByCode: Record<string, string> = {};
  const productRows = SEED_PRODUCTS.map((pr) => {
    const pid = id("prd");
    productIdByCode[pr.code] = pid;
    return {
      id: pid,
      partnerId: partnerByCode[pr.partner],
      code: pr.code,
      name: pr.name,
      category: pr.category,
      icon: pr.icon,
      summaryEn: pr.summaryEn,
      summarySw: pr.summarySw,
      summarySh: pr.summarySh,
      detailsEn: pr.detailsEn,
      detailsSw: pr.detailsSw,
      minAmount: pr.minAmount ?? null,
      maxAmount: pr.maxAmount ?? null,
      interestRate: pr.interestRate ?? null,
      premium: pr.premium ?? null,
      termLabel: pr.termLabel ?? null,
      eligibility: pr.eligibility ?? null,
      requiresMembership: pr.requiresMembership ? 1 : 0,
      featured: pr.featured ? 1 : 0,
      active: 1,
      createdAt: ts,
    };
  });
  await bulkInsert("Product", productRows);

  // ----------------------------------------------------------- lessons ----
  const lessonIds: string[] = [];
  const lessonRows: Record<string, unknown>[] = [];
  const questionRows: Record<string, unknown>[] = [];
  for (const l of SEED_LESSONS) {
    const lid = id("lsn");
    lessonIds.push(lid);
    lessonRows.push({
      id: lid,
      moduleKey: l.moduleKey,
      order: l.order,
      code: l.code,
      titleEn: l.titleEn,
      titleSw: l.titleSw,
      titleSh: l.titleSh,
      bodyEn: l.bodyEn,
      bodySw: l.bodySw,
      bodySh: l.bodySh,
      smsEn: l.smsEn,
      smsSw: l.smsSw,
      smsSh: l.smsSh,
      durationMin: l.durationMin,
      active: 1,
    });
    l.questions.forEach((q, i) => {
      questionRows.push({
        id: id("qst"),
        lessonId: lid,
        order: i + 1,
        promptEn: q.promptEn,
        promptSw: q.promptSw,
        promptSh: q.promptSh,
        optionsJson: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        explanationEn: q.explanationEn,
        explanationSw: q.explanationSw,
      });
    });
  }
  await bulkInsert("Lesson", lessonRows);
  await bulkInsert("QuizQuestion", questionRows);

  // Reference data — partners, staff accounts, stages, products and the
  // curriculum — is always created: the platform is unusable without it.
  // Everything below is synthetic demonstration data and is skipped unless
  // SEED_DEMO_DATA is on, so a live deployment starts with an empty register.
  if (!env.seedDemoData) {
    return {
      skipped: false,
      demoData: false,
      partners: 2,
      stages: stageIds.length,
      products: SEED_PRODUCTS.length,
      lessons: SEED_LESSONS.length,
      riders: 0,
      campaigns: 0,
      messages: 0,
      leads: 0,
    };
  }

  // ------------------------------------------------------------ riders ----
  // Demo rows are built in memory and written in batches. Against a hosted
  // database each statement is a network round trip, so row-by-row inserts
  // would take tens of seconds; batched, the whole seed is a few dozen calls.
  type SeedRider = {
    id: string;
    status: string;
    literacyScore: number;
    consent: number;
    language: string;
    channelPref: string;
  };
  const riderRows: Record<string, unknown>[] = [];
  const riders: SeedRider[] = [];
  const used = new Set<string>();
  const TOTAL_RIDERS = 240;

  for (let i = 0; i < TOTAL_RIDERS; i++) {
    let msisdn = "";
    do {
      msisdn = `+2547${pickOne(["0", "1", "2", "4", "8", "9"])}${Math.floor(1000000 + rand() * 8999999)}`;
    } while (used.has(msisdn));
    used.add(msisdn);

    const female = chance(0.08); // boda riding in Nairobi is heavily male but not exclusively
    const firstName = female ? pickOne(FIRST_F) : pickOne(FIRST_M);
    const createdDaysAgo = Math.floor(rand() * 150);

    // Programme funnel: prospect -> enrolled -> active -> onboarded
    const r = rand();
    const status =
      r < 0.18 ? "PROSPECT" : r < 0.46 ? "ENROLLED" : r < 0.74 ? "ACTIVE" : r < 0.94 ? "ONBOARDED" : r < 0.98 ? "DORMANT" : "OPTED_OUT";

    const onboarded = status === "ONBOARDED";
    const engaged = status === "ACTIVE" || onboarded;

    const langRoll = rand();
    const language = langRoll < 0.52 ? "SW" : langRoll < 0.78 ? "SH" : "EN";

    const chRoll = rand();
    const channelPref = chRoll < 0.54 ? "SMS" : chRoll < 0.76 ? "WHATSAPP" : chRoll < 0.92 ? "USSD" : "APP";

    const rid = id("rdr");
    const row = {
      id: rid,
      msisdn,
      firstName,
      lastName: pickOne(LAST),
      nationalId: `${Math.floor(20000000 + rand() * 19999999)}`,
      gender: female ? "F" : "M",
      ageBand: pickOne(AGE_BANDS),
      language,
      channelPref,
      stageId: pickOne(stageIds),
      dailyIncomeBand: pickOne(INCOME_BANDS),
      ownsMotorbike: chance(onboarded ? 0.55 : 0.32) ? 1 : 0,
      hasBankAccount: chance(engaged ? 0.46 : 0.22) ? 1 : 0,
      saccoMember: onboarded ? (chance(0.78) ? 1 : 0) : chance(0.12) ? 1 : 0,
      hasInsurance: onboarded ? (chance(0.72) ? 1 : 0) : chance(0.27) ? 1 : 0,
      usesMobileMoney: chance(0.96) ? 1 : 0,
      status,
      literacyScore: status === "PROSPECT" ? 0 : Math.floor(25 + rand() * (onboarded ? 60 : 45)),
      consent: status === "OPTED_OUT" ? 0 : chance(0.94) ? 1 : 0,
      consentAt: status === "OPTED_OUT" ? null : daysAgo(createdDaysAgo),
      registeredVia: pickOne(["FIELD", "FIELD", "USSD", "USSD", "SMS", "WHATSAPP", "APP"]),
      // Generated numbers may belong to real people. Flagging every synthetic
      // rider means a live campaign can never text a stranger who never
      // consented — sends to these riders are always simulated.
      isSynthetic: 1,
      lastActiveAt: engaged ? daysAgo(Math.floor(rand() * 14)) : daysAgo(Math.floor(rand() * 90)),
      createdAt: daysAgo(createdDaysAgo),
      updatedAt: daysAgo(Math.floor(rand() * createdDaysAgo || 1)),
    };
    riderRows.push(row);
    riders.push({
      id: rid,
      status,
      literacyScore: row.literacyScore,
      consent: row.consent,
      language,
      channelPref,
    });
  }
  await bulkInsert("Rider", riderRows);

  // --------------------------------------------- lesson progress & quiz ----
  const progressRows: Record<string, unknown>[] = [];
  const attemptRows: Record<string, unknown>[] = [];
  for (const rider of riders) {
    if (rider.status === "PROSPECT" || rider.status === "OPTED_OUT") continue;

    const lessonsDone = Math.min(lessonIds.length, Math.floor((rider.literacyScore / 100) * 12) + (chance(0.3) ? 1 : 0));

    // Riders do not all start at lesson one: field officers and campaigns push
    // whichever module is most urgent for that rider, so the starting point is
    // rotated. Without this every rider would cluster in the savings module.
    const offset = Math.floor(rand() * lessonIds.length);
    const order = lessonIds.map((_, i) => lessonIds[(i + offset) % lessonIds.length]);

    for (let i = 0; i < lessonsDone; i++) {
      const completedAt = daysAgo(Math.floor(rand() * 80));
      progressRows.push({
        id: id("lpr"),
        riderId: rider.id,
        lessonId: order[i],
        channel: pickOne(["APP", "APP", "USSD", "SMS", "WHATSAPP"]),
        completedAt,
      });
      if (chance(0.7)) {
        attemptRows.push({
          id: id("qat"),
          riderId: rider.id,
          lessonId: order[i],
          score: chance(0.72) ? 2 : 1,
          total: 2,
          channel: pickOne(["APP", "USSD"]),
          createdAt: completedAt,
        });
      }
    }
  }
  await bulkInsert("LessonProgress", progressRows);
  await bulkInsert("QuizAttempt", attemptRows);

  // --------------------------------------------------------- campaigns ----
  const campaignSpecs = [
    { name: "Save First — Week 1 nudge", objective: "EDUCATION", lesson: "SAV-1", channels: "SMS,WHATSAPP", days: 74 },
    { name: "Emergency fund challenge", objective: "EDUCATION", lesson: "SAV-2", channels: "SMS", days: 61 },
    { name: "Know what your loan costs", objective: "EDUCATION", lesson: "CRE-1", channels: "SMS,WHATSAPP,USSD", days: 47 },
    { name: "Stima Alpha Deposits — stage drive", objective: "PRODUCT_PUSH", product: "STIMA-ALPHA", channels: "SMS,WHATSAPP", days: 33 },
    { name: "Your passenger is not covered", objective: "AWARENESS", lesson: "INS-2", channels: "SMS,WHATSAPP", days: 21 },
    { name: "Britam Connect — pay KSh 50 a week", objective: "PRODUCT_PUSH", product: "BRITAM-AFYA", channels: "SMS,WHATSAPP,APP", days: 9 },
  ];

  const consented = riders.filter((r) => r.consent === 1 && r.status !== "OPTED_OUT");
  const campaignRows: Record<string, unknown>[] = [];
  const messageRows: Record<string, unknown>[] = [];

  for (const spec of campaignSpecs) {
    const lesson = spec.lesson ? SEED_LESSONS.find((l) => l.code === spec.lesson) : undefined;
    const product = spec.product ? SEED_PRODUCTS.find((p) => p.code === spec.product) : undefined;

    const bodyEn = lesson
      ? lesson.smsEn
      : `BodaPesa: ${product!.name} from ${product!.partner === "STIMA" ? "Stima SACCO" : "Britam"} — ${product!.summaryEn.slice(0, 90)} Reply YES or dial *384*14791#`;
    const bodySw = lesson
      ? lesson.smsSw
      : `BodaPesa: ${product!.name} — ${product!.summarySw.slice(0, 90)} Jibu NDIO au piga *384*14791#`;
    const bodySh = lesson
      ? lesson.smsSh
      : `BodaPesa: ${product!.name} — ${product!.summarySh.slice(0, 90)} Reply YES ama dial *384*14791#`;

    const cid = id("cmp");
    const sentAt = daysAgo(spec.days);
    campaignRows.push({
      id: cid,
      name: spec.name,
      objective: spec.objective,
      productId: product ? productIdByCode[product.code] : null,
      bodyEn,
      bodySw,
      bodySh,
      channels: spec.channels,
      segmentJson: JSON.stringify({ consentOnly: true }),
      status: "SENT",
      scheduledAt: sentAt,
      sentAt,
      createdById: adminId,
      createdAt: daysAgo(spec.days + 2),
      updatedAt: sentAt,
    });

    // reach ~ 80% of the consented base per campaign
    for (const rider of consented) {
      if (!chance(0.82)) continue;
      const channel = spec.channels.includes(rider.channelPref) ? rider.channelPref : spec.channels.split(",")[0];
      const body = rider.language === "EN" ? bodyEn : rider.language === "SH" ? bodySh : bodySw;
      const roll = rand();
      const status = roll < 0.9 ? "DELIVERED" : roll < 0.96 ? "SENT" : "FAILED";
      messageRows.push({
        id: id("msg"),
        campaignId: cid,
        riderId: rider.id,
        channel,
        language: rider.language,
        body,
        direction: "OUT",
        status,
        providerRef: `sim_${Math.floor(rand() * 1e9).toString(36)}`,
        costKes: channel === "SMS" ? 0.8 : channel === "WHATSAPP" ? 0.5 : 0,
        error: status === "FAILED" ? "Absent subscriber" : null,
        createdAt: sentAt,
        sentAt,
        deliveredAt: status === "DELIVERED" ? sentAt : null,
        readAt: status === "DELIVERED" && channel === "WHATSAPP" && chance(0.62) ? sentAt : null,
      });
    }
  }
  await bulkInsert("Campaign", campaignRows);
  await bulkInsert("Message", messageRows);

  // ------------------------------------------------------------- leads ----
  const leadProducts = [
    "STIMA-ALPHA", "STIMA-ALPHA", "STIMA-TWIGA", "STIMA-SHARES", "STIMA-MAKEOVER",
    "BRITAM-TPO", "BRITAM-PLL", "BRITAM-PA", "BRITAM-AFYA", "BRITAM-AFYA", "BRITAM-FARIJI",
  ];
  const engagedRiders = riders.filter((r) => r.status === "ACTIVE" || r.status === "ONBOARDED");
  const leadRows: Record<string, unknown>[] = [];
  for (const rider of engagedRiders) {
    const n = chance(0.55) ? (chance(0.3) ? 2 : 1) : 0;
    for (let i = 0; i < n; i++) {
      const code = pickOne(leadProducts);
      const roll = rand();
      const status = roll < 0.2 ? "NEW" : roll < 0.42 ? "CONTACTED" : roll < 0.62 ? "QUALIFIED" : roll < 0.9 ? "CONVERTED" : "DECLINED";
      const created = daysAgo(Math.floor(rand() * 70));
      leadRows.push({
        id: id("led"),
        riderId: rider.id,
        productId: productIdByCode[code],
        partnerId: code.startsWith("STIMA") ? stimaId : britamId,
        status,
        source: pickOne(["APP", "USSD", "SMS", "WHATSAPP"]),
        note: null,
        valueKes: status === "CONVERTED" ? Math.round((500 + rand() * 12000) / 50) * 50 : null,
        createdAt: created,
        updatedAt: created,
      });
    }
  }
  await bulkInsert("Lead", leadRows);

  // ------------------------------------------------------ savings goals ----
  const goalTitles = [
    "Share capital for Stima SACCO",
    "Annual insurance premium",
    "Deposit for my own bike",
    "Emergency fund",
    "School fees January",
    "Bike service fund",
  ];
  const goalRows: Record<string, unknown>[] = [];
  const depositRows: Record<string, unknown>[] = [];
  for (const rider of engagedRiders) {
    if (!chance(0.45)) continue;
    const target = pickOne([5000, 10000, 15000, 20000, 36000, 50000]);
    const gid = id("gol");
    goalRows.push({
      id: gid,
      riderId: rider.id,
      title: pickOne(goalTitles),
      targetAmount: target,
      dailyTarget: Math.round(target / 180 / 10) * 10,
      targetDate: new Date(Date.now() + Math.floor(30 + rand() * 180) * 86400000).toISOString(),
      createdAt: daysAgo(Math.floor(20 + rand() * 90)),
    });
    const deposits = Math.floor(rand() * 22);
    for (let i = 0; i < deposits; i++) {
      depositRows.push({
        id: id("dep"),
        goalId: gid,
        amount: pickOne([50, 100, 100, 150, 200, 300, 500]),
        note: null,
        createdAt: daysAgo(Math.floor(rand() * 60)),
      });
    }
  }
  await bulkInsert("SavingsGoal", goalRows);
  await bulkInsert("SavingsDeposit", depositRows);

  return {
    skipped: false,
    demoData: true,
    partners: 2,
    stages: stageIds.length,
    products: SEED_PRODUCTS.length,
    lessons: SEED_LESSONS.length,
    riders: riderRows.length,
    campaigns: campaignRows.length,
    messages: messageRows.length,
    leads: leadRows.length,
  };
}

/** Called on first request so the demo is always populated. */
/**
 * Rewrites an old USSD code to the current one in stored content — lessons,
 * campaigns and message history were seeded with the code of the day, and a
 * change of channel number should not leave riders being told to dial a code
 * that no longer works. Idempotent; runs once per server instance.
 */
let ussdCodeChecked = false;
async function refreshUssdCode() {
  if (ussdCodeChecked) return;
  ussdCodeChecked = true;
  const columns: Record<string, string[]> = {
    Lesson: ["bodyEn", "bodySw", "bodySh", "smsEn", "smsSw", "smsSh"],
    Campaign: ["bodyEn", "bodySw", "bodySh"],
    Message: ["body"],
  };
  for (const legacy of LEGACY_USSD_CODES) {
    if (legacy === USSD_CODE) continue;
    for (const [table, cols] of Object.entries(columns)) {
      const set = cols.map((c) => `${c} = REPLACE(${c}, ?, ?)`).join(", ");
      const where = cols.map((c) => `${c} LIKE ?`).join(" OR ");
      await run(`UPDATE ${table} SET ${set} WHERE ${where}`, [
        ...cols.flatMap(() => [legacy, USSD_CODE]),
        ...cols.map(() => `%${legacy}%`),
      ]);
    }
  }
}

export async function ensureSeeded() {
  try {
    if (await isSeeded()) {
      await refreshUssdCode();
      return;
    }
    // Several serverless instances can arrive here at once on first deploy.
    // Only one may seed; the rest wait on the lock, then find the work done.
    await withLock(SEED_LOCK, async () => {
      if (!(await isSeeded())) await seed();
    });
  } catch (err) {
    console.error("[bodapesa] seed failed", err);
  }
}

export { run };
