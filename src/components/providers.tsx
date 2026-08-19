"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { dict, type Dict, type Lang } from "@/lib/i18n";

/* ---------------- language ---------------- */

type LangCtx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dict;
  setLang: (l: Lang) => void;
};

const LangContext = createContext<LangCtx>({
  lang: "ar",
  dir: "rtl",
  t: dict.ar,
  setLang: () => {},
});

export const useLang = () => useContext(LangContext);

/* ---------------- theme ---------------- */

export type Theme = "dark" | "light";

type ThemeCtx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeCtx>({
  theme: "dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

/* ---------------- auth ---------------- */

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
  provider: string;
} | null;

type AuthCtx = { user: AuthUser; reload: () => void };

const AuthContext = createContext<AuthCtx>({ user: null, reload: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AUTH_EVENT = "notec:auth";

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=${365 * 86400};samesite=lax`;
}

/* ---------------- combined provider ---------------- */

export function Providers({
  initialLang,
  initialTheme,
  children,
}: {
  initialLang: Lang;
  initialTheme: Theme;
  children: ReactNode;
}) {
  const router = useRouter();

  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [user, setUser] = useState<AuthUser>(null);

  /* theme */
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      setCookie("notec_theme", next);
      return next;
    });
  }, []);

  /* language */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      setCookie("notec_lang", l);
      // re-render server components (titles, static copy)
      router.refresh();
    },
    [router],
  );

  /* auth */
  const reload = useCallback(() => {
    fetch("/api/auth/me", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((j) => setUser(j.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    reload();
    const h = () => {
      reload();
      router.refresh();
    };
    window.addEventListener(AUTH_EVENT, h);
    return () => window.removeEventListener(AUTH_EVENT, h);
  }, [reload, router]);

  const langValue = useMemo<LangCtx>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      t: dict[lang],
      setLang,
    }),
    [lang, setLang],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
      <LangContext.Provider value={langValue}>
        <AuthContext.Provider value={{ user, reload }}>
          {children}
        </AuthContext.Provider>
      </LangContext.Provider>
    </ThemeContext.Provider>
  );
}
