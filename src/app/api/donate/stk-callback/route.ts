import { NextResponse } from "next/server";
import { checkWebhookSecret } from "@/lib/env";
import { getDonationByProviderRef, markFailed, markSuccess } from "@/lib/payments/donations";
import { parseStkCallback, stkFailureReason, type StkCallbackBody } from "@/lib/payments/mpesa";

export const dynamic = "force-dynamic";

// Safaricom expects this acknowledgement whatever we decide to do with the
// payload, otherwise it retries.
const ACK = { ResultCode: 0, ResultDesc: "Accepted" };

/**
 * M-Pesa Express result callback.
 *
 * Safaricom does not sign this request, so it is guarded two ways: a secret
 * in the URL (WEBHOOK_SECRET), and the CheckoutRequestID, which only we and
 * Safaricom know — an attacker cannot name a donation they have never seen.
 * (The path deliberately avoids the word "mpesa": Safaricom rejects some
 * callback URLs that contain it.)
 */
export async function POST(request: Request) {
  const denied = checkWebhookSecret(request);
  if (denied) return denied;

  const payload = (await request.json().catch(() => null)) as StkCallbackBody | null;
  const result = payload ? parseStkCallback(payload) : null;
  if (!result) return NextResponse.json(ACK);

  const donation = await getDonationByProviderRef(result.checkoutRequestId);
  if (!donation) return NextResponse.json(ACK);

  if (result.resultCode === 0) {
    await markSuccess(donation.txRef, { receipt: result.receipt, amountKes: result.amount });
  } else {
    await markFailed(donation.txRef, stkFailureReason(result.resultCode, result.resultDesc));
  }
  return NextResponse.json(ACK);
}
