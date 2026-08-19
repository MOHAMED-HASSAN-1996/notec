"use client";

import { useState } from "react";
import type { EventPublic } from "@/lib/types";
import { EventCard } from "./event-card";

export function RelatedSlider({ events }: { events: EventPublic[] }) {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(events.length / perPage);
  const start = page * perPage;
  const visible = events.slice(start, start + perPage);

  if (events.length === 0) return null;

  return (
    <div className="relative">
      <div className="grid gap-5 sm:grid-cols-2">
        {visible.map((ev) => (
          <EventCard key={ev.id} ev={ev} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => (p + 1) % totalPages)}
            className="grid size-10 place-items-center rounded-full border border-line bg-card text-mut transition-colors hover:border-limed hover:text-limed cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="text-[14px] text-mut" dir="ltr">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
            className="grid size-10 place-items-center rounded-full border border-line bg-card text-mut transition-colors hover:border-limed hover:text-limed cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
