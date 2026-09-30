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
        <h2 className="text-[1.15rem] leading-tight">{title}</h2>
        {subtitle ? <p className="text-xs text-[var(--text-faint)] mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const STAT_MARK: Record<string, string> = {
  default: "var(--border-strong)",
  brand: "var(--sunset)",
  accent: "var(--matatu)",
  success: "var(--mpesa)",
  info: "var(--sky)",
  pink: "var(--kanga)",
  danger: "var(--danger)",
};

/**
 * A headline number. The value always wears text ink; the coloured bar and
 * icon carry the tile's identity (colour is never the only signal).
 */
export function Stat({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "brand" | "accent" | "success" | "info" | "pink" | "danger";
  icon?: ReactNode;
}) {
  const mark = STAT_MARK[tone] ?? STAT_MARK.default;
  return (
    <div className="card p-4 relative overflow-hidden lift">
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: mark }} />
      <div className="flex items-start justify-between gap-2">
        <div className="stat-label">{label}</div>
        {icon ? (
          <span
            className="w-8 h-8 rounded-xl grid place-items-center shrink-0 -mt-1 -mr-1"
            style={{ background: `color-mix(in oklab, ${mark} 22%, var(--surface))`, color: "var(--text)" }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="stat-value mt-1">{value}</div>
      {hint ? <div className="text-[0.72rem] text-[var(--text-faint)] mt-1">{hint}</div> : null}
    </div>
  );
}

const TONES: Record<string, { bg: string; fg: string }> = {
  brand: { bg: "var(--brand-soft)", fg: "var(--brand-strong)" },
  success: { bg: "var(--success-soft)", fg: "var(--success)" },
  pink: { bg: "var(--pink-soft)", fg: "var(--pink)" },
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
  ONBOARDED: "success",
  DORMANT: "neutral",
  OPTED_OUT: "danger",
  NEW: "info",
  CONTACTED: "accent",
  QUALIFIED: "accent",
  CONVERTED: "success",
  DECLINED: "danger",
  DRAFT: "neutral",
  SCHEDULED: "info",
  SENDING: "accent",
  SENT: "success",
  DELIVERED: "success",
  READ: "success",
  FAILED: "danger",
  QUEUED: "neutral",
  CANCELLED: "danger",
};

export const CATEGORY_TONE: Record<string, string> = {
  SAVINGS: "success",
  CREDIT: "brand",
  INSURANCE: "pink",
  INVESTMENT: "info",
  PENSION: "accent",
};

export function Bar({ value, max, tone = "brand" }: { value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const colour =
    tone === "accent"
      ? "var(--matatu)"
      : tone === "info"
        ? "var(--sky)"
        : tone === "success"
          ? "var(--mpesa)"
          : "var(--sunset)";
  return (
    <div className="h-2 rounded-full w-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
      <div className="h-full rounded-full bar-fill" style={{ width: `${pct}%`, background: colour }} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm text-[var(--text-faint)] py-10 text-center border-2 border-dashed rounded-[var(--radius)]" style={{ borderColor: "var(--border-strong)" }}>
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
  live: { bg: "var(--success-soft)", fg: "var(--success)", label: "Live" },
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
