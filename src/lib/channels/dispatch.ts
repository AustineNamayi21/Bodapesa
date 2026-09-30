import { all, bulkInsert, id, insert, now, one, run, update } from "../db";
import { parseSegment, segmentRiders } from "../segments";
import { PROVIDERS, simulatedSend } from "./providers";
import type { Campaign, Channel, Lang, Rider } from "../types";

/**
 * Chooses the channel to use for a given rider.
 *
 * The rider's stated preference wins whenever the campaign includes it —
 * respecting how each person actually wants to be reached is what keeps
 * opt-out rates low. Otherwise the campaign's channels are tried in
 * cost-effective order.
 */
export function resolveChannel(rider: Rider, campaignChannels: Channel[]): Channel {
  if (campaignChannels.includes(rider.channelPref)) return rider.channelPref;
  const order: Channel[] = ["SMS", "WHATSAPP", "APP", "USSD"];
  return order.find((c) => campaignChannels.includes(c)) ?? "SMS";
}

export function bodyFor(campaign: Pick<Campaign, "bodyEn" | "bodySw" | "bodySh">, lang: Lang): string {
  if (lang === "EN") return campaign.bodyEn;
  if (lang === "SH") return campaign.bodySh || campaign.bodySw || campaign.bodyEn;
  return campaign.bodySw || campaign.bodyEn;
}


/**
 * WhatsApp allows free-form text only within 24 hours of the rider's last
 * inbound message. Outside that window a business-initiated message must use
 * an approved template, so the window is checked per rider before dispatch.
 */
async function withinServiceWindow(riderId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const row = await one<{ id: string }>(
    `SELECT id FROM Message
      WHERE riderId = ? AND direction = 'IN' AND channel = 'WHATSAPP' AND createdAt >= ?
      LIMIT 1`,
    [riderId, cutoff],
  );
  return Boolean(row);
}

export interface DispatchReport {
  campaignId: string;
  audience: number;
  queued: number;
  sent: number;
  failed: number;
  costKes: number;
  byChannel: Record<string, number>;
}

/**
 * Sends a campaign to its whole audience.
 *
 * Every message is persisted before the provider is called, so a crash mid-run
 * never loses the record of who was targeted, and a retry can pick up exactly
 * the messages still marked QUEUED.
 */
export async function sendCampaign(campaignId: string): Promise<DispatchReport> {
  const campaign = await one<Campaign>("SELECT * FROM Campaign WHERE id = ?", [campaignId]);
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status === "SENT" || campaign.status === "SENDING") {
    throw new Error("Campaign has already been sent");
  }

  await update("Campaign", campaignId, { status: "SENDING", updatedAt: now() });

  const channels = campaign.channels.split(",").map((c) => c.trim()) as Channel[];
  const audience = await segmentRiders(parseSegment(campaign.segmentJson));

  const report: DispatchReport = {
    campaignId,
    audience: audience.length,
    queued: 0,
    sent: 0,
    failed: 0,
    costKes: 0,
    byChannel: {},
  };

  // 1. Persist every intended message first, in one batched write.
  const queued: {
    messageId: string;
    msisdn: string;
    body: string;
    channel: Channel;
    riderId: string;
    language: Lang;
    synthetic: boolean;
  }[] = [];
  const rows: Record<string, unknown>[] = [];
  for (const rider of audience) {
    const channel = resolveChannel(rider, channels);
    const body = bodyFor(campaign, rider.language);
    const messageId = id("msg");
    rows.push({
      id: messageId,
      campaignId,
      riderId: rider.id,
      channel,
      language: rider.language,
      body,
      direction: "OUT",
      status: "QUEUED",
      providerRef: null,
      costKes: 0,
      error: null,
      createdAt: now(),
      sentAt: null,
      deliveredAt: null,
      readAt: null,
    });
    queued.push({
      messageId,
      msisdn: rider.msisdn,
      body,
      channel,
      riderId: rider.id,
      language: rider.language,
      synthetic: Number(rider.isSynthetic) === 1,
    });
    report.queued++;
    report.byChannel[channel] = (report.byChannel[channel] ?? 0) + 1;
  }
  await bulkInsert("Message", rows);

  // 2. Hand each queued message to its provider, in batches.
  const BATCH = 25;
  for (let i = 0; i < queued.length; i += BATCH) {
    const batch = queued.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (m) => {
        const provider = PROVIDERS[m.channel];
        const options =
          m.channel === "WHATSAPP" && !m.synthetic
            ? { useTemplate: !(await withinServiceWindow(m.riderId)), language: m.language }
            : undefined;
        // Synthetic riders are never sent a real message, even on a live account.
        const result = m.synthetic
          ? await simulatedSend(m.channel, m.body)
          : await provider.send(m.msisdn, m.body, options);
        if (result.status === "SENT") {
          report.sent++;
          report.costKes += result.costKes;
          await update("Message", m.messageId, {
            status: "SENT",
            providerRef: result.providerRef ?? null,
            costKes: result.costKes,
            sentAt: now(),
          });
        } else {
          report.failed++;
          await update("Message", m.messageId, {
            status: "FAILED",
            error: result.error ?? "Unknown error",
            sentAt: now(),
          });
        }
      }),
    );
  }

  await update("Campaign", campaignId, { status: "SENT", sentAt: now(), updatedAt: now() });

  await simulateDeliveryReceipts(campaignId);

  // Riders who have now received programme content move from PROSPECT to ENROLLED.
  await run(
    `UPDATE Rider SET status = 'ENROLLED', updatedAt = ?
      WHERE status = 'PROSPECT'
        AND id IN (SELECT riderId FROM Message WHERE campaignId = ? AND status IN ('SENT','DELIVERED'))`,
    [now(), campaignId],
  );

  report.costKes = Number(report.costKes.toFixed(2));
  return report;
}

