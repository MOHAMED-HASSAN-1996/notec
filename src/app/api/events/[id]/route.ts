import { NextResponse } from "next/server";
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { events, reservations, reminders } from "@/db/schema";
import { toPublic } from "@/lib/types";
import { getSessionUser, ownerKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getSessionUser(req);
  const owner = user
    ? `u:${user.id}`
    : req.headers.get("x-device-id") || "";

  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!rows[0]) {
    return NextResponse.json({ error: "الحدث مش موجود" }, { status: 404 });
  }
  const row = rows[0];

  const [r, m] = await Promise.all([
    owner
      ? db
          .select({ id: reservations.id })
          .from(reservations)
          .where(and(eq(reservations.eventId, id), eq(reservations.device, owner)))
          .limit(1)
      : Promise.resolve([] as { id: string }[]),
    owner
      ? db
          .select({ beforeMinutes: reminders.beforeMinutes })
          .from(reminders)
          .where(and(eq(reminders.eventId, id), eq(reminders.device, owner)))
          .limit(1)
      : Promise.resolve([] as { beforeMinutes: number }[]),
  ]);

  const related = await db
    .select()
    .from(events)
    .where(and(eq(events.category, row.category), gte(events.startsAt, new Date())))
    .orderBy(asc(events.startsAt))
    .limit(3);

  return NextResponse.json({
    event: toPublic(row),
    state: {
      isReserved: r.length > 0,
      isReminded: m.length > 0,
      beforeMinutes: m[0]?.beforeMinutes ?? 1440,
      attendeesCount: row.attendeesCount,
    },
    related: related.filter((e) => e.id !== row.id).map(toPublic),
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await getSessionUser(req);
  const owner = ownerKey(user, req.headers.get("x-device-id") || "anonymous");

  let body: { action?: string; beforeMinutes?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!rows[0]) {
    return NextResponse.json({ error: "الحدث مش موجود" }, { status: 404 });
  }

  const action = body.action;
  if (action === "reserve" || action === "unreserve") {
    if (action === "reserve") {
      const inserted = await db
        .insert(reservations)
        .values({ eventId: id, device: owner })
        .onConflictDoNothing({
          target: [reservations.eventId, reservations.device],
        })
        .returning({ id: reservations.id });
      if (inserted.length > 0) {
        await db
          .update(events)
          .set({ attendeesCount: rows[0].attendeesCount + 1 })
          .where(eq(events.id, id));
      }
    } else {
      const del = await db
        .delete(reservations)
        .where(and(eq(reservations.eventId, id), eq(reservations.device, owner)))
        .returning({ id: reservations.id });
      if (del.length > 0) {
        await db
          .update(events)
          .set({ attendeesCount: Math.max(0, rows[0].attendeesCount - 1) })
          .where(eq(events.id, id));
      }
    }
  } else if (action === "reminder") {
    const before = Number(body.beforeMinutes) || 1440;
    await db
      .insert(reminders)
      .values({ eventId: id, device: owner, beforeMinutes: before })
      .onConflictDoUpdate({
        target: [reminders.eventId, reminders.device],
        set: { beforeMinutes: before },
      });
  } else if (action === "unremind") {
    await db
      .delete(reminders)
      .where(and(eq(reminders.eventId, id), eq(reminders.device, owner)));
  } else {
    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  }

  const [r, m] = await Promise.all([
    db
      .select({ id: reservations.id })
      .from(reservations)
      .where(and(eq(reservations.eventId, id), eq(reservations.device, owner)))
      .limit(1),
    db
      .select({ beforeMinutes: reminders.beforeMinutes })
      .from(reminders)
      .where(and(eq(reminders.eventId, id), eq(reminders.device, owner)))
      .limit(1),
  ]);
  const ev = await db.select().from(events).where(eq(events.id, id)).limit(1);

  return NextResponse.json({
    isReserved: r.length > 0,
    isReminded: m.length > 0,
    beforeMinutes: m[0]?.beforeMinutes ?? 1440,
    attendeesCount: ev[0]?.attendeesCount ?? 0,
  });
}
