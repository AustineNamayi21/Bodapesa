import { all, id, insert, now, one, run } from "@/lib/db";
import { normaliseMsisdn } from "@/lib/i18n";
import { MAX_DONATION_KES, MIN_DONATION_KES, cardMode, isLiveMode, mpesaMode } from "./config";
import { stkQuery } from "./mpesa";
import { verifyByReference } from "./flutterwave";
import { verifyPaystack } from "./paystack";

export type DonationMethod = "MPESA" | "CARD";
export type DonationStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Donation {
  id: string;
  txRef: string;
  method: DonationMethod;
  provider: "DARAJA" | "FLUTTERWAVE" | "PAYSTACK" | "SIMULATED";
  live: number;
  amountKes: number;
  donorName: string | null;
  donorEmail: string | null;
  donorMsisdn: string | null;
  note: string | null;
  anonymous: number;
  status: DonationStatus;
  providerRef: string | null;
  receipt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

// ------------------------------------------------------------- input -----

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

export interface DonorInput {
  amountKes: number;
  name: string;
  note: string;
  anonymous: boolean;
  email: string;
  msisdn: string | null;
}

/** Validates the public donation form. Never trusts the client's numbers. */
export function parseDonorInput(
  body: unknown,
  method: DonationMethod,
): { ok: true; value: DonorInput } | { ok: false; error: string } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;

  const amount = Math.round(Number(b.amount));
  if (!Number.isFinite(amount) || amount < MIN_DONATION_KES) {
    return { ok: false, error: `The minimum donation is KSh ${MIN_DONATION_KES}.` };
  }
  if (amount > MAX_DONATION_KES) {
    return { ok: false, error: `For gifts above KSh ${MAX_DONATION_KES.toLocaleString("en-KE")}, please contact us directly.` };
  }

  const email = clean(b.email, 120).toLowerCase();
  if (method === "CARD" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address — your card receipt is sent there." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  let msisdn: string | null = null;
  if (method === "MPESA") {
    msisdn = normaliseMsisdn(clean(b.phone, 20));
    if (!msisdn) return { ok: false, error: "Enter a valid Safaricom number, e.g. 0712 345 678." };
  }

  return {
    ok: true,
    value: {
      amountKes: amount,
      name: clean(b.name, 60),
      note: clean(b.note, 200),
      anonymous: b.anonymous === true,
      email,
      msisdn,
    },
  };
}

export function newTxRef(): string {
  return `BP-${crypto.randomUUID().replace(/-/g, "").slice(0, 14).toUpperCase()}`;
}

// ----------------------------------------------------------- lifecycle ---

export async function createDonation(opts: {
  method: DonationMethod;
  provider: Donation["provider"];
  live: boolean;
  input: DonorInput;
}): Promise<Donation> {
  const ts = now();
  const row = {
    id: id("don"),
    txRef: newTxRef(),
    method: opts.method,
    provider: opts.provider,
    live: opts.live ? 1 : 0,
    amountKes: opts.input.amountKes,
    donorName: opts.input.name || null,
    donorEmail: opts.input.email || null,
    donorMsisdn: opts.input.msisdn,
    note: opts.input.note || null,
    anonymous: opts.input.anonymous ? 1 : 0,
    status: "PENDING",
    createdAt: ts,
    updatedAt: ts,
  };
  await insert("Donation", row);
  return (await getDonation(row.txRef))!;
}

export const getDonation = (txRef: string) =>
  one<Donation>("SELECT * FROM Donation WHERE txRef = ?", [txRef]);

export const getDonationByProviderRef = (providerRef: string) =>
  one<Donation>("SELECT * FROM Donation WHERE providerRef = ?", [providerRef]);

export async function attachProviderRef(txRef: string, providerRef: string) {
  await run("UPDATE Donation SET providerRef = ?, updatedAt = ? WHERE txRef = ?", [providerRef, now(), txRef]);
}

/**
 * A confirmed payment is the truth, so success may overwrite a failed or
 * cancelled attempt (e.g. the donor closed the page, then the callback
 * arrived). It is idempotent: a repeat callback changes nothing.
 */
export async function markSuccess(
  txRef: string,
  extra: { receipt?: string | null; providerRef?: string | null; amountKes?: number | null } = {},
) {
  const ts = now();
  await run(
    `UPDATE Donation
        SET status = 'SUCCESS', failureReason = NULL, paidAt = ?, updatedAt = ?,
            receipt = COALESCE(?, receipt),
            providerRef = COALESCE(?, providerRef),
            amountKes = COALESCE(?, amountKes)
      WHERE txRef = ? AND status <> 'SUCCESS'`,
    [ts, ts, extra.receipt ?? null, extra.providerRef ?? null, extra.amountKes ?? null, txRef],
  );
}

/** Failure only ever applies to a donation that is still waiting. */
export async function markFailed(txRef: string, reason: string, status: "FAILED" | "CANCELLED" = "FAILED") {
  await run(
    "UPDATE Donation SET status = ?, failureReason = ?, updatedAt = ? WHERE txRef = ? AND status = 'PENDING'",
    [status, reason.slice(0, 200), now(), txRef],
  );
}

const touch = (txRef: string) => run("UPDATE Donation SET updatedAt = ? WHERE txRef = ?", [now(), txRef]);
const msSince = (iso: string) => Date.now() - new Date(iso).getTime();

// ------------------------------------------------------------ settling ---

/**
 * Brings a pending M-Pesa donation up to date. Called each time the donor's
 * browser polls. The callback normally settles it first; this is the safety
 * net for when it is late or lost.
 */
export async function settleMpesa(d: Donation): Promise<Donation> {
  if (d.status !== "PENDING") return d;

  if (d.provider === "SIMULATED") {
    if (msSince(d.createdAt) > 5_000) {
      await markSuccess(d.txRef, { receipt: `SIM${d.txRef.slice(3, 10)}` });
    }
  } else if (d.providerRef && msSince(d.updatedAt) > 6_000 && msSince(d.createdAt) > 8_000) {
    const result = await stkQuery(d.providerRef);
    if (result.state === "SUCCESS") await markSuccess(d.txRef);
    else if (result.state === "FAILED") await markFailed(d.txRef, result.reason);
    else await touch(d.txRef);
  }
  return (await getDonation(d.txRef)) ?? d;
}

/**
 * Brings a pending card donation up to date by asking the card provider directly.
 * Used by the thank-you page and the webhook — both only trigger the check;
 * neither is believed on its own.
 */
export async function settleCard(d: Donation): Promise<Donation> {
  if (d.status === "SUCCESS") return d;

  if (d.provider === "SIMULATED") {
    if (d.status === "PENDING") await markSuccess(d.txRef, { receipt: `SIM${d.txRef.slice(3, 10)}` });
  } else if (d.status === "PENDING" || d.status === "CANCELLED") {
    if (msSince(d.updatedAt) > 3_000) {
      const verdict =
        d.provider === "PAYSTACK"
          ? await verifyPaystack(d.txRef, d.amountKes)
          : await verifyByReference(d.txRef, d.amountKes);
      if (verdict.state === "SUCCESS") {
        await markSuccess(d.txRef, { providerRef: verdict.transactionId, receipt: verdict.transactionId, amountKes: verdict.amount });
      } else if (verdict.state === "FAILED") {
        await markFailed(d.txRef, verdict.reason);
      } else {
        await touch(d.txRef);
      }
    }
  }
  return (await getDonation(d.txRef)) ?? d;
}

// --------------------------------------------------------------- reads ---

export interface PublicStats {
  raisedKes: number;
  donors: number;
}

/** Only confirmed, live-money donations count — never tests or simulations. */
export async function publicStats(): Promise<PublicStats> {
  const row = await one<{ total: number | null; n: number }>(
    "SELECT COALESCE(SUM(amountKes), 0) AS total, COUNT(*) AS n FROM Donation WHERE status = 'SUCCESS' AND live = 1",
  );
  return { raisedKes: Number(row?.total ?? 0), donors: Number(row?.n ?? 0) };
}

export interface Supporter {
  name: string;
  note: string | null;
  paidAt: string;
}

/** First names only, never contact details, and never anyone who opted out. */
export async function recentSupporters(limit = 6): Promise<Supporter[]> {
  const rows = await all<{ donorName: string | null; note: string | null; paidAt: string }>(
    `SELECT donorName, note, paidAt FROM Donation
      WHERE status = 'SUCCESS' AND live = 1 AND anonymous = 0 AND donorName IS NOT NULL AND paidAt IS NOT NULL
      ORDER BY paidAt DESC LIMIT ?`,
    [limit],
  );
  return rows.map((r) => ({
    name: (r.donorName ?? "").split(" ")[0],
    note: r.note,
    paidAt: r.paidAt,
  }));
}

export const donationModes = () => ({ mpesa: mpesaMode(), card: cardMode() });
export { isLiveMode };
