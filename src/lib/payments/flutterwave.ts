/**
 * Flutterwave Standard (v3) — hosted card checkout.
 *
 * We never see or store card details: the donor is redirected to Flutterwave's
 * PCI-compliant page, pays there, and is sent back to /donate/thanks. We then
 * confirm the outcome server-to-server — the redirect's query string is never
 * trusted on its own.
 */

// FLW_BASE_URL exists so the integration can be tested against a local mock.
const API = process.env.FLW_BASE_URL || "https://api.flutterwave.com/v3";

const headers = () => ({
  Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
  "Content-Type": "application/json",
});

export async function createCardCheckout(opts: {
  txRef: string;
  amountKes: number;
  email: string;
  name?: string;
  redirectUrl: string;
  title: string;
  description: string;
}): Promise<{ link: string }> {
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      tx_ref: opts.txRef,
      amount: opts.amountKes,
      currency: "KES",
      redirect_url: opts.redirectUrl,
      payment_options: "card",
      customer: { email: opts.email, name: opts.name || "Well-wisher" },
      customizations: { title: opts.title, description: opts.description },
      meta: { purpose: "donation" },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  };

  if (!res.ok || data.status !== "success" || !data.data?.link) {
    console.error("[donate] Flutterwave checkout rejected:", res.status, data.message);
    throw new Error("We couldn't open the card payment page. Please try again in a moment.");
  }
  return { link: data.data.link };
}

export type CardVerdict =
  | { state: "SUCCESS"; transactionId: string; amount: number }
  | { state: "FAILED"; reason: string }
  | { state: "PENDING" };

/**
 * Looks the transaction up by our own reference and checks it really was a
 * successful payment of at least the expected amount, in KES.
 */
export async function verifyByReference(txRef: string, expectedAmountKes: number): Promise<CardVerdict> {
  try {
    const res = await fetch(`${API}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as {
      status?: string;
      data?: { id?: number | string; status?: string; amount?: number; currency?: string; processor_response?: string };
    };

    // No transaction yet (donor hasn't paid, or abandoned the page).
    if (!res.ok || body.status !== "success" || !body.data) return { state: "PENDING" };

    const tx = body.data;
    const status = (tx.status ?? "").toLowerCase();
    if (status === "successful") {
      if (tx.currency !== "KES" || Number(tx.amount) < expectedAmountKes) {
        return { state: "FAILED", reason: "Payment amount or currency did not match the donation." };
      }
      return { state: "SUCCESS", transactionId: String(tx.id), amount: Number(tx.amount) };
    }
    if (status === "failed") {
      return { state: "FAILED", reason: tx.processor_response || "The card payment was declined." };
    }
    return { state: "PENDING" };
  } catch {
    return { state: "PENDING" };
  }
}
