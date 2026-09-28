"use client";

import { useState } from "react";
import { ussdSimulatorAction } from "@/lib/actions";

interface Registered {
  msisdn: string;
  display: string;
  firstName: string;
  lastName: string;
  language: string;
}

export default function Handset({ registered }: { registered: Registered[] }) {
  const [phone, setPhone] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [screen, setScreen] = useState<string>("");
  const [ended, setEnded] = useState(false);
  const [path, setPath] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ dir: "in" | "out"; text: string }[]>([]);

  const post = async (sid: string, text: string) => {
    setBusy(true);
    try {
      const body = await ussdSimulatorAction(sid, phone, text);
      const isEnd = body.startsWith("END");
      setScreen(body.replace(/^(CON|END)\s?/, ""));
      setEnded(isEnd);
      setLog((l) => [...l, { dir: "out", text: body }]);
      return isEnd;
    } finally {
      setBusy(false);
    }
  };

  const dial = async () => {
    if (!phone.trim()) return;
    const sid = `sim_${Date.now().toString(36)}`;
    setSessionId(sid);
    setPath([]);
    setEnded(false);
    setLog([{ dir: "in", text: `Dialling *384*7788# from ${phone}` }]);
    await post(sid, "");
  };

  const send = async () => {
    if (!sessionId || !input.trim() || ended) return;
    const nextPath = [...path, input.trim()];
    setPath(nextPath);
    setLog((l) => [...l, { dir: "in", text: input.trim() }]);
    setInput("");
    await post(sessionId, nextPath.join("*"));
  };

  const hangUp = () => {
    setSessionId(null);
    setScreen("");
    setPath([]);
    setEnded(false);
    setInput("");
    setLog([]);
  };

  return (
    <div className="space-y-3">
      {/* handset */}
      <div className="card p-3" style={{ background: "var(--surface-2)" }}>
        <div className="rounded-xl p-3 mb-3" style={{ background: "#0c1410" }}>
          <div className="flex items-center justify-between mb-2 text-[0.6rem]" style={{ color: "#4d8a6b" }}>
            <span>Safaricom</span>
            <span>*384*7788#</span>
          </div>
          <div className="ussd-screen rounded-lg p-3 min-h-[230px]">
            {screen || (sessionId ? "…" : "Enter a phone number below and press Dial.")}
            {ended ? <div className="mt-3 text-[0.7rem] opacity-60">— session ended —</div> : null}
          </div>
        </div>

        {!sessionId ? (
          <div className="space-y-2">
            <input
              className="input"
              placeholder="0712 345 678"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && dial()}
            />
            <button className="btn btn-primary w-full" onClick={dial} disabled={busy || !phone.trim()}>
              Dial *384*7788#
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="input"
                placeholder={ended ? "Session ended" : "Type your reply…"}
                value={input}
                disabled={ended || busy}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button className="btn btn-primary shrink-0" onClick={send} disabled={ended || busy || !input.trim()}>
                Send
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((k) => (
                <button
                  key={k}
                  className="btn btn-ghost btn-sm"
                  disabled={ended || busy}
                  onClick={() => setInput((v) => v + k)}
                >
                  {k}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" disabled={ended || busy} onClick={() => setInput("")}>
                clear
              </button>
              <button className="btn btn-ghost btn-sm" onClick={hangUp}>
                hang up
              </button>
            </div>
          </div>
        )}
      </div>

      {/* quick numbers */}
      {!sessionId && registered.length === 0 ? (
        <div className="card p-4">
          <p className="text-[0.76rem] text-[var(--text-muted)] leading-relaxed">
            Type any Kenyan number and press Dial. A number that isn&rsquo;t registered yet is walked through
            registration; dialling again with it opens the main menu.
          </p>
        </div>
      ) : null}

      {!sessionId && registered.length > 0 ? (
        <div className="card p-4">
          <div className="stat-label mb-2">Registered numbers</div>
          <div className="space-y-1">
            {registered.map((r) => (
              <button
                key={r.msisdn}
                onClick={() => setPhone(r.display)}
                className="w-full flex items-center justify-between gap-2 text-[0.76rem] p-1.5 rounded hover:bg-[var(--surface-2)] text-left"
              >
                <span className="truncate">
                  {r.firstName} {r.lastName}
                  <span className="text-[var(--text-faint)]"> · {r.language}</span>
                </span>
                <code className="shrink-0 tabular-nums">{r.display}</code>
              </button>
            ))}
          </div>
          <p className="text-[0.7rem] text-[var(--text-faint)] mt-2 leading-relaxed">
            Or type any unregistered number — the menu will take you through registration.
          </p>
        </div>
      ) : null}

      {/* transcript */}
      {log.length ? (
        <div className="card p-4">
          <div className="stat-label mb-2">Session transcript</div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto scroll-thin">
            {log.map((l, i) => (
              <div key={i} className="text-[0.72rem] font-mono leading-relaxed">
                <span
                  className="font-bold mr-1.5"
                  style={{ color: l.dir === "in" ? "var(--accent)" : "var(--brand)" }}
                >
                  {l.dir === "in" ? "›" : "‹"}
                </span>
                <span className="text-[var(--text-muted)] whitespace-pre-wrap">{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
