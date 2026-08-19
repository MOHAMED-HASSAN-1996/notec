"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/types";
import { Logo } from "./ui";
import { useLang } from "./providers";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-ink2">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo size="lg" word={t.nav.logoWord} />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-mut">
              {t.footer.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-limed/40 px-3 py-1 text-[14px] text-limed">
                {t.footer.free}
              </span>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-black text-bone">
              {t.footer.links}
            </h4>
            <ul className="flex flex-col gap-2.5 text-[15px] text-mut">
              <li>
                <Link className="transition-colors hover:text-limed" href="/events">
                  {t.nav.events}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-limed" href="/communities">
                  {t.nav.communities}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-limed" href="/add">
                  {t.nav.addEvent.replace("+ ", "")}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-limed" href="/my">
                  {t.nav.myEvents}
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-limed" href="/about">
                  {t.nav.about}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] font-black text-bone">
              {t.footer.cats}
            </h4>
            <ul className="flex flex-col gap-2.5 text-[15px] text-mut">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    className="transition-colors hover:text-limed"
                    href={`/events?cat=${encodeURIComponent(c)}`}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[14px] text-mut">
          <span>{t.footer.rights}</span>
          <span dir="ltr">hello@notec.eg</span>
        </div>
      </div>
    </footer>
  );
}
