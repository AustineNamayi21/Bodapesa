import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { now, one, update } from "@/lib/db";
import { sendDirect } from "@/lib/channels/dispatch";
import { handleKeywordMessage } from "@/lib/channels/keywords";
import { PROVIDERS } from "@/lib/channels/providers";
import { clientKey, rateLimit } from "@/lib/env";
import { normaliseMsisdn } from "@/lib/i18n";
import { ensureSeeded } from "@/lib/seed";
import type { Rider } from "@/lib/types";

/**
 * WhatsApp Cloud API webhook — the verification handshake Meta requires, then
 * delivery receipts and inbound messages.
 *
 * A rider who writes to the business number opens a 24-hour window in which
 * replies are free-form and free of charge, so every inbound message gets an
 * immediate keyword reply (SOMO, NDIO, AKIBA, ACHA, JIUNGE …).
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === (process.env.WHATSAPP_VERIFY_TOKEN ?? "bodapesa")) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta signs every callback with the app secret (X-Hub-Signature-256). When
 * WHATSAPP_APP_SECRET is set, unsigned or wrongly signed posts are refused —
 * otherwise anyone could fake an inbound message.
 */
function signatureOk(raw: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const given = header.slice(7);
  return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

interface WhatsAppPayload {
  entry?: {
    changes?: {
      value?: {
        statuses?: { id: string; status: string; errors?: { title: string; message?: string }[] }[];
        messages?: {
          from: string;
          type?: string;
          text?: { body: string };
          button?: { text: string };
          interactive?: { button_reply?: { title: string } };
        }[];
      };
    }[];
  }[];
}

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "wa-in"), 600, 60_000)) {
    return new Response("Too Many Requests", { status: 429 });
  }
  const raw = await request.text();
  if (!signatureOk(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Forbidden", { status: 403 });
  }

  let payload: WhatsAppPayload;
  try {
    payload = JSON.parse(raw) as WhatsAppPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  await ensureSeeded();

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      // Delivery and read receipts
      for (const s of change.value?.statuses ?? []) {
        const message = await one<{ id: string }>("SELECT id FROM Message WHERE providerRef = ?", [s.id]);
        if (!message) continue;
        if (s.status === "delivered") {
          await update("Message", message.id, { status: "DELIVERED", deliveredAt: now() });
        } else if (s.status === "read") {
          await update("Message", message.id, { status: "READ", readAt: now() });
        } else if (s.status === "failed") {
          const e = s.errors?.[0];
          await update("Message", message.id, { status: "FAILED", error: e?.message ?? e?.title ?? "Failed" });
        }
      }

      // Inbound messages — answered for free inside the window they open
      for (const m of change.value?.messages ?? []) {
        const msisdn = normaliseMsisdn(m.from);
        if (!msisdn) continue;
        const text = m.text?.body ?? m.button?.text ?? m.interactive?.button_reply?.title ?? "";

        const result = await handleKeywordMessage(msisdn, text, "WHATSAPP");
        if (!result.reply || !result.send) continue;

        const rider = result.riderId ? await one<Rider>("SELECT * FROM Rider WHERE id = ?", [result.riderId]) : null;
        if (rider && Number(rider.consent) === 1) {
          // Logged like any other message, so it shows in the inbox and message log.
          await sendDirect(rider.id, "WHATSAPP", result.reply);
        } else {
          // Opt-out confirmations and replies to unknown numbers go straight out.
          await PROVIDERS.WHATSAPP.send(msisdn, result.reply);
        }
        if (rider) await update("Rider", rider.id, { lastActiveAt: now() });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
