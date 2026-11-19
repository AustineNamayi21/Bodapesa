import { all, id, insert, now, one } from "@/lib/db";

/**
 * Intent the rider never declared.
 *
 * The console could already see who pressed "I'm interested". What it could
 * not see was the rider who finished the whole insurance module last night,
 * set a savings goal on Monday, and has opened the same product page three
 * times — all of which say more than a button press does.
 *
 * Signals are append-only and scored. The score decays, because interest a
 * month old is not interest.
 */

export type SignalKind =
  | "MODULE_DONE"
  | "LESSON_DONE"
  | "GOAL_SET"
  | "DEPOSIT"
  | "DEPOSIT_STREAK"
  | "QUIZ_PASSED"
  | "PRODUCT_VIEWED"
  | "ENQUIRY_SENT"
  | "CHAT_STARTED";

/**
 * What each signal is worth.
 *
 * Deliberately crude: these are opening guesses, not a model. Once the table
 * has a few months of real behaviour behind it you can fit these against
 * actual conversions instead of arguing about them.
 */
export const SIGNAL_WEIGHT: Record<SignalKind, number> = {
  CHAT_STARTED: 10,
  ENQUIRY_SENT: 10,
  MODULE_DONE: 6,
  DEPOSIT_STREAK: 6,
  GOAL_SET: 5,
  QUIZ_PASSED: 3,
  PRODUCT_VIEWED: 2,
  DEPOSIT: 2,
  LESSON_DONE: 1,
};

export const SIGNAL_LABEL: Record<SignalKind, string> = {
  CHAT_STARTED: "Started a conversation",
  ENQUIRY_SENT: "Sent an enquiry",
  MODULE_DONE: "Finished a module",
  DEPOSIT_STREAK: "Saving consistently",
  GOAL_SET: "Set a savings goal",
  QUIZ_PASSED: "Passed a quiz",
  PRODUCT_VIEWED: "Looked at a product",
  DEPOSIT: "Made a deposit",
  LESSON_DONE: "Finished a lesson",
};

/**
 * Records a signal.
 *
 * Never throws into the caller's path: a rider finishing a lesson must not
 * fail because the signals table had a bad day. Everything here is
 * best-effort telemetry, not part of the transaction that matters.
 */
export async function recordSignal(opts: {
  riderId: string;
  kind: SignalKind;
  productId?: string | null;
  detail?: string | null;
  /** Suppress repeats of the same kind within this many hours. */
  dedupeHours?: number;
}): Promise<void> {
  try {
    if (opts.dedupeHours) {
      const since = new Date(Date.now() - opts.dedupeHours * 3600_000).toISOString();
      const seen = await one<{ id: string }>(
        `SELECT id FROM RiderSignal
          WHERE riderId = ? AND kind = ? AND createdAt > ?
            AND ((productId IS NULL AND ? IS NULL) OR productId = ?)
          LIMIT 1`,
        [opts.riderId, opts.kind, since, opts.productId ?? null, opts.productId ?? null],
      );
      if (seen) return;
    }
    await insert("RiderSignal", {
      id: id("sig"),
      riderId: opts.riderId,
      kind: opts.kind,
      weight: SIGNAL_WEIGHT[opts.kind] ?? 1,
      productId: opts.productId ?? null,
      detail: opts.detail ?? null,
      createdAt: now(),
    });
  } catch (err) {
    console.error("[bodapesa] signal not recorded:", err);
  }
}

export type WarmRider = {
  riderId: string;
  firstName: string;
  lastName: string;
  msisdn: string;
  language: string;
  literacyScore: number;
  stageName: string | null;
  score: number;
  signals: number;
  lastSignalAt: string;
  topKind: SignalKind;
  productName: string | null;
  productId: string | null;
  hasOpenLead: number;
};

/**
 * Riders worth a call today, hottest first.
 *
 * Signals older than the window are ignored outright rather than decayed on a
 * curve — simpler to reason about, and the cliff is honest: nobody should be
 * called about a product they looked at two months ago.
 *
 * Riders with an open lead are not excluded; they are flagged, because a warm
 * rider who already has an untouched lead is the most urgent call of all.
 */
export async function warmRiders(opts: { days?: number; limit?: number; partnerId?: string | null } = {}) {
  const days = opts.days ?? 30;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const partnerFilter = opts.partnerId ? "AND (pr.partnerId = ? OR s.productId IS NULL)" : "";
  const params: unknown[] = [since];
  if (opts.partnerId) params.push(opts.partnerId);
  params.push(opts.limit ?? 25);

  return all<WarmRider>(
    `SELECT r.id AS riderId, r.firstName, r.lastName, r.msisdn, r.language, r.literacyScore,
            st.name AS stageName,
            SUM(s.weight) AS score,
            COUNT(s.id) AS signals,
            MAX(s.createdAt) AS lastSignalAt,
            (SELECT s2.kind FROM RiderSignal s2
              WHERE s2.riderId = r.id AND s2.createdAt > ?
              ORDER BY s2.weight DESC, s2.createdAt DESC LIMIT 1) AS topKind,
            (SELECT p2.name FROM RiderSignal s3 LEFT JOIN Product p2 ON p2.id = s3.productId
              WHERE s3.riderId = r.id AND s3.productId IS NOT NULL
              ORDER BY s3.weight DESC, s3.createdAt DESC LIMIT 1) AS productName,
            (SELECT s4.productId FROM RiderSignal s4
              WHERE s4.riderId = r.id AND s4.productId IS NOT NULL
              ORDER BY s4.weight DESC, s4.createdAt DESC LIMIT 1) AS productId,
            (SELECT COUNT(*) FROM Lead l WHERE l.riderId = r.id
               AND l.status IN ('NEW','CONTACTED','QUALIFIED')) AS hasOpenLead
       FROM RiderSignal s
       JOIN Rider r ON r.id = s.riderId
       LEFT JOIN Stage st ON st.id = r.stageId
       LEFT JOIN Product pr ON pr.id = s.productId
      WHERE s.createdAt > ? AND r.status <> 'OPTED_OUT' ${partnerFilter}
      GROUP BY r.id
      ORDER BY score DESC, lastSignalAt DESC
      LIMIT ?`,
    [since, ...params],
  );
}

export async function signalsForRider(riderId: string, limit = 20) {
  return all<{ kind: SignalKind; detail: string | null; productName: string | null; createdAt: string }>(
    `SELECT s.kind, s.detail, p.name AS productName, s.createdAt
       FROM RiderSignal s LEFT JOIN Product p ON p.id = s.productId
      WHERE s.riderId = ? ORDER BY s.createdAt DESC LIMIT ?`,
    [riderId, limit],
  );
}
