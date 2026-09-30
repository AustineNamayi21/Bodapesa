"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addDepositAction, createGoalAction } from "@/lib/actions";
import type { Lang } from "@/lib/types";

const PRESETS: { title: Record<Lang, string>; amount: number }[] = [
  { title: { EN: "SACCO share capital", SW: "Hisa za SACCO", SH: "Shares za SACCO" }, amount: 5000 },
  { title: { EN: "Annual insurance premium", SW: "Malipo ya bima ya mwaka", SH: "Bima ya mwaka" }, amount: 10000 },
  { title: { EN: "Emergency fund", SW: "Akiba ya dharura", SH: "Emergency fund" }, amount: 15000 },
  { title: { EN: "Deposit for my own bike", SW: "Malipo ya awali ya pikipiki yangu", SH: "Deposit ya pikipiki yangu" }, amount: 50000 },
];

const QUICK = [50, 100, 200, 500];

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full" disabled={pending}>
      {pending ? "…" : label}
    </button>
  );
}

export default function GoalForms({
  mode,
  riderId,
  goalId,
  lang,
}: {
  mode: "create" | "deposit";
  riderId: string;
  goalId?: string;
  lang: Lang;
}) {
  const [createState, createAction] = useActionState(createGoalAction, null as { error?: string; ok?: string } | null);
  const [depositState, depositAction] = useActionState(addDepositAction, null as { error?: string; ok?: string } | null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState("");

  if (mode === "deposit") {
    return (
      <form action={depositAction} className="space-y-2">
        <input type="hidden" name="goalId" value={goalId} />
        <div className="flex gap-1.5">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setDeposit(String(q))}
              className="flex-1 rounded-xl py-2 font-extrabold tabular-nums border-2 transition-all hover:-translate-y-0.5"
              style={{
                background: deposit === String(q) ? "var(--matatu)" : "var(--surface)",
                borderColor: deposit === String(q) ? "var(--ink)" : "var(--border-strong)",
                boxShadow: deposit === String(q) ? "2px 2px 0 var(--ink)" : "none",
              }}
            >
              +{q}
            </button>
          ))}
        </div>
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          min={1}
          className="input"
          placeholder={lang === "EN" ? "Amount in KSh" : "Kiasi cha KSh"}
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          required
        />
        {depositState?.error ? (
          <p className="text-[0.76rem]" style={{ color: "var(--danger)" }}>{depositState.error}</p>
        ) : null}
        <Submit label={lang === "EN" ? "Record it" : lang === "SH" ? "Record" : "Rekodi"} />
      </form>
    );
  }

  return (
    <form action={createAction} className="space-y-3">
      <input type="hidden" name="riderId" value={riderId} />

      <div className="space-y-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.amount}
            type="button"
            onClick={() => {
              setTitle(p.title[lang]);
              setAmount(String(p.amount));
            }}
            className="w-full flex items-center justify-between gap-2 p-3 rounded-2xl text-[0.85rem] text-left border-2 transition-all hover:-translate-y-0.5"
            style={{
              background: title === p.title[lang] ? "var(--accent-soft)" : "var(--surface)",
              borderColor: title === p.title[lang] ? "var(--ink)" : "var(--border)",
              boxShadow: title === p.title[lang] ? "3px 3px 0 var(--ink)" : "none",
              color: "var(--text)",
            }}
          >
            <span className="font-semibold">{p.title[lang]}</span>
            <span className="tabular-nums shrink-0 font-semibold">KSh {p.amount.toLocaleString()}</span>
          </button>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="title">{lang === "EN" ? "Goal" : "Lengo"}</label>
        <input
          id="title"
          name="title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label" htmlFor="targetAmount">{lang === "EN" ? "Amount (KSh)" : "Kiasi (KSh)"}</label>
          <input
            id="targetAmount"
            name="targetAmount"
            type="number"
            inputMode="numeric"
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="days">{lang === "EN" ? "In how long?" : "Kwa muda gani?"}</label>
          <select id="days" name="days" className="select" defaultValue="180">
            <option value="90">{lang === "EN" ? "3 months" : "Miezi 3"}</option>
            <option value="180">{lang === "EN" ? "6 months" : "Miezi 6"}</option>
            <option value="365">{lang === "EN" ? "1 year" : "Mwaka 1"}</option>
          </select>
        </div>
      </div>

      {createState?.error ? (
        <p className="text-[0.76rem]" style={{ color: "var(--danger)" }}>{createState.error}</p>
      ) : null}
      <Submit label={lang === "EN" ? "Create goal" : lang === "SH" ? "Weka goal" : "Weka lengo"} />
    </form>
  );
}
