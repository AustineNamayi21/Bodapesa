import { all, count, id, insert, now, one, run, update } from "../db";
import { normaliseMsisdn, pick } from "../i18n";
import { env } from "../env";
import { inBackground } from "../background";
import { sendWelcome } from "./dispatch";
import type { Lang, Lesson, Product, Rider } from "../types";

/**
 * USSD menu engine, compatible with the Africa's Talking USSD callback format.
 *
 * USSD is the single most important channel for this project: it works on
 * every handset, needs no data bundle, costs the rider nothing beyond the
 * session, and works in areas with only 2G coverage. Any rider who can dial
 * a number can complete the whole journey — register, learn, take a quiz,
 * browse products and request a callback — without a smartphone.
 *
 * Africa's Talking sends the full input path on every request (e.g. "1*2*3"),
 * so the handler below is a pure function of that path. The UssdSession table
 * is used for analytics and transcripts rather than for state.
 */

export interface UssdRequest {
  sessionId: string;
  phoneNumber: string;
  text: string;
  serviceCode?: string;
}

/**
 * Where a USSD request came from.
 *
 * "provider" — Africa's Talking, relaying a real handset. The phone number was
 *   supplied by the mobile network, so it is trusted.
 * "web" — the simulator on this website. Anyone can type any number into it,
 *   so the number proves nothing: riders it registers are flagged synthetic
 *   (never sent a real message), and outside demo mode it refuses to open the
 *   account of a real rider.
 */
export type UssdSource = "provider" | "web";

const CON = (s: string) => `CON ${s}`;
const END = (s: string) => `END ${s}`;

const MODULES = ["SAVINGS", "CREDIT", "INVESTMENT", "INSURANCE"] as const;

const L = {
  chooseLang: "Welcome to BodaPesa / Karibu BodaPesa\n1. Kiswahili\n2. English\n3. Sheng",
  mainMenu: {
    SW: "BodaPesa\n1. Jifunze kuhusu pesa\n2. Bidhaa za kifedha\n3. Akiba yangu\n4. Ujumbe wangu\n5. Wasifu wangu\n6. Badilisha lugha",
    EN: "BodaPesa\n1. Learn about money\n2. Financial products\n3. My savings goal\n4. My messages\n5. My profile\n6. Change language",
    SH: "BodaPesa\n1. Jifunze kuhusu doo\n2. Financial deals\n3. Savings yangu\n4. Messages zangu\n5. Profile yangu\n6. Change lugha",
  } as Record<Lang, string>,
  modules: {
    SW: "Chagua somo:\n1. Akiba\n2. Mikopo\n3. Uwekezaji\n4. Bima\n0. Rudi",
    EN: "Choose a module:\n1. Savings\n2. Credit\n3. Investment\n4. Insurance\n0. Back",
    SH: "Chagua module:\n1. Kubank doo\n2. Loan\n3. Kuinvest\n4. Bima\n0. Back",
  } as Record<Lang, string>,
  categories: {
    SW: "Bidhaa:\n1. Akiba\n2. Mikopo\n3. Bima\n4. Uwekezaji\n5. Pensheni\n0. Rudi",
    EN: "Products:\n1. Savings\n2. Credit\n3. Insurance\n4. Investment\n5. Pension\n0. Back",
    SH: "Deals:\n1. Kubank\n2. Loan\n3. Bima\n4. Invest\n5. Pension\n0. Back",
  } as Record<Lang, string>,
  registerName: {
    SW: "Karibu BodaPesa. Andika jina lako kamili:",
    EN: "Welcome to BodaPesa. Enter your full name:",
    SH: "Karibu BodaPesa. Andika jina lako kamili:",
  } as Record<Lang, string>,
  registerDone: {
    SW: "Umesajiliwa! Utapokea masomo ya pesa bila malipo. Piga *384*7788# wakati wowote.",
    EN: "You are registered. You will receive free money lessons. Dial *384*7788# any time.",
    SH: "Umesajiliwa! Utapata masomo ya doo bure. Dial *384*7788# any time.",
  } as Record<Lang, string>,
  consent: {
    SW: "BodaPesa itahifadhi jina na nambari yako kukutumia masomo ya pesa na ofa za Stima SACCO na Britam. Jibu ACHA wakati wowote.\n1. Nakubali\n2. Sikubali",
    EN: "BodaPesa will keep your name and number to send you free money lessons and offers from Stima SACCO and Britam. Reply STOP any time.\n1. I agree\n2. No thanks",
    SH: "BodaPesa itaweka jina na number yako ikutumie masomo ya doo na offers za Stima SACCO na Britam. Reply ACHA any time.\n1. Niko sawa\n2. Hapana",
  } as Record<Lang, string>,
  declined: {
    SW: "Sawa. Hakuna kilichohifadhiwa. Piga *384*7788# ukibadili nia.",
    EN: "No problem. Nothing has been saved. Dial *384*7788# if you change your mind.",
    SH: "Sawa. Hakuna kitu imesaviwa. Dial *384*7788# ukichange mind.",
  } as Record<Lang, string>,
  interested: {
    SW: "Asante! Ombi lako limepokelewa. Afisa atakupigia simu ndani ya siku 2 za kazi.",
    EN: "Thank you. Your request has been received. An officer will call you within 2 working days.",
    SH: "Asante! Request yako imepokelewa. Officer atakucall ndani ya siku 2 za kazi.",
  } as Record<Lang, string>,
  noGoal: {
    SW: "Huna lengo la akiba. Chagua lengo:\n1. Hisa za SACCO KSh 5,000\n2. Bima ya mwaka KSh 10,000\n3. Akiba ya dharura KSh 15,000",
    EN: "You have no savings goal. Choose one:\n1. SACCO shares KSh 5,000\n2. Annual insurance KSh 10,000\n3. Emergency fund KSh 15,000",
    SH: "Huna savings goal. Chagua:\n1. SACCO shares KSh 5,000\n2. Bima ya mwaka KSh 10,000\n3. Emergency fund KSh 15,000",
  } as Record<Lang, string>,
  invalid: {
    SW: "Chaguo si sahihi. Piga tena *384*7788#",
    EN: "Invalid choice. Please dial *384*7788# again.",
    SH: "Choice si sahihi. Dial tena *384*7788#",
  } as Record<Lang, string>,
};

