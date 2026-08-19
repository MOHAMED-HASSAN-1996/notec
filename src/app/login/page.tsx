"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useLang, useAuth, AUTH_EVENT } from "@/components/providers";
import { useToast } from "@/components/toast";
import { getDeviceId } from "@/lib/device";
import { IconCheck } from "@/components/ui";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.3 1.2-3.2 0-6-2.1-7-5.1l-3.9 3C3.1 21.3 7.2 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-3.9-3C.4 8.3 0 10.1 0 12s.4 3.7 1.1 5.3l3.9-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.8 1 4.7 1.8l3.3-3.2C18 1.2 15.2 0 12 0 7.2 0 3.1 2.7 1.1 6.7l3.9 3c1-3 3.8-5 7-5z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const sp = useSearchParams();

  const [googleOn, setGoogleOn] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errs, setErrs] = useState<{ name?: string; email?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((j) => setGoogleOn(Boolean(j.google)))
      .catch(() => setGoogleOn(false));
  }, []);

  useEffect(() => {
    if (user) router.replace("/my");
  }, [user, router]);

  useEffect(() => {
    if (sp.get("err")) push(t.toast.error, "err");
  }, [sp, push, t]);

  async function demoSubmit() {
    const e: typeof errs = {};
    if (!name.trim()) e.name = t.auth.errName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = t.auth.errEmail;
    setErrs(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-device-id": getDeviceId(),
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      push(t.auth.welcome(name.trim()));
      window.dispatchEvent(new Event(AUTH_EVENT));
      router.replace("/my");
    } catch {
      push(t.toast.error, "err");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_1fr]">
      {/* side */}
      <div className="hidden lg:block">
        <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
          <span>Notec</span>
          <span className="h-px w-10 bg-line" />
        </div>
        <h1 className="text-6xl font-black leading-[1.05]">
          {t.auth.loginTitle.split(" ")[0]}
          <br />
          <span className="text-limed">{t.auth.whyTitle}</span>
        </h1>
        <ul className="mt-9 flex max-w-md flex-col gap-4">
          {t.auth.why.map((w) => (
            <li key={w} className="flex items-center gap-3.5 text-[16px]">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime text-ink">
                <IconCheck className="size-4" />
              </span>
              {w}
            </li>
          ))}
        </ul>
        <div className="mt-12 select-none font-black leading-none text-outline text-[150px]">
          Notec
        </div>
      </div>

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-line bg-ink2 p-7 md:p-9"
      >
        <h2 className="text-3xl font-black md:text-4xl">{t.auth.loginTitle}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-mut">
          {t.auth.loginSub}
        </p>

        <a
          href="/api/auth/google"
          className={`mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line bg-card text-[16px] font-bold transition-all ${
            googleOn === false
              ? "cursor-not-allowed opacity-50"
              : "hover:-translate-y-0.5 hover:border-mut"
          }`}
          onClick={(e) => {
            if (googleOn === false) e.preventDefault();
          }}
        >
          <GoogleGlyph />
          {t.auth.google}
        </a>
        {googleOn === false && (
          <p className="mt-3 rounded-xl border border-amber/30 bg-amber/5 p-3.5 text-[14px] leading-relaxed text-amber">
            {t.auth.googleNote}
          </p>
        )}

        <div className="my-7 flex items-center gap-4 text-[14px] font-bold text-mut">
          <span className="h-px flex-1 bg-line" />
          {t.auth.or}
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.auth.namePh}
            />
            {errs.name && (
              <div className="mt-1.5 text-[14px] font-bold text-amber">
                {errs.name}
              </div>
            )}
          </div>
          <div>
            <input
              dir="ltr"
              className={`field ${lang === "ar" ? "text-left" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPh}
              type="email"
            />
            {errs.email && (
              <div className="mt-1.5 text-[14px] font-bold text-amber">
                {errs.email}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={demoSubmit}
            className="flex h-14 w-full items-center justify-center rounded-full bg-lime text-[16px] font-bold text-ink transition-all hover:bg-bone disabled:opacity-60 cursor-pointer"
          >
            {busy ? "…" : t.auth.demoSubmit}
          </button>
          <p className="text-[14px] leading-relaxed text-mut">{t.auth.demoHint}</p>
        </div>
      </motion.div>
    </div>
  );
}
