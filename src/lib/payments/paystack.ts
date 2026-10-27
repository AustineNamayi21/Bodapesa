/**
 * Paystack — hosted card checkout (Kenya, KES).
 *
 * Same shape as the Flutterwave flow: the donor is redirected to Paystack's
 * secure page, pays there, and returns to /donate/thanks. We then confirm the
 * result server-to-server; the redirect's query string is never trusted.
 *
 * Paystack amounts are in the currency's subunit: KES 500 is sent as 50000.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { CardVerdict } from "./flutterwave";

// PAYSTACK_BASE_URL exists so the integration can be tested against a local mock.
const API = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

const headers = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

export async function createPaystackCheckout(opts: {
  txRef: string;
  amountKes: number;
  email: string;
  name?: string;
  callbackUrl: string;
}): Promise<{ link: string }> {
  const res = await fetch(`${API}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountKes * 100),
      currency: "KES",
      reference: opts.txRef,
      callback_url: opts.callbackUrl,
      channels: ["card"],
      metadata: { purpose: "donation", donor_name: opts.name || "" },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };

  if (!res.ok || data.status !== true || !data.data?.authorization_url) {
    console.error("[donate] Paystack initialize rejected:", res.status, data.message);
    throw new Error("We couldn't open the card payment page. Please try again in a moment.");
  }
  return { link: data.data.authorization_url };
}

/**
 * Looks the transaction up by our own reference and checks it really was a
 * successful payment of at least the expected amount, in KES.
 */
export async function verifyPaystack(txRef: string, expectedAmountKes: number): Promise<CardVerdict> {
  try {
    const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(txRef)}`, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      data?: { id?: number | string; status?: string; amount?: number; currency?: string; gateway_response?: string };
    };

    // Unknown reference (donor hasn't reached the payment page) or an API hiccup.
    if (!res.ok || body.status !== true || !body.data) return { state: "PENDING" };

    const tx = body.data;
    const status = (tx.status ?? "").toLowerCase();

    if (status === "success") {
      if (tx.currency !== "KES" || Number(tx.amount) < Math.round(expectedAmountKes * 100)) {
        return { state: "FAILED", reason: "Payment amount or currency did not match the donation." };
      }
      return { state: "SUCCESS", transactionId: String(tx.id), amount: Number(tx.amount) / 100 };
    }
    if (status === "failed") {
      return { state: "FAILED", reason: tx.gateway_response || "The card payment was declined." };
    }
    if (status === "reversed") {
      return { state: "FAILED", reason: "The card payment was reversed." };
    }
    // abandoned / ongoing / pending / processing / queued — not finished yet.
    return { state: "PENDING" };
  } catch {
    return { state: "PENDING" };
  }
}

/**
 * Paystack signs every webhook with HMAC-SHA512 of the raw request body,
 * keyed with your secret key, in the `x-paystack-signature` header.
 */
export function validPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
