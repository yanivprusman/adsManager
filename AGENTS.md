<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# adsManager — "Ads Desk"

Organizes the user's Meta (Facebook/Instagram) ads: statistics, the creatives themselves,
and lightweight interaction (star/tag/notes + a pause/resume action queue).
Dark editorial theme ("Ads Desk"), fonts Suez One + Rubik (both support Hebrew), ad content renders RTL.

## Data model — file-based, synced by Claude

The app has **no Meta API credentials**. All Meta data comes from `data/snapshot.json`,
written by a Claude session using the **meta-ads MCP tools**. The UI is read-only over
that snapshot plus two local files it owns:

- `data/snapshot.json` — account, campaigns[], adsets[], ads[] (with `daily[]` per-day metrics), creatives[] (body/title/CTA/postId + local image path). Shape: see `lib/ads/types.ts` (`Snapshot`).
- `public/creatives/<creativeId>.png` — creative images downloaded from the (expiring) fbcdn URLs at sync time.
- `data/user.json` — user's stars/tags/notes per ad id (written by `POST /api/user`).
- `data/actions.json` — queued pause/resume requests (written by `POST /api/actions`).

## How to sync (a Claude session does this on "sync my ads" / "sync adsManager")

Ad account id: `1243794037477701` (currency ILS, FB page id `1245961251929982`, link domain `atar24.prod.ya-niv.com`).

1. `mcp__meta-ads__ads_get_ad_entities` at levels `campaign`, `adset`, `ad` with `date_preset: "maximum"`, fields: id, name, status, objective (campaign), created_time, daily_budget, spend, impressions, clicks, ctr, cpc, cpm, reach, frequency.
2. Same tool at levels `account` and `ad` with `time_increment: "1"` → the `daily[]` arrays.
3. `mcp__meta-ads__ads_get_creatives` (then again with `creative_ids`) → body, title, call_to_action_type, image_url, effective_object_story_id. `mcp__meta-ads__ads_get_creative_ads` per creative → ad↔creative mapping.
4. `curl` each `image_url` → `public/creatives/<creativeId>.png` (URLs are signed and expire — always re-download new creatives at sync time).
5. Rewrite `data/snapshot.json` (parse display strings to plain numbers; dates ISO; set fresh `fetchedAt`). Keep ads present in user.json/actions.json even if archived — the UI joins by ad id.

## Applying queued actions ("apply my queued ad actions")

For each `data/actions.json` entry with `status: "pending"`:
1. Confirm with the user which actions to push (list them).
2. `mcp__meta-ads__ads_update_entity` (or `ads_activate_entity`) to set the ad status (`pause` → PAUSED, `resume` → ACTIVE).
3. Mark the entry `"applied"`, then run a sync so the UI reflects reality.

## Pages

- `/` Overview — KPI tiles, day-by-day small multiples (spend/clicks/CTR), rule-based insights (`computeInsights` in `lib/ads/data.ts`), ad leaderboard.
- `/ads` Gallery — search/filter/sort over the creatives, star + tags on cards.
- `/ads/[id]` Detail — Facebook-feed-style RTL preview built from snapshot data (`ad-preview.tsx`), full KPIs, daily bars, delivery control (action queue), tags/notes, creative text, deep links (FB post + Ads Manager).
- `/compare` — pick ads + metric, head-to-head bars (per-ad colors are stable app-wide, `slotColor`) + full scorecard table.
- `/structure` — campaign → adset → ad tree with spend-share bars.

## Conventions

- Charts are hand-rolled (`app/_components/charts.tsx`) following the dataviz skill: validated palette (`--series-1/2/3`), one axis, top-rounded baseline-anchored bars, CSS-only hover tooltips, selective direct labels.
- All pages `export const dynamic = "force-dynamic"` — they re-read the JSON files per request, so a sync shows up on refresh.
- Ad/creative text always renders with `dir="auto"` (or `dir="rtl"` in the preview).
