import { loadAdsFull } from "@/lib/ads/data";
import Gallery from "../_components/gallery";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const { ads } = await loadAdsFull();
  return (
    <div>
      <div className="eyebrow">Creative library</div>
      <h1 className="font-display mb-6 mt-2 text-[32px] leading-tight">
        Your ads, as people see them
      </h1>
      <Gallery ads={ads} />
    </div>
  );
}
