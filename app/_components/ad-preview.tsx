import Image from "next/image";
import type { Creative } from "@/lib/ads/types";
import { ctaLabel } from "@/lib/ads/format";

/**
 * Faithful Facebook-feed rendering of a creative, built from the snapshot data
 * (page name, primary text, image, headline, CTA). Fully RTL like the real ad.
 */
export default function AdPreview({
  creative,
  pageName,
  linkDomain,
  compact = false,
}: {
  creative: Creative;
  pageName: string;
  linkDomain: string;
  compact?: boolean;
}) {
  return (
    <div className="fb-card" dir="rtl">
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #1877f2, #0a4fa8)" }}
        >
          {pageName.slice(0, 1).toUpperCase()}
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">{pageName}</div>
          <div className="text-[12px] text-[#65676b]">
            ממומן · <span aria-hidden>🌐</span>
          </div>
        </div>
      </div>
      <div
        className={`whitespace-pre-line px-4 pb-3 text-[14px] leading-[1.45] ${
          compact ? "line-clamp-4" : ""
        }`}
      >
        {creative.body}
      </div>
      <Image
        src={creative.image}
        alt={creative.title}
        width={creative.imageWidth}
        height={creative.imageHeight}
        className="w-full"
        unoptimized
      />
      <div className="flex items-center justify-between gap-3 bg-[#f0f2f5] px-4 py-2.5">
        <div className="min-w-0">
          <div className="text-[12px] uppercase tracking-wide text-[#65676b]">
            {linkDomain}
          </div>
          <div className="truncate text-[15px] font-semibold leading-snug">
            {creative.title}
          </div>
        </div>
        <div className="fb-cta">{ctaLabel(creative.callToAction)}</div>
      </div>
    </div>
  );
}
