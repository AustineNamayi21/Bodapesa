import { all, id, insert, now, one, run } from "@/lib/db";

/**
 * Two-way conversations between riders and the people behind the products.
 *
 * Routing rule, and the only one that matters: a conversation carries a
 * partnerId or it does not. With one, it belongs to that partner's staff —
 * Britam see Britam, Stima see Stima. Without one, it belongs to the
 * platform team. Platform admins see everything, because somebody has to be
 * able to answer a rider whose question does not fit a product.
 *
 * Unread counts live on the Conversation row rather than being counted from
 * ChatMessage on read. Both sides poll, and a COUNT per thread per poll is
 * the kind of thing that is fine with 250 riders and painful with 25,000.
 */

export type SenderType = "RIDER" | "STAFF" | "SYSTEM";
export type ConversationStatus = "OPEN" | "PENDING_RIDER" | "RESOLVED";

export type ConversationRow = {
  id: string;
  riderId: string;
  partnerId: string | null;
  productId: string | null;
  leadId: string | null;
  subject: string;
  status: ConversationStatus;
  assignedToId: string | null;
  openedBy: SenderType;
  lastMessageAt: string;
  lastMessageFrom: SenderType;
  riderUnread: number;
  staffUnread: number;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageRow = {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderUserId: string | null;
  senderName: string;
  body: string;
  createdAt: string;
};

/** Trimmed, length-capped, and never empty. Used on both entry points. */
export function cleanBody(raw: FormDataEntryValue | null | undefined): string | null {
  const body = String(raw ?? "").replace(/\s+\n/g, "\n").trim();
  if (!body) return null;
  return body.slice(0, 2000);
}

/**
 * Opens a conversation, or returns the rider's existing open one on the same
 * subject. Riders tap the same button twice; that should not make two threads
 * for one question.
 */
export async function openConversation(opts: {
  riderId: string;
  partnerId?: string | null;
  productId?: string | null;
  subject: string;
  openedBy: SenderType;
}): Promise<string> {
  // The product branch is chosen in JavaScript rather than with `? IS NULL`:
  // Postgres cannot infer the type of a bare parameter compared to NULL and
  // rejects the statement, where SQLite accepts it happily.
  const productId = opts.productId ?? null;
  const existing = productId
    ? await one<{ id: string }>(
        `SELECT id FROM Conversation
          WHERE riderId = ? AND status <> 'RESOLVED' AND productId = ?
          ORDER BY lastMessageAt DESC LIMIT 1`,
        [opts.riderId, productId],
      )
    : await one<{ id: string }>(
        `SELECT id FROM Conversation
          WHERE riderId = ? AND status <> 'RESOLVED' AND productId IS NULL
          ORDER BY lastMessageAt DESC LIMIT 1`,
        [opts.riderId],
      );
  if (existing) return existing.id;

  const stamp = now();
  const conversationId = id("cnv");
  await insert("Conversation", {
    id: conversationId,
    riderId: opts.riderId,
    partnerId: opts.partnerId ?? null,
    productId: opts.productId ?? null,
    leadId: null,
    subject: opts.subject.slice(0, 160),
    status: "OPEN",
    assignedToId: null,
    openedBy: opts.openedBy,
    lastMessageAt: stamp,
    lastMessageFrom: opts.openedBy,
    riderUnread: 0,
    staffUnread: 0,
    createdAt: stamp,
    updatedAt: stamp,
  });
  return conversationId;
}

/**
 * Appends a message and moves the thread's state in one go.
 *
 * The unread counter that goes up is the *other* side's, and the sender's own
 * is cleared — writing a reply means you have read what you are replying to.
 * A rider's message reopens a resolved thread, because from the rider's side
 * the matter plainly is not resolved.
 */
export async function postMessage(opts: {
  conversationId: string;
  senderType: SenderType;
  senderUserId?: string | null;
  senderName: string;
  body: string;
}): Promise<void> {
  const stamp = now();
  await insert("ChatMessage", {
    id: id("msg"),
    conversationId: opts.conversationId,
    senderType: opts.senderType,
    senderUserId: opts.senderUserId ?? null,
    senderName: opts.senderName.slice(0, 80),
    body: opts.body,
    createdAt: stamp,
  });

  if (opts.senderType === "RIDER") {
    await run(
      `UPDATE Conversation
          SET staffUnread = staffUnread + 1, riderUnread = 0,
              lastMessageAt = ?, lastMessageFrom = 'RIDER',
              status = CASE WHEN status = 'RESOLVED' THEN 'OPEN' ELSE status END,
              updatedAt = ?
        WHERE id = ?`,
      [stamp, stamp, opts.conversationId],
    );
    return;
  }

  // Staff and system replies both land on the rider's side. A staff reply
  // also clears our own unread and parks the thread as waiting on the rider.
  // Whether this is a staff reply is known here, so it shapes the statement
  // instead of becoming a parameter: Postgres cannot type `? = 'STAFF'`,
  // where both sides are unknown to the planner.
  const fromStaff = opts.senderType === "STAFF";
  await run(
    `UPDATE Conversation
        SET riderUnread = riderUnread + 1,
            ${fromStaff ? "staffUnread = 0," : ""}
            lastMessageAt = ?, lastMessageFrom = ?,
            ${fromStaff ? "status = CASE WHEN status = 'OPEN' THEN 'PENDING_RIDER' ELSE status END," : ""}
            updatedAt = ?
      WHERE id = ?`,
    [stamp, opts.senderType, stamp, opts.conversationId],
  );
}

export async function messagesFor(conversationId: string, limit = 200): Promise<ChatMessageRow[]> {
  return all<ChatMessageRow>(
    `SELECT id, conversationId, senderType, senderUserId, senderName, body, createdAt
       FROM ChatMessage WHERE conversationId = ? ORDER BY createdAt ASC LIMIT ?`,
    [conversationId, limit],
  );
}

export async function markRead(conversationId: string, side: "RIDER" | "STAFF"): Promise<void> {
  const column = side === "RIDER" ? "riderUnread" : "staffUnread";
  await run(`UPDATE Conversation SET ${column} = 0 WHERE id = ?`, [conversationId]);
}

/**
 * The SQL fragment that scopes a staff member to what they may see.
 *
 * Platform admins see every thread. Partner staff see their partner's threads
 * only — not the platform's general ones, and not the other partner's. This
 * is the whole access model for chat, so it lives in one place.
 */
export function staffScope(user: { role: string; partnerId: string | null }): {
  where: string;
  params: unknown[];
} {
  if (user.role === "PLATFORM_ADMIN") return { where: "1 = 1", params: [] };
  if (!user.partnerId) return { where: "c.partnerId IS NULL", params: [] };
  return { where: "c.partnerId = ?", params: [user.partnerId] };
}

export async function canStaffSee(
  user: { role: string; partnerId: string | null },
  conversationId: string,
): Promise<boolean> {
  const scope = staffScope(user);
  const row = await one<{ id: string }>(
    `SELECT c.id FROM Conversation c WHERE c.id = ? AND ${scope.where}`,
    [conversationId, ...scope.params],
  );
  return Boolean(row);
}

/** Unread thread count for a rider — drives the badge on the app's nav. */
export async function riderUnreadCount(riderId: string): Promise<number> {
  const row = await one<{ n: number }>(
    "SELECT COALESCE(SUM(riderUnread), 0) AS n FROM Conversation WHERE riderId = ?",
    [riderId],
  );
  return Number(row?.n ?? 0);
}
