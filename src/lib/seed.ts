import { all, count, id, insert, now, one, run, bulkInsert, withLock, SEED_LOCK } from "./db";
import { CATALOGUE, catalogueSize } from "./catalogue";
import { SEED_LESSONS } from "./seed-lessons";
import { enrichmentFor, syncCurriculum } from "./curriculum";
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
  const partnerUserIds: Record<string, string> = {};
  const partnerUserNames: Record<string, string> = {};
  for (const account of partnerAccounts) {
    const password = env.partnerPasswords[account.code];
    if (!password) continue;
    const uid = id("usr");
    partnerUserIds[account.code] = uid;
    partnerUserNames[account.code] = account.name;
    await insert("AppUser", {
      id: uid,
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
  // The verified catalogue is the product set: 32 Stima and Britam products
  // taken from their own published pages, each carrying the source URL and the
  // date it was checked. The older hand-written list is no longer seeded —
  // a demonstration should show exactly what the catalogue claims.
  const productIdByCode: Record<string, string> = {};
  const productRows: Record<string, unknown>[] = [];
  for (const [partnerCode, entries] of Object.entries(CATALOGUE)) {
    const partnerId = partnerByCode[partnerCode];
    if (!partnerId) continue;
    for (const e of entries) {
      const pid = id("prd");
      productIdByCode[e.code] = pid;
      productRows.push({
        id: pid,
        partnerId,
        code: e.code,
        name: e.name,
        category: e.category,
        icon: e.icon,
        summaryEn: e.summaryEn,
        summarySw: e.summarySw,
        summarySh: e.summarySh,
        detailsEn: e.detailsEn,
        detailsSw: e.detailsSw,
        minAmount: e.minAmount ?? null,
        maxAmount: e.maxAmount ?? null,
        interestRate: e.interestRate ?? null,
        premium: e.premium ?? null,
        termLabel: e.termLabel ?? null,
        eligibility: e.eligibility ?? null,
        requiresMembership: e.requiresMembership,
        featured: e.featured,
        active: 1,
        sourceUrl: e.sourceUrl,
        verifiedOn: e.verifiedOn,
        createdAt: ts,
      });
    }
  }
  await bulkInsert("Product", productRows);

  // ----------------------------------------------------------- lessons ----
  const lessonIds: string[] = [];
  const lessonRows: Record<string, unknown>[] = [];
  const questionRows: Record<string, unknown>[] = [];
  for (const l of SEED_LESSONS) {
    const lid = id("lsn");
    lessonIds.push(lid);
    // The structured teaching material lives in src/lib/curriculum and is
    // written straight in on a fresh seed; an existing database gets it from
    // syncCurriculum() instead.
    const rich = enrichmentFor(l.code);
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
      sectionsEn: rich ? JSON.stringify(rich.sections.En) : "",
      sectionsSw: rich ? JSON.stringify(rich.sections.Sw) : "",
      sectionsSh: rich ? JSON.stringify(rich.sections.Sh) : "",
      summaryEn: rich?.summary.En ?? "",
      summarySw: rich?.summary.Sw ?? "",
      summarySh: rich?.summary.Sh ?? "",
      durationMin: rich?.durationMin ?? l.durationMin,
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
      products: catalogueSize(),
      lessons: SEED_LESSONS.length,
      riders: 0,
      campaigns: 0,
      messages: 0,
      leads: 0,
      conversations: 0,
      signals: 0,
      donations: 0,
    };
  }

  const demo = await seedDemoData();
  return {
    skipped: false,
    demoData: true,
    partners: 2,
    stages: stageIds.length,
    products: catalogueSize(),
    lessons: SEED_LESSONS.length,
    ...demo,
  };
}

/**
 * Writes the synthetic demonstration dataset on top of reference data that
 * already exists.
 *
 * Split out of `seed()` so a populated database can be re-stocked without
 * dropping it: partners, staff accounts, stages, products and the curriculum
 * are read from the database rather than created, so an administrator keeps
 * their login and the verified catalogue survives untouched. The caller is
 * responsible for clearing the previous demonstration rows first.
 */
export async function seedDemoData() {
  const partners = await all<{ id: string; code: string }>("SELECT id, code FROM Partner");
  const partnerByCode: Record<string, string> = {};
  for (const p of partners) partnerByCode[p.code.toUpperCase()] = p.id;
  const stimaId = partnerByCode.STIMA;
  const britamId = partnerByCode.BRITAM;
  if (!stimaId || !britamId) throw new Error("Partners are missing — seed the reference data first.");

  const stageIds = (await all<{ id: string }>("SELECT id FROM Stage")).map((r) => r.id);
  const lessonIds = (await all<{ id: string }>('SELECT id FROM Lesson ORDER BY moduleKey, "order"')).map((r) => r.id);
  if (!stageIds.length || !lessonIds.length) throw new Error("Stages or lessons are missing — seed the reference data first.");

  const productIdByCode: Record<string, string> = {};
  for (const p of await all<{ id: string; code: string }>("SELECT id, code FROM Product")) {
    productIdByCode[p.code] = p.id;
  }

  const adminRow = await one<{ id: string }>("SELECT id FROM AppUser WHERE role = 'PLATFORM_ADMIN' ORDER BY createdAt LIMIT 1");
  const adminId = adminRow?.id ?? null;

  const partnerUserIds: Record<string, string> = {};
  const partnerUserNames: Record<string, string> = {};
  for (const u of await all<{ id: string; name: string; partnerId: string | null }>(
    "SELECT id, name, partnerId FROM AppUser WHERE role = 'PARTNER_ADMIN'",
  )) {
    const code = u.partnerId === stimaId ? "STIMA" : u.partnerId === britamId ? "BRITAM" : null;
    if (!code) continue;
    partnerUserIds[code] = u.id;
    partnerUserNames[code] = u.name;
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

  // ---------------------------------------------------------- demo scale ----
  // Sized for a demonstration rather than a load test: 30 riders keeps every
  // dashboard panel legible on a projector and every list short enough to read
  // aloud. Raise TOTAL_RIDERS and the rest scales with it — the proportions
  // below are what make the funnel, the warm list and the pipeline hang
  // together, so change those rather than patching individual tables.
  const TOTAL_RIDERS = 30;
  const CAMPAIGN_REACH = 0.82;   // share of the consented base each campaign hits
  const LEAD_RATE = 0.6;         // share of engaged riders with at least one lead
  const GOAL_RATE = 0.62;        // share of engaged riders saving toward a goal
  const CHAT_RATE = 0.62;        // share of engaged riders who opened a thread
  const DONATIONS = 14;

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

    // SMS or the web app. The programme runs on these two channels only.
    const channelPref = chance(0.72) ? "SMS" : "APP";

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
      registeredVia: pickOne(["FIELD", "FIELD", "FIELD", "SMS", "SMS", "APP"]),
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
  // At 30 riders the tail states can fail to appear at all. Force one of each
  // so a demonstration can show what dormancy and opt-out actually look like.
  for (const want of ["DORMANT", "OPTED_OUT"]) {
    if (riders.some((r) => r.status === want)) continue;
    const i = riders.findIndex((r) => r.status === "ENROLLED");
    if (i < 0) continue;
    riders[i].status = want;
    riderRows[i].status = want;
    if (want === "OPTED_OUT") {
      riders[i].consent = 0;
      riderRows[i].consent = 0;
      riderRows[i].consentAt = null;
    }
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
    const order = lessonIds.map((_: string, i: number) => lessonIds[(i + offset) % lessonIds.length]);

    for (let i = 0; i < lessonsDone; i++) {
      const completedAt = daysAgo(Math.floor(rand() * 80));
      progressRows.push({
        id: id("lpr"),
        riderId: rider.id,
        lessonId: order[i],
        channel: pickOne(["APP", "APP", "SMS", "SMS"]),
        completedAt,
      });
      if (chance(0.7)) {
        attemptRows.push({
          id: id("qat"),
          riderId: rider.id,
          lessonId: order[i],
          score: chance(0.72) ? 2 : 1,
          total: 2,
          channel: pickOne(["APP", "SMS"]),
          createdAt: completedAt,
        });
      }
    }
  }
  await bulkInsert("LessonProgress", progressRows);
  await bulkInsert("QuizAttempt", attemptRows);

  // --------------------------------------------------------- campaigns ----
  const campaignSpecs = [
    { name: "Save First — Week 1 nudge", objective: "EDUCATION", lesson: "SAV-1", channels: "SMS", days: 74 },
    { name: "Emergency fund challenge", objective: "EDUCATION", lesson: "SAV-2", channels: "SMS", days: 61 },
    { name: "Know what your loan costs", objective: "EDUCATION", lesson: "CRE-1", channels: "SMS,APP", days: 47 },
    { name: "Stima Alpha Deposits — stage drive", objective: "PRODUCT_PUSH", product: "STM-ALPHA", channels: "SMS", days: 33 },
    { name: "Your passenger is not covered", objective: "AWARENESS", lesson: "INS-2", channels: "SMS", days: 21 },
    { name: "Britam Connect — pay KSh 50 a week", objective: "PRODUCT_PUSH", product: "BRT-MWANANCHI", channels: "SMS,APP", days: 9 },
  ];

  const consented = riders.filter((r) => r.consent === 1 && r.status !== "OPTED_OUT");
  const campaignRows: Record<string, unknown>[] = [];
  const messageRows: Record<string, unknown>[] = [];

  for (const spec of campaignSpecs) {
    const lesson = spec.lesson ? SEED_LESSONS.find((l) => l.code === spec.lesson) : undefined;
    const product = spec.product
      ? Object.values(CATALOGUE).flat().find((p) => p.code === spec.product)
      : undefined;

    const bodyEn = lesson
      ? lesson.smsEn
      : `BodaPesa: ${product!.name} from ${spec.product!.startsWith("STM") ? "Stima SACCO" : "Britam"} — ${product!.summaryEn.slice(0, 90)} Reply YES to be called.`;
    const bodySw = lesson
      ? lesson.smsSw
      : `BodaPesa: ${product!.name} — ${product!.summarySw.slice(0, 90)} Jibu NDIO upigiwe simu.`;
    const bodySh = lesson
      ? lesson.smsSh
      : `BodaPesa: ${product!.name} — ${product!.summarySh.slice(0, 90)} Jibu NDIO upigiwe.`;

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
      if (!chance(CAMPAIGN_REACH)) continue;
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
        costKes: channel === "SMS" ? 0.8 : 0,
        error: status === "FAILED" ? "Absent subscriber" : null,
        createdAt: sentAt,
        sentAt,
        deliveredAt: status === "DELIVERED" ? sentAt : null,
        readAt: status === "DELIVERED" && channel === "APP" && chance(0.62) ? sentAt : null,
      });
    }
  }
  await bulkInsert("Campaign", campaignRows);
  await bulkInsert("Message", messageRows);

  // ------------------------------------------------------------- leads ----
  // Weighted toward the products a boda rider actually asks about: a savings
  // account he can open small, credit against the bike, and cover for himself
  // and his passenger.
  const leadProducts = [
    "STM-ALPHA", "STM-ALPHA", "STM-TWIGA", "STM-SHARE", "STM-MAKEOVER", "STM-MPAWA",
    "BRT-MOTOR-COM", "BRT-MOTIFLEX", "BRT-DATAPLUS", "BRT-MWANANCHI", "BRT-MWANANCHI", "BRT-LASTEXP",
  ];
  const engagedRiders = riders.filter((r) => r.status === "ACTIVE" || r.status === "ONBOARDED");
  const leadRows: Record<string, unknown>[] = [];
  // Conversions alternate between the two partners so neither console opens on
  // an empty board — and so partner performance compares two working pipelines
  // rather than one.
  let convertedCount = 0;
  for (const rider of engagedRiders) {
    const isOnboarded = rider.status === "ONBOARDED";
    const n = isOnboarded ? (chance(0.35) ? 2 : 1) : chance(LEAD_RATE) ? (chance(0.3) ? 2 : 1) : 0;
    for (let i = 0; i < n; i++) {
      // An onboarded rider is onboarded *because* a lead converted. Tying the
      // two together means the headline KPI (riders at status ONBOARDED) and
      // the funnel (riders with a converted lead) can never disagree — they are
      // counted differently in analytics.ts and would otherwise show two
      // different numbers on the same screen.
      const converts = isOnboarded && i === 0;
      const code = converts
        ? (convertedCount++ % 2 === 0
            ? pickOne(["STM-ALPHA", "STM-TWIGA", "STM-MPAWA", "STM-SHARE"])
            : pickOne(["BRT-MWANANCHI", "BRT-MOTOR-COM", "BRT-DATAPLUS", "BRT-MOTIFLEX"]))
        : pickOne(leadProducts);
      const roll = rand();
      const status = converts
        ? "CONVERTED"
        : roll < 0.3 ? "NEW" : roll < 0.58 ? "CONTACTED" : roll < 0.84 ? "QUALIFIED" : "DECLINED";
      const created = daysAgo(Math.floor(rand() * 70));
      leadRows.push({
        id: id("led"),
        riderId: rider.id,
        productId: productIdByCode[code],
        partnerId: code.startsWith("STM") ? stimaId : britamId,
        status,
        source: pickOne(["APP", "SMS", "SMS", "CHAT"]),
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
    if (!chance(GOAL_RATE)) continue;
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
    const deposits = 4 + Math.floor(rand() * 15);
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

  // ----------------------------------------------------- conversations ----
  // Two-way threads between riders and partner staff. Most carry a reply, so
  // the partner queue shows both answered and waiting work rather than a wall
  // of untouched rows. Threads are attached to the rider's own lead where one
  // exists, which is what makes the officer's screen coherent: the question,
  // the product and the pipeline entry are the same story.
  const ASKS = [
    {
      en: "How much is the cover per month, and does it pay for my passenger too?",
      sw: "Bima ni ngapi kwa mwezi? Na inalipia abiria pia?",
      sh: "Hii cover ni ngapi kwa mwezi? Na inacover abiria pia?",
      subject: "Monthly premium and passenger cover",
    },
    {
      en: "If I miss one week of saving, do I lose anything?",
      sw: "Nikikosa kuweka akiba wiki moja, nitapoteza kitu?",
      sh: "Nikiskip wiki moja ya kusave, nitalose kitu?",
      subject: "Missing a week of saving",
    },
    {
      en: "What papers do I need to join the SACCO?",
      sw: "Nahitaji nyaraka gani kujiunga na SACCO?",
      sh: "Nahitaji documents gani kujoin SACCO?",
      subject: "Documents needed to join",
    },
    {
      en: "How fast can I get the loan after I apply?",
      sw: "Nitapata mkopo baada ya siku ngapi nikiomba?",
      sh: "Loan inachukua siku ngapi nikiapply?",
      subject: "How long the loan takes",
    },
    {
      en: "If the bike is stolen, what exactly do you pay?",
      sw: "Pikipiki ikiibiwa, mnalipa kiasi gani hasa?",
      sh: "Pikipiki ikiibiwa, mnalipa pesa ngapi exactly?",
      subject: "What the claim pays out",
    },
  ];
  const REPLIES = [
    "Habari. Nitakupigia leo kuelezea vizuri — ni KSh 1,250 kwa mwezi na inajumuisha abiria.",
    "Asante kwa swali. Hakuna adhabu ukikosa wiki moja; unaendelea pale ulipoishia.",
    "Unahitaji kitambulisho na namba ya simu pekee. Nitakutumia fomu leo.",
    "Baada ya kuleta nyaraka, mkopo unachukua siku 3 za kazi.",
    "Thank you — I will call you this afternoon and take you through it step by step.",
  ];

  const leadByRider: Record<string, { id: string; productId: string; partnerId: string }> = {};
  for (const l of leadRows) {
    const rid = l.riderId as string;
    if (!leadByRider[rid]) {
      leadByRider[rid] = {
        id: l.id as string,
        productId: l.productId as string,
        partnerId: l.partnerId as string,
      };
    }
  }

  const convoRows: Record<string, unknown>[] = [];
  const chatRows: Record<string, unknown>[] = [];
  for (const rider of engagedRiders) {
    if (!chance(CHAT_RATE)) continue;
    const ask = pickOne(ASKS);
    const lead = leadByRider[rider.id];
    const partnerCode = lead ? (lead.partnerId === stimaId ? "STIMA" : "BRITAM") : pickOne(["STIMA", "BRITAM"]);
    const partnerId = partnerCode === "STIMA" ? stimaId : britamId;

    const openedDaysAgo = Math.floor(rand() * 24);
    const openedAt = daysAgo(openedDaysAgo);
    const answered = chance(0.68);
    const repliedAt = answered ? daysAgo(Math.max(0, openedDaysAgo - 1)) : null;

    const cid = id("cnv");
    const body = rider.language === "EN" ? ask.en : rider.language === "SH" ? ask.sh : ask.sw;

    convoRows.push({
      id: cid,
      riderId: rider.id,
      partnerId,
      productId: lead?.productId ?? null,
      leadId: lead?.id ?? null,
      subject: ask.subject,
      status: answered && chance(0.4) ? "CLOSED" : "OPEN",
      assignedToId: answered ? (partnerUserIds[partnerCode] ?? null) : null,
      openedBy: "RIDER",
      lastMessageAt: repliedAt ?? openedAt,
      lastMessageFrom: answered ? "STAFF" : "RIDER",
      riderUnread: answered ? 1 : 0,
      staffUnread: answered ? 0 : 1,
      createdAt: openedAt,
      updatedAt: repliedAt ?? openedAt,
    });

    chatRows.push({
      id: id("cms"),
      conversationId: cid,
      senderType: "RIDER",
      senderUserId: null,
      senderName: "Rider",
      body,
      createdAt: openedAt,
    });
    if (answered) {
      chatRows.push({
        id: id("cms"),
        conversationId: cid,
        senderType: "STAFF",
        senderUserId: partnerUserIds[partnerCode] ?? null,
        senderName: partnerUserNames[partnerCode] ?? (partnerCode === "STIMA" ? "Stima SACCO" : "Britam"),
        body: pickOne(REPLIES),
        createdAt: repliedAt!,
      });
    }
  }
  await bulkInsert("Conversation", convoRows);
  await bulkInsert("ChatMessage", chatRows);

  // ----------------------------------------------------------- signals ----
  // Behavioural signals are derived from what each rider actually did, not
  // generated independently — otherwise the warm list would recommend riders
  // whose history does not support it. Only the last 30 days count toward the
  // score, so these are dated inside that window.
  const SIGNAL_W: Record<string, number> = {
    CHAT_STARTED: 10, ENQUIRY_SENT: 10, MODULE_DONE: 6, DEPOSIT_STREAK: 6,
    GOAL_SET: 5, QUIZ_PASSED: 3, PRODUCT_VIEWED: 2, DEPOSIT: 2, LESSON_DONE: 1,
  };
  const signalRows: Record<string, unknown>[] = [];
  const signal = (riderId: string, kind: string, productId: string | null, days: number) =>
    signalRows.push({
      id: id("sig"),
      riderId,
      kind,
      weight: SIGNAL_W[kind] ?? 1,
      productId,
      detail: null,
      createdAt: daysAgo(days),
    });

  const goalRiderIds = new Set(goalRows.map((g) => g.riderId as string));
  const chatRiderIds = new Set(convoRows.map((c) => c.riderId as string));
  for (const rider of engagedRiders) {
    const lead = leadByRider[rider.id];
    const pid = lead?.productId ?? null;

    if (chatRiderIds.has(rider.id)) signal(rider.id, "CHAT_STARTED", pid, Math.floor(rand() * 20));
    if (lead) signal(rider.id, "ENQUIRY_SENT", pid, Math.floor(rand() * 26));
    if (goalRiderIds.has(rider.id)) signal(rider.id, "GOAL_SET", null, Math.floor(rand() * 28));

    const lessons = 1 + Math.floor(rand() * 4);
    for (let i = 0; i < lessons; i++) signal(rider.id, "LESSON_DONE", null, Math.floor(rand() * 29));
    if (lessons >= 3) signal(rider.id, "MODULE_DONE", null, Math.floor(rand() * 18));
    if (chance(0.6)) signal(rider.id, "QUIZ_PASSED", null, Math.floor(rand() * 25));
    if (chance(0.7)) signal(rider.id, "PRODUCT_VIEWED", pid, Math.floor(rand() * 14));
    if (goalRiderIds.has(rider.id) && chance(0.5)) signal(rider.id, "DEPOSIT_STREAK", null, Math.floor(rand() * 12));
    const deps = Math.floor(rand() * 3);
    for (let i = 0; i < deps; i++) signal(rider.id, "DEPOSIT", null, Math.floor(rand() * 20));
  }
  await bulkInsert("RiderSignal", signalRows);

  // --------------------------------------------------------- donations ----
  // The platform is free to riders and carries a donation path to fund the
  // messages that reach them. Simulated so the ledger is never empty in a
  // demonstration; live is 0 on every row.
  const DONORS = [
    "Wanjiku M.", "Omondi O.", "Achieng A.", "Kiprotich K.", "Njeri W.",
    "Mutua S.", "Hassan A.", "Chebet R.", null, "Kariuki P.", null, "Atieno L.",
  ];
  const donationRows: Record<string, unknown>[] = [];
  for (let i = 0; i < DONATIONS; i++) {
    const amount = pickOne([200, 500, 500, 1000, 1000, 2000, 2500, 5000]);
    const mpesa = chance(0.68);
    const roll = rand();
    const status = roll < 0.82 ? "SUCCESS" : roll < 0.93 ? "PENDING" : "FAILED";
    const created = daysAgo(Math.floor(rand() * 95));
    const donor = pickOne(DONORS);
    donationRows.push({
      id: id("don"),
      txRef: `bp_${Math.floor(rand() * 1e12).toString(36)}`,
      method: mpesa ? "MPESA" : "CARD",
      provider: mpesa ? "DARAJA" : pickOne(["FLUTTERWAVE", "PAYSTACK"]),
      live: 0,
      amountKes: amount,
      donorName: donor,
      donorEmail: donor ? `${donor.split(" ")[0].toLowerCase()}@example.com` : null,
      donorMsisdn: mpesa ? `+2547${Math.floor(10000000 + rand() * 89999999)}` : null,
      note: chance(0.25) ? "Keep teaching the riders." : null,
      anonymous: donor ? 0 : 1,
      status,
      providerRef: status === "SUCCESS" ? `sim_${Math.floor(rand() * 1e9).toString(36)}` : null,
      receipt: status === "SUCCESS" && mpesa ? `S${Math.floor(rand() * 1e9).toString(36).toUpperCase()}` : null,
      failureReason: status === "FAILED" ? "Request cancelled by user" : null,
      createdAt: created,
      updatedAt: created,
      paidAt: status === "SUCCESS" ? created : null,
    });
  }
  await bulkInsert("Donation", donationRows);

  return {
    riders: riderRows.length,
    campaigns: campaignRows.length,
    messages: messageRows.length,
    leads: leadRows.length,
    conversations: convoRows.length,
    signals: signalRows.length,
    donations: donationRows.length,
    goals: goalRows.length,
    deposits: depositRows.length,
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

/**
 * Brings the stored curriculum up to date with the one in the code.
 *
 * Runs once per server instance and holds the bootstrap lock, so two
 * instances starting together cannot both write the same lessons. Failure is
 * logged and swallowed: an out-of-date curriculum still renders, so this must
 * never be able to take the application down.
 */
let curriculumChecked = false;
async function refreshCurriculum() {
  if (curriculumChecked) return;
  curriculumChecked = true;
  try {
    await withLock(SEED_LOCK, async () => {
      const { created, enriched } = await syncCurriculum();
      if (created || enriched) {
        console.log(`[bodapesa] curriculum synced — ${created} added, ${enriched} updated`);
      }
    });
  } catch (err) {
    console.error("[bodapesa] curriculum sync failed", err);
  }
}

export async function ensureSeeded() {
  try {
    if (await isSeeded()) {
      await refreshUssdCode();
      await refreshCurriculum();
      return;
    }
    // Several serverless instances can arrive here at once on first deploy.
    // Only one may seed; the rest wait on the lock, then find the work done.
    await withLock(SEED_LOCK, async () => {
      if (!(await isSeeded())) await seed();
    });
    // A fresh seed already wrote the enriched curriculum, so mark it done.
    curriculumChecked = true;
  } catch (err) {
    console.error("[bodapesa] seed failed", err);
  }
}

export { run };
