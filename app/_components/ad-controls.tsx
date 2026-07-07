"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdActionType, QueuedAction } from "@/lib/ads/types";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function StarButton({ adId, starred }: { adId: string; starred: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      aria-label={starred ? "Unstar ad" : "Star ad"}
      title={starred ? "Unstar" : "Star"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          await post("/api/user", { adId, starred: !starred });
          router.refresh();
        });
      }}
      className={`text-[18px] leading-none transition-transform hover:scale-110 ${
        starred ? "text-[var(--accent)]" : "text-[var(--ink-3)] hover:text-[var(--ink-2)]"
      }`}
    >
      {starred ? "★" : "☆"}
    </button>
  );
}

export function TagsNotes({
  adId,
  tags,
  notes,
}: {
  adId: string;
  tags: string[];
  notes: string;
}) {
  const router = useRouter();
  const [draftTag, setDraftTag] = useState("");
  const [draftNotes, setDraftNotes] = useState(notes);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, start] = useTransition();

  const saveTags = (next: string[]) =>
    start(async () => {
      await post("/api/user", { adId, tags: next });
      router.refresh();
    });

  return (
    <div className="card px-4 py-4">
      <div className="eyebrow mb-3">Your organization</div>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((t) => (
          <span key={t} className="chip">
            <span dir="auto">{t}</span>
            <button
              aria-label={`Remove tag ${t}`}
              className="text-[var(--ink-3)] hover:text-[var(--critical)]"
              onClick={() => saveTags(tags.filter((x) => x !== t))}
            >
              ×
            </button>
          </span>
        ))}
        <form
          className="inline-flex"
          onSubmit={(e) => {
            e.preventDefault();
            const t = draftTag.trim();
            if (!t || tags.includes(t)) return;
            setDraftTag("");
            saveTags([...tags, t]);
          }}
        >
          <input
            dir="auto"
            value={draftTag}
            onChange={(e) => setDraftTag(e.target.value)}
            placeholder="+ tag"
            className="w-24 rounded-full border border-[var(--line)] bg-transparent px-3 py-1 text-[12px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] focus:border-[var(--accent)]"
          />
        </form>
      </div>
      <textarea
        dir="auto"
        value={draftNotes}
        onChange={(e) => setDraftNotes(e.target.value)}
        placeholder="Notes on this ad — hypotheses, results, next steps…"
        rows={3}
        className="mt-3 w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-[13px] leading-relaxed text-[var(--ink)] outline-none placeholder:text-[var(--ink-3)] focus:border-[var(--accent)]"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          className="btn"
          disabled={pending || draftNotes === notes}
          onClick={() =>
            start(async () => {
              await post("/api/user", { adId, notes: draftNotes });
              setSavedFlash(true);
              setTimeout(() => setSavedFlash(false), 1600);
              router.refresh();
            })
          }
        >
          Save notes
        </button>
        {savedFlash ? (
          <span className="text-[12px] text-[var(--good)]">Saved ✓</span>
        ) : null}
      </div>
    </div>
  );
}

export function ActionButtons({
  adId,
  adName,
  status,
  pendingAction,
}: {
  adId: string;
  adName: string;
  status: string;
  pendingAction?: QueuedAction;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const queue = (type: AdActionType) =>
    start(async () => {
      await post("/api/actions", { op: "queue", adId, adName, type });
      router.refresh();
    });

  const cancel = () =>
    start(async () => {
      await post("/api/actions", { op: "cancel", id: pendingAction!.id });
      router.refresh();
    });

  if (pendingAction) {
    return (
      <div className="card-raised flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-[13px]">
          <span
            className="badge mr-2 align-middle"
            style={{ color: "var(--warn)", borderColor: "var(--warn)" }}
          >
            <span className="badge-dot" style={{ background: "var(--warn)" }} />
            QUEUED
          </span>
          <b>{pendingAction.type === "pause" ? "Pause" : "Resume"}</b> requested —
          tell Claude <i>&ldquo;apply my queued ad actions&rdquo;</i> to push it to Meta.
        </div>
        <button className="btn" disabled={pending} onClick={cancel}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {status === "ACTIVE" ? (
        <button className="btn" disabled={pending} onClick={() => queue("pause")}>
          ⏸ Queue pause
        </button>
      ) : (
        <button className="btn btn-accent" disabled={pending} onClick={() => queue("resume")}>
          ▶ Queue resume
        </button>
      )}
    </div>
  );
}
