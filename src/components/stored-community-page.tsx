"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLang } from "@/components/providers";
import { useStoredCommunities } from "@/lib/community-store";
import type { CommunityPlatform } from "@/lib/types";
import {
  IconArrow,
  IconFacebook,
  IconGithub,
  IconLinkedIn,
  IconTelegram,
  IconWhatsApp,
  IconXBrand,
  IconYouTube,
} from "@/components/ui";

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

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[.\s/]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-");
}

export function StoredCommunityPage({ slug }: { slug: string }) {
  const { t } = useLang();
  const stored = useStoredCommunities();

  // Not hydrated yet (server / first client pass): render a neutral shell so we
  // don't fire a premature 404 for a community that lives in localStorage.
  if (stored === null) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-limed" />
      </div>
    );
  }

  const community = stored.find((c) => slugify(c.name) === slug) ?? null;
  if (community === null) notFound();

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
            {community.logo ? (
              <Image
                src={community.logo}
                alt={community.name}
                width={96}
                height={96}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black text-limed">
                {(community.name[0] || "?").toUpperCase()}
              </span>
            )}
          </span>
          <div>
            <h1 className="text-4xl font-bold leading-[1.2] md:text-6xl">
              {community.name}
            </h1>
            {community.description && (
              <p className="mt-3 max-w-xl text-[15px] text-mut">
                {community.description}
              </p>
            )}
          </div>
        </div>

        <div className="mb-16 mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="text-[14px] font-bold text-mut">{t.community.joinTitle}</div>
          <div className="flex items-center gap-2">
            {PLATFORMS.map(({ key, label, icon: Icon, color }) => {
              const href = community.links[key];
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

        <div className="mt-6 rounded-3xl border border-dashed border-line py-16 text-center">
          <h3 className="text-2xl font-black">{t.community.empty}</h3>
          <p className="mt-2 text-[15px] text-mut">{t.events.noResultsBody}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/add">{t.events.addIt}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}