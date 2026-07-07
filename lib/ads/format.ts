/** Formatting helpers — pure, safe to import from client components. */

export function fmtMoney(v: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? (v >= 100 ? 0 : 2);
  return `₪${v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function fmtInt(v: number): string {
  return v.toLocaleString("en-US");
}

export function fmtPct(v: number): string {
  return `${v.toFixed(2)}%`;
}

export function fmtCompact(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `${(v / 1_000).toFixed(1)}K`;
  return fmtInt(v);
}

/** "2026-07-06" -> "Jul 6" */
export function fmtDay(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CTA_LABELS: Record<string, string> = {
  LEARN_MORE: "למידע נוסף",
  SHOP_NOW: "לקנייה",
  SIGN_UP: "להרשמה",
  CONTACT_US: "יצירת קשר",
  BOOK_TRAVEL: "להזמנה",
  DOWNLOAD: "להורדה",
};

export function ctaLabel(cta: string): string {
  return CTA_LABELS[cta] ?? cta.replaceAll("_", " ");
}

/** Stable per-ad series colors — validated (dataviz palette, dark surface). */
export const SLOT_COLORS = ["#3987e5", "#199e70", "#c98500", "#9085e9", "#e66767"];

export function slotColor(slot: number): string {
  return SLOT_COLORS[slot % SLOT_COLORS.length];
}
