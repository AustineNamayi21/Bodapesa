import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getDonation, settleCard } from "@/lib/payments/donations";

export const dynamic = "force-dynamic";

function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Flutterwave webhook. Authenticated by the secret hash configured on the
 * dashboard (sent in the `verif-hash` header). Even then the payload is only
 * a nudge: we re-verify the transaction with Flutterwave before crediting it.
 */
export async function POST(request: Request) {
  const expected = process.env.FLW_WEBHOOK_HASH ?? "";
  const supplied = request.headers.get("verif-hash") ?? "";
  if (!expected || !sameSecret(supplied, expected)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = (await request.json().catch(() => null)) as { data?: { tx_ref?: string } } | null;
  const txRef = event?.data?.tx_ref;
  if (txRef && /^BP-[A-Z0-9]{14}$/.test(txRef)) {
    const donation = await getDonation(txRef);
    if (donation && donation.method === "CARD") await settleCard(donation);
  }
  return NextResponse.json({ ok: true });
}
