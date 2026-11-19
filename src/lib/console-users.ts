/**
 * Types and constants for console accounts.
 *
 * Kept out of `users.ts` because that file is marked "use server" and such a
 * file may only export async functions — exporting the role list from there
 * fails the build, the same way `echo` had to leave the CRUD module.
 */

export type ConsoleUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  partnerId: string | null;
  partnerName: string | null;
  active: number;
  createdAt: string;
  threads: number;
  openLeads: number;
};

export const CONSOLE_ROLES = [
  { value: "PLATFORM_ADMIN", label: "Platform admin", hint: "Sees every rider, partner and thread." },
  { value: "PARTNER_ADMIN", label: "Partner staff", hint: "Sees only their own partner's pipeline." },
] as const;
