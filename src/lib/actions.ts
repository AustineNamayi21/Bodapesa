"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { id, insert, now, one, run, update } from "./db";
import { clearAdminSession, clearRiderSession, login, setRiderSession } from "./auth";
import { sendCampaign, sendDirect, sendWelcome } from "./channels/dispatch";
import { handleUssd, recomputeLiteracy } from "./channels/ussd";
import { PROVIDERS, smsMode } from "./channels/providers";
import { inBackground } from "./background";
import { normaliseMsisdn, displayMsisdn } from "./i18n";
import { env, rateLimit } from "./env";
import { currentUser } from "./auth";
import { OTP_COOKIE, OTP_TTL_MS, checkTicket, codeMessage, issueTicket, newCode, readTicket } from "./otp";
import { cookies, headers } from "next/headers";
import type { Channel, Lang, Segment } from "./types";

// ------------------------------------------------------------------ auth --

export async function loginAction(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  // Throttle by client address and by account, so neither a single source nor
  // a single mailbox can be used to grind through passwords.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login-ip:${ip}`, 10, 5 * 60_000) || !rateLimit(`login-user:${email}`, 5, 5 * 60_000)) {
    return { error: "Too many sign-in attempts. Please wait a few minutes and try again." };
  }

  const user = await login(email, password);
  if (!user) return { error: "Those credentials were not recognised." };
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

// ---------------------------------------------------------------- riders --

export async function createRiderAction(_prev: unknown, formData: FormData) {
  const msisdn = normaliseMsisdn(String(formData.get("msisdn") ?? ""));
  if (!msisdn) return { error: "Enter a valid Kenyan phone number, e.g. 0712 345 678." };

  const existing = await one("SELECT id FROM Rider WHERE msisdn = ?", [msisdn]);
  if (existing) return { error: "A rider with that number is already registered." };

  const riderId = id("rdr");
  await insert("Rider", {
    id: riderId,
    msisdn,
    firstName: String(formData.get("firstName") ?? "").trim() || "Rider",
    lastName: String(formData.get("lastName") ?? "").trim() || "-",
    nationalId: String(formData.get("nationalId") ?? "").trim() || null,
    gender: String(formData.get("gender") ?? "") || null,
    ageBand: String(formData.get("ageBand") ?? "") || null,
    language: String(formData.get("language") ?? "SW"),
    channelPref: String(formData.get("channelPref") ?? "SMS"),
    stageId: String(formData.get("stageId") ?? "") || null,
    dailyIncomeBand: String(formData.get("dailyIncomeBand") ?? "") || null,
    ownsMotorbike: formData.get("ownsMotorbike") ? 1 : 0,
    hasBankAccount: formData.get("hasBankAccount") ? 1 : 0,
    saccoMember: formData.get("saccoMember") ? 1 : 0,
    hasInsurance: formData.get("hasInsurance") ? 1 : 0,
    usesMobileMoney: formData.get("usesMobileMoney") ? 1 : 0,
    status: "PROSPECT",
    literacyScore: 0,
    consent: formData.get("consent") ? 1 : 0,
    consentAt: formData.get("consent") ? now() : null,
    registeredVia: "FIELD",
    lastActiveAt: null,
    createdAt: now(),
    updatedAt: now(),
  });

  // The rider is standing in front of the field officer: a welcome SMS
  // arriving on their phone confirms the number and completes onboarding.
  if (formData.get("consent")) inBackground(() => sendWelcome(riderId));

  revalidatePath("/admin/riders");
  redirect(`/admin/riders/${riderId}`);
}

export async function updateRiderStatusAction(formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const status = String(formData.get("status"));
  await update("Rider", riderId, { status, updatedAt: now() });
  revalidatePath(`/admin/riders/${riderId}`);
  revalidatePath("/admin/riders");
}

