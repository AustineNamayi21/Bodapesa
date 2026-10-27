import { NextResponse } from "next/server";
import { getDonation, settleCard } from "@/lib/payments/donations";
import { validPaystackSignature } from "@/lib/payments/paystack";

export const dynamic = "force-dynamic";

/**
 * Paystack webhook. Authenticated by the HMAC signature Paystack computes
 * from the raw body with your secret key (no separate secret to configure).
 * Even then the payload is only a nudge: the transaction is re-verified with
 * Paystack before it is credited.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!validPaystackSignature(raw, request.headers.get("x-paystack-signature"))) {
    return new Response("Unauthorized", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } } | null = null;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const ref = event?.data?.reference;
  if (ref && /^BP-[A-Z0-9]{14}$/.test(ref)) {
    const donation = await getDonation(ref);
    if (donation && donation.method === "CARD") await settleCard(donation);
  }
  return NextResponse.json({ ok: true });
}
