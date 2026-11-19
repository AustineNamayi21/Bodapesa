"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";

import type { FormState } from "@/lib/form-state";

/**
 * Keeps an open thread current.
 *
 * `router.refresh()` re-runs the server component and streams the new
 * markup in, which means the message list, the unread badges and the lead
 * state all update from one mechanism — no second JSON endpoint to keep in
 * step with the page, and no websocket to hold open on a serverless host.
 *
 * Polling pauses while the tab is hidden. A rider on a Nairobi stage is
 * paying for this data.
 */
export function ChatPoller({ intervalMs = 10000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => router.refresh(), intervalMs);
    };
    const stop = () => {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  return null;
}

/** Pins the thread to the newest message, including when one arrives. */
export function ScrollToLatest({ dep }: { dep: string | number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "end" });
  }, [dep]);
  return <div ref={ref} />;
}

function SendButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending} style={{ minWidth: "5.5rem" }}>
      {pending ? "…" : <>{label} <Send size={13} /></>}
    </button>
  );
}

/**
 * The composer.
 *
 * Clearing the box is driven off a successful result rather than optimism:
 * if the send failed, whatever the rider typed is still there. On a flaky
 * connection that is the difference between a retry and a lost question.
 */
export function Composer({
  action,
  conversationId,
  productId,
  placeholder,
  label = "Send",
  autoFocus = false,
  redirectBase,
}: {
  action: (prev: FormState | undefined, formData: FormData) => Promise<FormState>;
  conversationId?: string;
  productId?: string;
  placeholder: string;
  label?: string;
  autoFocus?: boolean;
  /**
   * Prefix to navigate to once a brand-new thread exists; the new thread's id
   * is appended. A string rather than a callback because this renders inside
   * server components, and a function is not serialisable across that line.
   */
  redirectBase?: string;
}) {
  const [state, formAction] = useActionState(action, null as FormState);
  const formRef = useRef<HTMLFormElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state?.ok) return;
    formRef.current?.reset();
    if (redirectBase && state.ok !== "sent") router.push(`${redirectBase}${state.ok}`);
    else router.refresh();
  }, [state, router, redirectBase]);

  return (
    <form ref={formRef} action={formAction} style={{ display: "grid", gap: "0.6rem" }}>
      {conversationId ? <input type="hidden" name="conversationId" value={conversationId} /> : null}
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}

      <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
        <textarea
          ref={boxRef}
          name="body"
          rows={2}
          required
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="field-boxed"
          style={{ flex: 1, resize: "none", minHeight: "3.25rem", padding: "0.75rem 0.9rem" }}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter is a new line. Matches every other
            // chat a rider already uses.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <SendButton label={label} />
      </div>

      {state?.error ? (
        <p role="alert" style={{ fontSize: "0.78rem", color: "var(--danger)" }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
