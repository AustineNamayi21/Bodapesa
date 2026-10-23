import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/env";
import { getDonation, settleMpesa } from "@/lib/payments/donations";

export const dynamic = "force-dynamic";

/**
 * Polled by the donation form while a donor is at their M-Pesa PIN prompt.
 * Returns only what the donor's own screen needs — no contact details.
 */
export async function GET(request: Request) {
  if (!rateLimit(clientKey(request, "donate-status"), 150, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!/^BP-[A-Z0-9]{14}$/.test(ref)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let donation = await getDonation(ref);
  if (!donation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (donation.method === "MPESA") donation = await settleMpesa(donation);

  return NextResponse.json({
    status: donation.status,
    amount: donation.amountKes,
    receipt: donation.status === "SUCCESS" ? donation.receipt : null,
    reason: donation.status === "FAILED" || donation.status === "CANCELLED" ? donation.failureReason : null,
  });
}
