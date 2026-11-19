import { NextResponse } from "next/server";

import { all, count, migrate, now, run } from "@/lib/db";
import { openConversation, postMessage } from "@/lib/chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * The scheduled work.
 *
 * Until now everything in the platform happened because a person pressed a
 * button, which meant a lead could age for two months and a rider could go
 * quiet for six weeks with nothing noticing. This route is what notices.
 *
 * It runs on a schedule in production (see vercel.json) and can be run by
 * hand from the console. It is written to be safe to run twice: every job
 * below is idempotent within its own window, so a double fire changes
 * nothing.
 *
 * Authorisation: CRON_SECRET must match. Vercel Cron sends it as a bearer
 * token; a human running it by hand sends the same value as a header. With
 * no secret configured the route refuses rather than running openly.
 */

const STALE_LEAD_DAYS = 3;
const DORMANT_DAYS = 21;

function authorised(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json(
      { error: "Not authorised. Set CRON_SECRET and send it as a bearer token." },
      { status: 401 },
    );
  }

  await migrate();
  const ran: Record<string, number> = {};

  /* ── 1. Stale leads ───────────────────────────────────────────────────
     A lead nobody has touched inside the window gets a dated next action,
     which is what puts it at the top of the queue. The guard on
     nextActionAt is what makes a second run a no-op. */
  const staleCutoff = new Date(Date.now() - STALE_LEAD_DAYS * 86_400_000).toISOString();
  // Guarding on the start of today rather than on the current instant is
  // what makes a second run inside the same day a genuine no-op: flagging to
  // now() and then comparing against a later now() would re-flag every row.
  const startOfToday = new Date().toISOString().slice(0, 10);
  const stale = await all<{ id: string }>(
    `SELECT id FROM Lead
      WHERE status IN ('NEW','CONTACTED','QUALIFIED')
        AND COALESCE(firstContactedAt, createdAt) < ?
        AND (nextActionAt IS NULL OR nextActionAt < ?)
      LIMIT 500`,
    [staleCutoff, startOfToday],
  );
  for (const lead of stale) {
    await run("UPDATE Lead SET nextActionAt = ?, updatedAt = ? WHERE id = ?", [now(), now(), lead.id]);
  }
  ran.staleLeadsFlagged = stale.length;

  /* ── 2. Dormant riders ────────────────────────────────────────────────
     One message, referencing the rider's own savings goal where they have
     one, because a nudge about your own target is not the same as a blast.
     Riders who already have an open thread are skipped: they are mid
     conversation and do not need a robot talking over it. */
  const dormantCutoff = new Date(Date.now() - DORMANT_DAYS * 86_400_000).toISOString();
  const dormant = await all<{ id: string; firstName: string; language: string; goalTitle: string | null }>(
    `SELECT r.id, r.firstName, r.language,
            (SELECT g.title FROM SavingsGoal g WHERE g.riderId = r.id ORDER BY g.createdAt DESC LIMIT 1) AS goalTitle
       FROM Rider r
      WHERE r.status NOT IN ('OPTED_OUT','DORMANT')
        AND r.consent = 1
        AND COALESCE(r.lastActiveAt, r.createdAt) < ?
        AND NOT EXISTS (
          SELECT 1 FROM Conversation c WHERE c.riderId = r.id AND c.status <> 'RESOLVED'
        )
      LIMIT 200`,
    [dormantCutoff],
  );

  for (const rider of dormant) {
    const conversationId = await openConversation({
      riderId: rider.id,
      subject: rider.goalTitle ?? "Still with us?",
      openedBy: "SYSTEM",
    });
    const body = rider.goalTitle
      ? rider.language === "SW"
        ? `Habari ${rider.firstName}. Bado tuko hapa kukusaidia kufikia "${rider.goalTitle}". Ukiwa na swali lolote kuhusu akiba, mikopo au bima, niandikie hapa.`
        : rider.language === "SH"
          ? `Niaje ${rider.firstName}. Bado tuko hapa kukusaidia kufika "${rider.goalTitle}". Ukiwa na swali yoyote kuhusu doo, loan ama bima, niandikie hapa.`
          : `Hi ${rider.firstName}. We are still here to help you reach "${rider.goalTitle}". If you have any question about saving, credit or cover, write to me here.`
      : rider.language === "SW"
        ? `Habari ${rider.firstName}. Umekuwa mbali kidogo. Kuna swali lolote kuhusu pesa yako tunaweza kukusaidia nalo?`
        : rider.language === "SH"
          ? `Niaje ${rider.firstName}. Umepotea kidogo. Kuna swali yoyote kuhusu doo yako tunaweza kukusaidia?`
          : `Hi ${rider.firstName}. It has been a while. Any question about your money we can help with?`;

    await postMessage({
      conversationId,
      senderType: "SYSTEM",
      senderName: "BodaPesa",
      body,
    });
    await run("UPDATE Rider SET status = 'DORMANT', updatedAt = ? WHERE id = ?", [now(), rider.id]);
  }
  ran.dormantRidersReached = dormant.length;

  /* ── 3. What the queue looks like afterwards ──────────────────────── */
  ran.openLeads = await count(
    "SELECT COUNT(*) AS n FROM Lead WHERE status IN ('NEW','CONTACTED','QUALIFIED')",
  );
  ran.conversationsWaiting = await count(
    "SELECT COUNT(*) AS n FROM Conversation WHERE staffUnread > 0 AND status <> 'RESOLVED'",
  );

  return NextResponse.json({ ok: true, at: now(), ...ran });
}
