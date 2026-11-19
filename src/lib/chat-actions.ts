"use server";

import { revalidatePath } from "next/cache";

import { currentRiderId, currentUser } from "@/lib/auth";
import { id, insert, now, one, run } from "@/lib/db";
import { canStaffSee, cleanBody, markRead, openConversation, postMessage } from "@/lib/chat";
import { recordSignal } from "@/lib/signals";
import type { FormState } from "@/lib/form-state";

/* ══════════════════════════════════════════════════════════ rider side ══ */

/**
 * A rider asks a question.
 *
 * If it is about a product, the thread is routed to that product's partner
 * and an enquiry is opened at the same time — the question *is* the
 * enquiry, and making the rider press a separate "I'm interested" button
 * afterwards is how warm intent gets lost.
 */
export async function riderSendMessageAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const riderId = await currentRiderId();
  if (!riderId) return { error: "Your session has expired. Sign in again." };

  const body = cleanBody(formData.get("body"));
  if (!body) return { error: "Type a message first.", field: "body" };

  const rider = await one<{ firstName: string; lastName: string; status: string }>(
    "SELECT firstName, lastName, status FROM Rider WHERE id = ?",
    [riderId],
  );
  if (!rider) return { error: "Your session has expired. Sign in again." };

  let conversationId = String(formData.get("conversationId") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim() || null;

  if (!conversationId) {
    let partnerId: string | null = null;
    let subject = "General question";

    if (productId) {
      const product = await one<{ partnerId: string; name: string }>(
        "SELECT partnerId, name FROM Product WHERE id = ? AND active = 1",
        [productId],
      );
      if (!product) return { error: "That product is no longer available." };
      partnerId = product.partnerId;
      subject = product.name;
    }

    conversationId = await openConversation({
      riderId,
      partnerId,
      productId,
      subject,
      openedBy: "RIDER",
    });

    // A question about a product is an enquiry. Open one if the rider does
    // not already have a live one, and tie the two together so whoever picks
    // up the lead can read what was actually asked.
    if (productId && partnerId) {
      const existing = await one<{ id: string }>(
        "SELECT id FROM Lead WHERE riderId = ? AND productId = ? AND status IN ('NEW','CONTACTED','QUALIFIED')",
        [riderId, productId],
      );
      const leadId = existing?.id ?? id("led");
      if (!existing) {
        await insert("Lead", {
          id: leadId,
          riderId,
          productId,
          partnerId,
          status: "NEW",
          source: "APP",
          note: "Opened from a chat enquiry.",
          valueKes: null,
          ownerId: null,
          // Somebody owes this rider an answer tomorrow, not eventually.
          nextActionAt: new Date(Date.now() + 86_400_000).toISOString(),
          firstContactedAt: null,
          outcomeReason: null,
          conversationId,
          createdAt: now(),
          updatedAt: now(),
        });
      } else {
        await run("UPDATE Lead SET conversationId = ?, updatedAt = ? WHERE id = ?", [
          conversationId,
          now(),
          leadId,
        ]);
      }
      await run("UPDATE Conversation SET leadId = ? WHERE id = ?", [leadId, conversationId]);
      await recordSignal({ riderId, kind: "ENQUIRY_SENT", productId, detail: "Asked in chat" });
    }

    await recordSignal({ riderId, kind: "CHAT_STARTED", productId, dedupeHours: 24 });
    await run(
      "UPDATE Rider SET status = CASE WHEN status IN ('PROSPECT','ENROLLED','DORMANT') THEN 'ACTIVE' ELSE status END, lastActiveAt = ? WHERE id = ?",
      [now(), riderId],
    );
  } else {
    // Replying in a thread the rider does not own would be a nasty hole.
    const owned = await one<{ id: string }>("SELECT id FROM Conversation WHERE id = ? AND riderId = ?", [
      conversationId,
      riderId,
    ]);
    if (!owned) return { error: "That conversation could not be found." };
    // Replying is the end of being dormant, which is the whole point of the
    // nudge that most likely prompted it.
    await run(
      "UPDATE Rider SET status = CASE WHEN status IN ('PROSPECT','ENROLLED','DORMANT') THEN 'ACTIVE' ELSE status END, lastActiveAt = ? WHERE id = ?",
      [now(), riderId],
    );
  }

  await postMessage({
    conversationId,
    senderType: "RIDER",
    senderName: `${rider.firstName} ${rider.lastName}`.trim(),
    body,
  });

  revalidatePath("/rider", "layout");
  revalidatePath("/admin/conversations");
  return { ok: conversationId };
}