/**
 * In production, delivery status arrives asynchronously on the webhooks at
 * /api/sms/dlr and /api/whatsapp/webhook, and those handlers are what move a
 * message from SENT to DELIVERED. In sandbox mode no network ever calls back,
 * so this stands in for the operator: it applies realistic per-channel
 * delivery and read rates immediately, which keeps the dashboard's delivery
 * figures meaningful during a demo. It is a no-op for any live channel.
 */
async function simulateDeliveryReceipts(campaignId: string) {
  // Only simulated sends ("sim_" references) get simulated receipts. Real
  // sends — on a live or sandbox account — wait for the provider's own
  // delivery report on the webhook.
  const messages = await all<{ id: string; channel: Channel }>(
    // Real references start "ATXid_" (Africa's Talking) or "wamid." (Meta).
    "SELECT id, channel FROM Message WHERE campaignId = ? AND status = 'SENT' AND substr(providerRef, 1, 4) = 'sim_'",
    [campaignId],
  );

  const delivered: string[] = [];
  const read: string[] = [];
  const failedSms: string[] = [];
  const failedOther: string[] = [];

  for (const m of messages) {
    // Observed Kenyan bulk-SMS delivery sits around 92%; WhatsApp is higher
    // but only reaches handsets that actually have the app installed.
    const deliveryRate = m.channel === "SMS" ? 0.92 : m.channel === "WHATSAPP" ? 0.88 : 0.99;
    if (Math.random() > deliveryRate) {
      (m.channel === "SMS" ? failedSms : failedOther).push(m.id);
    } else if ((m.channel === "WHATSAPP" || m.channel === "APP") && Math.random() < 0.6) {
      // Only WhatsApp and the in-app inbox report a read receipt.
      read.push(m.id);
    } else {
      delivered.push(m.id);
    }
  }

  // One statement per outcome rather than one per message.
  const stamp = now();
  const apply = async (ids: string[], sql: string, extra: unknown[]) => {
    for (let i = 0; i < ids.length; i += 500) {
      const chunk = ids.slice(i, i + 500);
      await run(`${sql} WHERE id IN (${chunk.map(() => "?").join(",")})`, [...extra, ...chunk]);
    }
  };
  await apply(delivered, "UPDATE Message SET status = 'DELIVERED', deliveredAt = ?", [stamp]);
  await apply(read, "UPDATE Message SET status = 'READ', deliveredAt = ?, readAt = ?", [stamp, stamp]);
  await apply(failedSms, "UPDATE Message SET status = 'FAILED', error = ?", ["Absent subscriber"]);
  await apply(failedOther, "UPDATE Message SET status = 'FAILED', error = ?", ["Recipient unreachable"]);
}

