"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { COMMUNITIES, communityLogo, communitySlug } from "@/lib/types";
import { slugify, useStoredCommunities } from "@/lib/community-store";
import { useLang } from "./providers";
import { IconArrow } from "./ui";

type Item = {
  key: string;
  name: string;
  logo: string;
  href: string;
};

export function CommunitiesGrid() {
  const { t } = useLang();
  const reduce = useReducedMotion();
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

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
      {items.map((item, i) => (
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
                  delay: i * 0.04,
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
  );
}
