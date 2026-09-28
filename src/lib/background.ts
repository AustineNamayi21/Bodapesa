import { after } from "next/server";

/**
 * Runs work after the response has been sent.
 *
 * A USSD gateway gives the platform only a few seconds to answer each screen,
 * and a field officer should not wait on the SMS gateway to see the rider they
 * just registered. Next.js's `after()` keeps a serverless function alive until
 * the task finishes. Outside a request (scripts, tests) it runs immediately.
 */
export function inBackground(task: () => Promise<unknown>): void {
  const runTask = () =>
    task().catch((err) => console.error("[bodapesa] background task failed:", err));
  try {
    after(runTask);
  } catch {
    void runTask();
  }
}
