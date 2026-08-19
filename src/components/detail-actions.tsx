"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type ActionState } from "@/lib/api";
import { useToast } from "./toast";
import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconClock,
  IconExternal,
  IconFacebook,
  IconLinkedIn,
  IconLink,
  IconPin,
  IconTicket,
  IconWhatsApp,
  IconXBrand,
} from "./ui";
import { useAuth, useLang, AUTH_EVENT } from "./providers";
import { fmtDate, fmtTime, priceLabel, type EventPublic } from "@/lib/types";

function downloadICS(ev: EventPublic) {
  const f = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = new Date(ev.startsAt);
  const end = ev.endsAt
    ? new Date(ev.endsAt)
    : new Date(start.getTime() + 2 * 3600e3);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Notec//AR",
    "BEGIN:VEVENT",
    `UID:${ev.id}@notec`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${[ev.location, ev.city].filter(Boolean).join(", ")}`,
    ev.url ? `URL:${ev.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `notec-${ev.id}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function DetailActions({ ev }: { ev: EventPublic }) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [st, setSt] = useState<ActionState | null>(null);
  const [before, setBefore] = useState(1440);
  const [busy, setBusy] = useState(false);
  const [shareUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.href : ""
  );
  const { push } = useToast();

  const load = () => {
    api
      .getEvent(ev.id)
      .then((d) => {
        setSt(d.state);
        setBefore(d.state.beforeMinutes || 1440);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    window.addEventListener(AUTH_EVENT, load);
    return () => window.removeEventListener(AUTH_EVENT, load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev.id, user?.id]);

  async function act(action: string, beforeMinutes?: number) {
    setBusy(true);
    try {
      const s = await api.action(ev.id, { action, beforeMinutes });
      setSt(s);
      if (action === "reserve") push(t.toast.reserved);
      if (action === "unreserve") push(t.toast.unreserved);
      if (action === "reminder") push(t.toast.reminderOn);
      if (action === "unremind") push(t.toast.reminderOff);
    } catch {
      push(t.toast.error, "err");
    } finally {
      setBusy(false);
    }
  }

  const reserved = st?.isReserved ?? false;
  const reminded = st?.isReminded ?? false;
  const price = ev.price === "مجاني" && lang === "en" ? "Free" : priceLabel(ev.price);

  return (
    <>
    <div className="rounded-2xl border border-line bg-card p-6">
      {/* event thumbnail — same width as the card */}
      <div className="mb-5 overflow-hidden rounded-xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ev.imageUrl || "/about-hero.jpg"}
          alt={ev.title}
          className="aspect-[16/9] w-full object-cover"
        />
      </div>
      {!user && (
        <div className="mb-5 rounded-xl border border-line bg-ink2 p-4 text-[14px] leading-relaxed text-mut">
          {t.my.loginHint}{" "}
          <Link href="/login" className="font-bold text-limed hover:underline">
            {t.nav.login}
          </Link>
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-bold text-mut">{t.detail.cost}</span>
        <span className="text-3xl font-black text-limed">{price}</span>
      </div>
      <div className="mt-5 flex flex-col gap-3.5 border-t border-line pt-5 text-[15px]">
        <span className="flex items-center gap-3">
          <IconCalendar className="size-5 shrink-0 text-limed" />
          {fmtDate(ev.startsAt, lang)}
        </span>
        <span className="flex items-center gap-3">
          <IconClock className="size-5 shrink-0 text-limed" />
          {fmtTime(ev.startsAt, lang)}
          {ev.endsAt ? ` — ${t.detail.until} ${fmtTime(ev.endsAt, lang)}` : ""}
        </span>
        {(ev.location || ev.city) && (
          <span className="flex items-center gap-3">
            <IconPin className="size-5 shrink-0 text-limed" />
            {[ev.location, ev.city].filter(Boolean).join(t.detail.joinSep)}
          </span>
        )}
        <span className="flex items-center gap-3">
          <IconTicket className="size-5 shrink-0 text-limed" />
          {st ? t.detail.tickets(st.attendeesCount) : "…"}
        </span>
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => act(reserved ? "unreserve" : "reserve")}
        className={`mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full text-[16px] font-bold transition-all cursor-pointer ${
          reserved
            ? "border-2 border-limed bg-lime/10 text-limed"
            : "bg-lime text-ink hover:bg-bone"
        }`}
      >
        {reserved ? (
          <>
            <IconCheck className="size-5" />
            {t.detail.booked}
          </>
        ) : (
          t.detail.bookNow
        )}
      </button>

      <div className="mt-4 rounded-xl bg-ink2 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[15px] font-bold">
            <IconBell className="size-4.5 text-limed" />
            {t.detail.remindTitle}
          </span>
          {reminded && (
            <span className="rounded-full bg-lime px-2.5 py-0.5 text-[14px] font-bold text-ink">
              {t.detail.reminderOn}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={before}
            onChange={(e) => setBefore(Number(e.target.value))}
            className="field h-11 min-h-0 flex-1 text-[14px]"
            aria-label={t.detail.remindTitle}
          >
            <option value={60}>{t.detail.beforeHour}</option>
            <option value={1440}>{t.detail.beforeDay}</option>
            <option value={10080}>{t.detail.beforeWeek}</option>
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(reminded ? "unremind" : "reminder", before)}
            className={`shrink-0 rounded-xl px-5 text-[14px] font-bold transition-colors cursor-pointer ${
              reminded
                ? "border border-limed/50 bg-lime/10 text-limed"
                : "bg-bone text-ink hover:bg-lime"
            }`}
          >
            {reminded ? t.detail.cancel : t.detail.activate}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          downloadICS(ev);
          push(t.toast.ics);
        }}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line text-[15px] font-bold text-bone transition-colors hover:border-mut cursor-pointer"
      >
        <IconCalendar className="size-4.5" />
        {t.detail.addIcs}
      </button>

      {ev.url && (
        <a
          href={ev.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line text-[15px] font-bold text-bone transition-colors hover:border-mut"
        >
          <IconExternal className="size-4.5" />
          {t.detail.officialPage}
        </a>
      )}

      <p className="mt-5 text-[14px] leading-relaxed text-mut">{t.detail.note}</p>
    </div>

    {/* Share */}
    <div className="mt-5 rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 text-[14px] font-bold text-mut">{t.detail.shareTitle}</div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => push(t.detail.copied))
            .catch(() => {});
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-line text-[15px] font-bold text-bone transition-colors hover:border-mut cursor-pointer"
      >
        <IconLink className="size-4.5" />
        {t.detail.copyLink}
      </button>
      <div className="mt-4 grid grid-cols-4 gap-2.5">
        {[
          {
            label: "LinkedIn",
            icon: IconLinkedIn,
            href: (u: string) =>
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
            color: "text-[#0a66c2]",
          },
          {
            label: "Facebook",
            icon: IconFacebook,
            href: (u: string) =>
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
            color: "text-[#1877f2]",
          },
          {
            label: "X",
            icon: IconXBrand,
            href: (u: string) =>
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(ev.title)}&url=${encodeURIComponent(u)}`,
            color: "text-bone",
          },
          {
            label: "WhatsApp",
            icon: IconWhatsApp,
            href: (u: string) =>
              `https://wa.me/?text=${encodeURIComponent(`${ev.title} — ${u}`)}`,
            color: "text-[#25d366]",
          },
        ].map(({ label, icon: Icon, href, color }) => (
          <a
            key={label}
            href={href(shareUrl)}
            target="_blank"
            rel="noreferrer"
            title={label}
            className={`grid size-12 place-items-center rounded-full border border-line transition-colors hover:border-mut hover:bg-ink2 ${color}`}
          >
            <Icon className="size-5" />
          </a>
        ))}
      </div>
    </div>
    </>
  );
}
