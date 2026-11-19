"use server";

import { revalidatePath } from "next/cache";

import { currentUser, hashPassword } from "@/lib/auth";
import { all, id, insert, now, one, run } from "@/lib/db";
import { echo, type FormState } from "@/lib/form-state";
import { CONSOLE_ROLES, type ConsoleUser } from "@/lib/console-users";

/**
 * Console accounts.
 *
 * Until this existed the only way into the console was the single account the
 * seed creates, which meant Britam and Stima staff could not sign in at all —
 * and the partner half of the conversations feature was unreachable in
 * production however well it worked.
 *
 * Only a platform admin may touch these: handing partner staff the ability to
 * mint accounts would let one partner reach another partner's pipeline.
 */

async function requirePlatformAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "PLATFORM_ADMIN") return null;
  return user;
}

export async function listConsoleUsers(): Promise<ConsoleUser[]> {
  return all<ConsoleUser>(
    `SELECT u.id, u.email, u.name, u.role, u.partnerId, u.active, u.createdAt,
            p.name AS partnerName,
            (SELECT COUNT(*) FROM Conversation c WHERE c.assignedToId = u.id) AS threads,
            (SELECT COUNT(*) FROM Lead l WHERE l.ownerId = u.id
               AND l.status IN ('NEW','CONTACTED','QUALIFIED')) AS openLeads
       FROM AppUser u LEFT JOIN Partner p ON p.id = u.partnerId
      ORDER BY u.active DESC, p.name NULLS FIRST, u.name`,
  );
}

/** A readable starting password the admin can pass on, then have changed. */
function suggestPassword(): string {
  const words = ["boda", "stage", "piki", "safari", "mvua", "jembe", "tembo", "chui"];
  const word = words[Math.floor(Math.random() * words.length)];
  return `${word}-${Math.floor(1000 + Math.random() * 8999)}`;
}

export async function createConsoleUserAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await requirePlatformAdmin();
  if (!admin) return { error: "Only a platform admin can add console accounts." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "").trim() || suggestPassword();

  if (!name) return { error: "Give the person a name.", field: "name", values: echo(formData) };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "That does not look like an email address.", field: "email", values: echo(formData) };
  }
  if (!CONSOLE_ROLES.some((r) => r.value === role)) {
    return { error: "Pick a role.", field: "role", values: echo(formData) };
  }
  // Partner staff without a partner would see nothing at all; a platform
  // admin tied to one partner would quietly lose their platform-wide view.
  if (role === "PARTNER_ADMIN" && !partnerId) {
    return { error: "Partner staff need a partner.", field: "partnerId", values: echo(formData) };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters.", field: "password", values: echo(formData) };
  }

  const clash = await one<{ id: string }>("SELECT id FROM AppUser WHERE email = ?", [email]);
  if (clash) {
    return { error: "An account already uses that email.", field: "email", values: echo(formData) };
  }

  await insert("AppUser", {
    id: id("usr"),
    email,
    name,
    passwordHash: hashPassword(password),
    role,
    partnerId: role === "PLATFORM_ADMIN" ? null : partnerId,
    active: 1,
    createdAt: now(),
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/partners");
  // Handed back so the admin can pass it on; it is never stored in the clear.
  return { ok: password };
}

export async function setConsoleUserActiveAction(formData: FormData): Promise<void> {
  const admin = await requirePlatformAdmin();
  if (!admin) return;

  const userId = String(formData.get("userId") ?? "");
  const active = String(formData.get("active") ?? "") === "1" ? 1 : 0;
  if (!userId) return;

  // Locking yourself out of the console is not a recoverable mistake from
  // inside the console.
  if (userId === admin.id && active === 0) return;

  // Nor is switching off the last way in.
  if (active === 0) {
    const others = await one<{ n: number }>(
      "SELECT COUNT(*) AS n FROM AppUser WHERE role = 'PLATFORM_ADMIN' AND active = 1 AND id <> ?",
      [userId],
    );
    if (Number(others?.n ?? 0) === 0) return;
  }

  await run("UPDATE AppUser SET active = ? WHERE id = ?", [active, userId]);
  revalidatePath("/admin/users");
}

export async function resetConsolePasswordAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const admin = await requirePlatformAdmin();
  if (!admin) return { error: "Only a platform admin can reset a password." };

  const userId = String(formData.get("userId") ?? "");
  const target = await one<{ id: string }>("SELECT id FROM AppUser WHERE id = ?", [userId]);
  if (!target) return { error: "That account no longer exists." };

  const password = suggestPassword();
  await run("UPDATE AppUser SET passwordHash = ? WHERE id = ?", [hashPassword(password), userId]);
  revalidatePath("/admin/users");
  return { ok: password };
}
