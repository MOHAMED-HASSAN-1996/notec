import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { events, reservations, reminders } from "@/db/schema";
import { toPublic } from "@/lib/types";
import { getSessionUser, ownerKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = await getSessionUser(req);
  const owner = ownerKey(user, searchParams.get("device") || "");
  if (!owner || owner === "anon" || owner === "server") {
    return NextResponse.json({ reservations: [], reminders: [] });
  }

  const [resv, rem] = await Promise.all([
    db
      .select({ at: reservations.createdAt, e: events })
      .from(reservations)
      .innerJoin(events, eq(reservations.eventId, events.id))
      .where(eq(reservations.device, owner))
      .orderBy(asc(events.startsAt)),
    db
      .select({ beforeMinutes: reminders.beforeMinutes, e: events })
      .from(reminders)
      .innerJoin(events, eq(reminders.eventId, events.id))
      .where(eq(reminders.device, owner))
      .orderBy(asc(events.startsAt)),
  ]);

  return NextResponse.json({
    reservations: resv.map((r) => ({
      ...toPublic(r.e),
      at: new Date(r.at).toISOString(),
    })),
    reminders: rem.map((r) => ({ ...toPublic(r.e), beforeMinutes: r.beforeMinutes })),
  });
}
