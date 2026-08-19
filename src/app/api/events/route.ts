import { NextResponse } from "next/server";
import { desc, and, asc, eq, gte, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { normalizeUrl, titleSimilarity, SIMILAR_THRESHOLD } from "@/lib/match";
import { toPublic } from "@/lib/types";
import { getSessionUser, ownerKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const community = (searchParams.get("community") || "").trim();

  const conds = [gte(events.startsAt, new Date(Date.now() - 7 * 864e5))];
  if (q) {
    const w = `%${q}%`;
    conds.push(
      or(
        ilike(events.title, w),
        ilike(events.description, w),
        ilike(events.city, w),
        ilike(events.location, w),
        ilike(events.category, w),
        ilike(events.community, w),
      )!,
    );
  }
  if (category && category !== "الكل" && category !== "All") {
    conds.push(eq(events.category, category));
  }
  if (community) {
    conds.push(eq(events.community, community));
  }

  const order =
    searchParams.get("sort") === "popular"
      ? desc(events.attendeesCount)
      : asc(events.startsAt);

  let rows: (typeof events.$inferSelect)[] = [];
  try {
    rows = await db
      .select()
      .from(events)
      .where(and(...conds))
      .orderBy(order)
      .limit(80);
  } catch {
    // DB unavailable — return empty list.
  }

  return NextResponse.json({ events: rows.map(toPublic) });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const owner = ownerKey(user, req.headers.get("x-device-id") || "anonymous");

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const startsAt = new Date(String(body.startsAt || ""));
  if (!title || title.length < 3) {
    return NextResponse.json(
      { error: "اكتب اسم الحدث (3 أحرف على الأقل)" },
      { status: 400 },
    );
  }
  if (isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "اختار تاريخ الحدث" }, { status: 400 });
  }

  const url = String(body.url || "").trim();
  const urlKey = normalizeUrl(url);

  // 1) Exact link match → merge into the existing event.
  if (urlKey) {
    const hit = await db
      .select()
      .from(events)
      .where(eq(events.urlKey, urlKey))
      .limit(1);
    if (hit[0]) {
      await db
        .update(events)
        .set({ merges: sql`${events.merges} + 1` })
        .where(eq(events.id, hit[0].id));
      return NextResponse.json(
        {
          error: "الدمج شغّال: اللينك ده مرتبط بحدث موجود بالفعل",
          code: "url",
          existing: toPublic(hit[0]),
        },
        { status: 409 },
      );
    }
  }

  // 2) Title similarity → merge into the closest event.
  const all = await db
    .select({ id: events.id, title: events.title })
    .from(events);
  let best: { id: string; score: number } | null = null;
  for (const row of all) {
    const s = titleSimilarity(title, row.title);
    if (s >= SIMILAR_THRESHOLD && (!best || s > best.score)) {
      best = { id: row.id, score: s };
    }
  }
  if (best) {
    const hit = await db
      .select()
      .from(events)
      .where(eq(events.id, best.id))
      .limit(1);
    if (hit[0]) {
      await db
        .update(events)
        .set({ merges: sql`${events.merges} + 1` })
        .where(eq(events.id, hit[0].id));
      return NextResponse.json(
        {
          error: "الدمج شغّال: في حدث مشابه موجود بالفعل",
          code: "similar",
          score: Math.round(best.score * 100),
          existing: toPublic(hit[0]),
        },
        { status: 409 },
      );
    }
  }

  const endsAt = body.endsAt ? new Date(String(body.endsAt)) : null;
  const inserted = await db
    .insert(events)
    .values({
      title,
      description: String(body.description || "").trim(),
      category: String(body.category || "تقنية").trim() || "تقنية",
      location: String(body.location || "").trim(),
      city: String(body.city || "").trim(),
      price: String(body.price || "مجاني").trim() || "مجاني",
      url,
      urlKey,
      imageUrl: String(body.imageUrl || "").trim(),
      community: String(body.community || "").trim(),
      ownerDevice: owner,
      startsAt,
      endsAt: isNaN(endsAt?.getTime() as number) ? null : endsAt,
    })
    .returning();

  return NextResponse.json(
    { id: inserted[0].id, event: toPublic(inserted[0]) },
    { status: 201 },
  );
}
