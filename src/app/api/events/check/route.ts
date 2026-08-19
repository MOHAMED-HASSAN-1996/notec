import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { normalizeUrl, titleSimilarity, SIMILAR_THRESHOLD } from "@/lib/match";
import { toPublic } from "@/lib/types";
import type { CheckResult } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = (searchParams.get("url") || "").trim();
  const title = (searchParams.get("title") || "").trim();

  const urlKey = normalizeUrl(url);
  let match = null;
  let reason: CheckResult["reason"] = null;

  if (urlKey) {
    const hit = await db
      .select()
      .from(events)
      .where(eq(events.urlKey, urlKey))
      .limit(1);
    if (hit[0]) {
      match = toPublic(hit[0]);
      reason = "url";
    }
  }

  if (!match && title.length >= 4) {
    const all = await db.select({ id: events.id, title: events.title }).from(events);
    let best: { id: string; score: number } | null = null;
    for (const row of all) {
      const s = titleSimilarity(title, row.title);
      if (s >= SIMILAR_THRESHOLD && (!best || s > best.score)) {
        best = { id: row.id, score: s };
      }
    }
    if (best) {
      const hit = await db.select().from(events).where(eq(events.id, best.id)).limit(1);
      if (hit[0]) {
        match = toPublic(hit[0]);
        reason = "title";
      }
    }
  }

  return NextResponse.json({ match, reason } satisfies CheckResult);
}
