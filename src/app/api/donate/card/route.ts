import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/env";
import { baseUrl, beneficiaryName, cardMode, cardProvider, isLiveMode, methodAvailable } from "@/lib/payments/config";
import { createDonation, markFailed, parseDonorInput } from "@/lib/payments/donations";
import { createCardCheckout } from "@/lib/payments/flutterwave";
import { createPaystackCheckout } from "@/lib/payments/paystack";

export const dynamic = "force-dynamic";

/** Starts a card donation and returns the hosted checkout link to redirect to. */
export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "donate-init"), 6, 10 * 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseDonorInput(body, "CARD");
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const input = parsed.value;

  const mode = cardMode();
  const provider = cardProvider();
  if (!methodAvailable(mode)) {
    return NextResponse.json({ error: "Card donations aren't open yet. Please check back soon." }, { status: 503 });
  }

  const donation = await createDonation({
    method: "CARD",
    provider,
    live: isLiveMode(mode),
    input,
  });

  const returnUrl = `${baseUrl(request)}/donate/thanks?ref=${donation.txRef}`;

  if (mode === "simulated") {
    return NextResponse.json({ ref: donation.txRef, link: returnUrl, simulated: true });
  }

  try {
    const { link } =
      provider === "PAYSTACK"
        ? await createPaystackCheckout({
            txRef: donation.txRef,
            amountKes: input.amountKes,
            email: input.email,
            name: input.name,
            callbackUrl: returnUrl,
          })
        : await createCardCheckout({
            txRef: donation.txRef,
            amountKes: input.amountKes,
            email: input.email,
            name: input.name,
            redirectUrl: returnUrl,
            title: "Support BodaPesa",
            description: `Donation to ${beneficiaryName()}`,
          });
    return NextResponse.json({ ref: donation.txRef, link });
  } catch (err) {
    const message = (err as Error).message;
    await markFailed(donation.txRef, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
