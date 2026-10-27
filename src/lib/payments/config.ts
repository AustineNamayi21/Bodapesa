import { env } from "@/lib/env";

/**
 * How a payment method is currently wired — same vocabulary as the messaging
 * channels so the admin console can show one consistent status:
 *
 *   simulated — no credentials; nothing leaves the platform (offline demos)
 *   sandbox   — provider test environment; no real money moves
 *   live      — real money
 */
export type PayMode = "simulated" | "sandbox" | "live";

export function mpesaMode(): PayMode {
  const configured =
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_PASSKEY;
  if (!configured) return "simulated";
  return process.env.MPESA_ENV === "production" ? "live" : "sandbox";
}

export type CardProvider = "PAYSTACK" | "FLUTTERWAVE" | "SIMULATED";

/** Paystack wins if its key is set; Flutterwave is kept as an alternative. */
export function cardProvider(): CardProvider {
  if (process.env.PAYSTACK_SECRET_KEY) return "PAYSTACK";
  if (process.env.FLW_SECRET_KEY) return "FLUTTERWAVE";
  return "SIMULATED";
}

export function cardProviderLabel(): string {
  const p = cardProvider();
  return p === "PAYSTACK" ? "Paystack" : p === "FLUTTERWAVE" ? "Flutterwave" : "our payment partner";
}

export function cardMode(): PayMode {
  const p = cardProvider();
  if (p === "PAYSTACK") {
    // Only a clearly-live key counts as live, so a malformed key can never
    // inflate the public total.
    return process.env.PAYSTACK_SECRET_KEY!.startsWith("sk_live_") ? "live" : "sandbox";
  }
  if (p === "FLUTTERWAVE") {
    return process.env.FLW_SECRET_KEY!.startsWith("FLWSECK_TEST") ? "sandbox" : "live";
  }
  return "simulated";
}

/**
 * Simulated payments are allowed only while demo mode is on. On a public
 * production site with no credentials the method is simply unavailable —
 * a fake "success" there would mislead a real donor into thinking they had
 * given money.
 */
export function methodAvailable(mode: PayMode): boolean {
  return mode !== "simulated" || env.demoMode;
}

/** Only genuine, live-money donations count toward public totals. */
export const isLiveMode = (mode: PayMode) => mode === "live";

// ------------------------------------------------------------- limits ----

export const MIN_DONATION_KES = 50;
// Safaricom caps a single M-Pesa transaction; staying below it keeps one
// donation to one STK prompt.
export const MAX_DONATION_KES = 150_000;

export const PRESET_AMOUNTS_KES = [200, 500, 1000, 2500];

/** Optional public fundraising goal; leave unset to hide the progress bar. */
export function donationGoalKes(): number | null {
  const n = Number(process.env.DONATION_GOAL_KES);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Who donors are giving to — shown on the page and the card checkout. */
export function beneficiaryName(): string {
  return process.env.DONATION_ORG_NAME?.trim() || "the BodaPesa financial literacy programme";
}

/** Base URL for callbacks and redirects, from config or the live request. */
export function baseUrl(request: Request): string {
  if (env.publicUrl) return env.publicUrl.replace(/\/$/, "");
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
