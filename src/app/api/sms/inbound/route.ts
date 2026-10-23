import { NextResponse } from "next/server";
import { checkWebhookSecret, clientKey, rateLimit } from "@/lib/env";
import { normaliseMsisdn } from "@/lib/i18n";
import { handleKeywordMessage } from "@/lib/channels/keywords";
import { PROVIDERS } from "@/lib/channels/providers";
import { ensureSeeded } from "@/lib/seed";

/** Inbound SMS — the keyword interface (see lib/channels/keywords.ts). */

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

  const result = await handleKeywordMessage(msisdn, text, "SMS");
  if (result.reply && result.send) await PROVIDERS.SMS.send(msisdn, result.reply);
  return NextResponse.json({ ok: true, keyword: result.keyword, reply: result.reply });
}
