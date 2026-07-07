import type { ReactNode } from "react";

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  ACTIVE: { dot: "var(--good)", text: "ACTIVE" },
  PAUSED: { dot: "var(--warn)", text: "PAUSED" },
  ARCHIVED: { dot: "var(--ink-3)", text: "ARCHIVED" },
  DELETED: { dot: "var(--critical)", text: "DELETED" },
  WITH_ISSUES: { dot: "var(--serious)", text: "ISSUES" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { dot: "var(--ink-3)", text: status };
  return (
    <span className="badge text-[var(--ink-2)]">
      <span className="badge-dot" style={{ background: s.dot }} />
      {s.text}
    </span>
  );
}

export function KpiTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
}) {
  return (
    <div className="card px-4 py-3.5">
      <div className="eyebrow">{label}</div>
      <div className="num mt-1.5 text-[26px] font-semibold leading-none tracking-tight">
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-[12px] text-[var(--ink-3)]">{sub}</div> : null}
    </div>
  );
}

export function InsightCard({
  kind,
  title,
  detail,
}: {
  kind: "win" | "warn" | "info";
  title: string;
  detail: string;
}) {
  const conf = {
    win: { color: "var(--good)", icon: "▲", label: "Opportunity" },
    warn: { color: "var(--warn)", icon: "⚠", label: "Watch" },
    info: { color: "var(--series-1)", icon: "ℹ", label: "Note" },
  }[kind];
  return (
    <div className="card-raised flex gap-3 px-4 py-3">
      <span
        aria-hidden
        className="mt-0.5 text-[13px] leading-none"
        style={{ color: conf.color }}
      >
        {conf.icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: conf.color }}>
          {conf.label}
        </div>
        <div dir="auto" className="mt-0.5 text-[14px] font-semibold leading-snug">
          {title}
        </div>
        <div dir="auto" className="mt-1 text-[13px] leading-relaxed text-[var(--ink-2)]">
          {detail}
        </div>
      </div>
    </div>
  );
}
