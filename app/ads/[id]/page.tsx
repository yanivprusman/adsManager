import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAdsFull } from "@/lib/ads/data";
import { fmtCompact, fmtDay, fmtInt, fmtMoney, fmtPct, slotColor } from "@/lib/ads/format";
import AdPreview from "../../_components/ad-preview";
import { DayBars } from "../../_components/charts";
import { StatusBadge } from "../../_components/bits";
import { ActionButtons, StarButton, TagsNotes } from "../../_components/ad-controls";

export const dynamic = "force-dynamic";

export default async function AdDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { snapshot, ads } = await loadAdsFull();
  const ad = ads.find((a) => a.id === id);
  if (!ad) notFound();

  const siblings = ads.filter((a) => a.creativeId === ad.creativeId && a.id !== ad.id);
  const m = ad.metrics;
  const adsManagerUrl = `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${snapshot.account.id}&selected_ad_ids=${ad.id}`;
  const postUrl = `https://www.facebook.com/${ad.creative.postId}`;

  const kpis: [string, string][] = [
    ["Spend", fmtMoney(m.spend)],
    ["Impressions", fmtInt(m.impressions)],
    ["Clicks", fmtInt(m.clicks)],
    ["CTR", fmtPct(m.ctr)],
    ["CPC", fmtMoney(m.cpc)],
    ["CPM", m.cpm != null ? fmtMoney(m.cpm) : "—"],
    ["Reach", fmtCompact(m.reach)],
    ["Frequency", (m.frequency ?? 0).toFixed(2)],
  ];

  return (
    <div>
      <Link href="/ads" className="text-[13px] text-[var(--ink-3)] hover:text-[var(--accent)]">
        ← All ads
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="badge-dot h-3 w-3" style={{ background: slotColor(ad.slot) }} />
        <h1 dir="auto" className="font-display text-[28px] leading-tight">
          {ad.name}
        </h1>
        <StarButton adId={ad.id} starred={!!ad.user.starred} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--ink-3)]">
        <StatusBadge status={ad.status} />
        <span dir="auto" className="chip">{ad.adset.name}</span>
        <span dir="auto" className="chip">{ad.campaign.name}</span>
        <span className="num">created {ad.createdTime}</span>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="eyebrow">Live preview — as seen in the feed</div>
          <AdPreview
            creative={ad.creative}
            pageName={snapshot.account.pageName}
            linkDomain={snapshot.account.linkDomain}
          />
          <div className="flex flex-wrap gap-2">
            <a href={postUrl} target="_blank" rel="noreferrer" className="btn">
              Open Facebook post ↗
            </a>
            <a href={adsManagerUrl} target="_blank" rel="noreferrer" className="btn">
              Open in Ads Manager ↗
            </a>
          </div>
          {siblings.length > 0 && (
            <div className="card-raised px-4 py-3 text-[13px] text-[var(--ink-2)]">
              <span className="font-semibold text-[var(--ink)]">Same creative</span> also runs
              as{" "}
              {siblings.map((s, i) => (
                <span key={s.id}>
                  {i > 0 && " · "}
                  <Link
                    dir="auto"
                    href={`/ads/${s.id}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {s.name}
                  </Link>
                </span>
              ))}{" "}
              — <Link href="/compare" className="underline">compare them</Link>.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map(([label, value]) => (
              <div key={label} className="card px-3.5 py-3">
                <div className="eyebrow">{label}</div>
                <div className="num mt-1 text-[19px] font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <div className="card px-5 py-5">
            <h2 className="font-display mb-5 text-[18px]">Daily performance</h2>
            {ad.daily.length === 0 ? (
              <div className="text-[13px] text-[var(--ink-3)]">No delivery days yet.</div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                <DayBars
                  title="Spend"
                  color={slotColor(ad.slot)}
                  points={ad.daily.map((d) => ({
                    label: fmtDay(d.date),
                    value: d.spend,
                    display: fmtMoney(d.spend),
                  }))}
                />
                <DayBars
                  title="Clicks"
                  color={slotColor(ad.slot)}
                  points={ad.daily.map((d) => ({
                    label: fmtDay(d.date),
                    value: d.clicks,
                    display: fmtInt(d.clicks),
                  }))}
                />
                <DayBars
                  title="CTR"
                  color={slotColor(ad.slot)}
                  points={ad.daily.map((d) => ({
                    label: fmtDay(d.date),
                    value: d.ctr,
                    display: fmtPct(d.ctr),
                  }))}
                />
              </div>
            )}
          </div>

          <div className="card px-5 py-4">
            <div className="eyebrow mb-3">Delivery control</div>
            <ActionButtons
              adId={ad.id}
              adName={ad.name}
              status={ad.status}
              pendingAction={ad.pendingAction}
            />
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--ink-3)]">
              Actions queue locally and are pushed to Meta by Claude on your say-so —
              nothing touches the live campaign until you ask.
            </p>
          </div>

          <TagsNotes
            adId={ad.id}
            tags={ad.user.tags ?? []}
            notes={ad.user.notes ?? ""}
          />

          <div className="card px-5 py-4 text-[13px]">
            <div className="eyebrow mb-3">Creative details</div>
            <dl className="grid gap-2 text-[var(--ink-2)]">
              <div className="flex gap-2">
                <dt className="w-28 flex-none text-[var(--ink-3)]">Headline</dt>
                <dd dir="auto" className="font-medium text-[var(--ink)]">{ad.creative.title}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 flex-none text-[var(--ink-3)]">CTA</dt>
                <dd>{ad.creative.callToAction.replaceAll("_", " ")}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 flex-none text-[var(--ink-3)]">Creative</dt>
                <dd dir="auto">{ad.creative.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-28 flex-none text-[var(--ink-3)]">Primary text</dt>
                <dd dir="auto" className="whitespace-pre-line leading-relaxed">
                  {ad.creative.body}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