/** Send a single ad-hoc message to one rider (used by the rider detail page). */
export async function sendDirect(
  riderId: string,
  channel: Channel,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const rider = await one<Rider>("SELECT * FROM Rider WHERE id = ?", [riderId]);
  if (!rider) return { ok: false, error: "Rider not found" };
  if (!rider.consent) return { ok: false, error: "Rider has not given messaging consent" };

  const messageId = id("msg");
  await insert("Message", {
    id: messageId,
    campaignId: null,
    riderId,
    channel,
    language: rider.language,
    body,
    direction: "OUT",
    status: "QUEUED",
    providerRef: null,
    costKes: 0,
    error: null,
    createdAt: now(),
    sentAt: null,
    deliveredAt: null,
    readAt: null,
  });

  const options =
    channel === "WHATSAPP"
      ? { useTemplate: !(await withinServiceWindow(riderId)), language: rider.language }
      : undefined;
  const result =
    Number(rider.isSynthetic) === 1
      ? await simulatedSend(channel, body)
      : await PROVIDERS[channel].send(rider.msisdn, body, options);
  await update("Message", messageId, {
    status: result.status,
    providerRef: result.providerRef ?? null,
    costKes: result.costKes,
    error: result.error ?? null,
    sentAt: now(),
  });
  return result.status === "SENT" ? { ok: true } : { ok: false, error: result.error };
}

/** Record an inbound message (SMS reply, WhatsApp message). */
export async function recordInbound(riderId: string, channel: Channel, body: string, language: Lang) {
  await insert("Message", {
    id: id("msg"),
    campaignId: null,
    riderId,
    channel,
    language,
    body,
    direction: "IN",
    status: "DELIVERED",
    providerRef: null,
    costKes: 0,
    error: null,
    createdAt: now(),
    sentAt: now(),
    deliveredAt: now(),
    readAt: now(),
  });
}

/** Messages waiting in a rider's in-app / USSD inbox. */
export async function inboxFor(riderId: string, limit = 20) {
  return await all(
    `SELECT m.*, c.name AS campaignName
       FROM Message m LEFT JOIN Campaign c ON c.id = m.campaignId
      WHERE m.riderId = ? AND m.direction = 'OUT'
      ORDER BY m.createdAt DESC LIMIT ?`,
    [riderId, limit],
  );
}

const WELCOME: Record<Lang, (name: string) => string> = {
  EN: (n) =>
    `BodaPesa: Welcome ${n}! You will get free money lessons and offers from Stima SACCO and Britam. Dial *384*14791# to learn. Reply STOP to opt out.`,
  SW: (n) =>
    `BodaPesa: Karibu ${n}! Utapokea masomo ya pesa bure na ofa za Stima SACCO na Britam. Piga *384*14791# kujifunza. Jibu ACHA kujiondoa.`,
  SH: (n) =>
    `BodaPesa: Karibu ${n}! Utapata masomo ya doo bure na offers za Stima SACCO na Britam. Dial *384*14791# ujifunze. Reply ACHA kuexit.`,
};

/** Text of the welcome SMS, kept to a single 160-character SMS part. */
export function welcomeText(firstName: string, lang: Lang): string {
  const clean = firstName.replace(/[^\p{L}\p{N} '-]/gu, "").trim();
  const name = clean && clean !== "Rider" ? clean.slice(0, 14) : lang === "EN" ? "rider" : "mwendeshaji";
  return (WELCOME[lang] ?? WELCOME.SW)(name);
}

/**
 * Welcome SMS sent the moment a rider is registered with consent — the first
 * real touchpoint, and proof to the rider that the number they gave works.
 */
export async function sendWelcome(riderId: string): Promise<{ ok: boolean; error?: string }> {
  const rider = await one<Rider>("SELECT * FROM Rider WHERE id = ?", [riderId]);
  if (!rider || !rider.consent) return { ok: false, error: "No consent" };
  return sendDirect(riderId, "SMS", welcomeText(rider.firstName, rider.language));
}
