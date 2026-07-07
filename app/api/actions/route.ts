import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { loadActions, writeActions } from "@/lib/ads/data";
import type { AdActionType } from "@/lib/ads/types";

export async function GET() {
  return NextResponse.json(await loadActions());
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    op: "queue" | "cancel";
    adId?: string;
    adName?: string;
    type?: AdActionType;
    id?: string;
  };
  const data = await loadActions();

  if (body.op === "queue") {
    if (!body.adId || !body.type) {
      return NextResponse.json({ error: "adId and type required" }, { status: 400 });
    }
    // one pending action per ad — a new request replaces the old one
    for (const a of data.actions) {
      if (a.adId === body.adId && a.status === "pending") a.status = "cancelled";
    }
    data.actions.push({
      id: randomUUID(),
      adId: body.adId,
      adName: body.adName ?? body.adId,
      type: body.type,
      requestedAt: new Date().toISOString(),
      status: "pending",
    });
  } else if (body.op === "cancel") {
    const a = data.actions.find((x) => x.id === body.id);
    if (!a) return NextResponse.json({ error: "not found" }, { status: 404 });
    a.status = "cancelled";
  } else {
    return NextResponse.json({ error: "unknown op" }, { status: 400 });
  }

  await writeActions(data);
  return NextResponse.json({ ok: true });
}
