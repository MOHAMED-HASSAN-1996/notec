"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/providers";
import {
  IconBolt,
  IconCheck,
  IconLink,
  IconSpark,
} from "@/components/ui";
import {
  CATEGORIES,
  COMMUNITIES,
  type EventPublic,
} from "@/lib/types";

type Errors = { title?: string; date?: string; time?: string };

export default function AddPage() {
  const { t } = useLang();
  const router = useRouter();
  const { push } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("مجاني");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [community, setCommunity] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [check, setCheck] = useState<{
    match: EventPublic;
    reason: "url" | "title";
  } | null>(null);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      if (!url.trim() && !title.trim()) {
        setCheck(null);
        return;
      }
      setChecking(true);
      try {
        const r = await api.check(url, title);
        setCheck(r.match ? { match: r.match, reason: r.reason ?? "title" } : null);
      } catch {
        /* ignore */
      } finally {
        setChecking(false);
      }
    }, 550);
    return () => clearTimeout(timer);
  }, [url, title]);

  async function submit() {
    const errs: Errors = {};
    if (title.trim().length < 3) errs.title = t.add.errName;
    if (!date) errs.date = t.add.errDate;
    if (!time) errs.time = t.add.errTime;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const res = await api.createEvent({
        title,
        description,
        category,
        location,
        city,
        price,
        url,
        imageUrl,
        community,
        startsAt: `${date}T${time}`,
      });
      push(t.toast.added);
      router.push(`/events/${res.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const p = e.payload as { existing?: EventPublic; code?: string };
        push(p.code === "url" ? t.toast.mergedUrl : t.toast.mergedTitle, "warn");
        if (p.existing) router.push(`/events/${p.existing.id}`);
      } else {
        push(t.toast.error, "err");
      }
    } finally {
      setBusy(false);
    }
  }

  const label = "mb-2 block text-[14px] font-bold text-mut";
  const errCls = "mt-1.5 text-[14px] font-bold text-amber";
  const ruleIcons = { link: IconLink, spark: IconSpark, check: IconCheck };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 md:pt-36">
      <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
        <span>Notec</span>
        <span className="h-px w-10 bg-line" />
      </div>
      <h1 className="text-5xl font-black leading-none md:text-7xl">{t.add.title}</h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mut">{t.add.sub}</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_330px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-6 rounded-3xl border border-line bg-ink2 p-6 md:p-8"
          noValidate
        >
          <div>
            <label className={label} htmlFor="f-title">
              {t.add.fName} <span className="text-limed">*</span>
            </label>
            <input
              id="f-title"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.add.phName}
            />
            {errors.title && <div className={errCls}>{errors.title}</div>}
          </div>

          <div>
            <label className={label} htmlFor="f-desc">
              {t.add.fDesc}
            </label>
            <textarea
              id="f-desc"
              className="field resize-y"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.add.fDescPh}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="f-cat">
                {t.add.fCat}
              </label>
              <select
                id="f-cat"
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="f-comm">
                {t.add.fComm}
              </label>
              <select
                id="f-comm"
                className="field"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
              >
                <option value="">{t.add.fCommNone}</option>
                {COMMUNITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={label} htmlFor="f-price">
              {t.add.fPrice}
            </label>
            <input
              id="f-price"
              className="field"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t.add.fPricePh}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="f-date">
                {t.add.fDate} <span className="text-limed">*</span>
              </label>
              <input
                id="f-date"
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <div className={errCls}>{errors.date}</div>}
            </div>
            <div>
              <label className={label} htmlFor="f-time">
                {t.add.fTime} <span className="text-limed">*</span>
              </label>
              <input
                id="f-time"
                type="time"
                className="field"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              {errors.time && <div className={errCls}>{errors.time}</div>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="f-city">
                {t.add.fCity}
              </label>
              <input
                id="f-city"
                className="field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.add.fCityPh}
              />
            </div>
            <div>
              <label className={label} htmlFor="f-loc">
                {t.add.fLoc}
              </label>
              <input
                id="f-loc"
                className="field"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.add.fLocPh}
              />
            </div>
          </div>

          <div>
            <label className={label} htmlFor="f-url">
              {t.add.fUrl}
            </label>
            <input
              id="f-url"
              dir="ltr"
              className="field text-left"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
            <AnimatePresence>
              {checking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl border border-line bg-card px-4 py-3 text-[14px] text-mut">
                    {t.add.checking}
                  </div>
                </motion.div>
              )}
              {check && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-3 rounded-xl border border-amber/40 bg-amber/5 p-4"
                >
                  <div className="flex items-center gap-2 text-[14px] font-bold text-amber">
                    <IconSpark className="size-4" />
                    {check.reason === "url" ? t.add.matchUrl : t.add.matchTitle}
                  </div>
                  <div className="mt-1.5 text-[15px] font-bold text-bone">
                    {check.match.title}
                  </div>
                  <div className="mt-2 text-[14px] text-mut">
                    {t.add.willMerge}{" "}
                    <Link
                      href={`/events/${check.match.id}`}
                      className="font-bold text-limed hover:underline"
                    >
                      {t.add.viewIt}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className={label} htmlFor="f-img">
              {t.add.fImg}
            </label>
            <input
              id="f-img"
              dir="ltr"
              className="field text-left"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…/photo.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-bold text-ink transition-all hover:bg-bone disabled:opacity-60 cursor-pointer"
          >
            {busy ? t.add.submitting : t.add.submit}
          </button>
          <p className="text-center text-[14px] text-mut">{t.add.footer}</p>
        </form>

        <aside className="flex flex-col gap-5">
          <div className="rounded-2xl border border-line bg-ink2 p-6">
            <div className="flex items-center gap-2 text-[15px] font-black">
              <IconBolt className="size-5 text-limed" />
              {t.add.rulesTitle}
            </div>
            <ul className="mt-5 flex flex-col gap-5">
              {t.add.rules.map((r) => {
                const Ico = ruleIcons[r.icon];
                return (
                  <li key={r.t} className="flex gap-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-card text-limed">
                      <Ico className="size-4.5" />
                    </span>
                    <div>
                      <div className="text-[15px] font-bold">{r.t}</div>
                      <div className="mt-1 text-[14px] leading-relaxed text-mut">
                        {r.d}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-ink2 p-6">
            <div className="text-[15px] font-black">{t.add.tipsTitle}</div>
            <ul className="mt-4 flex list-disc flex-col gap-2.5 ps-5 text-[14px] leading-relaxed text-mut">
              {t.add.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
