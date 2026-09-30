import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PHOTOS, type PhotoKey } from "@/lib/photos";

/* ─────────────────────────────────────────────────────────────── logo ── */

/** The BodaPesa mark: a shilling coin rolling forward on speed lines. */
export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="45" height="45" rx="13" fill="var(--sunset)" stroke="var(--ink)" strokeWidth="3" />
      <g stroke="var(--ink)" strokeWidth="3" strokeLinecap="round">
        <line x1="8" y1="18" x2="15" y2="18" />
        <line x1="6" y1="25" x2="13" y2="25" />
        <line x1="9" y1="32" x2="15" y2="32" />
      </g>
      <circle cx="29" cy="25" r="12" fill="var(--matatu)" stroke="var(--ink)" strokeWidth="3" />
      <text
        x="29"
        y="31"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="800"
        fontSize="17"
        fill="var(--ink)"
      >
        B
      </text>
    </svg>
  );
}

export function Logo({
  href = "/",
  size = 36,
  tone = "default",
  sub,
}: {
  href?: string | null;
  size?: number;
  tone?: "default" | "light";
  sub?: ReactNode;
}) {
  const body = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} className="shrink-0 transition-transform duration-300 group-hover:rotate-[-8deg]" />
      <span className="leading-none">
        <span
          className="font-display font-extrabold tracking-tight block"
          style={{ fontSize: size * 0.52, color: tone === "light" ? "var(--cream)" : "var(--text)" }}
        >
          Boda<span style={{ color: "var(--sunset)" }}>Pesa</span>
        </span>
        {sub ? (
          <span
            className="block text-[0.66rem] font-semibold mt-1"
            style={{ color: tone === "light" ? "rgba(255,243,228,0.65)" : "var(--text-faint)" }}
          >
            {sub}
          </span>
        ) : null}
      </span>
    </span>
  );
  return href ? (
    <Link href={href} className="group inline-flex">
      {body}
    </Link>
  ) : (
    body
  );
}

/* ─────────────────────────────────────────────────────────── boda art ── */

/**
 * A small side-on boda boda with rider, drawn from simple shapes. Wheels spin
 * when `moving`; used as the progress marker on the rider's journey bar.
 */
export function BodaRider({
  size = 56,
  moving = true,
  jacket = "var(--sunset)",
  onDark = false,
}: {
  size?: number;
  moving?: boolean;
  jacket?: string;
  onDark?: boolean;
}) {
  const line = onDark ? "#fff3e4" : "var(--line)";
  const tyre = onDark ? "#3a2d22" : "var(--tyre)";
  const spin: CSSProperties = moving ? { animation: "spin 0.8s linear infinite", transformBox: "fill-box", transformOrigin: "center" } : {};
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 100 72" aria-hidden="true" style={moving ? { animation: "bounce-soft 0.5s ease-in-out infinite" } : undefined}>
      {/* rear wheel */}
      <g style={spin}>
        <circle cx="22" cy="54" r="14" fill={tyre} stroke={line} strokeWidth="2" />
        <circle cx="22" cy="54" r="7" fill="#9ca3af" />
        <line x1="22" y1="44" x2="22" y2="64" stroke={line} strokeWidth="2" />
        <line x1="12" y1="54" x2="32" y2="54" stroke={line} strokeWidth="2" />
      </g>
      {/* front wheel */}
      <g style={spin}>
        <circle cx="80" cy="54" r="14" fill={tyre} stroke={line} strokeWidth="2" />
        <circle cx="80" cy="54" r="7" fill="#9ca3af" />
        <line x1="80" y1="44" x2="80" y2="64" stroke={line} strokeWidth="2" />
        <line x1="70" y1="54" x2="90" y2="54" stroke={line} strokeWidth="2" />
      </g>
      {/* frame, tank, seat */}
      <path d="M22 54 L40 38 L64 38 L80 54" fill="none" stroke={line} strokeWidth="4" strokeLinejoin="round" />
      <path d="M36 40 Q40 30 54 31 L66 33 L62 42 L40 44 Z" fill="var(--kanga)" stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 33 L76 22 L82 22" fill="none" stroke={line} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="78" y="19" width="8" height="5" rx="2" fill="var(--matatu)" stroke={line} strokeWidth="2" />
      {/* rider */}
      <path d="M44 32 L50 14 L60 16 L62 30" fill={jacket} stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M58 20 L72 24" stroke={line} strokeWidth="4" strokeLinecap="round" />
      <path d="M47 32 L56 44 L52 50" fill="none" stroke={line} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="55" cy="8" r="7.5" fill="var(--matatu)" stroke={line} strokeWidth="2.5" />
      <path d="M52 6 L61 6" stroke={line} strokeWidth="2.5" strokeLinecap="round" />
      {/* speed lines */}
      {moving ? (
        <g stroke={line} strokeWidth="2.5" strokeLinecap="round" opacity="0.35">
          <line x1="2" y1="30" x2="12" y2="30" />
          <line x1="0" y1="40" x2="8" y2="40" />
        </g>
      ) : null}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────── photos ── */

/** A photo filling its (positioned) parent, cropped around the subject. */
export function Photo({
  name,
  sizes = "100vw",
  priority = false,
  className = "",
  style,
}: {
  name: PhotoKey;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const p = PHOTOS[name];
  return (
    <Image
      src={p.src}
      alt={p.alt}
      fill
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={`object-cover ${className}`}
      style={{ objectPosition: p.focus ?? "50% 50%", ...style }}
    />
  );
}

/* ─────────────────────────────────────────────────────────── marquee ── */

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (
    <div className="flex items-center shrink-0">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5 whitespace-nowrap">{t}</span>
          <span aria-hidden="true" style={{ color: i % 3 === 0 ? "var(--sunset)" : i % 3 === 1 ? "var(--mpesa)" : "var(--kanga)" }}>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden ${className}`} aria-label={items.join(", ")}>
      <div className="marquee" aria-hidden="true">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────── decorative bits ── */

export function Blobs({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute -top-24 -left-20 w-[420px] h-[420px] rounded-full opacity-50 blur-3xl animate-blob"
        style={{ background: "var(--matatu)" }}
      />
      <div
        className="absolute top-10 right-[-120px] w-[460px] h-[460px] rounded-full opacity-35 blur-3xl animate-blob"
        style={{ background: "var(--sunset)", animationDelay: "-5s" }}
      />
      <div
        className="absolute bottom-[-160px] left-1/3 w-[380px] h-[380px] rounded-full opacity-25 blur-3xl animate-blob"
        style={{ background: "var(--kanga)", animationDelay: "-10s" }}
      />
    </div>
  );
}

/** Round badge of a coloured icon — the visual anchor on feature cards. */
export function IconBadge({
  children,
  fill,
  size = 44,
  rotate = 0,
}: {
  children: ReactNode;
  fill: string;
  size?: number;
  rotate?: number;
}) {
  return (
    <span
      className="inline-grid place-items-center shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        background: fill,
        color: fill === "var(--surface)" ? "var(--text)" : "var(--ink)",
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 var(--ink)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  );
}
