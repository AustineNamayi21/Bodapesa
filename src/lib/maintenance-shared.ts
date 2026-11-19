/**
 * Constants for the maintenance screen, kept out of `maintenance.ts` because
 * that file is marked "use server" and may only export async functions.
 */
export const PURGE_PHRASE = "DELETE DEMO DATA";

export type PurgePreview = {
  ridersTotal: number;
  ridersSynthetic: number;
  ridersToDelete: number;
  ridersKept: { id: string; name: string; msisdn: string; createdAt: string; isSynthetic: number }[];
  messages: number;
  leads: number;
  conversations: number;
  signals: number;
  lessonProgress: number;
  goals: number;
  campaigns: number;
};
