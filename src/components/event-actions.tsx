"use client";

import { useEffect, useState } from "react";
import { api, type ActionState } from "@/lib/api";
import { useToast } from "./toast";
import { IconBell, IconCheck, IconUsers } from "./ui";
import { useLang, useAuth } from "./providers";
import { AUTH_EVENT } from "./providers";

export function EventActions({
  eventId,
  compact = false,
}: {
  eventId: string;
  compact?: boolean;
}) {
  const { t } = useLang();
  const { user } = useAuth();
  const [st, setSt] = useState<ActionState | null>(null);
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  const load = () => {
    api
      .getEvent(eventId)
      .then((d) => setSt(d.state))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    window.addEventListener(AUTH_EVENT, load);
    return () => window.removeEventListener(AUTH_EVENT, load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user?.id]);

  async function act(action: string, beforeMinutes?: number) {
    setBusy(true);
    try {
      const s = await api.action(eventId, { action, beforeMinutes });
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

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "flex-wrap"}`}>
      {st && (
        <span
          className={`items-center gap-1.5 text-[14px] text-mut ${
            compact ? "hidden sm:flex" : "flex"
          }`}
        >
          <IconUsers className="size-4" />
          {st.attendeesCount} {t.events.bookings}
        </span>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => act(reserved ? "unreserve" : "reserve")}
        title={reserved ? t.toast.unreserved : t.detail.bookNow}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[14px] font-bold transition-all cursor-pointer ${
          reserved
            ? "border border-limed/50 bg-lime/10 text-limed"
            : "bg-lime text-ink hover:bg-bone"
        }`}
      >
        {reserved && <IconCheck className="size-4" />}
        {reserved ? t.detail.reservedShort : t.detail.bookShort}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act(reminded ? "unremind" : "reminder")}
        title={reminded ? t.toast.reminderOff : t.detail.remindTitle}
        className={`grid size-10 place-items-center rounded-full border transition-all cursor-pointer ${
          reminded
            ? "border-limed bg-lime text-ink"
            : "border-line text-mut hover:border-mut hover:text-bone"
        }`}
      >
        <IconBell className="size-4.5" />
      </button>
    </div>
  );
}
