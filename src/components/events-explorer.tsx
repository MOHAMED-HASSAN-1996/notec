"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SimpleList } from "./flowlist";
import { EventActions } from "./event-actions";
import { Btn, Chip, IconPin, IconSearch, IconSpark, IconX } from "./ui";
import { useLang } from "./providers";
import {
  CATEGORIES,
  COMMUNITIES,
  fmtDayNum,
  fmtMonth,
  fmtTime,
  priceLabel,
  type EventPublic,
} from "@/lib/types";

type Sort = "closest" | "farthest" | "popular";

export function EventsExplorer({
  events,
  initialQ,
  initialCat,
  initialCommunity,
}: {
  events: EventPublic[];
  initialQ: string;
  initialCat: string;
  initialCommunity?: string;
}) {
  const { t, lang } = useLang();
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(
    CATEGORIES.includes(initialCat as (typeof CATEGORIES)[number])
      ? initialCat
      : t.events.all,
  );
  const [community, setCommunity] = useState(
    COMMUNITIES.includes(initialCommunity as (typeof COMMUNITIES)[number])
      ? initialCommunity
      : "",
  );
  const [sort, setSort] = useState<Sort>("closest");

  const present = useMemo(
    () => [t.events.all, ...CATEGORIES.filter((c) => events.some((e) => e.category === c))],
    [events, t.events.all],
  );

  const filtered = useMemo(() => {
    let list = [...events];
    const needle = q.trim().toLowerCase();
    if (needle) {
      list = list.filter((e) =>
        [e.title, e.city, e.location, e.category, e.description]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    if (cat !== t.events.all) list = list.filter((e) => e.category === cat);
    if (community) list = list.filter((e) => e.community === community);
    const time = (v: string) => new Date(v).getTime();
    if (sort === "closest") list.sort((a, b) => time(a.startsAt) - time(b.startsAt));
    if (sort === "farthest") list.sort((a, b) => time(b.startsAt) - time(a.startsAt));
    if (sort === "popular")
      list.sort((a, b) => b.attendeesCount - a.attendeesCount);
    return list;
  }, [events, q, cat, community, sort, t.events.all]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 md:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
            <span>Notec</span>
            <span className="h-px w-10 bg-line" />
          </div>
          <h1 className="text-5xl font-black leading-none md:text-7xl">
            {t.events.title}
          </h1>
          <p className="mt-4 text-[15px] text-mut">
            {t.events.count(filtered.length)}
            {t.events.sub}
          </p>
        </div>
        <Btn href="/add">{t.events.addEvent}</Btn>
      </div>

      {/* controls */}
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-line bg-ink2 px-4 focus-within:border-limed/50">
            <IconSearch className="size-5 shrink-0 text-mut" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.events.searchPh}
              className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-mut/70"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-mut hover:text-bone cursor-pointer"
                aria-label="clear"
              >
                <IconX className="size-4" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="field h-12 w-auto min-h-0 rounded-full px-5"
            aria-label="sort"
          >
            <option value="closest">{t.events.sortClosest}</option>
            <option value="farthest">{t.events.sortFarthest}</option>
            <option value="popular">{t.events.sortPopular}</option>
          </select>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {present.map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={!community} onClick={() => setCommunity("")}>
            {t.events.all}
          </Chip>
          {COMMUNITIES.map((c) => (
            <Chip key={c} active={community === c} onClick={() => setCommunity(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-line py-20 text-center">
          <div className="text-outline font-black text-7xl">0</div>
          <h3 className="mt-4 text-2xl font-black">{t.events.noResults}</h3>
          <p className="mt-2 text-[15px] text-mut">{t.events.noResultsBody}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Btn
              onClick={() => {
                setQ("");
                setCat(t.events.all);
                setCommunity("");
              }}
              variant="outline"
            >
              {t.events.clearFilters}
            </Btn>
            <Btn href="/add">{t.events.addIt}</Btn>
          </div>
        </div>
      ) : (
        <SimpleList
          className="mt-10"
          items={filtered}
          render={(ev) => {
            const price =
              ev.price === "مجاني" && lang === "en" ? "Free" : priceLabel(ev.price);
            return (
              <div className="group flex flex-wrap items-center gap-5 border-t border-line px-2 py-6 transition-colors last:border-b hover:bg-card/40 md:px-4">
                <div className="min-w-[64px] shrink-0 rounded-xl border border-line bg-ink2 px-2 py-2.5 text-center">
                  <div className="text-2xl font-black leading-none">
                    {fmtDayNum(ev.startsAt)}
                  </div>
                  <div className="mt-1 text-[14px] leading-none text-mut">
                    {fmtMonth(ev.startsAt, lang)}
                  </div>
                </div>
                {ev.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.imageUrl}
                    alt=""
                    className="hidden size-20 shrink-0 rounded-xl border border-line object-cover lg:block"
                  />
                )}
                <div className="min-w-0 flex-1 basis-52">
<div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-card px-3 py-0.5 text-[14px] font-bold text-limed">
                  {ev.category}
                </span>
                {ev.community && (
                  <span className="rounded-full border border-limed/40 px-3 py-0.5 text-[14px] font-bold text-limed">
                    {ev.community}
                  </span>
                )}
                {ev.merges > 0 && (
                  <span
                    className="flex items-center gap-1 rounded-full border border-limed/30 px-3 py-0.5 text-[14px] font-bold text-bone/80"
                    title={t.events.mergesTitle}
                  >
                    <IconSpark className="size-3.5 text-limed" />
                    {ev.merges} {t.events.merges}
                  </span>
                )}
              </div>
                  <Link
                    href={`/events/${ev.id}`}
                    className="mt-2 block truncate text-xl font-bold transition-colors hover:text-limed"
                  >
                    {ev.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-mut">
                    {ev.city && (
                      <span className="flex items-center gap-1.5">
                        <IconPin className="size-4" />
                        {ev.city}
                      </span>
                    )}
                    <span>{fmtTime(ev.startsAt, lang)}</span>
                    <span className="font-bold text-bone/70">{price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <EventActions eventId={ev.id} compact />
                  <Link
                    href={`/events/${ev.id}`}
                    className="hidden text-[14px] font-bold text-limed transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1 sm:block"
                  >
                    {t.events.details}
                  </Link>
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
