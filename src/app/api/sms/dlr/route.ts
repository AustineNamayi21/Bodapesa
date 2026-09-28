import { NextResponse } from "next/server";
import { checkWebhookSecret, clientKey, rateLimit } from "@/lib/env";
import { now, one, update } from "@/lib/db";

/**
 * Delivery report webhook.
 *
 * Africa's Talking POSTs a status for every message once the network confirms
 * or rejects it. Without this, "sent" is only ever a claim — this is what makes
 * the delivery rate on the dashboard a measured figure rather than an assumed
 * one.
 */
export async function POST(request: Request) {
  const blocked = checkWebhookSecret(request);
  if (blocked) return blocked;
  if (!rateLimit(clientKey(request, "sms-dlr"), 1200, 60_000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let providerRef = "";
  let status = "";
  let failureReason = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    providerRef = body.id ?? body.messageId ?? "";
    status = body.status ?? "";
    failureReason = body.failureReason ?? "";
  } else {
    const form = await request.formData();
    providerRef = String(form.get("id") ?? form.get("messageId") ?? "");
    status = String(form.get("status") ?? "");
    failureReason = String(form.get("failureReason") ?? "");
  }

  if (!providerRef) return NextResponse.json({ error: "Missing message id" }, { status: 400 });

  const message = await one<{ id: string }>("SELECT id FROM Message WHERE providerRef = ?", [providerRef]);
  // Acknowledge reports for messages we no longer hold (e.g. after a database
  // reset) with a 200. A non-2xx response makes the provider retry the same
  // report repeatedly.
  if (!message) return NextResponse.json({ ok: true, ignored: "unknown message" });

  const normalised = status.toLowerCase();
  if (normalised === "success" || normalised === "delivered") {
    await update("Message", message.id, { status: "DELIVERED", deliveredAt: now() });
  } else if (normalised === "failed" || normalised === "rejected") {
    await update("Message", message.id, { status: "FAILED", error: failureReason || status });
  } else if (normalised === "sent" || normalised === "submitted" || normalised === "buffered") {
    // Buffered: the handset is off or out of coverage and the network is
    // holding the message. Still in flight, so it stays SENT.
    await update("Message", message.id, { status: "SENT" });
  }

  return NextResponse.json({ ok: true });
}
