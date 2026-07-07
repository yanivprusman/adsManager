"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/ads", label: "Ads" },
  { href: "/compare", label: "Compare" },
  { href: "/structure", label: "Structure" },
];

export default function Nav({ fetchedAt }: { fetchedAt: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(14,15,18,0.82)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl leading-none text-[var(--accent)]">
            Ads
          </span>
          <span className="font-display text-xl leading-none">Desk</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              data-active={
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="chip num" title="Snapshot time — ask Claude to sync adsManager to refresh">
            <span
              className="badge-dot"
              style={{ background: "var(--good)" }}
            />
            data {fetchedAt}
          </span>
        </div>
      </div>
    </header>
  );
}
