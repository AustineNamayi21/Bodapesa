import { NextResponse } from "next/server";
import { checkWebhookSecret, clientKey, rateLimit } from "@/lib/env";
import { id, insert, now, one, run, update } from "@/lib/db";
import { normaliseMsisdn, pick } from "@/lib/i18n";
import { recordInbound } from "@/lib/channels/dispatch";
import { PROVIDERS } from "@/lib/channels/providers";
import { ensureSeeded } from "@/lib/seed";
import type { Lang, Lesson, Rider } from "@/lib/types";

/**
 * Inbound SMS handler — the keyword interface.
 *
 * Riders reply to a campaign with a single word and the platform responds. This
 * is the cheapest possible interaction: no data, no smartphone, no menu to
 * navigate. Supported keywords are deliberately few and forgiving.
 */

const KEYWORDS = {
  STOP: ["stop", "acha", "sitisha", "ondoa"],
  JOIN: ["join", "jiunge", "anza", "start", "sajili"],
  YES: ["yes", "ndio", "ndiyo", "sawa", "niko"],
  LEARN: ["learn", "somo", "jifunze", "soma"],
  HELP: ["help", "msaada", "saidia"],
  BALANCE: ["akiba", "savings", "goal", "lengo"],
};

function keywordOf(text: string): keyof typeof KEYWORDS | null {
  const word = text.trim().toLowerCase().split(/\s+/)[0];
  for (const [key, values] of Object.entries(KEYWORDS)) {
    if (values.includes(word)) return key as keyof typeof KEYWORDS;
  }
  return null;
}

const REPLY: Record<string, Record<Lang, string>> = {
  stopped: {
    EN: "You will no longer receive BodaPesa messages. Reply JOIN to start again.",
    SW: "Hutapokea ujumbe wa BodaPesa tena. Jibu JIUNGE kuanza upya.",
    SH: "Hutapata messages za BodaPesa tena. Reply JIUNGE ukitaka kurudi.",
  },
  joined: {
    EN: "Welcome to BodaPesa. You will get free money lessons. Dial *384*7788# any time.",
    SW: "Karibu BodaPesa. Utapokea masomo ya pesa bila malipo. Piga *384*7788# wakati wowote.",
    SH: "Karibu BodaPesa. Utapata masomo ya doo bure. Dial *384*7788# any time.",
  },
  interest: {
    EN: "Thank you. An officer will call you within 2 working days. Dial *384*7788# to see all products.",
    SW: "Asante. Afisa atakupigia simu ndani ya siku 2 za kazi. Piga *384*7788# kuona bidhaa zote.",
    SH: "Asante. Officer atakucall ndani ya siku 2 za kazi. Dial *384*7788# uone deals zote.",
  },
  unknown: {
    EN: "BodaPesa: reply LEARN for a lesson, YES to be contacted, AKIBA for your savings, or STOP to opt out.",
    SW: "BodaPesa: jibu SOMO kupata somo, NDIO kupigiwa simu, AKIBA kuona akiba yako, au ACHA kujiondoa.",
    SH: "BodaPesa: reply SOMO upate lesson, NDIO ukucalliwe, AKIBA uone savings, ama ACHA kuexit.",
  },
  notRegistered: {
    EN: "That number is not registered. Reply JOIN or dial *384*7788# to sign up for free.",
    SW: "Nambari hiyo haijasajiliwa. Jibu JIUNGE au piga *384*7788# kujisajili bila malipo.",
    SH: "Hiyo number haijasajiliwa. Reply JIUNGE ama dial *384*7788# ujisajili bure.",
  },
};

export async function POST(request: Request) {
  const blocked = checkWebhookSecret(request);
  if (blocked) return blocked;
  if (!rateLimit(clientKey(request, "sms-in"), 300, 60_000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  await ensureSeeded();

  const contentType = request.headers.get("content-type") ?? "";
  let from = "";
  let text = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    from = body.from ?? body.phoneNumber ?? "";
    text = body.text ?? body.message ?? "";
  } else {
    const form = await request.formData();
    from = String(form.get("from") ?? form.get("phoneNumber") ?? "");
    text = String(form.get("text") ?? form.get("message") ?? "");
  }

  const msisdn = normaliseMsisdn(from);
  if (!msisdn) return NextResponse.json({ error: "Invalid sender" }, { status: 400 });

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
        channelPref: "SMS",
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
        registeredVia: "SMS",
        lastActiveAt: now(),
        createdAt: now(),
        updatedAt: now(),
      });
      reply = REPLY.joined.SW;
      await recordInbound(riderId, "SMS", text, "SW");
      await PROVIDERS.SMS.send(msisdn, reply);
      return NextResponse.json({ ok: true, reply });
    }
    return NextResponse.json({ ok: true, reply: REPLY.notRegistered.SW });
  }

  await recordInbound(rider.id, "SMS", text, lang);
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
          source: "SMS",
          note: "Replied YES to an SMS campaign",
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
          channel: "SMS",
          completedAt: now(),
        });
        reply = pick(lesson, "sms", lang);
      } else {
        reply =
          lang === "EN"
            ? "You have completed every lesson. Dial *384*7788# to revisit any of them."
            : "Umekamilisha masomo yote. Piga *384*7788# kurudia lolote.";
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
            ? "You have no savings goal yet. Dial *384*7788# and choose option 3 to set one."
            : "Huna lengo la akiba bado. Piga *384*7788# na uchague 3 kuweka lengo.";
      }
      break;
    }

    default:
      reply = REPLY.unknown[lang];
  }

  await PROVIDERS.SMS.send(msisdn, reply);
  return NextResponse.json({ ok: true, keyword, reply });
}
