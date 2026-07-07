import Link from "next/link";
import { loadAdsFull } from "@/lib/ads/data";
import { fmtInt, fmtMoney, fmtPct, slotColor } from "@/lib/ads/format";
import { StatusBadge } from "../_components/bits";

export const dynamic = "force-dynamic";

export default async function StructurePage() {
  const { snapshot, ads } = await loadAdsFull();

  return (
    <div>
      <div className="eyebrow">Account anatomy</div>
      <h1 className="font-display mb-2 mt-2 text-[32px] leading-tight">
        Campaign → ad set → ad
      </h1>
      <p className="mb-8 max-w-xl text-[14px] text-[var(--ink-2)]">
        How the budget flows. Bars show each ad set&apos;s share of campaign spend.
      </p>

      <div className="flex flex-col gap-6">
        {snapshot.campaigns.map((c) => {
          const sets = snapshot.adsets.filter((s) => s.campaignId === c.id);
          return (
            <div key={c.id} className="card px-5 py-5">
              <div className="flex flex-wrap items-center gap-3">
                <h2 dir="auto" className="font-display text-[20px]">{c.name}</h2>
                <StatusBadge status={c.status} />
                <span className="chip">{c.objective.replaceAll("_", " ")}</span>
                {c.dailyBudget ? (
                  <span className="chip num">{fmtMoney(c.dailyBudget, { decimals: 0 })}/day</span>
                ) : null}
                <span className="num ml-auto text-[14px] font-semibold">
                  {fmtMoney(c.metrics.spend)}{" "}
                  <span className="text-[12px] font-normal text-[var(--ink-3)]">lifetime</span>
                </span>
              </div>

              <div className="mt-5 flex flex-col gap-4">
                {sets.map((s) => {
                  const share = c.metrics.spend ? (s.metrics.spend / c.metrics.spend) * 100 : 0;
                  const setAds = ads.filter((a) => a.adsetId === s.id);
                  return (
                    <div key={s.id} className="card-raised px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span dir="auto" className="text-[14px] font-semibold">{s.name}</span>
                        <StatusBadge status={s.status} />
                        <span className="num ml-auto text-[13px] text-[var(--ink-2)]">
                          {fmtMoney(s.metrics.spend)} · {fmtInt(s.metrics.clicks)} clicks ·{" "}
                          {fmtPct(s.metrics.ctr)} CTR
                        </span>
                      </div>
                      <div className="mt-2.5 h-[8px] overflow-hidden rounded-r-[3px] bg-[var(--surface)]">
                        <div
                          className="h-full rounded-r-[3px] bg-[var(--series-1)]"
                          style={{ width: `${share}%` }}
                          title={`${share.toFixed(0)}% of campaign spend`}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--ink-3)]">
                        {share.toFixed(0)}% of campaign spend
                      </div>

                      <div className="mt-3 flex flex-col">
                        {setAds.map((a) => (
                          <Link
                            key={a.id}
                            href={`/ads/${a.id}`}
                            className="hairline-t group flex flex-wrap items-center gap-2.5 py-2.5 text-[13px]"
                          >
                            <span className="badge-dot" style={{ background: slotColor(a.slot) }} />
                            <span dir="auto" className="font-medium group-hover:text-[var(--accent)]">
                              {a.name}
                            </span>
                            <StatusBadge status={a.status} />
                            <span className="num ml-auto text-[var(--ink-2)]">
                              {fmtMoney(a.metrics.spend)} · {fmtInt(a.metrics.clicks)} clicks ·{" "}
                              {fmtPct(a.metrics.ctr)} CTR · {fmtMoney(a.metrics.cpc)} CPC
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
