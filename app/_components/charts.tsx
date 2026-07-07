import type { ReactNode } from "react";

/* Presentational chart primitives — no state, CSS-only hover tooltips. */

export interface BarPoint {
  label: string;
  value: number;
  /** formatted value for tooltip / direct label */
  display: string;
  tooltip?: ReactNode;
}

/** Vertical day-bars: thin marks, top-rounded, baseline-anchored, hover tooltip. */
export function DayBars({
  points,
  color = "var(--series-1)",
  title,
  height = 120,
}: {
  points: BarPoint[];
  color?: string;
  title: string;
  height?: number;
}) {
  const max = Math.max(...points.map((p) => p.value), 0.0001);
  const maxIdx = points.reduce((mi, p, i) => (p.value > points[mi].value ? i : mi), 0);
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="eyebrow">{title}</span>
      </div>
      <div
        className="relative flex items-end gap-[10%] border-b border-[var(--line-strong)] px-1"
        style={{
          height,
          backgroundImage:
            "repeating-linear-gradient(to top, transparent, transparent calc(25% - 1px), var(--grid) calc(25% - 1px), var(--grid) 25%)",
        }}
      >
        {points.map((p, i) => {
          const hPct = Math.max((p.value / max) * 100, p.value > 0 ? 2 : 0);
          return (
            <div
              key={p.label}
              className="group relative flex h-full flex-1 items-end justify-center"
            >
              {/* direct label on the max point only (selective labeling) */}
              {i === maxIdx && (
                <span
                  className="num absolute text-[11px] font-medium text-[var(--ink-2)]"
                  style={{ bottom: `calc(${hPct}% + 4px)` }}
                >
                  {p.display}
                </span>
              )}
              <div
                className="w-full max-w-[38px] rounded-t-[4px] transition-opacity group-hover:opacity-80"
                style={{ height: `${hPct}%`, background: color }}
              />
              <div className="viz-tip hidden group-hover:block" style={{ left: "50%", top: 0 }}>
                <div className="text-[var(--ink-2)]">{p.label}</div>
                <div className="num font-semibold">{p.tooltip ?? p.display}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-[10%] px-1">
        {points.map((p) => (
          <div
            key={p.label}
            className="num flex-1 text-center text-[11px] text-[var(--ink-3)]"
          >
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tiny trend line for tables/cards. */
export function Sparkline({
  values,
  color = "var(--series-1)",
  width = 96,
  height = 28,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 0.0001);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pad = 3;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const pts = values.map((v, i) => [
    pad + i * step,
    height - pad - ((v - min) / span) * (height - pad * 2),
  ]);
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} aria-hidden className="shrink-0">
      {values.length > 1 ? (
        <polyline
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      <circle cx={last[0]} cy={last[1]} r={3} fill={color} />
    </svg>
  );
}

export interface CompareRow {
  name: string;
  color: string;
  value: number;
  display: string;
  href?: string;
}

/** Horizontal entity-comparison bars with end labels (identity = fixed entity color). */
export function CompareBars({
  rows,
  goodIsLow = false,
}: {
  rows: CompareRow[];
  goodIsLow?: boolean;
}) {
  const max = Math.max(...rows.map((r) => r.value), 0.0001);
  const bestValue = goodIsLow
    ? Math.min(...rows.map((r) => r.value))
    : Math.max(...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.name} className="grid grid-cols-[minmax(0,220px)_1fr_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="badge-dot" style={{ background: r.color }} />
            <span dir="auto" className="truncate text-[13px] text-[var(--ink-2)]">
              {r.name}
            </span>
          </div>
          <div className="h-[14px] rounded-r-[4px] bg-[var(--surface-2)]">
            <div
              className="h-full rounded-r-[4px]"
              style={{
                width: `${(r.value / max) * 100}%`,
                background: r.color,
                boxShadow: "0 0 0 2px var(--surface)",
              }}
            />
          </div>
          <span
            className={`num text-[13px] font-semibold ${
              r.value === bestValue ? "text-[var(--ink)]" : "text-[var(--ink-2)]"
            }`}
          >
            {r.display}
            {r.value === bestValue && rows.length > 1 ? (
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                best
              </span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}
