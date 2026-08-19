"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Parallax } from "./parallax";
import { useLang } from "./providers";
import { Btn, IconSearch } from "./ui";
import {
  fmtDayNum,
  fmtMonth,
  fmtTime,
  type EventPublic,
} from "@/lib/types";

function MiniCard({ ev }: { ev: EventPublic }) {
  const { t, lang } = useLang();
  return (
    <Link
      href={`/events/${ev.id}`}
      className="block rounded-2xl border border-line bg-card/90 p-4 shadow-[0_36px_70px_-24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-transform duration-300 hover:scale-[1.04]"
    >
      <div className="flex items-center gap-3">
        <div className="grid shrink-0 place-items-center rounded-xl border border-line bg-ink2 px-3 py-2 text-center">
          <span className="text-lg font-black leading-none">
            {fmtDayNum(ev.startsAt)}
          </span>
          <span className="-mt-0.5 text-[14px] leading-none text-mut">
            {fmtMonth(ev.startsAt, lang)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold">{ev.title}</div>
          <div className="mt-1 text-[14px] text-mut">
            {ev.city} · {fmtTime(ev.startsAt, lang)}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[14px]">
        <span className="font-bold text-limed">{ev.category}</span>
        <span className="text-mut">{t.events.details}</span>
      </div>
    </Link>
  );
}

export function Hero({ evts }: { evts: EventPublic[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const { t, lang } = useLang();
  const reduce = useReducedMotion();

  function submit(e: FormEvent) {
    e.preventDefault();
    router.push(
      q.trim() ? `/events?q=${encodeURIComponent(q.trim())}` : "/events",
    );
  }

  return (
    <section className="relative overflow-hidden pt-20">
      {/* 2D parallax background layers */}
      <Parallax y={0.2} className="absolute -inset-x-10 -top-[15%] bottom-[-30%] dot-grid opacity-50" />
      
      <Parallax x={0.14} y={0.5} className="pointer-events-none absolute right-[12%] top-[22%] hidden lg:block">
        <div className="size-44 rounded-full border border-line" />
      </Parallax>
      <Parallax x={-0.2} y={0.62} className="pointer-events-none absolute left-[10%] top-[56%] hidden lg:block">
        <div className="size-24 rounded-full border-2 border-limed/40" />
      </Parallax>
      <Parallax x={0.3} y={0.8} className="pointer-events-none absolute right-[30%] top-[12%]">
        <div className="size-3 rounded-full bg-lime" />
      </Parallax>
      <Parallax x={-0.34} y={0.9} className="pointer-events-none absolute left-[28%] top-[80%]">
        <div className="size-2 rounded-full bg-mut" />
      </Parallax>

      {/* floating event cards — each on its own 2D speed */}
      {evts[0] && (
        <Parallax x={0.05} y={-0.1} className="absolute right-[4%] top-[26%] z-[5] hidden w-72 rotate-3 xl:block">
          <MiniCard ev={evts[0]} />
        </Parallax>
      )}
      {evts[1] && (
        <Parallax x={-0.09} y={0.14} className="absolute left-[4%] top-[48%] z-[5] hidden w-68 -rotate-2 xl:block">
          <MiniCard ev={evts[1]} />
        </Parallax>
      )}
      {evts[2] && (
        <Parallax x={0.12} y={-0.18} className="absolute left-[10%] top-[14%] z-[5] hidden w-64 -rotate-2 2xl:block">
          <MiniCard ev={evts[2]} />
        </Parallax>
      )}

      <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-6xl flex-col justify-center px-5 py-20">
        <Parallax y={-0.05}>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-ink2/80 px-4 py-2 text-[14px] font-bold text-mut backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-lime" />
              </span>
              <span className="text-[11px] font-black tracking-tight text-bone">Notec</span>
              <span>— {t.hero.badgeEnd}</span>
            </span>
            <motion.h1
              className="mt-8 text-5xl font-bold leading-[1.4] md:text-7xl lg:text-8xl"
              initial={reduce ? false : "hidden"}
              whileInView={reduce ? undefined : "show"}
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.18, delayChildren: 0.1 },
                },
              }}
            >
              {[t.hero.t1, t.hero.t2, t.hero.t3].map((line, i) => (
                <motion.span
                  key={i}
                  className={`block ${i === 1 ? "text-limed" : ""}`}
                  variants={{
                    hidden: { opacity: 0, y: 34 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  {line}
                </motion.span>
              ))}
            </motion.h1>
            <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-mut md:text-lg">
              {t.hero.sub}
            </p>
            <form
              onSubmit={submit}
              className="mt-9 flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-ink2/90 p-2 backdrop-blur-sm focus-within:border-limed/50"
            >
              <IconSearch className="ms-3 size-5 shrink-0 text-mut" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.hero.searchPh}
                className="h-11 w-full bg-transparent text-[15px] outline-none placeholder:text-mut/70"
              />
              <button
                type="submit"
                className="h-11 shrink-0 rounded-full bg-lime px-6 text-[15px] font-bold text-ink transition-colors hover:bg-bone cursor-pointer"
              >
                {t.hero.searchBtn}
              </button>
            </form>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Btn href="/events">{t.hero.ctaEvents}</Btn>
              <Btn href="/add" variant="outline">
                {t.hero.ctaAdd}
              </Btn>
            </div>
          </div>
        </Parallax>
      </div>
    </section>
  );
}
