import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={`card ${padded ? "p-4 sm:p-5" : ""} ${className}`}>{children}</div>;
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-[0.95rem] font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="text-xs text-[var(--text-faint)] mt-0.5">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "accent" | "danger";
}) {
  const colour =
    tone === "brand"
      ? "var(--brand)"
      : tone === "accent"
        ? "var(--accent)"
        : tone === "danger"
          ? "var(--danger)"
          : "var(--text)";
  return (
    <div className="card p-4">
      <div className="stat-label">{label}</div>
      <div className="stat-value mt-1" style={{ color: colour }}>
        {value}
      </div>
      {hint ? <div className="text-[0.7rem] text-[var(--text-faint)] mt-1">{hint}</div> : null}
    </div>
  );
}

const TONES: Record<string, { bg: string; fg: string }> = {
  brand: { bg: "var(--brand-soft)", fg: "var(--brand-strong)" },
  accent: { bg: "var(--accent-soft)", fg: "var(--accent)" },
  danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  info: { bg: "var(--info-soft)", fg: "var(--info)" },
  neutral: { bg: "var(--surface-2)", fg: "var(--text-muted)" },
};

export function Pill({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES | string;
  dot?: boolean;
}) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <span className="pill" style={{ background: t.bg, color: t.fg }}>
      {dot ? <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.fg }} /> : null}
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<string, string> = {
  PROSPECT: "neutral",
  ENROLLED: "info",
  ACTIVE: "accent",
  ONBOARDED: "brand",
  DORMANT: "neutral",
  OPTED_OUT: "danger",
  NEW: "info",
  CONTACTED: "accent",
  QUALIFIED: "accent",
  CONVERTED: "brand",
  DECLINED: "danger",
  DRAFT: "neutral",
  SCHEDULED: "info",
  SENDING: "accent",
  SENT: "brand",
  DELIVERED: "brand",
  READ: "brand",
  FAILED: "danger",
  QUEUED: "neutral",
  CANCELLED: "danger",
};

export const CATEGORY_TONE: Record<string, string> = {
  SAVINGS: "brand",
  CREDIT: "accent",
  INSURANCE: "info",
  INVESTMENT: "brand",
  PENSION: "neutral",
};

export function Bar({ value, max, tone = "brand" }: { value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const colour = tone === "accent" ? "var(--accent)" : tone === "info" ? "var(--info)" : "var(--brand)";
  return (
    <div className="h-1.5 rounded-full w-full" style={{ background: "var(--surface-2)" }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colour }} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm text-[var(--text-faint)] py-8 text-center border border-dashed rounded-[var(--radius)]">
      {children}
    </div>
  );
}

export function formatKes(n: number): string {
  return `KSh ${Math.round(n).toLocaleString("en-KE")}`;
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

/** Whole days between now and an ISO date, floored at zero. */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - new Date().getTime()) / 86400000));
}

const MODE_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  live: { bg: "var(--brand-soft)", fg: "var(--brand-strong)", label: "Live" },
  sandbox: { bg: "var(--info-soft)", fg: "var(--info)", label: "Provider sandbox" },
  simulated: { bg: "var(--surface-2)", fg: "var(--text-faint)", label: "Simulated" },
};

/** Shows whether a channel is simulated, on a provider sandbox, or live. */
export function ModePill({ mode }: { mode: string }) {
  const m = MODE_STYLE[mode] ?? MODE_STYLE.simulated;
  return (
    <span className="pill" style={{ background: m.bg, color: m.fg }}>
      {m.label}
    </span>
  );
}
