"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  IconCalendar,
  IconLogin,
  IconMenu,
  IconX,
  Logo,
} from "./ui";
import {
  useAuth,
  useLang,
  useTheme,
  AUTH_EVENT,
} from "./providers";
import { useToast } from "./toast";
import { getDeviceId } from "@/lib/device";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { push } = useToast();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/events", label: t.nav.events },
    { href: "/communities", label: t.nav.communities },
    { href: "/my", label: t.nav.myEvents },
    { href: "/about", label: t.nav.about },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "x-device-id": getDeviceId() },
      });
    } catch {
      /* ignore */
    }
    push(t.auth.loggedOut);
    window.dispatchEvent(new Event(AUTH_EVENT));
    setMenu(false);
    router.push("/");
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-ink/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-5">
        <Logo word={t.nav.logoWord} />

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-[14px] font-bold transition-colors ${
                isActive(l.href)
                  ? "bg-card text-limed"
                  : "text-mut hover:text-bone"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* language toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="h-10 shrink-0 rounded-full border border-line px-3.5 text-[14px] font-bold text-mut transition-colors hover:border-mut hover:text-bone cursor-pointer"
            title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>

          {/* theme toggle */}
          <button
            type="button"
            onClick={toggle}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-mut transition-all hover:rotate-12 hover:border-mut hover:text-bone cursor-pointer"
            aria-label={theme === "dark" ? t.nav.themeLight : t.nav.themeDark}
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
              </svg>
            )}
          </button>

          {/* auth — before the add button */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-line p-1 pe-3 transition-colors hover:border-mut cursor-pointer"
                title={t.nav.signedIn}
              >
                {user.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.picture}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-limed text-[14px] font-black text-ink">
                    {(user.name || user.email)[0]?.toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-[110px] truncate text-[14px] font-bold lg:block">
                  {user.name || user.email}
                </span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute end-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
                  >
                    <div className="border-b border-line px-4 py-3">
                      <div className="truncate text-[14px] font-black">
                        {user.name || user.email}
                      </div>
                      <div className="truncate text-[14px] text-mut" dir="ltr">
                        {user.email}
                      </div>
                    </div>
                    <Link
                      href="/my"
                      className="flex items-center gap-3 px-4 py-3 text-[14px] font-bold transition-colors hover:bg-ink2"
                    >
                      <IconCalendar className="size-4.5 text-limed" />
                      {t.nav.myAccount}
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-[14px] font-bold text-red transition-colors hover:bg-ink2 cursor-pointer"
                    >
                      <IconX className="size-4.5" />
                      {t.nav.logout}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-10 items-center gap-2 rounded-full border border-line px-4 text-[14px] font-bold text-bone transition-colors hover:border-mut sm:inline-flex"
            >
              <IconLogin className="size-4 text-limed" />
              {t.nav.login}
            </Link>
          )}

          {/* add community — before add event */}
          <Link
            href="/add-community"
            className="hidden h-10 items-center rounded-full border border-line px-4 text-[14px] font-bold text-bone transition-colors hover:border-mut sm:inline-flex"
          >
            {t.nav.addCommunity}
          </Link>

          {/* add event */}
          <Link
            href="/add"
            className="hidden h-10 items-center rounded-full bg-lime px-5 text-[14px] font-bold text-ink transition-all hover:bg-bone sm:inline-flex"
          >
            {t.nav.addEvent}
          </Link>

          <button
            type="button"
            aria-label="menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-line text-bone md:hidden cursor-pointer"
          >
            {open ? <IconX className="size-5" /> : <IconMenu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-line bg-ink/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-xl px-4 py-3 text-[15px] font-bold ${
                    isActive(l.href) ? "bg-card text-limed" : "text-mut"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                <Link
                  href="/add-community"
                  className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-[15px] font-bold"
                >
                  {t.nav.addCommunity}
                </Link>
                <Link
                  href="/add"
                  className="flex h-12 flex-1 items-center justify-center rounded-xl bg-lime text-[15px] font-bold text-ink"
                >
                  {t.nav.addEvent}
                </Link>
                {!user && (
                  <Link
                    href="/login"
                    className="flex h-12 flex-1 items-center justify-center rounded-xl border border-line text-[15px] font-bold"
                  >
                    {t.nav.login}
                  </Link>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
