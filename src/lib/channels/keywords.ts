import { id, insert, now, one, run, update } from "../db";
import { pick } from "../i18n";
import { recordInbound } from "./dispatch";
import type { Lang, Lesson, Rider } from "../types";

/**
 * The keyword interface, shared by SMS and WhatsApp.
 *
 * Riders reply with a single word and the platform responds. This is the
 * cheapest possible interaction: no data, no smartphone, no menu to navigate.
 * Supported keywords are deliberately few and forgiving.
 */

export type KeywordChannel = "SMS" | "WHATSAPP";

export const KEYWORDS = {
  STOP: ["stop", "acha", "sitisha", "ondoa"],
  JOIN: ["join", "jiunge", "anza", "start", "sajili"],
  YES: ["yes", "ndio", "ndiyo", "sawa", "niko"],
  LEARN: ["learn", "somo", "jifunze", "soma"],
  HELP: ["help", "msaada", "saidia"],
  BALANCE: ["akiba", "savings", "goal", "lengo"],
};

export function keywordOf(text: string): keyof typeof KEYWORDS | null {
  const word = text.trim().toLowerCase().split(/\s+/)[0];
  for (const [key, values] of Object.entries(KEYWORDS)) {
    if (values.includes(word)) return key as keyof typeof KEYWORDS;
  }
  return null;
}

export const REPLY: Record<string, Record<Lang, string>> = {
  stopped: {
    EN: "You will no longer receive BodaPesa messages. Reply JOIN to start again.",
    SW: "Hutapokea ujumbe wa BodaPesa tena. Jibu JIUNGE kuanza upya.",
    SH: "Hutapata messages za BodaPesa tena. Reply JIUNGE ukitaka kurudi.",
  },
  joined: {
    EN: "Welcome to BodaPesa. You will get free money lessons. Dial *384*14791# any time.",
    SW: "Karibu BodaPesa. Utapokea masomo ya pesa bila malipo. Piga *384*14791# wakati wowote.",
    SH: "Karibu BodaPesa. Utapata masomo ya doo bure. Dial *384*14791# any time.",
  },
  interest: {
    EN: "Thank you. An officer will call you within 2 working days. Dial *384*14791# to see all products.",
    SW: "Asante. Afisa atakupigia simu ndani ya siku 2 za kazi. Piga *384*14791# kuona bidhaa zote.",
    SH: "Asante. Officer atakucall ndani ya siku 2 za kazi. Dial *384*14791# uone deals zote.",
  },
  unknown: {
    EN: "BodaPesa: reply LEARN for a lesson, YES to be contacted, AKIBA for your savings, or STOP to opt out.",
    SW: "BodaPesa: jibu SOMO kupata somo, NDIO kupigiwa simu, AKIBA kuona akiba yako, au ACHA kujiondoa.",
    SH: "BodaPesa: reply SOMO upate lesson, NDIO ukucalliwe, AKIBA uone savings, ama ACHA kuexit.",
  },
  notRegistered: {
    EN: "That number is not registered. Reply JOIN or dial *384*14791# to sign up for free.",
    SW: "Nambari hiyo haijasajiliwa. Jibu JIUNGE au piga *384*14791# kujisajili bila malipo.",
    SH: "Hiyo number haijasajiliwa. Reply JIUNGE ama dial *384*14791# ujisajili bure.",
  },
};


export interface KeywordResult {
  keyword: keyof typeof KEYWORDS | null;
  riderId: string | null;
  reply: string | null;
  /** Whether the reply should actually be sent back on the channel. */
  send: boolean;
}

