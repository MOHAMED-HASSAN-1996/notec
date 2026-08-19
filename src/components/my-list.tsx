"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, type MyData } from "@/lib/api";
import { useToast } from "./toast";
import { MyCalendar } from "./my-calendar";
import { Btn, IconBell, IconPin, IconX } from "./ui";
import { useAuth, useLang, AUTH_EVENT } from "./providers";
import {
  fmtCountdown,
  fmtDayNum,
  fmtDate,
  fmtMonth,
  fmtTime,
  type EventPublic,
} from "@/lib/types";

function DateBlock({ v }: { v: string }) {
  const { lang } = useLang();
  return (
    <div className="min-w-[64px] shrink-0 rounded-xl border border-line bg-ink2 px-2 py-2.5 text-center">
      <div className="text-2xl font-black leading-none">{fmtDayNum(v)}</div>
      <div className="mt-1 text-[14px] leading-none text-mut">
        {fmtMonth(v, lang)}
      </div>
    </div>
  );
}

export function MyList() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { push } = useToast();
  const [data, setData] = useState<MyData | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [perm, setPerm] = useState<string>("unsupported");

  const load = useCallback(() => {
    api
      .my()
      .then(setData)
      .catch(() => push(t.toast.error, "err"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    load();
    window.addEventListener(AUTH_EVENT, load);
    return () => window.removeEventListener(AUTH_EVENT, load);
  }, [load]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPerm(Notification.permission);
    }
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  async function requestPerm() {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === "granted") push(t.toast.notifGranted);
  }

  function notifyNow(ev: EventPublic) {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Notec", {
          body: `${ev.title} · ${fmtDate(ev.startsAt, lang)} · ${fmtTime(ev.startsAt, lang)}`,
        });
      } catch {
        /* ignore */
      }
    }
    push(
      `${t.toast.reminderTest} ${ev.title} — ${fmtCountdown(
        new Date(ev.startsAt).getTime() - now,
        lang,
      )}`,
    );
  }

  async function doAction(evId: string, action: string) {
    try {
      await api.action(evId, { action });
      if (action === "unreserve") push(t.toast.unreserved);
      if (action === "unremind") push(t.toast.reminderOff);
      load();
    } catch {
      push(t.toast.error, "err");
    }
  }

  const resv = data?.reservations ?? [];
  const rem = data?.reminders ?? [];

  const beforeLabel = (mins: number) =>
    mins <= 60
      ? t.my.beforeHour
      : mins <= 1440
        ? t.my.beforeDay
        : t.my.beforeWeek;

  return (
    <div>
      {!user && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-ink2 p-5">
          <p className="max-w-md text-[14px] leading-relaxed text-mut">
            {t.my.loginHint}
          </p>
          <Btn href="/login" className="h-11 px-5">
            {t.nav.login}
          </Btn>
        </div>
      )}

      {(perm === "default" || perm === "unsupported") && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-limed/30 bg-lime/5 p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lime text-ink">
              <IconBell className="size-5" />
            </span>
            <div>
              <div className="text-[15px] font-black">{t.my.notifTitle}</div>
              <div className="text-[14px] text-mut">{t.my.notifBody}</div>
            </div>
          </div>
          <Btn onClick={requestPerm} className="h-11 px-5">
            {t.my.notifBtn}
          </Btn>
        </div>
      )}
      {perm === "denied" && (
        <div className="mb-8 rounded-2xl border border-line bg-ink2 p-5 text-[14px] text-mut">
          {t.my.notifDenied}
        </div>
      )}

      {/* reservations */}
      <h2 className="mb-5 flex items-center gap-3 text-2xl font-black">
        {t.my.bookings}
        <span className="rounded-full bg-card px-3 py-0.5 text-[14px] text-mut">
          {resv.length}
        </span>
      </h2>
      {resv.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-[15px] text-mut">{t.my.emptyBookings}</p>
          <div className="mt-5">
            <Btn href="/events" variant="outline">
              {t.my.emptyCta}
            </Btn>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {resv.map((ev: EventPublic & { at: string }) => {
            const ms = new Date(ev.startsAt).getTime() - now;
            const soon = ms < 72 * 3600e3;
            return (
              <div
                key={ev.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-card p-5 transition-colors hover:border-mut/50"
              >
                <DateBlock v={ev.startsAt} />
                <div className="min-w-0 flex-1 basis-52">
                  <Link
                    href={`/events/${ev.id}`}
                    className="block truncate text-lg font-bold transition-colors hover:text-limed"
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
                    <span
                      className={`rounded-full px-3 py-0.5 font-bold ${
                        soon
                          ? "bg-lime text-ink"
                          : "border border-line text-mut"
                      }`}
                    >
                      {fmtCountdown(ms, lang)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => notifyNow(ev)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[14px] font-bold text-bone transition-colors hover:border-mut cursor-pointer"
                  >
                    <IconBell className="size-4" />
                    {t.my.remindNow}
                  </button>
                  <button
                    type="button"
                    onClick={() => doAction(ev.id, "unreserve")}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-red/30 px-4 text-[14px] font-bold text-red transition-colors hover:bg-red/10 cursor-pointer"
                  >
                    <IconX className="size-4" />
                    {t.my.cancelBooking}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* reminders */}
      <h2 className="mb-5 mt-14 flex items-center gap-3 text-2xl font-black">
        {t.my.reminders}
        <span className="rounded-full bg-card px-3 py-0.5 text-[14px] text-mut">
          {rem.length}
        </span>
      </h2>
      {rem.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-[15px] text-mut">{t.my.emptyReminders}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rem.map((ev: EventPublic & { beforeMinutes: number }) => (
            <div
              key={ev.id}
              className="flex flex-wrap items-center gap-5 rounded-2xl border border-line bg-card p-5 transition-colors hover:border-mut/50"
            >
              <DateBlock v={ev.startsAt} />
              <div className="min-w-0 flex-1 basis-52">
                <Link
                  href={`/events/${ev.id}`}
                  className="block truncate text-lg font-bold transition-colors hover:text-limed"
                >
                  {ev.title}
                </Link>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-mut">
                  <span>{fmtDate(ev.startsAt, lang)}</span>
                  <span className="rounded-full border border-limed/40 px-3 py-0.5 font-bold text-limed">
                    {beforeLabel(ev.beforeMinutes)}
                  </span>
                  <span>
                    {fmtCountdown(new Date(ev.startsAt).getTime() - now, lang)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => notifyNow(ev)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-[14px] font-bold text-bone transition-colors hover:border-mut cursor-pointer"
                >
                  <IconBell className="size-4" />
                  {t.my.tryReminder}
                </button>
                <button
                  type="button"
                  onClick={() => doAction(ev.id, "unremind")}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-red/30 px-4 text-[14px] font-bold text-red transition-colors hover:bg-red/10 cursor-pointer"
                >
                  <IconX className="size-4" />
                  {t.my.removeReminder}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && resv.length + rem.length > 0 && (
        <p className="mt-8 text-[14px] text-mut">
          {t.my.watching(resv.length + rem.length)}
        </p>
      )}

      {/* calendar */}
      <MyCalendar bookings={resv} reminders={rem} />
    </div>
  );
}
