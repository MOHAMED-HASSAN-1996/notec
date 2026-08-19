import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getT } from "@/lib/i18n-server";
import { fmtDate, fmtTime, priceLabel, toPublic } from "@/lib/types";
import { DetailActions } from "@/components/detail-actions";
import { RelatedSlider } from "@/components/related-slider";
import { LocalParallax } from "@/components/parallax";
import {
  IconCalendar,
  IconClock,
  IconExternal,
  IconPin,
  IconSpark,
  IconTicket,
} from "@/components/ui";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { id } = await params;
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  const ev = rows[0];
  if (!ev) return { title: "Notec" };
  const abs = (p?: string | null) =>
    p && /^https?:\/\//.test(p)
      ? p
      : `http://localhost:3000${p || "/about-hero.jpg"}`;
  const image = abs(ev.imageUrl);
  return {
    title: ev.title,
    description: ev.description?.slice(0, 150) || undefined,
    openGraph: {
      title: ev.title,
      description: ev.description?.slice(0, 150) || undefined,
      type: "article",
      url: `http://localhost:3000/events/${id}`,
      images: [{ url: image, width: 1200, height: 630, alt: ev.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: ev.title,
      description: ev.description?.slice(0, 150) || undefined,
      images: [image],
    },
  };
}

export default async function EventPage({ params }: Ctx) {
  const { id } = await params;
  const { t, lang } = await getT();
  let rows: (typeof events.$inferSelect)[] = [];
  try {
    rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  } catch {
    // DB unavailable below.
  }
  if (!rows[0]) notFound();
  const ev = toPublic(rows[0]);

  let rel: ReturnType<typeof toPublic>[] = [];
  try {
    const related = await db
      .select()
      .from(events)
      .where(and(eq(events.category, ev.category), gte(events.startsAt, new Date())))
      .orderBy(asc(events.startsAt))
      .limit(10);
    rel = related
      .filter((r) => r.id !== ev.id)
      .slice(0, 10)
      .map(toPublic);
  } catch {
    // Related events unavailable — hide slider.
  }

  const price = ev.price === "مجاني" && lang === "en" ? "Free" : priceLabel(ev.price);
  const isPast = new Date(ev.startsAt) < new Date();

  return (
    <div className="pt-[72px]">
      {/* cover */}
      <div className="relative h-[42vh] min-h-[330px] overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <LocalParallax y={70} className="h-full w-full">
            {ev.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ev.imageUrl}
                alt={ev.title}
                className="h-full w-full scale-110 object-cover"
              />
            ) : (
              <div className="dot-grid h-full w-full bg-ink2" />
            )}
          </LocalParallax>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/10" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_370px]">
        <div className="min-w-0">
          <Link
            href="/events"
            className="text-[14px] font-bold text-mut transition-colors hover:text-limed"
          >
            {t.detail.back}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-card px-3.5 py-1 text-[14px] font-bold text-limed">
              {ev.category}
            </span>
            {ev.merges > 0 && (
              <span className="flex items-center gap-1.5 rounded-full border border-limed/40 px-3.5 py-1 text-[14px] font-bold text-bone/85">
                <IconSpark className="size-3.5 text-limed" />
                {t.detail.mergedBadge(ev.merges)}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-black leading-[1.12] md:text-6xl">
            {ev.title}
          </h1>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-[15px] text-mut">
            <span className="flex items-center gap-2.5">
              <IconCalendar className="size-5 text-limed" />
              {fmtDate(ev.startsAt, lang)}
            </span>
            <span className="flex items-center gap-2.5">
              <IconClock className="size-5 text-limed" />
              {fmtTime(ev.startsAt, lang)}
              {ev.endsAt ? ` — ${t.detail.until} ${fmtTime(ev.endsAt, lang)}` : ""}
            </span>
            {(ev.location || ev.city) && (
              <span className="flex items-center gap-2.5">
                <IconPin className="size-5 text-limed" />
                {[ev.location, ev.city].filter(Boolean).join(t.detail.joinSep)}
              </span>
            )}
            <span className="flex items-center gap-2.5">
              <IconTicket className="size-5 text-limed" />
              {price}
            </span>
          </div>

          {ev.description && (
            <p className="mt-8 max-w-2xl whitespace-pre-line text-[16px] leading-loose text-bone/85">
              {ev.description}
            </p>
          )}

          {ev.merges > 0 && (
            <div className="mt-9 flex gap-4 rounded-2xl border border-limed/30 bg-lime/5 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-lime text-ink">
                <IconSpark className="size-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-black">{t.detail.matchTitle}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-mut">
                  {t.detail.matchBody(ev.merges)}
                </p>
              </div>
            </div>
          )}

          {ev.url && (
            <a
              href={ev.url}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 text-[15px] font-bold text-limed transition-colors hover:text-bone"
            >
              <IconExternal className="size-4.5" />
              {t.detail.officialPage}
            </a>
          )}

          {/* Past event: show registration link prominently */}
          {isPast && ev.url && (
            <div className="mt-7 rounded-2xl border border-amber/30 bg-amber/5 p-5">
              <div className="text-[15px] font-bold text-amber">{t.detail.pastTitle}</div>
              <p className="mt-2 text-[14px] text-mut">
                {t.detail.pastBody}
              </p>
              <a
                href={ev.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber/15 px-5 py-2.5 text-[15px] font-bold text-amber transition-colors hover:bg-amber/25"
              >
                <IconExternal className="size-4" />
                {t.detail.visitOfficial}
              </a>
            </div>
          )}

          {/* Agenda */}
          {ev.agenda.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-black md:text-3xl">{t.detail.agenda}</h2>
              <div className="mt-6 space-y-0">
                {ev.agenda.map((item, i) => (
                  <div key={i} className="flex gap-5 border-b border-line py-5 last:border-b-0">
                    <div className="shrink-0 w-16 text-center">
                      <div className="text-[15px] font-bold text-limed" dir="ltr">{item.time}</div>
                      {i < ev.agenda.length - 1 && (
                        <div className="mx-auto mt-2 h-full w-px bg-line" />
                      )}
                    </div>
                    <div>
                      <div className="text-[16px] font-bold">{item.title}</div>
                      {item.desc && (
                        <div className="mt-1 text-[14px] text-mut">{item.desc}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related events */}
          {rel.length > 0 && (
            <div className="mt-16 border-t border-line pt-12">
              <h2 className="text-2xl font-black md:text-3xl">{t.detail.related}</h2>
              <div className="mt-6">
                <RelatedSlider events={rel} />
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <DetailActions ev={ev} />
        </div>
      </div>
    </div>
  );
}
