"use client";

import { useState } from "react";

/* ---------------------------------------------------------------------------
 * Charts follow one rule: the form is chosen by the data's job, colour is
 * assigned by role, and every chart carries a legend for two or more series
 * plus a table view so identity is never carried by colour alone.
 * The categorical slots are the validated three-hue set (blue / orange / aqua).
 * ------------------------------------------------------------------------- */

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];

function niceMax(v: number): number {
  if (v <= 5) return 5;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}

// ---------------------------------------------------------------- trend ----

export interface TrendSeries {
  key: string;
  label: string;
}

export function TrendChart({
  data,
  series,
  xKey,
  height = 190,
  caption,
}: {
  data: Record<string, string | number>[];
  series: TrendSeries[];
  xKey: string;
  height?: number;
  caption?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 34;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxValue = niceMax(
    Math.max(1, ...data.flatMap((d) => series.map((s) => Number(d[s.key] ?? 0)))),
  );
  const x = (i: number) => padL + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / maxValue) * innerH;

  const ticks = [0, 0.5, 1].map((f) => Math.round(maxValue * f));

  return (
    <figure className="m-0">
      {/* legend — always present for two or more series */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
        {series.map((s, i) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)]">
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: SERIES[i % SERIES.length] }} />
            {s.label}
          </span>
        ))}
      </div>

      <div
        className="relative"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const rel = ((e.clientX - rect.left) / rect.width) * W;
          const idx = Math.round(((rel - padL) / innerW) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, idx)));
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ height }} role="img" aria-label={caption}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeWidth="1" />
              <text x={padL - 6} y={y(t) + 3.5} textAnchor="end" fontSize="9" fill="var(--text-faint)">
                {t}
              </text>
            </g>
          ))}

          {data.map((d, i) =>
            i % Math.ceil(data.length / 7) === 0 ? (
              <text key={i} x={x(i)} y={H - 7} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
                {String(d[xKey])}
              </text>
            ) : null,
          )}

          {hover !== null ? (
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + innerH} stroke="var(--border-strong)" strokeWidth="1" />
          ) : null}

          {series.map((s, si) => {
            const colour = SERIES[si % SERIES.length];
            const path = data
              .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(Number(d[s.key] ?? 0)).toFixed(1)}`)
              .join(" ");
            return (
              <g key={s.key}>
                <path d={path} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {hover !== null ? (
                  <circle
                    cx={x(hover)}
                    cy={y(Number(data[hover][s.key] ?? 0))}
                    r="4.5"
                    fill={colour}
                    stroke="var(--surface)"
                    strokeWidth="2"
                  />
                ) : null}
              </g>
            );
          })}
        </svg>

        {hover !== null ? (
          <div
            className="absolute pointer-events-none card px-2.5 py-2 text-[0.72rem] shadow-lg"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              top: 4,
              transform: `translateX(${hover > data.length / 2 ? "-105%" : "8px"})`,
              minWidth: 110,
            }}
          >
            <div className="font-semibold mb-1">Week of {String(data[hover][xKey])}</div>
            {series.map((s, i) => (
              <div key={s.key} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                  <span className="w-2 h-2 rounded-[2px]" style={{ background: SERIES[i % SERIES.length] }} />
                  {s.label}
                </span>
                <span className="font-semibold tabular-nums">{String(data[hover][s.key] ?? 0)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <details className="mt-2">
        <summary className="text-[0.7rem] text-[var(--text-faint)] cursor-pointer">View as table</summary>
        <div className="overflow-x-auto mt-2">
          <table className="table">
            <thead>
              <tr>
                <th>Week</th>
                {series.map((s) => (
                  <th key={s.key}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i}>
                  <td>{String(d[xKey])}</td>
                  {series.map((s) => (
                    <td key={s.key} className="tabular-nums">
                      {String(d[s.key] ?? 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {caption ? <figcaption className="text-[0.7rem] text-[var(--text-faint)] mt-1">{caption}</figcaption> : null}
    </figure>
  );
}

// ------------------------------------------------------------- bar list ----

export interface BarDatum {
  label: string;
  value: number;
  sub?: string;
}

export function BarList({
  data,
  format = (n: number) => n.toLocaleString(),
  tone = "brand",
  tooltipLabel = "Value",
}: {
  data: BarDatum[];
  format?: (n: number) => string;
  tone?: "brand" | "accent" | "info";
  tooltipLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const colour = tone === "accent" ? "var(--series-3)" : tone === "info" ? "var(--series-1)" : "var(--series-2)";

  if (!data.length) {
    return <p className="text-sm text-[var(--text-faint)] py-4">No data yet.</p>;
  }

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div
          key={d.label}
          className="relative"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <span className="text-[0.8rem] truncate">{d.label}</span>
            {/* direct label — identity and magnitude never rely on colour alone */}
            <span className="text-[0.8rem] font-semibold tabular-nums shrink-0">{format(d.value)}</span>
          </div>
          <div className="h-2 rounded-[4px] w-full" style={{ background: "var(--surface-2)" }}>
            <div
              className="h-full rounded-[4px] transition-[width] duration-300"
              style={{
                width: `${Math.max(2, (d.value / max) * 100)}%`,
                background: colour,
                opacity: hover === null || hover === i ? 1 : 0.55,
              }}
            />
          </div>
          {d.sub ? <div className="text-[0.68rem] text-[var(--text-faint)] mt-0.5">{d.sub}</div> : null}
          {hover === i ? (
            <div className="absolute right-0 -top-1 -translate-y-full card px-2 py-1 text-[0.7rem] z-10 whitespace-nowrap shadow-lg">
              {d.label}: <strong>{format(d.value)}</strong> {tooltipLabel.toLowerCase()}
              {d.sub ? <span className="text-[var(--text-faint)]"> · {d.sub}</span> : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------- grouped compare ----

export function GroupedBars({
  data,
  seriesLabels,
  suffix = "%",
}: {
  data: { label: string; a: number; b: number }[];
  seriesLabels: [string, string];
  suffix?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.a, d.b]));

  return (
    <div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        {seriesLabels.map((l, i) => (
          <span key={l} className="inline-flex items-center gap-1.5 text-[0.72rem] text-[var(--text-muted)]">
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: SERIES[i] }} />
            {l}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.label} onMouseEnter={() => setHover(d.label)} onMouseLeave={() => setHover(null)} className="relative">
            <div className="text-[0.8rem] mb-1.5">{d.label}</div>
            <div className="space-y-1">
              {([d.a, d.b] as const).map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-2 rounded-[4px] flex-1" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-[4px]"
                      style={{
                        width: `${Math.max(2, (v / max) * 100)}%`,
                        background: SERIES[i],
                        opacity: hover === null || hover === d.label ? 1 : 0.55,
                      }}
                    />
                  </div>
                  <span className="text-[0.72rem] font-semibold tabular-nums w-10 text-right shrink-0">
                    {v}
                    {suffix}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- funnel ---

export function Funnel({ data }: { data: { stage: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-2">
      {data.map((d, i) => {
        const prev = i > 0 ? data[i - 1].value : null;
        const dropOff = prev && prev > 0 ? Math.round((d.value / prev) * 100) : null;
        return (
          <div key={d.stage} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <span className="text-[0.8rem]">{d.stage}</span>
              <span className="text-[0.8rem] font-semibold tabular-nums">
                {d.value.toLocaleString()}
                {dropOff !== null ? (
                  <span className="text-[0.68rem] font-normal text-[var(--text-faint)] ml-1.5">{dropOff}% of previous</span>
                ) : null}
              </span>
            </div>
            <div className="h-6 rounded-[5px] w-full" style={{ background: "var(--surface-2)" }}>
              <div
                className="h-full rounded-[5px] transition-[width] duration-300"
                style={{
                  width: `${Math.max(3, (d.value / max) * 100)}%`,
                  background: "var(--series-2)",
                  opacity: hover === null || hover === i ? 1 : 0.6,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
