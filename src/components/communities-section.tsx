"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { COMMUNITIES, communityLogo, communitySlug } from "@/lib/types";
import { slugify, useStoredCommunities } from "@/lib/community-store";
import { useLang } from "./providers";
import { SectionHead, IconArrow } from "./ui";

const PER_PAGE = 6;

type Item = {
  key: string;
  name: string;
  logo: string;
  href: string;
};

export function CommunitiesSection() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [page, setPage] = useState(0);
  const stored = useStoredCommunities();

  const base: Item[] = COMMUNITIES.map((c) => ({
    key: c,
    name: c,
    logo: communityLogo(c),
    href: `/community/${communitySlug(c)}`,
  }));
  const extra: Item[] = (stored ?? []).map((c) => ({
    key: c.id,
    name: c.name,
    logo: c.logo,
    href: `/community/${slugify(c.name)}`,
  }));
  const items = [...extra, ...base];

  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const visible = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="mx-auto max-w-6xl px-5 pt-24 md:pt-32">
      <SectionHead
        index="03"
        title={
          <>
            {t.home.commA} <span className="text-limed">{t.home.commB}</span>
          </>
        }
        sub={t.home.commSub}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t.home.commPrev}
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="grid size-10 place-items-center rounded-full border border-line bg-ink2 text-bone transition-colors hover:border-limed/50 hover:text-limed disabled:cursor-not-allowed disabled:opacity-30"
            >
              <IconArrow className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              aria-label={t.home.commNext}
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              className="grid size-10 place-items-center rounded-full border border-line bg-ink2 text-bone transition-colors hover:border-limed/50 hover:text-limed disabled:cursor-not-allowed disabled:opacity-30"
            >
              <IconArrow className="size-4" />
            </button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
        {visible.map((item, i) => (
          <motion.div
            key={item.key}
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: "-40px" },
                  transition: {
                    duration: 0.5,
                    delay: i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  },
                })}
          >
            <Link
              href={item.href}
              className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-line bg-ink2 p-4 transition-colors hover:border-limed/50 md:gap-4 md:p-5"
            >
              <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full md:size-14">
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={56}
                    height={56}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-black text-limed">
                    {(item.name[0] || "?").toUpperCase()}
                  </span>
                )}
              </span>
              <span className="truncate text-[15px] font-bold leading-tight text-bone">
                {item.name}
              </span>
              <IconArrow className="absolute end-4 top-1/2 size-4 shrink-0 -translate-y-1/2 text-limed opacity-0 transition-all duration-300 group-hover:end-3 group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}