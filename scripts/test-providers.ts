/**
 * Contract tests for the channel adapters.
 *
 * Stubs the network with responses in the exact shape Africa's Talking and
 * Meta return, and checks the adapters build correct requests and interpret
 * every outcome — success, the common rejections, auth failure and timeout.
 *
 * Run:  npx tsx scripts/test-providers.ts
 */

type Captured = { url: string; headers: Record<string, string>; body: string };
let captured: Captured | null = null;
let nextResponse: () => Promise<Response> = async () => new Response("{}");

globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const headers: Record<string, string> = {};
  new Headers(init?.headers).forEach((v, k) => (headers[k] = v));
  captured = { url: String(input), headers, body: String(init?.body ?? "") };
  return nextResponse();
}) as typeof fetch;

const json = (status: number, payload: unknown) => async () =>
  new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });

const atRecipient = (statusCode: number, status: string, cost = "KES 0.8000") =>
  json(201, {
    SMSMessageData: {
      Message: "Sent to 1/1 Total Cost: KES 0.8000",
      Recipients: [{ statusCode, number: "+254712345678", status, cost, messageId: "ATXid_abc123" }],
    },
  });

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  // ------------------------------------------------ Africa's Talking SMS --
  process.env.AT_API_KEY = "atsk_test_key";
  process.env.AT_USERNAME = "sandbox";
  delete process.env.AT_SENDER_ID;

  const { smsProvider, smsMode, whatsappProvider } = await import("../src/lib/channels/providers");

  check("Sandbox username selects sandbox mode", smsMode() === "sandbox");

  nextResponse = atRecipient(101, "Success");
  let r = await smsProvider.send("+254712345678", "Hello rider");
  const form = new URLSearchParams(captured!.body);
  check("Calls the sandbox endpoint", captured!.url === "https://api.sandbox.africastalking.com/version1/messaging");
  check("Sends the API key header", captured!.headers["apikey"] === "atsk_test_key");
  check("Form carries username, to and message", form.get("username") === "sandbox" && form.get("to") === "+254712345678" && form.get("message") === "Hello rider");
  check("Omits sender ID when none is registered", !form.has("from"));
  check("Status 101 is accepted", r.status === "SENT" && r.providerRef === "ATXid_abc123");
  check("Billed cost is parsed from the response", r.costKes === 0.8, `got ${r.costKes}`);

  process.env.AT_SENDER_ID = "BODAPESA";
  nextResponse = atRecipient(102, "Queued");
  r = await smsProvider.send("+254712345678", "Hi");
  check("Includes sender ID once registered", new URLSearchParams(captured!.body).get("from") === "BODAPESA");
  check("Status 102 (queued) is accepted", r.status === "SENT");
  delete process.env.AT_SENDER_ID;

  nextResponse = atRecipient(405, "InsufficientBalance", "0");
  r = await smsProvider.send("+254712345678", "Hi");
  check("Insufficient balance is explained", r.status === "FAILED" && /top up/i.test(r.error ?? ""), r.error);

  nextResponse = atRecipient(402, "InvalidSenderId", "0");
  r = await smsProvider.send("+254712345678", "Hi");
  check("Invalid sender ID is explained", r.status === "FAILED" && /sender ID/i.test(r.error ?? ""), r.error);

  nextResponse = atRecipient(403, "InvalidPhoneNumber", "0");
  r = await smsProvider.send("+254712345678", "Hi");
  check("Invalid number is explained", r.status === "FAILED" && /Invalid phone/i.test(r.error ?? ""), r.error);

  nextResponse = json(201, { SMSMessageData: { Message: "InvalidSenderId", Recipients: [] } });
  r = await smsProvider.send("+254712345678", "Hi");
  check("Empty recipient list surfaces the summary", r.status === "FAILED" && r.error === "InvalidSenderId", r.error);

  nextResponse = async () => new Response("The supplied authentication is invalid", { status: 401 });
  r = await smsProvider.send("+254712345678", "Hi");
  check("Bad API key is explained", r.status === "FAILED" && /API key/i.test(r.error ?? ""), r.error);

  nextResponse = async () => {
    const e = new Error("timed out");
    e.name = "TimeoutError";
    throw e;
  };
  r = await smsProvider.send("+254712345678", "Hi");
  check("Timeout is explained", r.status === "FAILED" && /15s/.test(r.error ?? ""), r.error);

  process.env.AT_USERNAME = "bodapesa_live";
  nextResponse = atRecipient(101, "Success");
  await smsProvider.send("+254712345678", "Hi");
  check("Live username selects the production endpoint", captured!.url === "https://api.africastalking.com/version1/messaging");
  check("Live username selects live mode", smsMode() === "live");

  delete process.env.AT_API_KEY;
  check("No key means simulated mode", smsMode() === "simulated");

  // ---------------------------------------------------- WhatsApp Cloud --
  process.env.WHATSAPP_TOKEN = "EAAtest";
  process.env.WHATSAPP_PHONE_ID = "1234567890";
  process.env.WHATSAPP_TEMPLATE_NAME = "bodapesa_update";

  nextResponse = json(200, { messages: [{ id: "wamid.HBgM" }] });
  let w = await whatsappProvider.send("+254712345678", "Habari", { useTemplate: true, language: "SW" });
  let payload = JSON.parse(captured!.body);
  check("Template message uses the template type", payload.type === "template" && payload.template.name === "bodapesa_update");
  check("Kiswahili maps to the sw template locale", payload.template.language.code === "sw");
  check("Body is passed as the template parameter", payload.template.components[0].parameters[0].text === "Habari");

  await whatsappProvider.send("+254712345678", "BodaPesa: Weka akiba\nKWANZA. Reply STOP to opt out.", {
    useTemplate: true,
    language: "SW",
  });
  payload = JSON.parse(captured!.body);
  const param = payload.template.components[0].parameters[0].text;
  check("Brand prefix is not duplicated inside the template", !/^BodaPesa/i.test(param), param);
  check("Line breaks are flattened for Meta", !param.includes("\n"), JSON.stringify(param));
  check("Opt-out text is not duplicated inside the template", !/STOP/.test(param), param);
  check("Number is sent without the plus sign", payload.to === "254712345678");
  check("Bearer token is sent", captured!.headers["authorization"] === "Bearer EAAtest");
  check("Accepted template returns the message id", w.status === "SENT" && w.providerRef === "wamid.HBgM");

  await whatsappProvider.send("+254712345678", "Niaje", { useTemplate: true, language: "SH" });
  payload = JSON.parse(captured!.body);
  check("Sheng is delivered under the Kiswahili template", payload.template.language.code === "sw");

  await whatsappProvider.send("+254712345678", "Hello", { useTemplate: false, language: "EN" });
  payload = JSON.parse(captured!.body);
  check("Inside the service window, free text is used", payload.type === "text" && payload.text.body === "Hello");

  nextResponse = json(400, { error: { message: "Re-engagement message", code: 131047 } });
  w = await whatsappProvider.send("+254712345678", "Hi");
  check("Outside-window rejection is explained", w.status === "FAILED" && /template/i.test(w.error ?? ""), w.error);

  nextResponse = json(400, { error: { message: "Recipient phone number not in allowed list", code: 131030 } });
  w = await whatsappProvider.send("+254712345678", "Hi");
  check("Test-list rejection is explained", w.status === "FAILED" && /allowed test list/i.test(w.error ?? ""), w.error);

  nextResponse = json(401, { error: { message: "Error validating access token", code: 190 } });
  w = await whatsappProvider.send("+254712345678", "Hi");
  check("Expired token is explained", w.status === "FAILED" && /token/i.test(w.error ?? ""), w.error);

  console.log(`\n${passed}/${passed + failed} provider contract checks passed`);
  if (failed) process.exit(1);
}

main();

export {};