function langFromChoice(choice: string): Lang | null {
  if (choice === "1") return "SW";
  if (choice === "2") return "EN";
  if (choice === "3") return "SH";
  return null;
}

/** Removes the "dial *384*7788#" tail that SMS copy carries but USSD does not need. */
function stripCallToAction(s: string): string {
  return s
    .replace(/\b(Piga|Dial|Reply|Jibu)\b[^.]*\*384\*7788#[^.]*\.?/gi, "")
    .replace(/^BodaPesa:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, max = 155): string {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}

async function logSession(req: UssdRequest, riderId: string | null, response: string, state: string) {
  const existing = await one<{ id: string; transcript: string }>(
    "SELECT id, transcript FROM UssdSession WHERE sessionId = ?",
    [req.sessionId],
  );
  const line = `> ${req.text || "(dial)"}\n< ${response}\n`;
  if (existing) {
    await update("UssdSession", existing.id, {
      state,
      riderId,
      transcript: existing.transcript + line,
      active: response.startsWith("CON") ? 1 : 0,
      updatedAt: now(),
    });
  } else {
    await insert("UssdSession", {
      id: id("uss"),
      sessionId: req.sessionId,
      msisdn: req.phoneNumber,
      riderId,
      state,
      contextJson: "{}",
      transcript: line,
      active: response.startsWith("CON") ? 1 : 0,
      createdAt: now(),
      updatedAt: now(),
    });
  }
}

export async function handleUssd(req: UssdRequest, source: UssdSource = "provider"): Promise<string> {
  const msisdn = normaliseMsisdn(req.phoneNumber) ?? req.phoneNumber;
  const parts = req.text.split("*").filter((p) => p !== "");
  const rider = await one<Rider>("SELECT * FROM Rider WHERE msisdn = ?", [msisdn]);

  // The web simulator must not become a way to read a real rider's profile
  // and savings by typing their number.
  if (source === "web" && rider && !Number(rider.isSynthetic) && !env.demoMode) {
    return END(
      "This number belongs to a registered rider. For their privacy it can only be used from their own phone. Try a different number.",
    );
  }

  const response = await route(req, msisdn, rider, parts, source);
  await logSession(req, rider?.id ?? null, response, parts.join("*") || "ROOT");
  if (rider) await update("Rider", rider.id, { lastActiveAt: now() });
  return response;
}

async function route(
  req: UssdRequest,
  msisdn: string,
  rider: Rider | null,
  parts: string[],
  source: UssdSource,
): Promise<string> {
  // ---------------------------------------------------- new rider flow ----
  if (!rider) {
    if (parts.length === 0) return CON(L.chooseLang);
    const lang = langFromChoice(parts[0]);
    if (!lang) return END(L.invalid.EN);
    if (parts.length === 1) return CON(L.registerName[lang]);

    const name = parts[1].trim();
    if (parts.length === 2) {
      const stages = await all<{ id: string; name: string }>("SELECT id, name FROM Stage ORDER BY name LIMIT 9");
      const list = stages.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
      return CON(`${lang === "EN" ? "Choose your stage:" : "Chagua kituo chako:"}\n${list}`);
    }

    // parts[2] = stage choice -> create the rider
    const stages = await all<{ id: string; name: string }>("SELECT id, name FROM Stage ORDER BY name LIMIT 9");
    const stage = stages[Number(parts[2]) - 1];
    if (!stage) return END(L.invalid[lang]);

    // Consent is asked for explicitly, in the rider's language, before
    // anything is stored (Data Protection Act 2019, s.30 and s.32).
    if (parts.length === 3) return CON(L.consent[lang]);
    if (parts[3] !== "1") return END(L.declined[lang]);

    const [firstName, ...rest] = name.split(" ");
    const riderId = id("rdr");
    await insert("Rider", {
      id: riderId,
      msisdn,
      firstName: firstName || "Rider",
      lastName: rest.join(" ") || "-",
      nationalId: null,
      gender: null,
      ageBand: null,
      language: lang,
      channelPref: "USSD",
      stageId: stage.id,
      dailyIncomeBand: null,
      ownsMotorbike: 0,
      hasBankAccount: 0,
      saccoMember: 0,
      hasInsurance: 0,
      usesMobileMoney: 1,
      status: "ENROLLED",
      literacyScore: 0,
      consent: 1,
      consentAt: now(),
      registeredVia: "USSD",
      isSynthetic: source === "web" ? 1 : 0,
      lastActiveAt: now(),
      createdAt: now(),
      updatedAt: now(),
    });
    if (source === "provider") inBackground(() => sendWelcome(riderId));
    return END(L.registerDone[lang]);
  }

  // ------------------------------------------------- registered riders ----
  const lang = rider.language;
  if (parts.length === 0) return CON(L.mainMenu[lang]);

  switch (parts[0]) {
    // ------------------------------------------------------ 1. LEARN ----
    case "1": {
      if (parts.length === 1) return CON(L.modules[lang]);
      if (parts[1] === "0") return CON(L.mainMenu[lang]);

      const moduleKey = MODULES[Number(parts[1]) - 1];
      if (!moduleKey) return END(L.invalid[lang]);

      const lessons = await all<Lesson>(
        `SELECT * FROM Lesson WHERE moduleKey = ? AND active = 1 ORDER BY "order"`,
        [moduleKey],
      );
      if (parts.length === 2) {
        const list = lessons.map((l, i) => `${i + 1}. ${truncate(pick(l, "title", lang), 32)}`).join("\n");
        return CON(`${list}\n0. ${lang === "EN" ? "Back" : "Rudi"}`);
      }

      const lesson = lessons[Number(parts[2]) - 1];
      if (!lesson) return END(L.invalid[lang]);

      if (parts.length === 3) {
        // Deliver the condensed lesson, then offer the quiz. The "dial the
        // short code" call to action is stripped — the rider is already in it.
        const sms = stripCallToAction(pick(lesson, "sms", lang));
        await recordProgress(rider.id, lesson.id);
        return CON(`${truncate(sms, 128)}\n1. ${lang === "EN" ? "Take the quiz" : "Fanya jaribio"}\n0. ${lang === "EN" ? "Back" : "Rudi"}`);
      }

      // Quiz flow: parts[3] = "1" to start, parts[4..] = answers
      if (parts[3] !== "1") return CON(L.mainMenu[lang]);
      const questions = await all<{ id: string; promptEn: string; promptSw: string; promptSh: string; optionsJson: string; correctIndex: number }>(
        `SELECT * FROM QuizQuestion WHERE lessonId = ? ORDER BY "order"`,
        [lesson.id],
      );
      const answers = parts.slice(4);
      if (answers.length < questions.length) {
        const q = questions[answers.length];
        const opts = JSON.parse(q.optionsJson) as Record<string, string[]>;
        const key = lang === "EN" ? "en" : lang === "SH" ? "sh" : "sw";
        const list = (opts[key] ?? opts.en).map((o, i) => `${i + 1}. ${truncate(o, 38)}`).join("\n");
        return CON(`${truncate(pick(q, "prompt", lang), 70)}\n${list}`);
      }

      const score = questions.reduce(
        (acc, q, i) => acc + (Number(answers[i]) - 1 === q.correctIndex ? 1 : 0),
        0,
      );
      await insert("QuizAttempt", {
        id: id("qat"),
        riderId: rider.id,
        lessonId: lesson.id,
        score,
        total: questions.length,
        channel: "USSD",
        createdAt: now(),
      });
      await recomputeLiteracy(rider.id);
      return END(
        lang === "EN"
          ? `You scored ${score}/${questions.length}. Dial *384*7788# for the next lesson.`
          : lang === "SH"
            ? `Umepata ${score}/${questions.length}. Dial *384*7788# kwa lesson inayofuata.`
            : `Umepata ${score}/${questions.length}. Piga *384*7788# kwa somo linalofuata.`,
      );
    }

    // --------------------------------------------------- 2. PRODUCTS ----
    case "2": {
      if (parts.length === 1) return CON(L.categories[lang]);
      if (parts[1] === "0") return CON(L.mainMenu[lang]);

      const cats = ["SAVINGS", "CREDIT", "INSURANCE", "INVESTMENT", "PENSION"];
      const category = cats[Number(parts[1]) - 1];
      if (!category) return END(L.invalid[lang]);

      const products = await all<Product & { partnerName: string }>(
        `SELECT p.*, pt.name AS partnerName FROM Product p JOIN Partner pt ON pt.id = p.partnerId
          WHERE p.category = ? AND p.active = 1 ORDER BY p.featured DESC, p.name LIMIT 8`,
        [category],
      );
      if (!products.length) {
        return END(lang === "EN" ? "No products in this category yet." : "Hakuna bidhaa kwa sasa.");
      }

      if (parts.length === 2) {
        const list = products.map((p, i) => `${i + 1}. ${truncate(p.name, 34)}`).join("\n");
        return CON(`${list}\n0. ${lang === "EN" ? "Back" : "Rudi"}`);
      }

      const product = products[Number(parts[2]) - 1];
      if (!product) return END(L.invalid[lang]);

      if (parts.length === 3) {
        const summary = truncate(pick(product, "summary", lang), 105);
        return CON(
          `${product.name}\n${summary}\n1. ${lang === "EN" ? "I'm interested" : lang === "SH" ? "Niko down" : "Ninavutiwa"}\n0. ${lang === "EN" ? "Back" : "Rudi"}`,
        );
      }

      if (parts[3] === "1") {
        await insert("Lead", {
          id: id("led"),
          riderId: rider.id,
          productId: product.id,
          partnerId: product.partnerId,
          status: "NEW",
          source: "USSD",
          note: null,
          valueKes: null,
          createdAt: now(),
          updatedAt: now(),
        });
        if (rider.status === "ENROLLED") await update("Rider", rider.id, { status: "ACTIVE", updatedAt: now() });
        return END(L.interested[lang]);
      }
      return CON(L.mainMenu[lang]);
    }

    // ----------------------------------------------- 3. SAVINGS GOAL ----
    case "3": {
      const goal = await one<{ id: string; title: string; targetAmount: number; dailyTarget: number }>(
        "SELECT * FROM SavingsGoal WHERE riderId = ? ORDER BY createdAt DESC LIMIT 1",
        [rider.id],
      );

      if (!goal) {
        if (parts.length === 1) return CON(L.noGoal[lang]);
        const presets = [
          { title: "SACCO share capital", amount: 5000 },
          { title: "Annual insurance premium", amount: 10000 },
          { title: "Emergency fund", amount: 15000 },
        ];
        const chosen = presets[Number(parts[1]) - 1];
        if (!chosen) return END(L.invalid[lang]);
        await insert("SavingsGoal", {
          id: id("gol"),
          riderId: rider.id,
          title: chosen.title,
          targetAmount: chosen.amount,
          dailyTarget: Math.round(chosen.amount / 180 / 10) * 10,
          targetDate: new Date(Date.now() + 180 * 86400000).toISOString(),
          createdAt: now(),
        });
        return END(
          lang === "EN"
            ? `Goal set: ${chosen.title}, KSh ${chosen.amount.toLocaleString()}. Save about KSh ${Math.round(chosen.amount / 180)} a day.`
            : `Lengo: ${chosen.title}, KSh ${chosen.amount.toLocaleString()}. Weka takriban KSh ${Math.round(chosen.amount / 180)} kwa siku.`,
        );
      }

      const saved = await count("SELECT COALESCE(SUM(amount),0) AS n FROM SavingsDeposit WHERE goalId = ?", [goal.id]);
      const pctDone = Math.round((saved / goal.targetAmount) * 100);

      if (parts.length === 1) {
        return CON(
          `${truncate(goal.title, 30)}\n${lang === "EN" ? "Saved" : "Umeweka"}: KSh ${saved.toLocaleString()} / ${goal.targetAmount.toLocaleString()} (${pctDone}%)\n1. ${lang === "EN" ? "Record a deposit" : "Weka akiba"}\n0. ${lang === "EN" ? "Back" : "Rudi"}`,
        );
      }
      if (parts[1] === "1" && parts.length === 2) {
        return CON(lang === "EN" ? "Enter amount in KSh:" : "Andika kiasi cha KSh:");
      }
      if (parts[1] === "1" && parts.length === 3) {
        const amount = Number(parts[2].replace(/[^0-9]/g, ""));
        if (!amount || amount < 1) return END(L.invalid[lang]);
        await insert("SavingsDeposit", {
          id: id("dep"),
          goalId: goal.id,
          amount,
          note: "Recorded via USSD",
          createdAt: now(),
        });
        const total = saved + amount;
        return END(
          lang === "EN"
            ? `Recorded KSh ${amount.toLocaleString()}. Total saved: KSh ${total.toLocaleString()} of ${goal.targetAmount.toLocaleString()}.`
            : `Imerekodiwa KSh ${amount.toLocaleString()}. Jumla: KSh ${total.toLocaleString()} kati ya ${goal.targetAmount.toLocaleString()}.`,
        );
      }
      return CON(L.mainMenu[lang]);
    }

    // --------------------------------------------------- 4. MESSAGES ----
    case "4": {
      const messages = await all<{ body: string; createdAt: string }>(
        "SELECT body, createdAt FROM Message WHERE riderId = ? AND direction = 'OUT' ORDER BY createdAt DESC LIMIT 3",
        [rider.id],
      );
      if (!messages.length) {
        return END(lang === "EN" ? "You have no messages yet." : "Huna ujumbe kwa sasa.");
      }
      return END(messages.map((m) => truncate(m.body, 55)).join("\n---\n"));
    }

    // ---------------------------------------------------- 5. PROFILE ----
    case "5": {
      const stage = rider.stageId
        ? await one<{ name: string }>("SELECT name FROM Stage WHERE id = ?", [rider.stageId])
        : null;
      const lessonsDone = await count("SELECT COUNT(*) AS n FROM LessonProgress WHERE riderId = ?", [rider.id]);
      return END(
        `${rider.firstName} ${rider.lastName}\n${stage?.name ?? "-"}\n${lang === "EN" ? "Lessons" : "Masomo"}: ${lessonsDone}/12\n${lang === "EN" ? "Score" : "Alama"}: ${rider.literacyScore}/100`,
      );
    }

    // --------------------------------------------------- 6. LANGUAGE ----
    case "6": {
      if (parts.length === 1) return CON(L.chooseLang);
      const newLang = langFromChoice(parts[1]);
      if (!newLang) return END(L.invalid[lang]);
      await update("Rider", rider.id, { language: newLang, updatedAt: now() });
      return END(
        newLang === "EN" ? "Language set to English." : newLang === "SH" ? "Lugha imewekwa: Sheng." : "Lugha imewekwa: Kiswahili.",
      );
    }

    default:
      return END(L.invalid[lang]);
  }
}

async function recordProgress(riderId: string, lessonId: string) {
  const existing = await one("SELECT id FROM LessonProgress WHERE riderId = ? AND lessonId = ?", [riderId, lessonId]);
  if (existing) return;
  await insert("LessonProgress", {
    id: id("lpr"),
    riderId,
    lessonId,
    channel: "USSD",
    completedAt: now(),
  });
  await run("UPDATE Rider SET status = CASE WHEN status = 'ENROLLED' THEN 'ACTIVE' ELSE status END WHERE id = ?", [riderId]);
}

/**
 * The financial literacy score blends curriculum coverage with quiz accuracy:
 * 60% of the score comes from lessons completed, 40% from how well the rider
 * answered. It is the platform's primary impact measure.
 */
export async function recomputeLiteracy(riderId: string) {
  const lessonsTotal = await count("SELECT COUNT(*) AS n FROM Lesson WHERE active = 1") || 1;
  const done = await count("SELECT COUNT(*) AS n FROM LessonProgress WHERE riderId = ?", [riderId]);
  const attempt = await one<{ s: number; t: number }>(
    "SELECT COALESCE(SUM(score),0) AS s, COALESCE(SUM(total),0) AS t FROM QuizAttempt WHERE riderId = ?",
    [riderId],
  );
  const coverage = Math.min(1, done / lessonsTotal);
  const accuracy = attempt && attempt.t > 0 ? attempt.s / attempt.t : 0;
  const score = Math.round((coverage * 0.6 + accuracy * 0.4) * 100);
  await update("Rider", riderId, { literacyScore: score, updatedAt: now() });
  return score;
}
