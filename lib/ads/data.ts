import { promises as fs } from "fs";
import path from "path";
import type {
  ActionsFile,
  AdFull,
  Insight,
  QueuedAction,
  Snapshot,
  UserData,
} from "./types";
import { fmtMoney, fmtPct } from "./format";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadSnapshot(): Promise<Snapshot> {
  const snap = await readJson<Snapshot | null>("snapshot.json", null);
  if (!snap) throw new Error("data/snapshot.json missing — run a sync (see CLAUDE.md)");
  return snap;
}

export async function loadUserData(): Promise<UserData> {
  return readJson<UserData>("user.json", { ads: {} });
}

export async function loadActions(): Promise<ActionsFile> {
  return readJson<ActionsFile>("actions.json", { actions: [] });
}

export async function writeUserData(data: UserData): Promise<void> {
  await fs.writeFile(path.join(DATA_DIR, "user.json"), JSON.stringify(data, null, 2));
}

export async function writeActions(data: ActionsFile): Promise<void> {
  await fs.writeFile(path.join(DATA_DIR, "actions.json"), JSON.stringify(data, null, 2));
}

/** Ads joined with adset/campaign/creative/user-data, stable palette slots. */
export async function loadAdsFull(): Promise<{ snapshot: Snapshot; ads: AdFull[] }> {
  const [snapshot, user, actionsFile] = await Promise.all([
    loadSnapshot(),
    loadUserData(),
    loadActions(),
  ]);
  const pending = new Map<string, QueuedAction>();
  for (const a of actionsFile.actions) {
    if (a.status === "pending") pending.set(a.adId, a);
  }
  const ordered = [...snapshot.ads].sort(
    (a, b) => a.createdTime.localeCompare(b.createdTime) || a.id.localeCompare(b.id)
  );
  const slots = new Map(ordered.map((a, i) => [a.id, i]));
  const ads = snapshot.ads.map((ad) => {
    const adset = snapshot.adsets.find((s) => s.id === ad.adsetId)!;
    const campaign = snapshot.campaigns.find((c) => c.id === ad.campaignId)!;
    const creative = snapshot.creatives.find((c) => c.id === ad.creativeId)!;
    return {
      ...ad,
      adset,
      campaign,
      creative,
      slot: slots.get(ad.id) ?? 0,
      user: user.ads[ad.id] ?? {},
      pendingAction: pending.get(ad.id),
    } satisfies AdFull;
  });
  return { snapshot, ads };
}

const MIN_IMPRESSIONS = 300; // below this, rates are noise

/** Rule-based insights, recomputed from whatever the current snapshot holds. */
export function computeInsights(snapshot: Snapshot, ads: AdFull[]): Insight[] {
  const out: Insight[] = [];
  const eligible = ads.filter(
    (a) => a.status === "ACTIVE" && a.metrics.impressions >= MIN_IMPRESSIONS
  );
  const totalSpend = ads.reduce((s, a) => s + a.metrics.spend, 0);
  const totalClicks = ads.reduce((s, a) => s + a.metrics.clicks, 0);
  const totalImp = ads.reduce((s, a) => s + a.metrics.impressions, 0);
  const avgCtr = totalImp ? (totalClicks / totalImp) * 100 : 0;

  if (eligible.length >= 2) {
    const byCtr = [...eligible].sort((a, b) => b.metrics.ctr - a.metrics.ctr);
    const best = byCtr[0];
    if (best.metrics.ctr > avgCtr * 1.5) {
      const share = totalSpend ? (best.metrics.spend / totalSpend) * 100 : 0;
      out.push({
        kind: "win",
        adId: best.id,
        title: `“${best.name}” is your CTR champion`,
        detail: `${fmtPct(best.metrics.ctr)} CTR vs ${fmtPct(avgCtr)} account average — but it only gets ${share.toFixed(0)}% of spend. Consider shifting budget toward it.`,
      });
    }
    const byCpc = [...eligible].sort((a, b) => a.metrics.cpc - b.metrics.cpc);
    if (byCpc[0].id !== best.id && byCpc[0].metrics.cpc < byCpc[byCpc.length - 1].metrics.cpc * 0.6) {
      out.push({
        kind: "win",
        adId: byCpc[0].id,
        title: `Cheapest clicks: “${byCpc[0].name}”`,
        detail: `${fmtMoney(byCpc[0].metrics.cpc)} per click vs ${fmtMoney(byCpc[byCpc.length - 1].metrics.cpc)} on the most expensive ad.`,
      });
    }
  }

  for (const ad of ads) {
    const f = ad.metrics.frequency ?? 0;
    if (ad.status === "ACTIVE" && f >= 1.85) {
      out.push({
        kind: "warn",
        adId: ad.id,
        title: `Frequency ${f.toFixed(2)} on “${ad.name}”`,
        detail: "The same people are seeing this ad almost twice on average. Watch for creative fatigue — CTR will decay if this keeps climbing.",
      });
    }
  }

  // shared creative across ads
  const byCreative = new Map<string, AdFull[]>();
  for (const ad of ads) {
    byCreative.set(ad.creativeId, [...(byCreative.get(ad.creativeId) ?? []), ad]);
  }
  for (const [, group] of byCreative) {
    if (group.length > 1) {
      out.push({
        kind: "info",
        title: `${group.length} ads share one creative`,
        detail: `${group.map((a) => `“${a.name}”`).join(" and ")} run the same creative in different placements — an audience A/B test. Compare them side by side.`,
      });
    }
  }

  // pacing vs budget (last full day)
  const daily = snapshot.account.daily;
  if (daily.length >= 1) {
    const last = daily[daily.length - 1];
    const budget = snapshot.campaigns.reduce((s, c) => s + (c.dailyBudget ?? 0), 0);
    if (budget > 0) {
      const pct = (last.spend / budget) * 100;
      if (pct < 70) {
        out.push({
          kind: "info",
          title: `Under-delivering: ${pct.toFixed(0)}% of daily budget`,
          detail: `Spent ${fmtMoney(last.spend)} of ${fmtMoney(budget)} budgeted on ${last.date}. Meta may still be learning, or the audience is too narrow.`,
        });
      } else if (pct > 115) {
        out.push({
          kind: "warn",
          title: `Overshooting daily budget (${pct.toFixed(0)}%)`,
          detail: `Spent ${fmtMoney(last.spend)} against ${fmtMoney(budget)} daily budget on ${last.date}. Meta balances across the week, but keep an eye on it.`,
        });
      }
    }
  }

  // day-over-day CTR movement
  if (daily.length >= 2) {
    const [prev, last] = daily.slice(-2);
    if (prev.ctr > 0) {
      const delta = ((last.ctr - prev.ctr) / prev.ctr) * 100;
      if (Math.abs(delta) >= 25) {
        out.push({
          kind: delta > 0 ? "win" : "warn",
          title: `CTR ${delta > 0 ? "up" : "down"} ${Math.abs(delta).toFixed(0)}% day-over-day`,
          detail: `${fmtPct(prev.ctr)} → ${fmtPct(last.ctr)} between ${prev.date} and ${last.date}.`,
        });
      }
    }
  }

  return out;
}
