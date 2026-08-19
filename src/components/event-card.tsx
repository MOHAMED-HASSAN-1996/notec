"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { EventPublic } from "@/lib/types";
import { fmtDayNum, fmtMonth, fmtTime, priceLabel } from "@/lib/types";
import { IconPin, IconSpark, IconUsers } from "./ui";
import { useLang } from "./providers";

export function EventCard({ ev, big = false }: { ev: EventPublic; big?: boolean }) {
  const { t, lang } = useLang();
  const price = ev.price === "مجاني" && lang === "en" ? "Free" : priceLabel(ev.price);
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="h-full"
    >
    <Link
      href={`/events/${ev.id}`}
      className="group block h-full overflow-hidden rounded-2xl border border-line bg-card transition-all duration-300 hover:border-mut/60 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.25)]"
    >
      <div className={`relative overflow-hidden ${big ? "h-52" : "h-44"}`}>
        {ev.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ev.imageUrl}
            alt={ev.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <div className="dot-grid h-full w-full bg-ink2" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <span className="absolute top-3 start-3 rounded-full bg-ink/85 px-3 py-1 text-[14px] font-bold text-limed backdrop-blur-sm">
          {ev.category}
        </span>
        {ev.merges > 0 && (
          <span
            className="absolute top-3 end-3 flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 text-[14px] font-bold text-bone backdrop-blur-sm"
            title={t.events.mergesTitle}
          >
            <IconSpark className="size-3.5 text-limed" />
            {ev.merges}
          </span>
        )}
        {ev.community && (
          <span className="absolute bottom-3 start-3 rounded-full bg-ink/85 px-3 py-1 text-[13px] font-bold text-limed backdrop-blur-sm">
            {ev.community}
          </span>
        )}
      </div>
      <div className="flex items-start gap-4 p-5">
        <div className="min-w-[64px] shrink-0 rounded-xl border border-line bg-ink2 px-2 py-2.5 text-center">
          <div className="text-2xl font-black leading-none">
            {fmtDayNum(ev.startsAt)}
          </div>
          <div className="mt-1 text-[14px] leading-none text-mut">
            {fmtMonth(ev.startsAt, lang)}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-limed">
            {ev.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-mut">
            {ev.city && (
              <span className="flex items-center gap-1.5">
                <IconPin className="size-4" />
                {ev.city}
              </span>
            )}
            <span>{fmtTime(ev.startsAt, lang)}</span>
            <span className="font-bold text-bone/80">{price}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[14px] text-mut">
        <span className="flex items-center gap-1.5">
          <IconUsers className="size-4" />
          {ev.attendeesCount} {t.events.bookings}
        </span>
        <span className="font-bold text-limed transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1">
          {t.events.details}
        </span>
      </div>
    </Link>
    </motion.div>
  );
}