export async function riderMarkReadAction(formData: FormData): Promise<void> {
  const riderId = await currentRiderId();
  if (!riderId) return;
  const conversationId = String(formData.get("conversationId") ?? "");
  const owned = await one<{ id: string }>("SELECT id FROM Conversation WHERE id = ? AND riderId = ?", [
    conversationId,
    riderId,
  ]);
  if (!owned) return;
  await markRead(conversationId, "RIDER");
  revalidatePath("/rider", "layout");
}

/* ══════════════════════════════════════════════════════════ staff side ══ */

export async function staffReplyAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Your session has expired. Sign in again." };

  const conversationId = String(formData.get("conversationId") ?? "").trim();
  if (!(await canStaffSee(user, conversationId))) {
    return { error: "That conversation is not yours to answer." };
  }

  const body = cleanBody(formData.get("body"));
  if (!body) return { error: "Type a reply first.", field: "body" };

  await postMessage({
    conversationId,
    senderType: "STAFF",
    senderUserId: user.id,
    senderName: user.partnerName ? `${user.name} · ${user.partnerName}` : user.name,
    body,
  });

  // Answering is the first contact, and it stops the lead ageing silently.
  await run(
    `UPDATE Lead
        SET firstContactedAt = COALESCE(firstContactedAt, ?),
            status = CASE WHEN status = 'NEW' THEN 'CONTACTED' ELSE status END,
            ownerId = COALESCE(ownerId, ?),
            updatedAt = ?
      WHERE conversationId = ?`,
    [now(), user.id, now(), conversationId],
  );
  await run("UPDATE Conversation SET assignedToId = COALESCE(assignedToId, ?) WHERE id = ?", [
    user.id,
    conversationId,
  ]);

  revalidatePath("/admin/conversations");
  revalidatePath("/rider", "layout");
  return { ok: "sent" };
}

/** Staff opening a thread with a rider who has not asked anything yet. */
export async function staffStartConversationAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const user = await currentUser();
  if (!user) return { error: "Your session has expired. Sign in again." };

  const riderId = String(formData.get("riderId") ?? "").trim();
  const body = cleanBody(formData.get("body"));
  if (!riderId) return { error: "Pick a rider first." };
  if (!body) return { error: "Type a message first.", field: "body" };

  const rider = await one<{ id: string }>("SELECT id FROM Rider WHERE id = ? AND status <> 'OPTED_OUT'", [
    riderId,
  ]);
  if (!rider) return { error: "That rider is not reachable." };

  const productId = String(formData.get("productId") ?? "").trim() || null;
  let partnerId = user.partnerId;
  let subject = "Message from the team";

  if (productId) {
    const product = await one<{ partnerId: string; name: string }>(
      "SELECT partnerId, name FROM Product WHERE id = ?",
      [productId],
    );
    if (product) {
      // A partner may not start a thread about someone else's product.
      if (user.role !== "PLATFORM_ADMIN" && user.partnerId && product.partnerId !== user.partnerId) {
        return { error: "That product belongs to another partner." };
      }
      partnerId = product.partnerId;
      subject = product.name;
    }
  }

  const conversationId = await openConversation({
    riderId,
    partnerId,
    productId,
    subject,
    openedBy: "STAFF",
  });
  await run("UPDATE Conversation SET assignedToId = COALESCE(assignedToId, ?) WHERE id = ?", [
    user.id,
    conversationId,
  ]);
  await postMessage({
    conversationId,
    senderType: "STAFF",
    senderUserId: user.id,
    senderName: user.partnerName ? `${user.name} · ${user.partnerName}` : user.name,
    body,
  });

  revalidatePath("/admin/conversations");
  revalidatePath("/rider", "layout");
  return { ok: conversationId };
}

export async function staffSetConversationStatusAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  const conversationId = String(formData.get("conversationId") ?? "");
  if (!(await canStaffSee(user, conversationId))) return;

  const status = String(formData.get("status") ?? "");
  if (!["OPEN", "PENDING_RIDER", "RESOLVED"].includes(status)) return;

  await run("UPDATE Conversation SET status = ?, updatedAt = ? WHERE id = ?", [status, now(), conversationId]);
  revalidatePath("/admin/conversations");
}

export async function staffMarkReadAction(formData: FormData): Promise<void> {
  const user = await currentUser();
  if (!user) return;
  const conversationId = String(formData.get("conversationId") ?? "");
  if (!(await canStaffSee(user, conversationId))) return;
  await markRead(conversationId, "STAFF");
  revalidatePath("/admin/conversations");
}
