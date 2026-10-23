import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/env";
import { baseUrl, isLiveMode, methodAvailable, mpesaMode } from "@/lib/payments/config";
import { attachProviderRef, createDonation, markFailed, parseDonorInput } from "@/lib/payments/donations";
import { stkPush } from "@/lib/payments/mpesa";

export const dynamic = "force-dynamic";

const WINDOW = 10 * 60_000;

/** Starts an M-Pesa STK Push donation. Public endpoint — hence the limits. */
export async function POST(request: Request) {
  // An STK prompt lands on whatever number is typed in, so this endpoint must
  // not be usable to spam someone's phone: limit per caller and per number.
  if (!rateLimit(clientKey(request, "donate-init"), 6, WINDOW)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseDonorInput(body, "MPESA");
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  if (!rateLimit(`donate-phone:${input.msisdn}`, 3, WINDOW)) {
    return NextResponse.json(
      { error: "We've already sent several prompts to that number. Please wait a few minutes." },
      { status: 429 },
    );
  }

  const mode = mpesaMode();
  if (!methodAvailable(mode)) {
    return NextResponse.json({ error: "M-Pesa donations aren't open yet. Please check back soon." }, { status: 503 });
  }

  const donation = await createDonation({
    method: "MPESA",
    provider: mode === "simulated" ? "SIMULATED" : "DARAJA",
    live: isLiveMode(mode),
    input,
  });

  if (mode !== "simulated") {
    const secret = process.env.WEBHOOK_SECRET ? `?secret=${encodeURIComponent(process.env.WEBHOOK_SECRET)}` : "";
    try {
      const result = await stkPush({
        msisdn: input.msisdn!,
        amountKes: input.amountKes,
        callbackUrl: `${baseUrl(request)}/api/donate/stk-callback${secret}`,
      });
      await attachProviderRef(donation.txRef, result.checkoutRequestId);
    } catch (err) {
      const message = (err as Error).message;
      await markFailed(donation.txRef, message);
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ ref: donation.txRef, status: "PENDING", simulated: mode === "simulated" });
}
