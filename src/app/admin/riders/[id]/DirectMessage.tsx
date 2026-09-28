"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { sendDirectMessageAction } from "@/lib/actions";
import { smsParts } from "@/lib/i18n";

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending || disabled}>
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

export default function DirectMessage({
  riderId,
  defaultChannel,
  consented,
}: {
  riderId: string;
  defaultChannel: string;
  consented: boolean;
}) {
  const [state, action] = useActionState(
    sendDirectMessageAction,
    null as { error?: string; ok?: string } | null,
  );
  const [body, setBody] = useState("");
  const { chars, parts, unicode } = smsParts(body);

  if (!consented) {
    return (
      <p className="text-[0.8rem]" style={{ color: "var(--danger)" }}>
        This rider has not given messaging consent, so no message can be sent to them.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="riderId" value={riderId} />
      <select name="channel" defaultValue={defaultChannel} className="select">
        <option value="SMS">SMS</option>
        <option value="WHATSAPP">WhatsApp</option>
        <option value="APP">In-app inbox</option>
        <option value="USSD">USSD inbox</option>
      </select>
      <textarea
        name="body"
        className="textarea"
        placeholder="Write the message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.7rem] text-[var(--text-faint)] tabular-nums">
          {chars} chars · {parts} SMS part{parts === 1 ? "" : "s"}
          {unicode ? " · unicode" : ""}
        </span>
        <Submit disabled={!body.trim()} />
      </div>
      {state?.error ? (
        <p className="text-[0.78rem]" style={{ color: "var(--danger)" }}>{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-[0.78rem]" style={{ color: "var(--brand)" }}>{state.ok}</p>
      ) : null}
    </form>
  );
}
