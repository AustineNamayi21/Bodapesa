import { Flag, HandCoins, Landmark, PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";
import type { CSSProperties } from "react";
import { BodaRider } from "./brand";

/** Literacy score as an animated ring. */
export function ScoreRing({ value, size = 104, label }: { value: number; size?: number; label?: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="ring-draw"
          style={{ ["--c" as string]: c } as CSSProperties}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3ad17a" />
            <stop offset="100%" stopColor="#0e7f3f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display font-extrabold text-[1.9rem] leading-none tabular-nums">{value}</div>
          {label ? <div className="text-[0.58rem] font-bold uppercase tracking-wider opacity-70 mt-0.5">{label}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** The rider's journey through the curriculum — a boda riding towards the flag. */
export function JourneyBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="relative pt-11 pr-8">
      <div className="h-3.5 rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.14)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full progress-stripes bar-fill"
          style={{ width: `${pct}%`, backgroundColor: "var(--green-bright)" }}
        />
      </div>
      <div className="absolute top-0 left-0 right-8 pointer-events-none">
        <div className="relative">
          <div className="absolute ride-in" style={{ left: `${pct}%`, transform: "translateX(-62%)" }}>
            <BodaRider size={58} moving={pct < 100} onDark />
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-[-4px]" aria-hidden="true" style={{ color: "var(--green-bright)" }}>
        <Flag size={20} />
      </div>
    </div>
  );
}

/** A savings jar that fills to the goal percentage. */
export function SavingsJar({ pct, size = 120 }: { pct: number; size?: number }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative shrink-0" style={{ width: size * 0.8, height: size }}>
      <svg viewBox="0 0 80 100" width={size * 0.8} height={size} className="absolute inset-0 z-10" aria-hidden="true">
        <rect x="22" y="2" width="36" height="12" rx="4" fill="var(--green)" stroke="var(--line)" strokeWidth="3" />
        <path
          d="M18 16 H62 Q70 16 70 26 V86 Q70 97 58 97 H22 Q10 97 10 86 V26 Q10 16 18 16 Z"
          fill="none"
          stroke="var(--line)"
          strokeWidth="3.5"
        />
        <path d="M18 30 Q16 50 18 70" stroke="rgba(255,255,255,0.7)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${(11.5 / 80) * 100}%`,
          right: `${(11.5 / 80) * 100}%`,
          top: `${(17.5 / 100) * 100}%`,
          bottom: `${(4.5 / 100) * 100}%`,
          borderRadius: "10px 10px 12px 12px",
          background: "color-mix(in oklab, var(--mpesa) 10%, var(--surface))",
        }}
      >
        <div className="absolute inset-x-0 bottom-0 jar-fill" style={{ height: `${p}%` }}>
          <svg className="absolute -top-2 left-0 h-3 jar-wave" style={{ width: "200%" }} viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 5 Q15 0 30 5 T60 5 T90 5 T120 5 V10 H0 Z" fill="var(--green-bright)" />
          </svg>
          <div className="absolute inset-0 top-0.5" style={{ background: "linear-gradient(180deg, var(--green-bright), var(--green))" }} />
          <div className="absolute inset-0 grid place-items-center text-[0.9rem] font-extrabold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
            {p >= 18 ? "KSh" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

const MODULE_ICON = {
  SAVINGS: PiggyBank,
  CREDIT: HandCoins,
  INVESTMENT: TrendingUp,
  INSURANCE: ShieldCheck,
  PENSION: Landmark,
} as const;

export function ModuleIcon({ moduleKey, size = 20, className = "" }: { moduleKey: string; size?: number; className?: string }) {
  const Icon = MODULE_ICON[moduleKey as keyof typeof MODULE_ICON] ?? PiggyBank;
  return <Icon size={size} className={className} />;
}