/** Applies a rider's message (opt-out, join, lesson request…) and returns the reply. */
export async function handleKeywordMessage(msisdn: string, text: string, channel: KeywordChannel): Promise<KeywordResult> {
  const rider = await one<Rider>("SELECT * FROM Rider WHERE msisdn = ?", [msisdn]);
  const keyword = keywordOf(text);
  const lang: Lang = rider?.language ?? "SW";

  let reply: string;

  if (!rider) {
    if (keyword === "JOIN") {
      const riderId = id("rdr");
      await insert("Rider", {
        id: riderId,
        msisdn,
        firstName: "Rider",
        lastName: "-",
        nationalId: null,
        gender: null,
        ageBand: null,
        language: "SW",
        channelPref: channel,
        stageId: null,
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
        registeredVia: channel,
        lastActiveAt: now(),
        createdAt: now(),
        updatedAt: now(),
      });
      await recordInbound(riderId, channel, text, "SW");
      return { keyword, riderId, reply: REPLY.joined.SW, send: true };
    }
    // An unknown SMS number is not charged a reply; on WhatsApp the reply is
    // free (the sender opened the conversation) and tells them how to join.
    return { keyword, riderId: null, reply: REPLY.notRegistered.SW, send: channel === "WHATSAPP" };
  }

  await recordInbound(rider.id, channel, text, lang);
  await update("Rider", rider.id, { lastActiveAt: now() });

  switch (keyword) {
    case "STOP":
      await update("Rider", rider.id, { status: "OPTED_OUT", consent: 0, updatedAt: now() });
      reply = REPLY.stopped[lang];
      break;

    case "JOIN":
      await update("Rider", rider.id, {
        status: rider.status === "OPTED_OUT" ? "ENROLLED" : rider.status,
        consent: 1,
        consentAt: now(),
        updatedAt: now(),
      });
      reply = REPLY.joined[lang];
      break;

    case "YES": {
      // Interest in the product from the most recent campaign sent to this rider.
      const lastProduct = await one<{ productId: string; partnerId: string }>(
        `SELECT c.productId, p.partnerId FROM Message m
           JOIN Campaign c ON c.id = m.campaignId
           JOIN Product p ON p.id = c.productId
          WHERE m.riderId = ? AND c.productId IS NOT NULL
          ORDER BY m.createdAt DESC LIMIT 1`,
        [rider.id],
      );
      if (lastProduct) {
        await insert("Lead", {
          id: id("led"),
          riderId: rider.id,
          productId: lastProduct.productId,
          partnerId: lastProduct.partnerId,
          status: "NEW",
          source: channel,
          note: `Replied YES on ${channel === "SMS" ? "SMS" : "WhatsApp"}`,
          valueKes: null,
          createdAt: now(),
          updatedAt: now(),
        });
        await run("UPDATE Rider SET status = CASE WHEN status IN ('PROSPECT','ENROLLED') THEN 'ACTIVE' ELSE status END WHERE id = ?", [rider.id]);
      }
      reply = REPLY.interest[lang];
      break;
    }

    case "LEARN": {
      const lesson = await one<Lesson>(
        `SELECT * FROM Lesson WHERE active = 1
            AND id NOT IN (SELECT lessonId FROM LessonProgress WHERE riderId = ?)
          ORDER BY CASE moduleKey
                     WHEN 'SAVINGS' THEN 0 WHEN 'CREDIT' THEN 1
                     WHEN 'INVESTMENT' THEN 2 ELSE 3 END, "order" LIMIT 1`,
        [rider.id],
      );
      if (lesson) {
        await insert("LessonProgress", {
          id: id("lpr"),
          riderId: rider.id,
          lessonId: lesson.id,
          channel,
          completedAt: now(),
        });
        reply = pick(lesson, "sms", lang);
      } else {
        reply =
          lang === "EN"
            ? "You have completed every lesson. Dial *384*14791# to revisit any of them."
            : "Umekamilisha masomo yote. Piga *384*14791# kurudia lolote.";
      }
      break;
    }

    case "BALANCE": {
      const goal = await one<{ id: string; title: string; targetAmount: number }>(
        "SELECT * FROM SavingsGoal WHERE riderId = ? ORDER BY createdAt DESC LIMIT 1",
        [rider.id],
      );
      if (goal) {
        const savedRow = await one<{ n: number }>(
          "SELECT COALESCE(SUM(amount),0) AS n FROM SavingsDeposit WHERE goalId = ?",
          [goal.id],
        );
        const saved = Number(savedRow?.n ?? 0);
        reply =
          lang === "EN"
            ? `${goal.title}: KSh ${saved.toLocaleString()} saved of KSh ${goal.targetAmount.toLocaleString()}.`
            : `${goal.title}: KSh ${saved.toLocaleString()} kati ya KSh ${goal.targetAmount.toLocaleString()}.`;
      } else {
        reply =
          lang === "EN"
            ? "You have no savings goal yet. Dial *384*14791# and choose option 3 to set one."
            : "Huna lengo la akiba bado. Piga *384*14791# na uchague 3 kuweka lengo.";
      }
      break;
    }

    default:
      reply = REPLY.unknown[lang];
  }


  return { keyword, riderId: rider.id, reply, send: true };
}
