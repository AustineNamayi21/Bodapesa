/**
 * Safaricom Daraja — M-Pesa Express (STK Push).
 *
 * Flow: we ask Safaricom to pop a payment prompt on the donor's phone; the
 * donor enters their M-Pesa PIN; Safaricom calls our callback URL with the
 * outcome. If the callback is slow or lost (it happens), `stkQuery` asks
 * Safaricom directly, so a donation never gets stuck on "waiting".
 */

const BASES = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
};

// MPESA_BASE_URL exists so the integration can be tested against a local mock.
const base = () =>
  process.env.MPESA_BASE_URL || (process.env.MPESA_ENV === "production" ? BASES.production : BASES.sandbox);

let cachedToken: { token: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;

  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${base()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Daraja authentication failed (HTTP ${res.status}). Check the consumer key, secret and MPESA_ENV.`);
  }
  const data = (await res.json()) as { access_token: string; expires_in?: string };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in ?? 3599) - 60) * 1000,
  };
  return cachedToken.token;
}

/** YYYYMMDDHHmmss in East Africa Time, which is what Daraja expects. */
function timestamp(): string {
  return new Date(Date.now() + 3 * 3_600_000)
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(0, 14);
}

function password(ts: string): string {
  return Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${ts}`).toString("base64");
}

/** `+2547…` → `2547…` (Daraja wants no plus sign). */
export const toDarajaMsisdn = (msisdn: string) => msisdn.replace(/^\+/, "");

export interface StkPushResult {
  checkoutRequestId: string;
  merchantRequestId: string;
}

export async function stkPush(opts: {
  msisdn: string;
  amountKes: number;
  callbackUrl: string;
}): Promise<StkPushResult> {
  const token = await accessToken();
  const ts = timestamp();
  const shortcode = process.env.MPESA_SHORTCODE!;
  // Paybill by default. For a Till number set MPESA_TRANSACTION_TYPE to
  // CustomerBuyGoodsOnline and MPESA_PARTY_B to the till number.
  const transactionType = process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline";
  const partyB = process.env.MPESA_PARTY_B || shortcode;

  const res = await fetch(`${base()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password(ts),
      Timestamp: ts,
      TransactionType: transactionType,
      Amount: Math.round(opts.amountKes),
      PartyA: toDarajaMsisdn(opts.msisdn),
      PartyB: partyB,
      PhoneNumber: toDarajaMsisdn(opts.msisdn),
      CallBackURL: opts.callbackUrl,
      AccountReference: "BodaPesa",
      TransactionDesc: "Donation",
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json().catch(() => ({}))) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    errorMessage?: string;
  };

  if (!res.ok || data.ResponseCode !== "0" || !data.CheckoutRequestID) {
    // Log the provider's wording for the operator; give the donor a calm,
    // actionable message rather than a raw API error.
    console.error("[donate] STK push rejected:", res.status, data.errorMessage ?? data.ResponseDescription);
    throw new Error("We couldn't send the M-Pesa prompt to your phone. Please check the number and try again.");
  }
  return { checkoutRequestId: data.CheckoutRequestID, merchantRequestId: data.MerchantRequestID ?? "" };
}

export type StkState =
  | { state: "PENDING" }
  | { state: "SUCCESS" }
  | { state: "FAILED"; reason: string };

/** Friendly wording for the result codes a donor is most likely to hit. */
export function stkFailureReason(code: number, fallback?: string): string {
  switch (code) {
    case 1:
      return "Insufficient M-Pesa balance.";
    case 1001:
      return "Another M-Pesa transaction is in progress on your phone. Please try again in a minute.";
    case 1019:
    case 1037:
      return "The prompt timed out before a PIN was entered.";
    case 1025:
    case 1032:
      return "The request was cancelled on your phone.";
    case 2001:
      return "The M-Pesa PIN entered was incorrect.";
    default:
      return fallback?.trim() || "The M-Pesa payment was not completed.";
  }
}

/** Asks Safaricom for the outcome of a prompt when the callback hasn't arrived. */
export async function stkQuery(checkoutRequestId: string): Promise<StkState> {
  try {
    const token = await accessToken();
    const ts = timestamp();
    const res = await fetch(`${base()}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password(ts),
        Timestamp: ts,
        CheckoutRequestID: checkoutRequestId,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json().catch(() => ({}))) as { ResultCode?: string | number; ResultDesc?: string };

    // While the donor is still at the PIN prompt Daraja answers with an error
    // body and no ResultCode — that means "not finished", not "failed".
    if (data.ResultCode === undefined) return { state: "PENDING" };
    const code = Number(data.ResultCode);
    if (code === 0) return { state: "SUCCESS" };
    return { state: "FAILED", reason: stkFailureReason(code, data.ResultDesc) };
  } catch {
    return { state: "PENDING" };
  }
}

/** What Safaricom posts to the callback URL. */
export interface StkCallbackBody {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: { Item?: { Name: string; Value?: string | number }[] };
    };
  };
}

export function parseStkCallback(body: StkCallbackBody) {
  const cb = body.Body?.stkCallback;
  if (!cb?.CheckoutRequestID || cb.ResultCode === undefined) return null;
  const meta = Object.fromEntries((cb.CallbackMetadata?.Item ?? []).map((i) => [i.Name, i.Value]));
  return {
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: Number(cb.ResultCode),
    resultDesc: cb.ResultDesc ?? "",
    amount: meta.Amount !== undefined ? Number(meta.Amount) : null,
    receipt: meta.MpesaReceiptNumber !== undefined ? String(meta.MpesaReceiptNumber) : null,
  };
}
