import { asc, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { CATEGORIES, toPublic } from "@/lib/types";
import { getT } from "@/lib/i18n-server";
import { Hero } from "@/components/home-hero";
import { StepsList, type StepData } from "@/components/steps-list";
import { Parallax, Reveal, Float } from "@/components/parallax";
import { EventCard } from "@/components/event-card";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CommunitiesSection } from "@/components/communities-section";
import { AnimatedCounter } from "@/components/animated-counter";
import { Btn, IconMerge, IconSpark, Marquee, SectionHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { t } = await getT();

  const rows = await db
    .select()
    .from(events)
    .where(gte(events.startsAt, new Date()))
    .orderBy(asc(events.startsAt))
    .limit(6);
  const evts = rows.map(toPublic);

  const [stats] = await db
    .select({
      events: sql<number>`count(*)::int`,
      attendees: sql<number>`coalesce(sum(${events.attendeesCount}),0)::int`,
      cities: sql<number>`count(distinct nullif(${events.city},''))::int`,
      merges: sql<number>`coalesce(sum(${events.merges}),0)::int`,
    })
    .from(events);

  const steps: StepData[] = t.home.steps.map((s, i) => ({
    n: `0${i + 1}`,
    icon: s.icon,
    t: s.t,
    d: s.d,
  }));

  return (
    <>
      <Hero evts={evts.slice(0, 3)} />

      {/* Stats */}
      <section className="bg-ink2">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {[stats.events, stats.attendees, stats.cities, stats.merges].map(
            (v, i) => (
              <div key={i} className="border-b border-line px-6 py-8 text-center last:border-b-0 md:border-b-0 md:border-e border-line md:last:border-e-0 md:py-10">
                <div className="flex items-baseline justify-center gap-px" dir="ltr">
                  <span className="text-3xl font-black text-limed md:text-4xl">
                    +
                  </span>
                  <AnimatedCounter value={v} className="text-3xl font-black text-limed md:text-4xl" />
                </div>
                <div className="mt-1.5 text-[13px] text-mut">{t.home.stats[i]}</div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Featured events — BEFORE how it works */}
      <section className="mx-auto max-w-6xl px-5 pt-10 md:pt-16">
        <SectionHead
          index="01"
          title={
            <>
              {t.home.upcomingA} <span className="text-limed">{t.home.upcomingB}</span>
            </>
          }
          sub={t.home.upcomingSub}
          action={
            <Btn href="/events" variant="outline">
              {t.home.allEvents}
            </Btn>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {evts.slice(0, 6).map((ev, i) => (
            <Reveal key={ev.id} delay={i * 0.06}>
              <EventCard ev={ev} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 pt-24 md:pt-32">
        <SectionHead
          index="02"
          title={
            <>
              {t.home.howA} <span className="text-limed">{t.home.howB}</span>{" "}
              {t.home.howC}
            </>
          }
          sub={t.home.howSub}
        />
        <StepsList items={steps} />
        <div className="border-t border-line" />
      </section>

      {/* Communities */}
      <CommunitiesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Match demo */}
      <section className="mx-auto max-w-6xl px-5 pt-24 md:pt-32">
        <SectionHead
          index="05"
          title={
            <>
              {t.home.matchA} <span className="text-limed">{t.home.matchB}</span>
            </>
          }
          sub={t.home.matchSub}
        />
        <div className="grid gap-4 rounded-3xl border border-line bg-ink2 p-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:p-10">
          <Reveal>
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-line bg-card p-4">
                <div className="text-[14px] text-mut">{t.home.guest1}</div>
                <div className="mt-1 font-bold">ملتقى القاهرة للذكاء الاصطناعي</div>
                <div
                  className="mt-2 truncate rounded-lg bg-ink px-3 py-1.5 text-[14px] text-mut"
                  dir="ltr"
                >
                  egyptinnovate.com/events
                </div>
              </div>
              <div className="rounded-xl border border-line bg-card p-4">
                <div className="text-[14px] text-mut">{t.home.guest2}</div>
                <div className="mt-1 font-bold">ملتقى القاهرة للذكاء الاصطناعي</div>
                <div
                  className="mt-2 truncate rounded-lg bg-ink px-3 py-1.5 text-[14px] text-limed"
                  dir="ltr"
                >
                  egyptinnovate.com/events
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex flex-col items-center gap-3 py-4 md:py-0">
              <span className="grid size-14 place-items-center rounded-full bg-lime text-ink">
                <IconMerge className="size-7" />
              </span>
              <span className="text-[14px] font-bold text-mut">{t.home.instantMatch}</span>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="rounded-xl border-2 border-limed/50 bg-lime/5 p-5">
              <div className="flex items-center gap-2 text-[14px] font-bold text-limed">
                <IconSpark className="size-4" />
                {t.home.matchBadge}
              </div>
              <div className="mt-2 text-lg font-black">
                ملتقى القاهرة للذكاء الاصطناعي
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-ink px-3 py-1 text-[14px] text-bone">
                  {t.home.bookingsChip}
                </span>
                <span className="rounded-full bg-ink px-3 py-1 text-[14px] text-bone">
                  {t.home.mergedChip}
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-5 py-28 text-center md:py-36">
        <Parallax y={0.18} className="pointer-events-none absolute -top-20 right-[10%]">
          <Float y={14} duration={4.5}>
            <div className="size-64 rounded-full border border-line" />
          </Float>
        </Parallax>
        <Parallax y={-0.12} x={-0.08} className="pointer-events-none absolute bottom-0 left-[8%]">
          <Float y={10} duration={3.6} delay={0.8}>
            <div className="size-3 rounded-full bg-lime" />
          </Float>
        </Parallax>
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            {t.home.ctaA} <span className="text-limed">{t.home.ctaB}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-mut">
            {t.home.ctaSub}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Btn href="/events">{t.home.ctaStart}</Btn>
            <Btn href="/about" variant="outline">
              {t.home.ctaMore}
            </Btn>
          </div>
        </Reveal>
      </section>
    </>
  );
}
