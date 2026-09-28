"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendTestMessageAction } from "@/lib/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send test message"}
    </button>
  );
}

export default function TestSend() {
  const [state, action] = useActionState(sendTestMessageAction, null as { error?: string; ok?: string } | null);

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div>
          <label className="label" htmlFor="msisdn">
            Phone number
          </label>
          <input id="msisdn" name="msisdn" className="input" inputMode="tel" placeholder="0712 345 678" required />
        </div>
        <div>
          <label className="label" htmlFor="channel">
            Channel
          </label>
          <select id="channel" name="channel" className="select" defaultValue="SMS">
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="body">
          Message (optional)
        </label>
        <textarea
          id="body"
          name="body"
          className="textarea"
          placeholder="BodaPesa test: this message was sent from the platform to confirm live delivery."
        />
      </div>
      {state?.error ? (
        <p className="text-[0.78rem]" style={{ color: "var(--danger)" }}>
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-[0.78rem]" style={{ color: "var(--brand)" }}>
          {state.ok}
        </p>
      ) : null}
      <Submit />
      <p className="text-[0.7rem] text-[var(--text-faint)] leading-relaxed">
        On a live account each SMS costs roughly KSh 0.80. Test numbers are kept out of every campaign audience,
        and sends are capped at 20 per hour to protect your balance.
      </p>
    </form>
  );
}
