"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function withCommas(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Counts up to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  duration = 1400,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || value <= 0) return;
    setShown(0);
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    // Printing (or a full-page capture) must never show an un-counted zero.
    const showFinal = () => setShown(value);
    window.addEventListener("beforeprint", showFinal);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("beforeprint", showFinal);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {withCommas(shown)}
      {suffix}
    </span>
  );
}

const CONFETTI_COLOURS = ["#0e7f3f", "#3ad17a", "#111111", "#ffffff", "#22b35e"];

/** A one-off confetti burst, e.g. when a quiz is passed. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const [bits] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      left: `${(i * 97) % 100}%`,
      dx: `${((i * 53) % 120) - 60}px`,
      rot: `${((i * 71) % 720) - 360}deg`,
      delay: `${(i % 9) * 40}ms`,
      colour: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
      round: i % 4 === 0,
    })),
  );
  if (prefersReducedMotion()) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: b.left,
              background: b.colour,
              borderRadius: b.round ? "999px" : "2px",
              animationDelay: b.delay,
              "--dx": b.dx,
              "--rot": b.rot,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
