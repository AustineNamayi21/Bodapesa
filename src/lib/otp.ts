import crypto from "node:crypto";
import { env } from "./env";

/**
 * One-time sign-in codes for the rider portal.
 *
 * A phone number on its own is not proof of identity — anyone can type one —
 * so outside demo mode the portal texts a six-digit code to the number and
 * only signs the rider in once it is entered.
 *
 * The code is never stored. The browser holds a short-lived, signed ticket
 * binding the number, the expiry and an HMAC of the code; entering the code
 * recomputes that HMAC. No table, no migration, nothing to clean up.
 */

export const OTP_COOKIE = "bp_otp";
export const OTP_TTL_MS = 10 * 60_000;

export function newCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function mac(msisdn: string, code: string, expires: number): string {
  return crypto
    .createHmac("sha256", env.sessionSecret)
    .update(`otp|${msisdn}|${code}|${expires}`)
    .digest("base64url");
}

export function issueTicket(msisdn: string, code: string, nowMs = Date.now()): string {
  const expires = nowMs + OTP_TTL_MS;
  return `${msisdn}.${expires}.${mac(msisdn, code, expires)}`;
}

export function readTicket(ticket: string | undefined): { msisdn: string; expires: number } | null {
  if (!ticket) return null;
  const [msisdn, expiresRaw, sig] = ticket.split(".");
  const expires = Number(expiresRaw);
  if (!msisdn || !sig || !Number.isFinite(expires)) return null;
  return { msisdn, expires };
}

export function checkTicket(ticket: string | undefined, code: string, nowMs = Date.now()): string | null {
  const parsed = readTicket(ticket);
  if (!parsed || nowMs > parsed.expires) return null;
  const sig = ticket!.split(".")[2];
  const expected = mac(parsed.msisdn, code.replace(/\D/g, ""), parsed.expires);
  if (expected.length !== sig.length) return null;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)) ? parsed.msisdn : null;
}

export function codeMessage(code: string, lang: string): string {
  if (lang === "EN") return `BodaPesa: your sign-in code is ${code}. It expires in 10 minutes. Do not share it with anyone.`;
  if (lang === "SH") return `BodaPesa: code yako ya kuingia ni ${code}. Inaexpire baada ya dakika 10. Usimpatie mtu yeyote.`;
  return `BodaPesa: nambari yako ya kuingia ni ${code}. Itaisha baada ya dakika 10. Usimpe mtu yeyote.`;
}