export async function sendDirectMessageAction(_prev: unknown, formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const channel = String(formData.get("channel")) as Channel;
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a message first." };
  const result = await sendDirect(riderId, channel, body);
  revalidatePath(`/admin/riders/${riderId}`);
  return result.ok ? { ok: "Message sent." } : { error: result.error ?? "Send failed." };
}

// ------------------------------------------------------------- campaigns --

function buildSegment(formData: FormData): Segment {
  const multi = (key: string) => formData.getAll(key).map(String).filter(Boolean);
  const tri = (key: string) => {
    const v = String(formData.get(key) ?? "any");
    return v === "any" ? undefined : v === "yes";
  };
  const literacy = String(formData.get("literacyBelow") ?? "");
  return {
    consentOnly: true,
    stageIds: multi("stageIds").length ? multi("stageIds") : undefined,
    subCounties: multi("subCounties").length ? multi("subCounties") : undefined,
    languages: multi("languages").length ? (multi("languages") as Lang[]) : undefined,
    statuses: multi("statuses").length ? (multi("statuses") as Segment["statuses"]) : undefined,
    incomeBands: multi("incomeBands").length ? multi("incomeBands") : undefined,
    saccoMember: tri("saccoMember"),
    hasInsurance: tri("hasInsurance"),
    hasBankAccount: tri("hasBankAccount"),
    literacyBelow: literacy ? Number(literacy) : undefined,
  };
}

