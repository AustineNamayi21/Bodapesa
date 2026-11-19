"use client";

import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Theme = "dark" | "light";

/** Shared with the blocking script in the document head — keep them in step. */
export const THEME_STORAGE_KEY = "bp-theme";

/**
 * Applied in <head> before the first paint, so a light-mode visitor never sees
 * a black frame flash past. It runs ahead of React, which is exactly why it is
 * a string rather than a component: there is no hydration to wait for.
 *
 * Reading the stored value and the OS preference here (rather than in an
 * effect) is what makes the switch flash-free. The try/catch covers Safari in
 * private mode, where touching localStorage throws.
 */
export const themeBootScript = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

function read(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/**
 * The switch.
 *
 * Deliberately not a sliding pill: the language has no rounded rectangles in
 * it. This is the same circle as the CTA ring, with the icon rotating out and
 * its replacement rotating in — one gesture, no bounce.
 */
export default function ThemeToggle({
  size = 40,
  className = "",
  style,
}: {
  size?: number;
  className?: string;
  /** For the public header, which sits on a photograph and sets its own ink. */
  style?: React.CSSProperties;
}) {
  // Start from whatever the boot script already put on <html>, so the first
  // client render agrees with the server-rendered markup it is hydrating.
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(read());
    setReady(true);
  }, []);

  // Someone changing the OS setting, or flipping the theme in another tab,
  // should be reflected here rather than leaving the icon lying.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) setTheme(read());
    };
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onScheme = () => {
      try {
        if (localStorage.getItem(THEME_STORAGE_KEY)) return; // an explicit choice wins
      } catch {
        /* storage unavailable — fall through and follow the OS */
      }
      const next: Theme = mq.matches ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    window.addEventListener("storage", onStorage);
    mq.addEventListener("change", onScheme);
    return () => {
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", onScheme);
    };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = read() === "light" ? "dark" : "light";
    const root = document.documentElement;

    // Only transition colours during the switch itself. Leaving the transition
    // on permanently would make every ordinary hover and route change fade.
    root.classList.add("theme-animating");
    root.setAttribute("data-theme", next);
    window.setTimeout(() => root.classList.remove("theme-animating"), 500);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* the switch still works for this session */
    }
    setTheme(next);
  }, []);

  const light = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      // Until the effect has run, the icon is a guess; hiding it from
      // assistive tech for that instant avoids announcing the wrong state.
      aria-hidden={ready ? undefined : true}
      title={light ? "Dark" : "Light"}
    >
      <span className="theme-toggle-icon" data-on={!light}>
        <Moon size={Math.round(size * 0.42)} strokeWidth={1.6} />
      </span>
      <span className="theme-toggle-icon" data-on={light}>
        <Sun size={Math.round(size * 0.42)} strokeWidth={1.6} />
      </span>
    </button>
  );
}
