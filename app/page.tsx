import Link from "next/link";
import { loadAdsFull, computeInsights } from "@/lib/ads/data";
import { fmtCompact, fmtDay, fmtInt, fmtMoney, fmtPct, slotColor } from "@/lib/ads/format";
import { DayBars, Sparkline } from "./_components/charts";
import { InsightCard, KpiTile, StatusBadge } from "./_components/bits";
import { StarButton } from "./_components/ad-controls";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const { snapshot, ads } = await loadAdsFull();
  const insights = computeInsights(snapshot, ads);
  const pending = ads.filter((a) => a.pendingAction);

  const spend = snapshot.campaigns.reduce((s, c) => s + c.metrics.spend, 0);
  const imp = snapshot.campaigns.reduce((s, c) => s + c.metrics.impressions, 0);
  const clicks = snapshot.campaigns.reduce((s, c) => s + c.metrics.clicks, 0);
  const reach = snapshot.campaigns.reduce((s, c) => s + c.metrics.reach, 0);
  const budget = snapshot.campaigns.reduce((s, c) => s + (c.dailyBudget ?? 0), 0);
  const ctr = imp ? (clicks / imp) * 100 : 0;
  const cpc = clicks ? spend / clicks : 0;
  const cpm = imp ? (spend / imp) * 1000 : 0;
  const freq = reach ? imp / reach : 0;

  const daily = snapshot.account.daily;
  const leaderboard = [...ads].sort((a, b) => b.metrics.spend - a.metrics.spend);

  return (
    <div className="flex flex-col gap-10">
      <section className="reveal">
        <div className="eyebrow">
          Meta ads · {snapshot.account.name} · {snapshot.account.currency}
        </div>
        <h1 className="font-display mt-2 text-[42px] leading-[1.05]">
          The state of your <span className="text-[var(--accent)]">ads</span>.
        </h1>
        <p className="mt-2 max-w-xl text-[14px] text-[var(--ink-2)]">
          {snapshot.campaigns.length} campaign{snapshot.campaigns.length === 1 ? "" : "s"} ·{" "}
          {snapshot.adsets.length} ad sets · {ads.length} ads, all in one place —
          live numbers, the creatives themselves, and what to do next.
        </p>
      </section>

      {pending.length > 0 && (
        <section className="card-raised reveal reveal-1 flex items-center gap-3 px-4 py-3 text-[13px]">
          <span className="badge" style={{ color: "var(--warn)", borderColor: "var(--warn)" }}>
            <span className="badge-dot" style={{ background: "var(--warn)" }} />
            {pending.length} QUEUED
          </span>
          <span className="text-[var(--ink-2)]">
            {pending
              .map((a) => `${a.pendingAction!.type} “${a.name}”`)
              .join(" · ")}{" "}
            — tell Claude <i>“apply my queued ad actions”</i>.
          </span>
        </section>
      )}

      <section className="reveal reveal-1 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiTile
          label="Spend"
          value={fmtMoney(spend)}
          sub={budget ? `budget ${fmtMoney(budget, { decimals: 0 })}/day` : undefined}
        />
        <KpiTile label="Clicks" value={fmtInt(clicks)} sub={`${fmtCompact(imp)} impressions`} />
        <KpiTile label="CTR" value={fmtPct(ctr)} sub="account average" />
        <KpiTile label="CPC" value={fmtMoney(cpc)} sub="avg cost per click" />
        <KpiTile label="CPM" value={fmtMoney(cpm)} sub="per 1,000 impressions" />
        <KpiTile
          label="Reach"
          value={fmtCompact(reach)}
          sub={`frequency ${freq.toFixed(2)}`}
        />
      </section>

      <section className="reveal reveal-2 card px-5 py-5">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-[20px]">Day by day</h2>
          <span className="text-[12px] text-[var(--ink-3)]">
            {daily.length} day{daily.length === 1 ? "" : "s"} of delivery
          </span>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <DayBars
            title={`Spend (${snapshot.account.currency})`}
            color="var(--series-1)"
            points={daily.map((d) => ({
              label: fmtDay(d.date),
              value: d.spend,
              display: fmtMoney(d.spend),
            }))}
          />
          <DayBars
            title="Clicks"
            color="var(--series-2)"
            points={daily.map((d) => ({
              label: fmtDay(d.date),
              value: d.clicks,
              display: fmtInt(d.clicks),
            }))}
          />
          <DayBars
            title="CTR"
            color="var(--series-3)"
            points={daily.map((d) => ({
              label: fmtDay(d.date),
              value: d.ctr,
              display: fmtPct(d.ctr),
            }))}
          />
        </div>
      </section>

      {insights.length > 0 && (
        <section className="reveal reveal-3">
          <h2 className="font-display mb-4 text-[20px]">What the numbers say</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {insights.map((ins) => (
              <InsightCard key={ins.title} kind={ins.kind} title={ins.title} detail={ins.detail} />
            ))}
          </div>
        </section>
      )}

      <section className="reveal reveal-4 card overflow-hidden">
        <div className="flex items-baseline justify-between px-5 pt-5">
          <h2 className="font-display text-[20px]">Ad leaderboard</h2>
          <Link href="/ads" className="text-[13px] text-[var(--accent)] hover:underline">
            Browse the ads →
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-[var(--ink-3)]">
                <th className="px-5 py-2 font-medium">Ad</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="num px-3 py-2 text-right font-medium">Spend</th>
                <th className="num px-3 py-2 text-right font-medium">Clicks</th>
                <th className="num px-3 py-2 text-right font-medium">CTR</th>
                <th className="num px-3 py-2 text-right font-medium">CPC</th>
                <th className="px-3 py-2 font-medium">Clicks/day</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((ad) => (
                <tr key={ad.id} className="hairline-t hover:bg-[var(--surface-2)]">
                  <td className="max-w-[280px] px-5 py-3">
                    <Link href={`/ads/${ad.id}`} className="flex items-center gap-2 hover:text-[var(--accent)]">
                      <span className="badge-dot" style={{ background: slotColor(ad.slot) }} />
                      <span dir="auto" className="truncate font-medium">{ad.name}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={ad.status} /></td>
                  <td className="num px-3 py-3 text-right">{fmtMoney(ad.metrics.spend)}</td>
                  <td className="num px-3 py-3 text-right">{fmtInt(ad.metrics.clicks)}</td>
                  <td className="num px-3 py-3 text-right font-semibold">{fmtPct(ad.metrics.ctr)}</td>
                  <td className="num px-3 py-3 text-right">{fmtMoney(ad.metrics.cpc)}</td>
                  <td className="px-3 py-3">
                    <Sparkline
                      values={ad.daily.map((d) => d.clicks)}
                      color={slotColor(ad.slot)}
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StarButton adId={ad.id} starred={!!ad.user.starred} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
