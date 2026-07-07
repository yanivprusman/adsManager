"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdFull } from "@/lib/ads/types";
import { fmtInt, fmtMoney, fmtPct, slotColor } from "@/lib/ads/format";
import { CompareBars } from "./charts";

interface MetricDef {
  key: string;
  label: string;
  goodIsLow?: boolean;
  get: (a: AdFull) => number;
  fmt: (v: number) => string;
}

const METRICS: MetricDef[] = [
  { key: "ctr", label: "CTR", get: (a) => a.metrics.ctr, fmt: fmtPct },
  { key: "cpc", label: "CPC", goodIsLow: true, get: (a) => a.metrics.cpc, fmt: fmtMoney },
  { key: "spend", label: "Spend", get: (a) => a.metrics.spend, fmt: fmtMoney },
  { key: "clicks", label: "Clicks", get: (a) => a.metrics.clicks, fmt: fmtInt },
  { key: "impressions", label: "Impressions", get: (a) => a.metrics.impressions, fmt: fmtInt },
  { key: "cpm", label: "CPM", goodIsLow: true, get: (a) => a.metrics.cpm ?? 0, fmt: fmtMoney },
  { key: "reach", label: "Reach", get: (a) => a.metrics.reach, fmt: fmtInt },
  {
    key: "frequency",
    label: "Frequency",
    goodIsLow: true,
    get: (a) => a.metrics.frequency ?? 0,
    fmt: (v) => v.toFixed(2),
  },
];

export default function CompareBoard({ ads }: { ads: AdFull[] }) {
  const [selected, setSelected] = useState<string[]>(ads.map((a) => a.id));
  const [metricKey, setMetricKey] = useState("ctr");

  const metric = METRICS.find((m) => m.key === metricKey)!;
  const chosen = useMemo(
    () => ads.filter((a) => selected.includes(a.id)),
    [ads, selected]
  );

  const toggle = (id: string) =>
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        {ads.map((ad) => {
          const on = selected.includes(ad.id);
          return (
            <button
              key={ad.id}
              onClick={() => toggle(ad.id)}
              className={`card flex items-center gap-3 px-3 py-2 text-left transition-opacity ${
                on ? "" : "opacity-40"
              }`}
              style={on ? { borderColor: slotColor(ad.slot) } : undefined}
            >
              <Image
                src={ad.creative.image}
                alt=""
                width={64}
                height={34}
                className="rounded object-cover"
                unoptimized
              />
              <span className="flex flex-col">
                <span dir="auto" className="max-w-[180px] truncate text-[13px] font-medium">
                  {ad.name}
                </span>
                <span dir="auto" className="text-[11px] text-[var(--ink-3)]">
                  {ad.adset.name}
                </span>
              </span>
              <span
                className="badge-dot ml-1"
                style={{ background: on ? slotColor(ad.slot) : "var(--ink-3)" }}
              />
            </button>
          );
        })}
      </div>

      <div className="card px-5 py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[18px]">Head to head</h2>
          <div className="flex flex-wrap gap-1.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetricKey(m.key)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  m.key === metricKey
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "bg-[var(--surface-2)] text-[var(--ink-2)] hover:text-[var(--ink)]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {chosen.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[var(--ink-3)]">
            Select at least one ad above.
          </div>
        ) : (
          <>
            <CompareBars
              goodIsLow={metric.goodIsLow}
              rows={chosen.map((a) => ({
                name: a.name,
                color: slotColor(a.slot),
                value: metric.get(a),
                display: metric.fmt(metric.get(a)),
              }))}
            />
            {metric.goodIsLow && chosen.length > 1 ? (
              <p className="mt-3 text-[11px] text-[var(--ink-3)]">
                Lower is better for {metric.label}.
              </p>
            ) : null}
          </>
        )}
      </div>

      {chosen.length > 0 && (
        <div className="card overflow-hidden">
          <h2 className="font-display px-5 pt-5 text-[18px]">Full scorecard</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--ink-3)]">
                  <th className="px-5 py-2 font-medium">Metric</th>
                  {chosen.map((a) => (
                    <th key={a.id} className="px-3 py-2 font-medium">
                      <Link
                        href={`/ads/${a.id}`}
                        className="flex items-center gap-1.5 normal-case tracking-normal hover:text-[var(--accent)]"
                      >
                        <span className="badge-dot" style={{ background: slotColor(a.slot) }} />
                        <span dir="auto" className="max-w-[160px] truncate">{a.name}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((m) => {
                  const values = chosen.map((a) => m.get(a));
                  const best = m.goodIsLow ? Math.min(...values) : Math.max(...values);
                  return (
                    <tr key={m.key} className="hairline-t">
                      <td className="px-5 py-2.5 text-[var(--ink-2)]">{m.label}</td>
                      {chosen.map((a, i) => (
                        <td
                          key={a.id}
                          className={`num px-3 py-2.5 ${
                            values[i] === best && chosen.length > 1
                              ? "font-bold text-[var(--accent)]"
                              : ""
                          }`}
                        >
                          {m.fmt(values[i])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
