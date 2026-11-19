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
        <h2 className="display-sm">{title}</h2>
        {subtitle ? <p className="text-xs text-[var(--text-faint)] mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const STAT_MARK: Record<string, string> = {
  brand: "#ffffff",
  accent: "var(--accent)",
  success: "var(--success)",
  info: "var(--text-muted)",
  pink: "var(--text-muted)",
  danger: "var(--danger)",
  default: "var(--text-faint)",
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
    <div style={{ borderTop: "1px solid var(--border-strong)", paddingTop: "1rem" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="stat-label">{label}</div>
        {icon ? (
          <span className="shrink-0" style={{ color: mark, marginTop: "-0.15rem" }}>
            {icon}
          </span>
        ) : null}
      </div>
      <div className="stat-value" style={{ marginTop: "0.9rem" }}>
        {value}
      </div>
      {hint ? (
        <div style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: "0.45rem" }}>{hint}</div>
      ) : null}
    </div>
  );
}

const TONES: Record<string, { bg: string; fg: string }> = {
  brand: { bg: "transparent", fg: "var(--brand-strong)" },
  success: { bg: "transparent", fg: "var(--success)" },
  pink: { bg: "transparent", fg: "var(--text-muted)" },
  accent: { bg: "transparent", fg: "var(--accent)" },
  danger: { bg: "transparent", fg: "var(--danger)" },
  info: { bg: "transparent", fg: "var(--text-muted)" },
  neutral: { bg: "transparent", fg: "var(--text-faint)" },
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
    <span className="pill" style={{ background: t.bg, color: t.fg, borderColor: "currentColor" }}>
      {dot ? <span className="w-1.5 h-1.5 rounded-none" style={{ background: t.fg }} /> : null}
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
      ? "var(--accent)"
      : tone === "info"
        ? "var(--text-muted)"
        : tone === "success"
          ? "var(--success)"
          : "#ffffff";
  return (
    <div style={{ height: "3px", width: "100%", background: "var(--rule)", overflow: "hidden" }}>
      <div className="bar-fill" style={{ height: "100%", width: `${pct}%`, background: colour }} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm text-[var(--text-faint)] py-10 text-center border-2 border-dashed rounded-none" style={{ borderColor: "var(--border-strong)" }}>
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
