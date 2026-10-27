"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Method = "MPESA" | "CARD";
type Phase = "form" | "sending" | "waiting" | "success" | "failed" | "timeout";

interface MethodInfo {
  available: boolean;
  /** simulated | sandbox | live */
  mode: string;
}

interface Props {
  methods: { MPESA: MethodInfo; CARD: MethodInfo };
  presets: number[];
  impact: { amountKes: number; text: string }[];
  min: number;
  max: number;
  /** Display name of the card processor, e.g. "Paystack". */
  cardProvider: string;
}

const POLL_MS = 3000;
const MAX_POLLS = 34; // ~100 seconds — longer than an M-Pesa prompt stays alive

const fmt = (n: number) => `KSh ${Math.round(n).toLocaleString("en-KE")}`;

export default function DonateForm({ methods, presets, impact, min, max, cardProvider }: Props) {
  const firstAvailable: Method = methods.MPESA.available ? "MPESA" : "CARD";
  const [method, setMethod] = useState<Method>(firstAvailable);
  const [preset, setPreset] = useState<number | "custom">(presets[1] ?? presets[0]);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => stopPolling, [stopPolling]);

  const amount = preset === "custom" ? Math.round(Number(custom)) : preset;
  const amountValid = Number.isFinite(amount) && amount >= min && amount <= max;
  const tier = preset !== "custom" ? impact.find((t) => t.amountKes === preset) : undefined;
  const testMode = methods[method].mode !== "live";

  function poll(ref: string) {
    let tries = 0;
    stopPolling();
    timer.current = setInterval(async () => {
      tries++;
      try {
        const res = await fetch(`/api/donate/status?ref=${encodeURIComponent(ref)}`, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { status: string; amount: number; receipt: string | null; reason: string | null };
          if (data.status === "SUCCESS") {
            stopPolling();
            setReceipt(data.receipt);
            setPaidAmount(data.amount);
            setPhase("success");
            return;
          }
          if (data.status === "FAILED" || data.status === "CANCELLED") {
            stopPolling();
            setError(data.reason || "The payment was not completed.");
            setPhase("failed");
            return;
          }
        }
      } catch {
        // transient network error — keep polling
      }
      if (tries >= MAX_POLLS) {
        stopPolling();
        setPhase("timeout");
      }
    }, POLL_MS);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!amountValid) {
      setError(`Enter an amount between ${fmt(min)} and ${fmt(max)}.`);
      return;
    }

    setPhase("sending");
    try {
      const res = await fetch(method === "MPESA" ? "/api/donate/mpesa" : "/api/donate/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, name, phone, email, note, anonymous }),
      });
      const data = (await res.json().catch(() => ({}))) as { ref?: string; link?: string; error?: string };
      if (!res.ok || !data.ref) {
        setError(data.error || "Something went wrong. Please try again.");
        setPhase("form");
        return;
      }
      if (method === "CARD") {
        // Hand over to Flutterwave's hosted, PCI-compliant page.
        window.location.href = data.link!;
        return;
      }
      setPhase("waiting");
      poll(data.ref);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setPhase("form");
    }
  }

  function reset() {
    stopPolling();
    setPhase("form");
    setError("");
  }

  // ----------------------------------------------------------- end states --

  if (phase === "success") {
    return (
      <div className="card p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full grid place-items-center text-xl mb-3" style={{ background: "var(--brand-soft)", color: "var(--brand-strong)" }}>
          ✓
        </div>
        <h3 className="font-semibold text-lg tracking-tight">Asante sana{name ? `, ${name.split(" ")[0]}` : ""}!</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1.5">
          Your {fmt(paidAmount)} gift is received. You&rsquo;re helping boda boda riders learn to save, borrow and insure wisely.
        </p>
        {receipt ? <p className="text-xs text-[var(--text-faint)] mt-3">M-Pesa receipt: {receipt}</p> : null}
        <button className="btn btn-ghost mt-5" onClick={reset}>
          Make another donation
        </button>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="card p-6 text-center">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--brand)" }} />
        <h3 className="font-semibold tracking-tight">Check your phone</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1.5">
          An M-Pesa prompt for <strong className="text-[var(--text)]">{fmt(amount)}</strong> is on its way to {phone}. Enter your M-Pesa PIN to finish.
        </p>
        <button className="btn btn-ghost btn-sm mt-5" onClick={reset}>
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "failed" || phase === "timeout") {
    return (
      <div className="card p-6 text-center">
        <h3 className="font-semibold tracking-tight">
          {phase === "failed" ? "The donation didn’t go through" : "We haven’t heard back yet"}
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-1.5">
          {phase === "failed"
            ? error
            : "If you entered your PIN, your gift will still be recorded and M-Pesa will SMS you a receipt. If not, you can try again."}
        </p>
        <button className="btn btn-primary mt-5" onClick={reset}>
          Try again
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------------ form --

  const sending = phase === "sending";

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6 space-y-5" noValidate>
      {testMode ? (
        <div className="text-[0.75rem] rounded-lg px-3 py-2" style={{ background: "var(--info-soft)", color: "var(--info)" }}>
          Test mode — {methods[method].mode === "sandbox" ? "the provider sandbox is in use" : "payments are simulated"}, so no real money moves.
        </div>
      ) : null}

      {/* method */}
      <div role="tablist" aria-label="Payment method" className="grid grid-cols-2 gap-2">
        {(["MPESA", "CARD"] as Method[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={method === m}
            disabled={!methods[m].available || sending}
            onClick={() => setMethod(m)}
            className="btn"
            style={{
              background: method === m ? "var(--brand-soft)" : "transparent",
              color: method === m ? "var(--brand-strong)" : "var(--text-muted)",
              borderColor: method === m ? "var(--brand)" : "var(--border-strong)",
            }}
          >
            {m === "MPESA" ? "M-Pesa" : "Card"}
            {!methods[m].available ? <span className="text-[0.65rem] opacity-70">soon</span> : null}
          </button>
        ))}
      </div>

      {/* amount */}
      <div>
        <span className="label">Amount (KES)</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              disabled={sending}
              onClick={() => setPreset(p)}
              className="btn"
              aria-pressed={preset === p}
              style={{
                background: preset === p ? "var(--brand)" : "transparent",
                color: preset === p ? "#fff" : "var(--text)",
                borderColor: preset === p ? "var(--brand)" : "var(--border-strong)",
              }}
            >
              {p.toLocaleString("en-KE")}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPreset("custom")}
          className="text-[0.78rem] font-semibold mt-2"
          style={{ color: "var(--brand)" }}
          hidden={preset === "custom"}
        >
          Enter a different amount
        </button>
        {preset === "custom" ? (
          <input
            className="input mt-2"
            inputMode="numeric"
            placeholder={`${min} – ${max.toLocaleString("en-KE")}`}
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
            aria-label="Custom amount in Kenya shillings"
            autoFocus
          />
        ) : null}
        {tier ? (
          <p className="text-[0.78rem] text-[var(--text-muted)] mt-2">
            <strong className="text-[var(--text)]">{fmt(tier.amountKes)}</strong> {tier.text}.
          </p>
        ) : null}
      </div>

      {/* donor */}
      <div className="grid gap-3 sm:grid-cols-2">
        {method === "MPESA" ? (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="d-phone">M-Pesa phone number</label>
            <input id="d-phone" className="input" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sending} />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="d-email">Email (for your receipt)</label>
            <input id="d-email" type="email" className="input" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={sending} />
            <p className="text-[0.72rem] text-[var(--text-faint)] mt-1.5">
              Next, you&rsquo;ll enter your card number, expiry date and CVV on {cardProvider}&rsquo;s secure payment page.
            </p>
          </div>
        )}
        <div>
          <label className="label" htmlFor="d-name">Your name (optional)</label>
          <input id="d-name" className="input" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} disabled={sending} />
        </div>
        <div>
          <label className="label" htmlFor="d-note">A message (optional)</label>
          <input id="d-note" className="input" maxLength={200} placeholder="Keep riding, keep saving!" value={note} onChange={(e) => setNote(e.target.value)} disabled={sending} />
        </div>
      </div>

      <label className="flex items-start gap-2 text-[0.8rem] text-[var(--text-muted)] cursor-pointer">
        <input type="checkbox" className="mt-0.5" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} disabled={sending} />
        Keep my name off the public supporters list
      </label>

      {error ? (
        <p className="text-[0.8rem]" role="alert" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-primary w-full py-3" disabled={sending || !amountValid}>
        {sending
          ? method === "CARD" ? "Opening secure payment page…" : "Please wait…"
          : amountValid
            ? method === "MPESA" ? `Donate ${fmt(amount)} with M-Pesa` : `Continue to card payment · ${fmt(amount)}`
            : "Enter an amount"}
      </button>

      <p className="text-[0.7rem] text-[var(--text-faint)] text-center leading-relaxed">
        {method === "MPESA"
          ? "You'll get an M-Pesa prompt on your phone. We never see your PIN."
          : `You'll be taken to ${cardProvider}'s secure page to enter your card details. We never see or store them.`}
      </p>
    </form>
  );
}
