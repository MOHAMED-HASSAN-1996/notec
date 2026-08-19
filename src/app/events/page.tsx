import type { Metadata } from "next";
import { asc, gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { toPublic } from "@/lib/types";
import { getT } from "@/lib/i18n-server";
import { EventsExplorer } from "@/components/events-explorer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t.events.title,
    description: t.events.sub,
  };
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; community?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getT();
  let rows: (typeof events.$inferSelect)[] = [];
  try {
    rows = await db
      .select()
      .from(events)
      .where(gte(events.startsAt, new Date()))
      .orderBy(asc(events.startsAt))
      .limit(80);
  } catch {
    // DB unavailable — show empty explorer instead of crashing.
  }

  return (
    <EventsExplorer
      events={rows.map(toPublic)}
      initialQ={sp.q || ""}
      initialCat={sp.cat || t.events.all}
      initialCommunity={sp.community || ""}
    />
  );
}
