import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getT } from "@/lib/i18n-server";
import {
  COMMUNITIES,
  communityLinks,
  communityLogo,
  communitySlug,
  toPublic,
  type CommunityPlatform,
} from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { Reveal } from "@/components/parallax";
import { StoredCommunityPage } from "@/components/stored-community-page";
import {
  Btn,
  SectionHead,
  IconArrow,
  IconFacebook,
  IconGithub,
  IconLinkedIn,
  IconTelegram,
  IconWhatsApp,
  IconXBrand,
  IconYouTube,
} from "@/components/ui";

export const dynamic = "force-dynamic";

const PLATFORMS: {
  key: CommunityPlatform;
  label: string;
  icon: (p: { className?: string }) => React.ReactNode;
  color: string;
}[] = [
  { key: "youtube", label: "YouTube", icon: IconYouTube, color: "text-[#ff0000]" },
  { key: "facebook", label: "Facebook", icon: IconFacebook, color: "text-[#1877f2]" },
  { key: "linkedin", label: "LinkedIn", icon: IconLinkedIn, color: "text-[#0a66c2]" },
  { key: "x", label: "X", icon: IconXBrand, color: "text-bone" },
  { key: "whatsapp", label: "WhatsApp", icon: IconWhatsApp, color: "text-[#25d366]" },
  { key: "telegram", label: "Telegram", icon: IconTelegram, color: "text-[#229ed9]" },
  { key: "github", label: "GitHub", icon: IconGithub, color: "text-bone" },
];

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = COMMUNITIES.find((c) => communitySlug(c) === slug);
  if (!community) return <StoredCommunityPage slug={slug} />;
  const { t } = await getT();

  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.community, community), gte(events.startsAt, new Date())))
    .orderBy(asc(events.startsAt))
    .limit(40);
  const evts = rows.map(toPublic);

  return (
    <div className="pt-[72px]">
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-[14px] font-bold text-mut transition-colors hover:text-limed"
        >
          <IconArrow className="size-4 rotate-180" />
          {t.events.title}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <span className="grid size-20 place-items-center overflow-hidden rounded-2xl border border-line md:size-24">
            <Image
              src={communityLogo(community)}
              alt={community}
              width={96}
              height={96}
              className="size-full object-cover"
            />
          </span>
          <div>
            <h1 className="text-4xl font-bold leading-[1.2] md:text-6xl">
              {community}
            </h1>
            <p className="mt-3 text-[15px] text-mut">{t.community.sub}</p>
          </div>
        </div>

        <div className="mb-16 mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="text-[14px] font-bold text-mut">{t.community.joinTitle}</div>
          <div className="flex items-center gap-2">
            {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
              const href = communityLinks(community)[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  className="grid size-10 place-items-center rounded-full border border-line text-bone transition-colors hover:border-mut hover:bg-ink2"
                >
                  <span className={color}>
                    <Icon className="size-[18px]" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        <SectionHead
          index="01"
          title={
            <>
              {t.community.eventsTitleA}{" "}
              <span className="text-limed">{t.community.eventsTitleB}</span>
            </>
          }
          action={
            <Btn href="/events" variant="outline">
              {t.home.allEvents}
            </Btn>
          }
        />

        {evts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-line py-16 text-center">
            <h3 className="text-2xl font-black">{t.community.empty}</h3>
            <p className="mt-2 text-[15px] text-mut">{t.events.noResultsBody}</p>
            <div className="mt-6 flex justify-center">
              <Btn href="/add">{t.events.addIt}</Btn>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {evts.map((ev, i) => (
              <Reveal key={ev.id} delay={i * 0.06}>
                <EventCard ev={ev} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}