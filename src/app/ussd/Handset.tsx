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
    setLog([{ dir: "in", text: `Dialling *384*14791# from ${phone}` }]);
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

  const press = (k: string) => {
    if (busy) return;
    if (!sessionId) setPhone((v) => (v + k).slice(0, 14));
    else if (!ended) setInput((v) => (v + k).slice(0, 40));
  };

  const KEYS: [string, string][] = [
    ["1", ""], ["2", "ABC"], ["3", "DEF"],
    ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
    ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
    ["*", ""], ["0", "+"], ["#", ""],
  ];

  return (
    <div className="space-y-4">
      {/* handset */}
      <div
        className="relative mx-auto w-full max-w-[330px] rounded-[44px] p-4 pb-5 animate-pop"
        style={{
          background: "linear-gradient(160deg, #2b3036 0%, #15181b 55%, #0b0d0f 100%)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.12), 0 0 0 3px var(--ink)",
        }}
      >
        <div className="mx-auto mb-3 w-16 h-1.5 rounded-full" style={{ background: "#07080a", boxShadow: "inset 0 1px 1px rgba(0,0,0,0.8)" }} />
        <div className="rounded-[20px] p-2.5" style={{ background: "#07110b", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)" }}>
          <div className="flex items-center justify-between mb-1.5 px-1 text-[0.62rem] font-mono" style={{ color: "#6fd39a" }}>
            <span className="flex items-end gap-[2px]" aria-hidden="true">
              {[4, 6, 8, 10].map((h) => (
                <span key={h} className="w-[3px] rounded-sm" style={{ height: h, background: "#6fd39a" }} />
              ))}
            </span>
            <span className="font-bold tracking-wide">Safaricom</span>
            <span aria-hidden="true">▮▮▮▯</span>
          </div>
          <div className="ussd-screen rounded-xl p-3 min-h-[228px]">
            {screen ? (
              <>
                {screen}
                {sessionId && !ended ? (
                  <div className="mt-2 pt-2 border-t border-dashed border-[#2f5a40]">
                    &gt; {input}
                    <span className="ussd-caret" />
                  </div>
                ) : null}
              </>
            ) : sessionId ? (
              <span className="opacity-70">Connecting…</span>
            ) : (
              <>
                <span className="opacity-70">Enter a number, then press the green key.</span>
                {"\n\n"}
                {phone ? <span className="text-lg tracking-wider">{phone}</span> : null}
                <span className="ussd-caret" />
              </>
            )}
            {ended ? <div className="mt-3 text-[0.7rem] opacity-60">— session ended —</div> : null}
          </div>
        </div>

        {/* call / hang up */}
        <div className="grid grid-cols-3 gap-2 mt-3 items-center">
          <button
            type="button"
            onClick={() => (sessionId ? (ended ? hangUp() : send()) : dial())}
            disabled={busy || (!sessionId && !phone.trim()) || (Boolean(sessionId) && !ended && !input.trim())}
            className="h-10 rounded-2xl grid place-items-center font-extrabold text-white transition-transform active:translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(180deg, #22c55e, #15803d)", boxShadow: "0 2px 0 #0b3d1d" }}
            aria-label={sessionId ? "Send reply" : "Call"}
          >
            ✆
          </button>
          <button
            type="button"
            onClick={() => (sessionId ? setInput((v) => v.slice(0, -1)) : setPhone((v) => v.slice(0, -1)))}
            className="h-8 rounded-xl text-[0.66rem] font-bold tracking-widest text-white/70"
            style={{ background: "#1c2024" }}
          >
            ⌫ CLR
          </button>
          <button
            type="button"
            onClick={hangUp}
            className="h-10 rounded-2xl grid place-items-center font-extrabold text-white transition-transform active:translate-y-0.5"
            style={{ background: "linear-gradient(180deg, #ef4444, #b91c1c)", boxShadow: "0 2px 0 #4c0b0b" }}
            aria-label="Hang up"
          >
            ✕
          </button>
        </div>

        {/* keypad */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {KEYS.map(([k, letters]) => (
            <button key={k} type="button" className="keypad-key" onClick={() => press(k)} disabled={busy || ended}>
              <span>
                {k}
                <small>{letters || "\u00a0"}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* typed controls — also usable with a keyboard */}
      {!sessionId ? (
        <div className="card p-3 flex gap-2">
          <input
            className="input font-mono"
            placeholder="0712 345 678"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && dial()}
            aria-label="Phone number"
          />
          <button className="btn btn-primary shrink-0" onClick={dial} disabled={busy || !phone.trim()}>
            Dial
          </button>
        </div>
      ) : (
        <div className="card p-3 flex gap-2">
          <input
            className="input font-mono"
            placeholder={ended ? "Session ended" : "Type your reply…"}
            value={input}
            disabled={ended || busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            aria-label="Reply"
          />
          {ended ? (
            <button className="btn btn-accent shrink-0" onClick={hangUp}>
              New call
            </button>
          ) : (
            <button className="btn btn-primary shrink-0" onClick={send} disabled={busy || !input.trim()}>
              Send
            </button>
          )}
        </div>
      )}

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
                className="w-full flex items-center justify-between gap-2 text-[0.78rem] p-2 rounded-xl hover:bg-[var(--surface-2)] text-left transition-colors"
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
                  style={{ color: l.dir === "in" ? "var(--brand-strong)" : "var(--success)" }}
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
