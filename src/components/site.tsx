"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/theme";
import { Logo, Photo } from "./brand";
import type { PhotoKey } from "@/lib/photos";

/* ─────────────────────────────────────────────────────────── header ── */

const NAV = [
  { href: "/#learn", label: "Learn" },
  { href: "/#how", label: "How it works" },
  { href: "/#products", label: "Products" },
  { href: "/#channels", label: "Channels" },
];

/**
 * The site header.
 *
 * Transparent over the hero photograph so the frame runs edge to edge, then
 * resolving to solid black once the page scrolls — the behaviour the
 * reference design uses to let its opening image fill the viewport. Nav is
 * 11px tracked capitals; nothing competes with the headline beneath it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over the hero the header is transparent and its type is white, whatever
  // the theme: it is sitting on a photograph. Once it has a ground under it,
  // it follows the theme.
  const solid = scrolled || open;
  const fg = solid ? "var(--on-ground)" : "#fff";
  const fgMuted = solid ? "var(--text-muted)" : "rgba(255,255,255,0.72)";

  return (
    <header
      className="fixed top-0 inset-x-0 z-50"
      data-theme-surface
      style={{
        background: solid ? "var(--ground)" : "transparent",
        borderBottom: `1px solid ${solid ? "var(--rule)" : "rgba(255,255,255,0.16)"}`,
        transition: "background 0.6s var(--ease), border-color 0.6s var(--ease)",
      }}
    >
      <div
        className="flex items-center justify-between gap-6"
        style={{ paddingInline: "var(--gutter)", height: "72px" }}
      >
        <Logo tone={solid ? "default" : "light"} size={30} />

        <nav className="hidden lg:flex items-center" style={{ gap: "2.25rem" }} aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="underline-wipe"
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: n.href === pathname ? fg : fgMuted,
              }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden sm:inline-flex underline-wipe"
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: fgMuted,
            }}
          >
            Console
          </Link>
          <ThemeToggle
            size={38}
            style={{
              color: fg,
              borderColor: solid ? "var(--border-strong)" : "rgba(255,255,255,0.45)",
            }}
          />
          <Link
            href="/rider"
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: "44px",
              padding: "0 1.2rem",
              background: solid ? "var(--on-ground)" : "#fff",
              color: solid ? "var(--ground)" : "#000",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Rider portal
          </Link>
          <button
            type="button"
            className="lg:hidden grid place-items-center"
            style={{ width: 44, height: 44, color: fg, background: "transparent", border: 0, cursor: "pointer" }}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <div
        className="lg:hidden overflow-hidden"
        style={{ maxHeight: open ? 420 : 0, background: "var(--ground)", transition: "max-height 0.6s var(--ease)" }}
      >
        <nav style={{ paddingInline: "var(--gutter)", paddingBottom: "1rem" }} aria-label="Mobile">
          {[...NAV, { href: "/admin", label: "Console" }].map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between"
              style={{
                padding: "1rem 0",
                borderBottom: "1px solid var(--rule)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--on-ground)",
              }}
            >
              {n.label}
              <ArrowRight size={15} style={{ color: "var(--accent)" }} />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────── hero slider ── */

export interface Slide {
  photo: PhotoKey;
  eyebrow: string;
  title: ReactNode;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  card?: { label: string; value: string };
}

