import { loadAdsFull } from "@/lib/ads/data";
import CompareBoard from "../_components/compare-board";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const { ads } = await loadAdsFull();
  return (
    <div>
      <div className="eyebrow">A/B view</div>
      <h1 className="font-display mb-2 mt-2 text-[32px] leading-tight">
        Which ad earns its budget?
      </h1>
      <p className="mb-8 max-w-xl text-[14px] text-[var(--ink-2)]">
        Pick ads, pick a metric — the bars keep each ad&apos;s color everywhere in the app,
        so you always know who&apos;s who.
      </p>
      <CompareBoard ads={ads} />
    </div>
  );
}
