import crypto from "node:crypto";
import { cookies } from "next/headers";
import { one } from "./db";

import { env } from "./env";

const SECRET = env.sessionSecret;
const ADMIN_COOKIE = "bp_admin";
const RIDER_COOKIE = "bp_rider";

// --------------------------------------------------------------- hashing --

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

// -------------------------------------------------------------- sessions --

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
  return `${Buffer.from(value).toString("base64url")}.${mac}`;
}

function unsign(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const value = Buffer.from(payload, "base64url").toString();
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
  if (expected.length !== mac.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(mac))) return null;
  return value;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  partnerId: string | null;
  partnerName: string | null;
  partnerCode: string | null;
}

export async function setAdminSession(userId: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const userId = unsign(store.get(ADMIN_COOKIE)?.value);
  if (!userId) return null;
  return await one<SessionUser>(
    `SELECT u.id, u.email, u.name, u.role, u.partnerId,
            p.name AS partnerName, p.code AS partnerCode
       FROM AppUser u LEFT JOIN Partner p ON p.id = u.partnerId
      WHERE u.id = ?`,
    [userId],
  );
}

export async function login(email: string, password: string): Promise<SessionUser | null> {
  const row = await one<{ id: string; passwordHash: string }>(
    "SELECT id, passwordHash FROM AppUser WHERE email = ?",
    [email.trim().toLowerCase()],
  );
  if (!row || !verifyPassword(password, row.passwordHash)) return null;
  await setAdminSession(row.id);
  return currentUser();
}

// --------------------------------------------------------- rider session --

export async function setRiderSession(riderId: string) {
  const store = await cookies();
  store.set(RIDER_COOKIE, sign(riderId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearRiderSession() {
  (await cookies()).delete(RIDER_COOKIE);
}

export async function currentRiderId(): Promise<string | null> {
  const store = await cookies();
  return unsign(store.get(RIDER_COOKIE)?.value);
}