export async function createCampaignAction(_prev: unknown, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  const bodySw = String(formData.get("bodySw") ?? "").trim();
  const bodySh = String(formData.get("bodySh") ?? "").trim();
  const channels = formData.getAll("channels").map(String);

  if (!name) return { error: "Give the campaign a name." };
  if (!bodyEn || !bodySw) return { error: "English and Kiswahili message bodies are both required." };
  if (!channels.length) return { error: "Select at least one channel." };

  const campaignId = id("cmp");
  await insert("Campaign", {
    id: campaignId,
    name,
    objective: String(formData.get("objective") ?? "EDUCATION"),
    productId: String(formData.get("productId") ?? "") || null,
    bodyEn,
    bodySw,
    bodySh: bodySh || bodySw,
    channels: channels.join(","),
    segmentJson: JSON.stringify(buildSegment(formData)),
    status: "DRAFT",
    scheduledAt: null,
    sentAt: null,
    createdById: null,
    createdAt: now(),
    updatedAt: now(),
  });

  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${campaignId}`);
}

export async function sendCampaignAction(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  await sendCampaign(campaignId);
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin");
}

export async function deleteCampaignAction(formData: FormData) {
  const campaignId = String(formData.get("campaignId"));
  await run("DELETE FROM Campaign WHERE id = ? AND status = 'DRAFT'", [campaignId]);
  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}

// ----------------------------------------------------------------- leads --

export async function updateLeadAction(formData: FormData) {
  const leadId = String(formData.get("leadId"));
  const status = String(formData.get("status"));
  const valueRaw = String(formData.get("valueKes") ?? "");
  const patch: Record<string, unknown> = { status, updatedAt: now() };
  if (status === "CONVERTED" && valueRaw) patch.valueKes = Number(valueRaw);

  await update("Lead", leadId, patch);

  if (status === "CONVERTED") {
    const lead = await one<{ riderId: string; productId: string }>(
      "SELECT riderId, productId FROM Lead WHERE id = ?",
      [leadId],
    );
    if (lead) {
      const product = await one<{ category: string }>("SELECT category FROM Product WHERE id = ?", [lead.productId]);
      const patchRider: Record<string, unknown> = { status: "ONBOARDED", updatedAt: now() };
      if (product?.category === "INSURANCE") patchRider.hasInsurance = 1;
      if (product?.category === "SAVINGS" || product?.category === "CREDIT") patchRider.saccoMember = 1;
      await update("Rider", lead.riderId, patchRider);
    }
  }
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

// ---------------------------------------------------------- rider portal --

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export type RiderLoginState =
  | null
  | { error?: string; step?: "code"; display?: string; note?: string };

/**
 * Rider sign-in.
 *
 * In demo mode a registered number is enough, so an examiner can try the
 * portal with the sample riders. Everywhere else a phone number alone proves
 * nothing, so a six-digit code is texted to it and must be entered.
 */
export async function riderLoginAction(_prev: RiderLoginState, formData: FormData): Promise<RiderLoginState> {
  const ip = await clientIp();
  const store = await cookies();

  // ---- step 2: check the code -------------------------------------------
  if (formData.has("code")) {
    const ticket = store.get(OTP_COOKIE)?.value;
    const pending = readTicket(ticket);
    if (!pending) return { error: "That code has expired. Enter your number again." };
    const again = { step: "code" as const, display: displayMsisdn(pending.msisdn) };
    if (!rateLimit(`otp-check:${pending.msisdn}`, 5, OTP_TTL_MS) || !rateLimit(`otp-check-ip:${ip}`, 20, OTP_TTL_MS)) {
      store.delete({ name: OTP_COOKIE, path: "/rider" });
      return { error: "Too many wrong codes. Wait a few minutes, then ask for a new one." };
    }
    const msisdn = checkTicket(ticket, String(formData.get("code") ?? ""));
    if (!msisdn) return { ...again, error: "That code is not right, or it has expired." };
    const rider = await one<{ id: string }>("SELECT id FROM Rider WHERE msisdn = ?", [msisdn]);
    if (!rider) return { error: "That number is not registered." };
    store.delete({ name: OTP_COOKIE, path: "/rider" });
    await setRiderSession(rider.id);
    await update("Rider", rider.id, { lastActiveAt: now() });
    redirect("/rider/home");
  }

  // ---- step 1: the phone number -----------------------------------------
  const msisdn = normaliseMsisdn(String(formData.get("msisdn") ?? ""));
  if (!msisdn) return { error: "Enter a valid phone number, e.g. 0712 345 678." };
  if (!rateLimit(`rider-login-ip:${ip}`, 20, 10 * 60_000)) {
    return { error: "Too many attempts from this connection. Please wait a few minutes." };
  }
  const rider = await one<{ id: string; language: string; isSynthetic: number }>(
    "SELECT id, language, isSynthetic FROM Rider WHERE msisdn = ?",
    [msisdn],
  );
  if (!rider) return { error: "That number is not registered. Dial *384*14791# to join, or ask your stage chairperson." };

  // Demonstration riders hold no real person's data (their numbers were
  // generated, or typed into the web USSD simulator), so they sign in
  // directly — which lets an examiner register on the simulator and then open
  // the portal with the same number.
  if (env.demoMode || Number(rider.isSynthetic) === 1) {
    await setRiderSession(rider.id);
    await update("Rider", rider.id, { lastActiveAt: now() });
    redirect("/rider/home");
  }
  const mode = smsMode();
  if (mode === "simulated") {
    return { error: "Sign-in codes are sent by SMS, and SMS is not configured on this deployment yet." };
  }
  if (!rateLimit(`otp-send:${msisdn}`, 3, OTP_TTL_MS)) {
    return { error: "A code was sent recently. Wait a few minutes before asking for another." };
  }

  const code = newCode();
  // Sent straight to the provider rather than through the message log, so
  // the code never appears in the admin console or the rider's inbox.
  const result = await PROVIDERS.SMS.send(msisdn, codeMessage(code, rider.language));
  if (result.status !== "SENT") {
    return { error: `We could not send the code: ${result.error ?? "the SMS gateway refused it"}.` };
  }
  store.set(OTP_COOKIE, issueTicket(msisdn, code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/rider",
    maxAge: OTP_TTL_MS / 1000,
  });
  return {
    step: "code",
    display: displayMsisdn(msisdn),
    note:
      mode === "sandbox"
        ? "Sandbox mode: the code appears in the Africa's Talking simulator, not on a real phone."
        : undefined,
  };
}

export async function riderLogoutAction() {
  await clearRiderSession();
  redirect("/rider");
}

export async function setRiderLanguageAction(formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const language = String(formData.get("language"));
  await update("Rider", riderId, { language, updatedAt: now() });
  revalidatePath("/rider", "layout");
}

export async function completeLessonAction(formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const lessonId = String(formData.get("lessonId"));
  const existing = await one("SELECT id FROM LessonProgress WHERE riderId = ? AND lessonId = ?", [riderId, lessonId]);
  if (!existing) {
    await insert("LessonProgress", {
      id: id("lpr"),
      riderId,
      lessonId,
      channel: "APP",
      completedAt: now(),
    });
  }
  await run("UPDATE Rider SET status = CASE WHEN status IN ('PROSPECT','ENROLLED') THEN 'ACTIVE' ELSE status END WHERE id = ?", [riderId]);
  await recomputeLiteracy(riderId);
  revalidatePath("/rider", "layout");
}

export async function submitQuizAction(_prev: unknown, formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const lessonId = String(formData.get("lessonId"));
  const questionIds = formData.getAll("questionId").map(String);

  let score = 0;
  const results: { questionId: string; correct: boolean; chosen: number }[] = [];
  for (const qid of questionIds) {
    const q = await one<{ correctIndex: number }>("SELECT correctIndex FROM QuizQuestion WHERE id = ?", [qid]);
    const chosen = Number(formData.get(`answer_${qid}`) ?? -1);
    const correct = q ? chosen === q.correctIndex : false;
    if (correct) score++;
    results.push({ questionId: qid, correct, chosen });
  }

  await insert("QuizAttempt", {
    id: id("qat"),
    riderId,
    lessonId,
    score,
    total: questionIds.length,
    channel: "APP",
    createdAt: now(),
  });

  const existing = await one("SELECT id FROM LessonProgress WHERE riderId = ? AND lessonId = ?", [riderId, lessonId]);
  if (!existing) {
    await insert("LessonProgress", { id: id("lpr"), riderId, lessonId, channel: "APP", completedAt: now() });
  }
  const literacyScore = await recomputeLiteracy(riderId);
  revalidatePath("/rider", "layout");
  return { score, total: questionIds.length, results, literacyScore };
}

export async function expressInterestAction(formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const productId = String(formData.get("productId"));
  const product = await one<{ partnerId: string }>("SELECT partnerId FROM Product WHERE id = ?", [productId]);
  if (!product) return;

  const existing = await one(
    "SELECT id FROM Lead WHERE riderId = ? AND productId = ? AND status IN ('NEW','CONTACTED','QUALIFIED')",
    [riderId, productId],
  );
  if (!existing) {
    await insert("Lead", {
      id: id("led"),
      riderId,
      productId,
      partnerId: product.partnerId,
      status: "NEW",
      source: "APP",
      note: null,
      valueKes: null,
      createdAt: now(),
      updatedAt: now(),
    });
  }
  await run("UPDATE Rider SET status = CASE WHEN status IN ('PROSPECT','ENROLLED') THEN 'ACTIVE' ELSE status END WHERE id = ?", [riderId]);
  revalidatePath("/rider", "layout");
  revalidatePath("/admin/leads");
}

export async function createGoalAction(_prev: unknown, formData: FormData) {
  const riderId = String(formData.get("riderId"));
  const title = String(formData.get("title") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount") ?? 0);
  const days = Number(formData.get("days") ?? 180);
  if (!title || !targetAmount) return { error: "Give your goal a name and an amount." };

  await insert("SavingsGoal", {
    id: id("gol"),
    riderId,
    title,
    targetAmount,
    dailyTarget: Math.max(10, Math.round(targetAmount / days / 10) * 10),
    targetDate: new Date(Date.now() + days * 86400000).toISOString(),
    createdAt: now(),
  });
  revalidatePath("/rider", "layout");
  return { ok: "Goal created." };
}

export async function addDepositAction(_prev: unknown, formData: FormData) {
  const goalId = String(formData.get("goalId"));
  const amount = Number(formData.get("amount") ?? 0);
  if (!amount || amount <= 0) return { error: "Enter an amount." };
  await insert("SavingsDeposit", {
    id: id("dep"),
    goalId,
    amount,
    note: String(formData.get("note") ?? "") || null,
    createdAt: now(),
  });
  revalidatePath("/rider", "layout");
  return { ok: "Deposit recorded." };
}

// ---------------------------------------------------------- integrations --

/**
 * Sends one real message to a number of the administrator's choosing, so a
 * live integration can be proven end to end — dispatch, provider acceptance,
 * and the delivery report arriving back on the webhook.
 *
 * The number is stored as a rider flagged registeredVia = 'TEST', which gives
 * the message a proper row for the delivery report to update, while keeping
 * the number out of every campaign audience.
 */
export async function sendTestMessageAction(_prev: unknown, formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "PLATFORM_ADMIN") return { error: "Only the platform administrator can send test messages." };

  const msisdn = normaliseMsisdn(String(formData.get("msisdn") ?? ""));
  if (!msisdn) return { error: "Enter a valid Kenyan number, e.g. 0712 345 678." };

  const channel = String(formData.get("channel") ?? "SMS") as Channel;
  const body =
    String(formData.get("body") ?? "").trim() ||
    "BodaPesa test: this message was sent from the platform to confirm live delivery.";

  if (!rateLimit(`test-send:${user.id}`, 20, 60 * 60_000)) {
    return { error: "Test-send limit reached (20 per hour). This protects your account balance." };
  }

  let rider = await one<{ id: string }>("SELECT id FROM Rider WHERE msisdn = ?", [msisdn]);
  if (!rider) {
    const riderId = id("rdr");
    await insert("Rider", {
      id: riderId,
      msisdn,
      firstName: "Test",
      lastName: "Recipient",
      nationalId: null,
      gender: null,
      ageBand: null,
      language: "EN",
      channelPref: channel,
      stageId: null,
      dailyIncomeBand: null,
      ownsMotorbike: 0,
      hasBankAccount: 0,
      saccoMember: 0,
      hasInsurance: 0,
      usesMobileMoney: 1,
      status: "PROSPECT",
      literacyScore: 0,
      consent: 1,
      consentAt: now(),
      registeredVia: "TEST",
      lastActiveAt: null,
      createdAt: now(),
      updatedAt: now(),
    });
    rider = { id: riderId };
  }

  const result = await sendDirect(rider.id, channel, body);
  revalidatePath("/admin/integrations");
  return result.ok
    ? { ok: `Accepted by the provider. Watch the status below change to DELIVERED once the network confirms.` }
    : { error: result.error ?? "The provider rejected the message." };
}

// ------------------------------------------------------- USSD simulator --

/**
 * The on-site USSD handset. It calls the menu engine directly rather than the
 * public /api/ussd webhook, which is locked to Africa's Talking by the
 * webhook secret — and it marks itself as the web source, so numbers typed
 * into it are never treated as a real rider's phone.
 */
export async function ussdSimulatorAction(sessionId: string, phone: string, text: string): Promise<string> {
  if (!rateLimit(`ussd-web:${await clientIp()}`, 120, 60_000)) {
    return "END Too many requests. Please wait a minute.";
  }
  const phoneNumber = normaliseMsisdn(phone);
  if (!phoneNumber) return "END Enter a valid Kenyan number, e.g. 0712 345 678.";
  const sid = `web_${String(sessionId).replace(/[^\w-]/g, "").slice(0, 40)}`;
  return handleUssd({ sessionId: sid, phoneNumber, text: String(text).slice(0, 200), serviceCode: "*384*14791#" }, "web");
}
