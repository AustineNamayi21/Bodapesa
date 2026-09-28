import { NextResponse } from "next/server";
import { now, one, update } from "@/lib/db";
import { recordInbound } from "@/lib/channels/dispatch";
import { normaliseMsisdn } from "@/lib/i18n";
import type { Rider } from "@/lib/types";

/**
 * WhatsApp Cloud API webhook — handles both the verification handshake Meta
 * requires and the status/message callbacks that follow.
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

interface WhatsAppPayload {
  entry?: {
    changes?: {
      value?: {
        statuses?: { id: string; status: string; errors?: { title: string }[] }[];
        messages?: { from: string; text?: { body: string } }[];
      };
    }[];
  }[];
}

export async function POST(request: Request) {
  const payload = (await request.json()) as WhatsAppPayload;

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
          await update("Message", message.id, { status: "FAILED", error: s.errors?.[0]?.title ?? "Failed" });
        }
      }

      // Inbound messages from riders
      for (const m of change.value?.messages ?? []) {
        const msisdn = normaliseMsisdn(m.from);
        if (!msisdn) continue;
        const rider = await one<Rider>("SELECT * FROM Rider WHERE msisdn = ?", [msisdn]);
        if (!rider) continue;
        await recordInbound(rider.id, "WHATSAPP", m.text?.body ?? "", rider.language);
        await update("Rider", rider.id, { lastActiveAt: now() });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
