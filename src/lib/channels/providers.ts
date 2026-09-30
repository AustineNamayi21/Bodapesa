import type { Channel } from "../types";

export interface SendResult {
  status: "SENT" | "FAILED";
  providerRef?: string;
  costKes: number;
  error?: string;
}

export interface SendOptions {
  /**
   * WhatsApp only. Outside the 24-hour customer service window Meta rejects
   * free-form text, so a business-initiated message must go out as an approved
   * template carrying the body as its parameter.
   */
  useTemplate?: boolean;
  /** Language of the body, used to pick the template's registered locale. */
  language?: "EN" | "SW" | "SH";
}

export interface ChannelProvider {
  readonly channel: Channel;
  readonly name: string;
  readonly live: boolean;
  send(to: string, body: string, options?: SendOptions): Promise<SendResult>;
}

const ref = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`;

/**
 * Africa's Talking SMS adapter.
 *
 * Kenyan riders overwhelmingly use feature phones or low-end smartphones with
 * intermittent data, so SMS is the backbone channel. When no API key is
 * configured the adapter runs in sandbox mode: messages are still persisted,
 * costed and reported, so the whole platform is demonstrable offline.
 */
/**
 * How a channel is currently wired:
 *   simulated — no credentials; messages are persisted and costed but no
 *               network call is made (offline demos, automated tests)
 *   sandbox   — real API calls to the provider's free sandbox; messages
 *               appear in the provider's simulator, not on real phones
 *   live      — real messages to real handsets, billed to the account
 */
export type ChannelMode = "simulated" | "sandbox" | "live";

export function smsMode(): ChannelMode {
  if (!process.env.AT_API_KEY) return "simulated";
  return (process.env.AT_USERNAME ?? "sandbox") === "sandbox" ? "sandbox" : "live";
}

/**
 * Africa's Talking per-recipient status codes. 101 and 102 mean the message
 * was accepted; everything else is a rejection with a specific cause worth
 * surfacing to whoever is running the campaign.
 */
const AT_STATUS: Record<number, string> = {
  100: "Processed",
  101: "Sent",
  102: "Queued",
  401: "Risk hold — contact Africa's Talking support",
  402: "Invalid sender ID — register one or leave AT_SENDER_ID empty",
  403: "Invalid phone number",
  404: "Unsupported number type",
  405: "Insufficient balance — top up the Africa's Talking account",
  406: "Recipient has blocked promotional messages",
  407: "Could not route to this network",
  409: "Do-not-disturb rejection",
  500: "Africa's Talking internal error",
  501: "Gateway error",
  502: "Rejected by the network",
};

export const smsProvider: ChannelProvider = {
  channel: "SMS",
  name: "Africa's Talking SMS",
  live: Boolean(process.env.AT_API_KEY),
  async send(to, body) {
    const apiKey = process.env.AT_API_KEY;
    const username = process.env.AT_USERNAME ?? "sandbox";
    // Only send a sender ID if one has actually been registered. An
    // unregistered alphanumeric sender is rejected outright (status 402);
    // omitting it makes Africa's Talking use the account's default shortcode.
    const senderId = process.env.AT_SENDER_ID?.trim();

    // Kenyan SMS is billed per 160-character GSM-7 part.
    const parts = Math.max(1, Math.ceil(body.length / 160));
    const estimatedCost = Number((parts * 0.8).toFixed(2));

    if (!apiKey) {
      await new Promise((r) => setTimeout(r, 4));
      if (Math.random() < 0.03) {
        return { status: "FAILED", costKes: 0, error: "Absent subscriber (simulated)" };
      }
      return { status: "SENT", providerRef: ref("sim"), costKes: estimatedCost };
    }

    const endpoint =
      username === "sandbox"
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";

    const form = new URLSearchParams({ username, to, message: body });
    if (senderId) form.set("from", senderId);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: form,
        signal: AbortSignal.timeout(15_000),
      });

      if (res.status === 401) {
        return { status: "FAILED", costKes: 0, error: "Africa's Talking rejected the API key or username" };
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { status: "FAILED", costKes: 0, error: `HTTP ${res.status} ${text.slice(0, 120)}`.trim() };
      }

      const data = (await res.json()) as {
        SMSMessageData?: {
          Message?: string;
          Recipients?: { messageId?: string; status?: string; statusCode?: number; cost?: string }[];
        };
      };
      const recipient = data.SMSMessageData?.Recipients?.[0];

      if (!recipient) {
        // An empty recipient list with a summary message usually means every
        // number was rejected up front (e.g. "InvalidSenderId").
        return {
          status: "FAILED",
          costKes: 0,
          error: data.SMSMessageData?.Message ?? "No recipient in provider response",
        };
      }

      const code = Number(recipient.statusCode ?? 0);
      if (code !== 101 && code !== 102 && code !== 100) {
        return {
          status: "FAILED",
          costKes: 0,
          error: AT_STATUS[code] ?? recipient.status ?? `Rejected (status ${code})`,
        };
      }

      const billed = Number(recipient.cost?.replace(/[^0-9.]/g, ""));
      return {
        status: "SENT",
        providerRef: recipient.messageId,
        costKes: Number.isFinite(billed) && billed > 0 ? billed : estimatedCost,
      };
    } catch (err) {
      const e = err as Error;
      return {
        status: "FAILED",
        costKes: 0,
        error: e.name === "TimeoutError" ? "Africa's Talking did not respond within 15s" : e.message,
      };
    }
  },
};

/** Translates the Meta error codes a campaign is most likely to hit. */
function explainMetaError(code: number | undefined, message: string | undefined): string {
  switch (code) {
    case 190:
      return "WhatsApp access token expired or invalid — generate a new one in Meta for Developers";
    case 131030:
      return "Recipient is not on the allowed test list — add the number in the Meta dashboard";
    case 131047:
      return "Outside the 24-hour window — the message must be sent as an approved template";
    case 132001:
      return "Template not found — check WHATSAPP_TEMPLATE_NAME and that it is approved in both languages";
    case 131026:
      return "Recipient cannot receive WhatsApp messages";
    default:
      return message ? message.slice(0, 200) : `WhatsApp error ${code ?? "unknown"}`;
  }
}

export function whatsappMode(): ChannelMode {
  return process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID ? "live" : "simulated";
}

/**
 * WhatsApp Cloud API adapter — used for riders on smartphones, where richer
 * content (product brochures, images, longer explanations) is possible and
 * delivery is cheaper than SMS.
 */
export const whatsappProvider: ChannelProvider = {
  channel: "WHATSAPP",
  name: "WhatsApp Cloud API",
  live: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
  async send(to, body, options) {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneId) {
      await new Promise((r) => setTimeout(r, 4));
      if (Math.random() < 0.05) {
        return { status: "FAILED", costKes: 0, error: "Recipient not on WhatsApp (simulated)" };
      }
      return { status: "SENT", providerRef: ref("sim"), costKes: 0.5 };
    }

    // WhatsApp templates are registered per language. Sheng is not a WhatsApp
    // locale, so Sheng copy is delivered under the Kiswahili template.
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "bodapesa_update";
    const templateLocale = options?.language === "EN" ? "en" : "sw";

    // The approved template reads "BodaPesa: {{1}} Reply STOP to opt out." —
    // Meta rejects templates that begin or end with a variable, so the brand
    // and opt-out text are fixed in the template. Strip them from the body so
    // riders don't see them twice, and flatten line breaks, which Meta rejects
    // inside template parameters.
    const templateParam = body
      .replace(/^\s*BodaPesa\s*:?\s*/i, "")
      .replace(/\s*(Reply|Jibu) (STOP|ACHA)[^.]*\.?\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim();

    const payload = options?.useTemplate
      ? {
          messaging_product: "whatsapp",
          to: to.replace("+", ""),
          type: "template",
          template: {
            name: templateName,
            language: { code: templateLocale },
            components: [{ type: "body", parameters: [{ type: "text", text: templateParam }] }],
          },
        }
      : {
          messaging_product: "whatsapp",
          to: to.replace("+", ""),
          type: "text",
          text: { preview_url: false, body },
        };

    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
        return { status: "FAILED", costKes: 0, error: explainMetaError(err.error?.code, err.error?.message) };
      }
      const data = (await res.json()) as { messages?: { id: string }[] };
      return { status: "SENT", providerRef: data.messages?.[0]?.id, costKes: 0.5 };
    } catch (err) {
      const e = err as Error;
      return {
        status: "FAILED",
        costKes: 0,
        error: e.name === "TimeoutError" ? "WhatsApp did not respond within 15s" : e.message,
      };
    }
  },
};

/**
 * In-app delivery. Nothing leaves the platform: the message is stored and the
 * rider sees it in their inbox next time they open the portal. Free, and the
 * right channel for riders who have already been onboarded.
 */
export const appProvider: ChannelProvider = {
  channel: "APP",
  name: "In-app inbox",
  live: true,
  async send() {
    return { status: "SENT", providerRef: ref("app"), costKes: 0 };
  },
};

/**
 * USSD is pull, not push: the rider dials the short code. A campaign targeted
 * at USSD therefore queues the message into the rider's USSD inbox, which is
 * surfaced under menu option 4 ("Ujumbe wangu") the next time they dial in.
 */
export const ussdProvider: ChannelProvider = {
  channel: "USSD",
  name: "USSD inbox (*384*14791#)",
  live: true,
  async send() {
    return { status: "SENT", providerRef: ref("ussd"), costKes: 0 };
  },
};

/**
 * A send that never leaves the platform. Used when a channel has no
 * credentials, and always for synthetic demonstration riders — whose
 * generated numbers may belong to real people — even on a live account.
 * Simulated references begin "sim_" so delivery can be simulated for them.
 */
export async function simulatedSend(channel: Channel, body: string): Promise<SendResult> {
  if (channel === "APP" || channel === "USSD") {
    return { status: "SENT", providerRef: ref("sim"), costKes: 0 };
  }
  const costKes = channel === "SMS" ? Number((Math.max(1, Math.ceil(body.length / 160)) * 0.8).toFixed(2)) : 0.5;
  return { status: "SENT", providerRef: ref("sim"), costKes };
}

export const PROVIDERS: Record<Channel, ChannelProvider> = {
  SMS: smsProvider,
  WHATSAPP: whatsappProvider,
  APP: appProvider,
  USSD: ussdProvider,
};

export function providerStatus() {
  const mode: Record<Channel, ChannelMode> = {
    SMS: smsMode(),
    WHATSAPP: whatsappMode(),
    // USSD sessions are real whenever a callback is registered; the inbox and
    // in-app channels have no external provider at all.
    USSD: "live",
    APP: "live",
  };
  return (Object.keys(PROVIDERS) as Channel[]).map((c) => ({
    channel: c,
    name: PROVIDERS[c].name,
    mode: mode[c],
    live: mode[c] === "live",
  }));
}