/** Auto-advancing hero carousel: fades between slides, slow zoom on the photo. */
export function HeroCarousel({ slides, interval = 6500 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(index + 1), interval);
    return () => clearTimeout(t);
  }, [index, paused, interval, go, slides.length]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--ink)", color: "#fff" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div
        className="absolute -top-40 right-[-10%] w-[640px] h-[640px] rounded-none opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--green-bright), transparent 65%)" }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-28">
        <div className="grid">
          {slides.map((s, i) => {
            const active = i === index;
            return (
              <div
                key={i}
                className="col-start-1 row-start-1 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center transition-opacity duration-700"
                style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
                aria-hidden={!active}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
              >
                <div key={active ? `on-${index}` : `off-${i}`}>
                  <span className="eyebrow animate-rise" style={{ color: "var(--green-bright)" }}>
                    <span className="w-7 h-[2px] rounded-none" style={{ background: "var(--green-bright)" }} />
                    {s.eyebrow}
                  </span>
                  {i === 0 ? (
                    <h1 className="mt-5 text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-[4.1rem] animate-rise d-1">{s.title}</h1>
                  ) : (
                    <h2 className="mt-5 text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-[4.1rem] font-bold animate-rise d-1">{s.title}</h2>
                  )}
                  <p className="mt-6 text-[1.02rem] sm:text-lg leading-relaxed text-white/75 max-w-xl animate-rise d-2">{s.body}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-4 animate-rise d-3">
                    <Link href={s.primary.href} className="btn btn-primary btn-lg" tabIndex={active ? 0 : -1}>
                      {s.primary.label} <ArrowRight size={18} />
                    </Link>
                    {s.secondary ? (
                      <Link href={s.secondary.href} className="btn btn-lg btn-outline-light" tabIndex={active ? 0 : -1}>
                        {s.secondary.label}
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative aspect-[5/4] rounded-none overflow-hidden" style={{ boxShadow: "0 40px 80px -30px rgba(0,0,0,0.8)" }}>
                    <div key={active ? `img-${index}` : `img-off-${i}`} className="absolute inset-0 animate-kenburns">
                      <Photo name={s.photo} priority={i === 0} sizes="(max-width: 1024px) 92vw, 560px" />
                    </div>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55))" }} />
                  </div>
                  {s.card ? (
                    <div
                      className="absolute -bottom-6 left-4 sm:-left-6 rounded-none px-4 py-3 flex items-center gap-3 animate-float"
                      style={{ background: "#fff", color: "#000", boxShadow: "0 20px 40px -16px rgba(0,0,0,0.5)" }}
                    >
                      <span className="w-10 h-10 rounded-none grid place-items-center text-white font-display font-bold" style={{ background: "var(--green)" }}>
                        ✓
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-[#767676]">{s.card.label}</span>
                        <span className="block font-display font-bold text-lg">{s.card.value}</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* controls */}
        {slides.length > 1 ? (
          <div className="mt-14 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  className="relative h-1.5 rounded-none overflow-hidden transition-all duration-300"
                  style={{ width: i === index ? 48 : 18, background: "rgba(255,255,255,0.25)" }}
                >
                  {i === index ? (
                    <span
                      key={`p-${index}-${paused}`}
                      className="absolute inset-0 rounded-none origin-left"
                      style={{
                        background: "var(--green-bright)",
                        animation: paused ? "none" : `progress-x ${interval}ms linear forwards`,
                        transform: paused ? "scaleX(1)" : undefined,
                      }}
                    />
                  ) : null}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <button type="button" onClick={() => go(index - 1)} className="w-11 h-11 rounded-none grid place-items-center border border-white/25 hover:border-[var(--green-bright)] hover:text-[var(--green-bright)] transition-colors" aria-label="Previous slide">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={() => go(index + 1)} className="w-11 h-11 rounded-none grid place-items-center border border-white/25 hover:border-[var(--green-bright)] hover:text-[var(--green-bright)] transition-colors" aria-label="Next slide">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* curved bottom edge into the white page */}
      <svg className="absolute bottom-[-1px] left-0 w-full h-12 sm:h-16" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 80 C 480 0, 960 0, 1440 80 Z" fill="var(--bg)" />
      </svg>
    </section>
  );
}

/* ───────────────────────────────────────────────────────── card rail ── */

/** A horizontally scrolling row of cards with previous / next buttons. */
export function CardRail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * Math.max(300, el.clientWidth * 0.8), behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div className="hidden sm:flex gap-2 absolute -top-16 right-0">
        <button type="button" onClick={() => scroll(-1)} className="w-11 h-11 rounded-none grid place-items-center border bg-[var(--surface)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors" aria-label={`Scroll ${label} left`}>
          <ArrowLeft size={18} />
        </button>
        <button type="button" onClick={() => scroll(1)} className="w-11 h-11 rounded-none grid place-items-center border bg-[var(--surface)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors" aria-label={`Scroll ${label} right`}>
          <ArrowRight size={18} />
        </button>
      </div>
      <div ref={ref} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0" aria-label={label}>
        {children}
      </div>
    </div>
  );
}
