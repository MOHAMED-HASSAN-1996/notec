"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/providers";
import {
  saveCommunities,
  slugify,
  useStoredCommunities,
  type StoredCommunity,
} from "@/lib/community-store";
import type { CommunityPlatform } from "@/lib/types";

const PLATFORMS: { id: CommunityPlatform; label: string }[] = [
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "github", label: "GitHub" },
];

export default function AddCommunityPage() {
  const { t } = useLang();
  const router = useRouter();
  const { push } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [links, setLinks] = useState<Record<CommunityPlatform, string>>({
    youtube: "",
    facebook: "",
    linkedin: "",
    x: "",
    whatsapp: "",
    telegram: "",
    github: "",
  });

  const stored = useStoredCommunities();
  const saved = stored ?? [];
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function remove(id: string) {
    saveCommunities(saved.filter((c) => c.id !== id));
  }

  function submit() {
    if (name.trim().length < 3) {
      setErr(t.addCommunity.errName);
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const present = PLATFORMS.filter((p) => links[p.id].trim().length > 0);
      const entry: StoredCommunity = {
        id: `${slugify(name)}-${Date.now().toString(36)}`,
        name: name.trim(),
        description: description.trim(),
        logo: logo.trim(),
        links: Object.fromEntries(present.map((p) => [p.id, links[p.id].trim()])),
        createdAt: Date.now(),
      };
      const next = [entry, ...saved];
      saveCommunities(next);
      push(t.addCommunity.saved);
      router.push(`/community/${slugify(entry.name)}`);
    } catch {
      push(t.addCommunity.error, "err");
    } finally {
      setBusy(false);
    }
  }

  const label = "mb-2 block text-[14px] font-bold text-mut";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-28 md:pt-36">
      <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
        <span>Notec</span>
        <span className="h-px w-10 bg-line" />
      </div>
      <h1 className="text-5xl font-black leading-none md:text-7xl">
        {t.addCommunity.title}
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mut">
        {t.addCommunity.sub}
      </p>

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
            <label className={label} htmlFor="c-name">
              {t.addCommunity.fName} <span className="text-limed">*</span>
            </label>
            <input
              id="c-name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.addCommunity.fNamePh}
            />
            {err && <div className="mt-1.5 text-[14px] font-bold text-amber">{err}</div>}
          </div>

          <div>
            <label className={label} htmlFor="c-desc">
              {t.addCommunity.fDesc}
            </label>
            <textarea
              id="c-desc"
              className="field resize-y"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.addCommunity.fDescPh}
            />
          </div>

          <div>
            <label className={label} htmlFor="c-logo">
              {t.addCommunity.fLogo}
            </label>
            <input
              id="c-logo"
              dir="ltr"
              className="field text-left"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder={t.addCommunity.fLogoPh}
            />
          </div>

          <div>
            <div className="mb-2 text-[14px] font-bold text-mut">
              {t.addCommunity.fLinks}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {PLATFORMS.map((p) => (
                <div key={p.id}>
                  <label className={label} htmlFor={`c-link-${p.id}`}>
                    {p.label}
                  </label>
                  <input
                    id={`c-link-${p.id}`}
                    dir="ltr"
                    className="field text-left"
                    value={links[p.id]}
                    onChange={(e) =>
                      setLinks((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    placeholder={`https://${p.id}.com/…`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-mut">{t.addCommunity.fLinksHint}</p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-bold text-ink transition-all hover:bg-bone disabled:opacity-60 cursor-pointer"
          >
            {busy ? t.addCommunity.saving : t.addCommunity.save}
          </button>
        </form>

        <aside className="flex flex-col gap-5">
          {/* live preview */}
          <div className="rounded-2xl border border-line bg-ink2 p-6">
            <div className="text-[15px] font-black">{t.addCommunity.preview}</div>
            <div className="mt-4 flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-card text-[22px] font-black text-limed">
                {logo ? (
                  <img
                    src={logo}
                    alt={name || "logo"}
                    className="size-full object-cover"
                  />
                ) : (
                  (name.trim()[0] || "?").toUpperCase()
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[17px] font-black text-bone">
                  {name || "…"}
                </div>
                <div className="mt-1 truncate text-[13px] text-mut">
                  {description || "…"}
                </div>
              </div>
            </div>
            {name && (
              <div className="mt-3 text-[13px] text-mut">
                notec.app/community/{slugify(name)}
              </div>
            )}
          </div>

          {/* saved list */}
          <div className="rounded-2xl border border-line bg-ink2 p-6">
            <div className="text-[15px] font-black">{t.addCommunity.title}</div>
            {saved.length === 0 ? (
              <p className="mt-4 text-[14px] text-mut">{t.addCommunity.none}</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {saved.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl border border-line bg-card p-3"
                  >
                    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink2 text-[15px] font-black text-limed">
                      {c.logo ? (
                        <img src={c.logo} alt={c.name} className="size-full object-cover" />
                      ) : (
                        (c.name[0] || "?").toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/community/${slugify(c.name)}`}
                        className="block truncate text-[15px] font-bold text-bone hover:text-limed"
                      >
                        {c.name}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      className="cursor-pointer text-[12px] font-bold text-mut transition-colors hover:text-amber"
                    >
                      {t.addCommunity.remove}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
