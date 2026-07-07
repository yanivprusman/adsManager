"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdFull } from "@/lib/ads/types";
import { fmtInt, fmtMoney, fmtPct, slotColor } from "@/lib/ads/format";
import { StatusBadge } from "./bits";
import { StarButton } from "./ad-controls";

type SortKey = "spend" | "ctr" | "cpc" | "clicks" | "newest";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "spend", label: "Spend" },
  { key: "ctr", label: "CTR" },
  { key: "cpc", label: "Cheapest clicks" },
  { key: "clicks", label: "Clicks" },
  { key: "newest", label: "Newest" },
];

export default function Gallery({ ads }: { ads: AdFull[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL");
  const [adset, setAdset] = useState("ALL");
  const [sort, setSort] = useState<SortKey>("spend");
  const [starredOnly, setStarredOnly] = useState(false);

  const adsets = useMemo(() => {
    const seen = new Map<string, string>();
    ads.forEach((a) => seen.set(a.adset.id, a.adset.name));
    return [...seen.entries()];
  }, [ads]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = ads.filter((a) => {
      if (status !== "ALL" && a.status !== status) return false;
      if (adset !== "ALL" && a.adset.id !== adset) return false;
      if (starredOnly && !a.user.starred) return false;
      if (needle) {
        const hay = [
          a.name,
          a.creative.title,
          a.creative.body,
          ...(a.user.tags ?? []),
          a.user.notes ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const cmp: Record<SortKey, (x: AdFull, y: AdFull) => number> = {
      spend: (x, y) => y.metrics.spend - x.metrics.spend,
      ctr: (x, y) => y.metrics.ctr - x.metrics.ctr,
      cpc: (x, y) => x.metrics.cpc - y.metrics.cpc,
      clicks: (x, y) => y.metrics.clicks - x.metrics.clicks,
      newest: (x, y) => y.createdTime.localeCompare(x.createdTime),
    };
    return filtered.sort(cmp[sort]);
  }, [ads, q, status, adset, sort, starredOnly]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          dir="auto"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, copy, tags…"
          className="w-56 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] outline-none placeholder:text-[var(--ink-3)] focus:border-[var(--accent)]"
        />
        <div className="flex overflow-hidden rounded-lg border border-[var(--line)]">
          {(["ALL", "ACTIVE", "PAUSED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-2 text-[12px] font-medium transition-colors ${
                status === s
                  ? "bg-[var(--surface-2)] text-[var(--ink)]"
                  : "text-[var(--ink-3)] hover:text-[var(--ink-2)]"
              }`}
            >
              {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Paused"}
            </button>
          ))}
        </div>
        <select
          value={adset}
          onChange={(e) => setAdset(e.target.value)}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink-2)] outline-none focus:border-[var(--accent)]"
        >
          <option value="ALL">All ad sets</option>
          {adsets.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--ink-2)] outline-none focus:border-[var(--accent)]"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              Sort: {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setStarredOnly((v) => !v)}
          className={`btn ${starredOnly ? "btn-accent" : ""}`}
          title="Show starred only"
        >
          ★ Starred
        </button>
        <span className="ml-auto text-[12px] text-[var(--ink-3)]">
          {shown.length} of {ads.length} ads
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="card px-6 py-16 text-center text-[var(--ink-3)]">
          No ads match these filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((ad, i) => (
            <div
              key={ad.id}
              className={`card reveal reveal-${Math.min(i + 1, 4)} group flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5`}
              style={{ borderTop: `2px solid ${slotColor(ad.slot)}` }}
            >
              <Link href={`/ads/${ad.id}`} className="relative block">
                <Image
                  src={ad.creative.image}
                  alt={ad.creative.title}
                  width={ad.creative.imageWidth}
                  height={ad.creative.imageHeight}
                  className="w-full transition-opacity group-hover:opacity-90"
                  unoptimized
                />
                {ad.pendingAction ? (
                  <span
                    className="badge absolute right-2 top-2 bg-[rgba(14,15,18,0.85)]"
                    style={{ color: "var(--warn)", borderColor: "var(--warn)" }}
                  >
                    <span className="badge-dot" style={{ background: "var(--warn)" }} />
                    {ad.pendingAction.type.toUpperCase()} QUEUED
                  </span>
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col gap-3 px-4 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/ads/${ad.id}`}
                    dir="auto"
                    className="min-w-0 text-[14px] font-semibold leading-snug hover:text-[var(--accent)]"
                  >
                    {ad.name}
                  </Link>
                  <StarButton adId={ad.id} starred={!!ad.user.starred} />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={ad.status} />
                  <span dir="auto" className="chip">{ad.adset.name}</span>
                  {(ad.user.tags ?? []).map((t) => (
                    <span key={t} dir="auto" className="chip text-[var(--accent)]">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="num mt-auto grid grid-cols-4 gap-2 border-t border-[var(--line)] pt-3 text-center">
                  {[
                    ["Spend", fmtMoney(ad.metrics.spend)],
                    ["Clicks", fmtInt(ad.metrics.clicks)],
                    ["CTR", fmtPct(ad.metrics.ctr)],
                    ["CPC", fmtMoney(ad.metrics.cpc)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[10px] uppercase tracking-wider text-[var(--ink-3)]">
                        {label}
                      </div>
                      <div className="mt-0.5 text-[13px] font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
