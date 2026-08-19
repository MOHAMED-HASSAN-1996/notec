"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "./providers";
import { IconPin, IconSearch, IconX } from "./ui";
import type { EventPublic } from "@/lib/types";

const TZ = "Africa/Cairo";

type DayEvent = EventPublic & { at?: string; beforeMinutes?: number };

function locale(lang: "ar" | "en") {
  return lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB";
}

function weekdayNames(lang: "ar" | "en"): string[] {
  const start = lang === "ar" ? 6 : 0; // Sat for ar, Sun for en
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2026, 0, 4 + i); // 2026-01-04 is a Sunday
    out.push(
      new Intl.DateTimeFormat(locale(lang), { weekday: "short", timeZone: TZ }).format(d),
    );
  }
  // reorder so index 0 == week start
  const re = [...out.slice(start), ...out.slice(0, start)];
  return re;
}

function dayKey(d: Date | string): string {
  const dt = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dt);
}

function monthLabel(y: number, m: number, lang: "ar" | "en"): string {
  return new Intl.DateTimeFormat(locale(lang), {
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date(Date.UTC(y, m, 1)));
}

function dayLabel(d: Date, lang: "ar" | "en"): string {
  return new Intl.DateTimeFormat(locale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(d);
}

type Ell = { date: Date; inMonth: boolean };

export function MyCalendar({
  bookings,
  reminders,
}: {
  bookings: DayEvent[];
  reminders: DayEvent[];
}) {
  const { t, lang } = useLang();
  const today = new Date();
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [q, setQ] = useState("");

  const weekStart = lang === "ar" ? 6 : 0;
  const wdNames = weekdayNames(lang);

  const byDay = useMemo(() => {
    const map = new Map<string, { book: DayEvent[]; rem: DayEvent[] }>();
    const push = (ev: DayEvent, kind: "book" | "rem") => {
      const k = dayKey(ev.startsAt);
      const slot = map.get(k) ?? { book: [], rem: [] };
      slot[kind].push(ev);
      map.set(k, slot);
    };
    bookings.forEach((e) => push(e, "book"));
    reminders.forEach((e) => push(e, "rem"));
    for (const slot of map.values()) {
      slot.book.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
      slot.rem.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    }
    return map;
  }, [bookings, reminders]);

  const searching = q.trim().length > 0;

  const results = useMemo(() => {
    if (!searching) return [];
    const needle = q.trim().toLowerCase();
    const all: { ev: DayEvent; kind: "book" | "rem" }[] = [
      ...bookings.map((ev) => ({ ev, kind: "book" as const })),
      ...reminders.map((ev) => ({ ev, kind: "rem" as const })),
    ];
    return all
      .filter(({ ev }) =>
        [ev.title, ev.city, ev.location, ev.category]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
      .sort((a, b) => +new Date(a.ev.startsAt) - +new Date(b.ev.startsAt));
  }, [searching, q, bookings, reminders]);

  const cells: Ell[] = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() - weekStart + 7) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const out: Ell[] = [];
    for (let i = 0; i < offset; i++) out.push({ date: new Date(y, m, i - offset + 1), inMonth: false });
    for (let d = 1; d <= days; d++) out.push({ date: new Date(y, m, d), inMonth: true });
    return out;
  }, [cursor, weekStart]);

  const weekDays = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const d = cursor.getDate();
    const base = new Date(y, m, d);
    const off = (base.getDay() - weekStart + 7) % 7;
    const start = new Date(y, m, d - off);
    return Array.from({ length: 7 }, (_, i) => new Date(y, m, start.getDate() + i));
  }, [cursor, weekStart]);

  const shift = (dir: 1 | -1) => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    setCursor(
      new Date(
        view === "month" ? (m === 0 && dir === -1 ? y - 1 : y) : y,
        view === "month" ? m + dir : m,
        view === "day" ? cursor.getDate() + dir : view === "week" ? cursor.getDate() + dir * 7 : 1,
      ),
    );
  };

  const goToday = () => {
    const t = new Date();
    setCursor(
      view === "month"
        ? new Date(t.getFullYear(), t.getMonth(), 1)
        : new Date(t.getFullYear(), t.getMonth(), t.getDate()),
    );
  };

  const nextBtn =
    "grid size-9 place-items-center rounded-full border border-line text-bone transition-colors hover:border-limed/50 hover:text-limed cursor-pointer";

  const viewBtn = (v: "day" | "week" | "month", label: string) => (
    <button
      type="button"
      onClick={() => setView(v)}
      className={`rounded-full px-4 py-2 text-[14px] font-bold transition-colors cursor-pointer ${
        view === v ? "bg-lime text-ink" : "text-mut hover:text-bone"
      }`}
    >
      {label}
    </button>
  );

  const kindDot = (kind: "book" | "rem") => (
    <span
      className={`inline-block size-1.5 rounded-full ${
        kind === "book" ? "bg-lime" : "bg-limed"
      }`}
    />
  );

  const evLink = (ev: DayEvent, kind: "book" | "rem") => {
    const time = new Intl.DateTimeFormat(locale(lang), {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: TZ,
    }).format(new Date(ev.startsAt));
    return (
      <Link
        key={ev.id + kind}
        href={`/events/${ev.id}`}
        className="flex items-center gap-2 rounded-lg border border-line bg-card px-2.5 py-1.5 text-[13px] transition-colors hover:border-limed/50"
      >
        <span className="font-bold text-limed">{time}</span>
        <span className="truncate">{ev.title}</span>
      </Link>
    );
  };

  const body = view === "month" ? (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink2">
      <div className="grid grid-cols-7 border-b border-line bg-ink">
        {wdNames.map((n, i) => (
          <div key={i} className="py-3 text-center text-[13px] font-bold text-mut">
            {n}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const k = dayKey(c.date);
          const slot = byDay.get(k);
          const isToday = k === dayKey(today);
          return (
            <button
              type="button"
              key={i}
              onClick={() => {
                setCursor(c.date);
                setView("day");
              }}
              className={`flex min-h-[72px] flex-col items-start gap-1 border-b border-line p-2 text-start transition-colors cursor-pointer ${
                c.inMonth ? "hover:bg-card/60" : "opacity-35"
              } ${i % 7 === 6 ? "" : "border-e"}`}
            >
              <span
                className={`grid size-7 place-items-center rounded-full text-[13px] font-bold ${
                  isToday ? "bg-lime text-ink" : "text-bone/80"
                }`}
              >
                {c.date.getDate()}
              </span>
              {slot && (slot.book.length > 0 || slot.rem.length > 0) && (
                <div className="flex flex-wrap gap-1">
                  {slot.book.length > 0 && (
                    <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[11px] font-bold text-limed">
                      {slot.book.length} {t.my.calBook}
                    </span>
                  )}
                  {slot.rem.length > 0 && (
                    <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-bone/70">
                      {slot.rem.length} {t.my.calRem}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  ) : view === "week" ? (
    <div className="grid gap-3 sm:grid-cols-7">
      {weekDays.map((d) => {
        const k = dayKey(d);
        const slot = byDay.get(k);
        const isToday = k === dayKey(today);
        const list = [
          ...(slot?.book ?? []).map((e) => ({ e, kind: "book" as const })),
          ...(slot?.rem ?? []).map((e) => ({ e, kind: "rem" as const })),
        ].sort((a, b) => +new Date(a.e.startsAt) - +new Date(b.e.startsAt));
        return (
          <button
            type="button"
            key={k}
            onClick={() => {
              setCursor(d);
              setView("day");
            }}
            className={`flex min-h-[160px] flex-col gap-1.5 rounded-2xl border p-2.5 text-start transition-colors cursor-pointer ${
              isToday ? "border-limed/50 bg-lime/5" : "border-line bg-ink2 hover:border-mut/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-mut">
                {new Intl.DateTimeFormat(locale(lang), { weekday: "short", timeZone: TZ }).format(d)}
              </span>
              <span
                className={`grid size-7 place-items-center rounded-full text-[13px] font-bold ${
                  isToday ? "bg-lime text-ink" : "text-bone/80"
                }`}
              >
                {d.getDate()}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
              {list.length === 0 ? (
                <span className="text-[11px] text-mut/60">—</span>
              ) : (
                list.map(({ e, kind }) => (
                  <span key={e.id + kind} className="flex items-center gap-1 truncate text-[11px]">
                    {kindDot(kind)}
                    <span className="truncate">{e.title}</span>
                  </span>
                ))
              )}
            </div>
          </button>
        );
      })}
    </div>
  ) : (
    <div className="rounded-2xl border border-line bg-ink2 p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[15px] font-bold text-bone">
          {dayLabel(cursor, lang)}
          {dayKey(cursor) === dayKey(today) && (
            <span className="ms-2 rounded-full bg-lime px-2.5 py-0.5 text-[12px] font-black text-ink">
              {t.my.calToday}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => shift(-1)} className={nextBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button type="button" onClick={() => shift(1)} className={nextBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {(() => {
          const k = dayKey(cursor);
          const slot = byDay.get(k);
          const list = [
            ...(slot?.book ?? []).map((e) => ({ e, kind: "book" as const })),
            ...(slot?.rem ?? []).map((e) => ({ e, kind: "rem" as const })),
          ].sort((a, b) => +new Date(a.e.startsAt) - +new Date(b.e.startsAt));
          if (list.length === 0) {
            return (
              <p className="py-8 text-center text-[14px] text-mut">{t.my.calNoEvents}</p>
            );
          }
          return (
            <div className="flex flex-col gap-2">
              {list.map(({ e, kind }) => (
                <Link
                  key={e.id + kind}
                  href={`/events/${e.id}`}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-limed/50"
                >
                  <span
                    className={`rounded-full px-3 py-0.5 text-[12px] font-black ` +
                      (kind === "book"
                        ? "bg-lime text-ink"
                        : "border border-limed/40 text-limed")}
                  >
                    {kind === "book" ? t.my.calBook : t.my.calRem}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold">{e.title}</div>
                    {e.city && (
                      <div className="mt-0.5 flex items-center gap-1 text-[13px] text-mut">
                        <IconPin className="size-3.5" />
                        {e.city}
                      </div>
                    )}
                  </div>
                  <span className="text-[14px] font-bold text-limed">
                    {new Intl.DateTimeFormat(locale(lang), {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: TZ,
                    }).format(new Date(e.startsAt))}
                  </span>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );

  return (
    <div className="mt-14">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-2xl font-black">
          {t.my.calTitle}
          <span className="rounded-full bg-card px-3 py-0.5 text-[14px] text-mut">
            {bookings.length + reminders.length}
          </span>
        </h2>
        <div className="flex items-center gap-1 rounded-full border border-line bg-ink2 p-1">
          {viewBtn("day", t.my.calViewDay)}
          {viewBtn("week", t.my.calViewWeek)}
          {viewBtn("month", t.my.calViewMonth)}
        </div>
      </div>

      {/* search */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-line bg-ink2 px-4 focus-within:border-limed/50">
          <IconSearch className="size-4 shrink-0 text-mut" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.my.calSearchPh}
            className="h-11 w-full bg-transparent text-[14px] outline-none placeholder:text-mut/70"
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
        {/* nav + today */}
        <div className="flex items-center justify-between gap-2">
          <div dir="ltr" className="flex items-center gap-2">
            <button type="button" onClick={() => shift(-1)} aria-label="prev" className={nextBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" onClick={() => shift(1)} aria-label="next" className={nextBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-bone transition-colors hover:border-limed/50 hover:text-limed cursor-pointer"
          >
            {t.my.calToday}
          </button>
        </div>
      </div>

      {searching ? (
        results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line py-14 text-center">
            <p className="text-[15px] text-mut">{t.my.calNoResults}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map(({ ev, kind }) => (
              <Link
                key={ev.id + kind}
                href={`/events/${ev.id}`}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-4 transition-colors hover:border-limed/50"
              >
                <span
                  className={`size-2 rounded-full ${kind === "book" ? "bg-lime" : "bg-limed"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{ev.title}</div>
                  <div className="mt-0.5 text-[13px] text-mut">
                    {new Intl.DateTimeFormat(locale(lang), {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      timeZone: TZ,
                    }).format(new Date(ev.startsAt))}{" "}
                    · {new Intl.DateTimeFormat(locale(lang), {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: TZ,
                    }).format(new Date(ev.startsAt))}
                  </div>
                </div>
                {ev.city && (
                  <span className="flex items-center gap-1 text-[13px] text-mut">
                    <IconPin className="size-3.5" />
                    {ev.city}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )
      ) : (
        <>
          {view !== "day" && (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[17px] font-black text-bone">
                {monthLabel(cursor.getFullYear(), cursor.getMonth(), lang)}
              </div>
              <div className="flex items-center gap-4 text-[12px] font-bold text-mut">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-lime" /> {t.my.calBook}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-limed" /> {t.my.calRem}
                </span>
              </div>
            </div>
          )}
          {body}
          {view === "month" &&
            (() => {
              const anyEv = cells.some((c) => {
                const s = byDay.get(dayKey(c.date));
                return s && (s.book.length > 0 || s.rem.length > 0);
              });
              return anyEv ? null : (
                <p className="mt-4 text-center text-[14px] text-mut">{t.my.calEmptyMonth}</p>
              );
            })()}
        </>
      )}
    </div>
  );
}