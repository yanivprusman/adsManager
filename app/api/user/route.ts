import { NextResponse } from "next/server";
import { loadUserData, writeUserData } from "@/lib/ads/data";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    adId?: string;
    starred?: boolean;
    tags?: string[];
    notes?: string;
  };
  if (!body.adId) {
    return NextResponse.json({ error: "adId required" }, { status: 400 });
  }
  const data = await loadUserData();
  const entry = { ...(data.ads[body.adId] ?? {}) };
  if (body.starred !== undefined) entry.starred = body.starred;
  if (body.tags !== undefined) entry.tags = body.tags;
  if (body.notes !== undefined) entry.notes = body.notes;
  data.ads[body.adId] = entry;
  await writeUserData(data);
  return NextResponse.json({ ok: true, entry });
}
