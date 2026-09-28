import { handleUssd } from "@/lib/channels/ussd";
import { checkWebhookSecret, clientKey, rateLimit } from "@/lib/env";
import { ensureSeeded } from "@/lib/seed";

/**
 * USSD callback endpoint, in the Africa's Talking format.
 *
 * Point the service code (*384*7788#) at this URL in the Africa's Talking
 * dashboard and the live menu works with no further changes. The response is
 * plain text beginning with CON (keep the session open) or END (close it).
 */
export async function POST(request: Request) {
  const blocked = checkWebhookSecret(request);
  if (blocked) return blocked;
  if (!rateLimit(clientKey(request, "ussd"), 600, 60_000)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  await ensureSeeded();

  const contentType = request.headers.get("content-type") ?? "";
  let sessionId = "";
  let phoneNumber = "";
  let text = "";
  let serviceCode = "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string>;
    ({ sessionId = "", phoneNumber = "", text = "", serviceCode = "" } = body);
  } else {
    const form = await request.formData();
    sessionId = String(form.get("sessionId") ?? "");
    phoneNumber = String(form.get("phoneNumber") ?? "");
    text = String(form.get("text") ?? "");
    serviceCode = String(form.get("serviceCode") ?? "");
  }

  if (!sessionId || !phoneNumber) {
    return new Response("END Invalid session.", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const response = await handleUssd({ sessionId, phoneNumber, text, serviceCode });

  return new Response(response, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET() {
  return new Response(
    "BodaPesa USSD endpoint. POST sessionId, phoneNumber, text and serviceCode in the Africa's Talking format.",
    { headers: { "Content-Type": "text/plain" } },
  );
}
