import Link from "next/link";
import type { ReactNode, SVGProps } from "react";
import { Underline } from "./parallax";

/* ---------- Logo ---------- */
export function Logo({ withWord = true, size = "sm", word }: { withWord?: boolean; size?: "sm" | "lg"; word?: string }) {
  const lg = size === "lg";
  const showWord = withWord && word !== undefined && word !== "";
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className={`grid place-items-center rounded-xl bg-lime transition-transform duration-300 group-hover:rotate-6 ${lg ? "size-12" : "size-9"}`}>
        <svg viewBox="0 0 32 32" className={lg ? "size-7" : "size-6"} aria-hidden>
          <path
            d="M10 23V9.5L22 23V9.5"
            fill="none"
            stroke="#0a0a0e"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24.6" cy="8.4" r="2.7" fill="#0a0a0e" />
        </svg>
      </span>
      {showWord && (
        <span className="flex items-baseline gap-2">
          <span className={`font-black tracking-tight ${lg ? "text-2xl" : "text-xl"}`}>Notec</span>
          <span className={`font-medium text-mut ${lg ? "text-base" : "text-[14px]"}`}>{word}</span>
        </span>
      )}
    </Link>
  );
}

/* ---------- Buttons ---------- */
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 text-[15px] font-bold transition-all duration-200 select-none cursor-pointer";

const btnVariants = {
  solid: "bg-lime text-ink hover:bg-bone hover:-translate-y-0.5",
  outline:
    "border border-line text-bone hover:border-mut hover:-translate-y-0.5",
  ghost: "text-mut hover:text-bone",
  danger: "border border-red/40 text-red hover:bg-red/10",
};

type BtnProps = {
  href?: string;
  onClick?: () => void;
  variant?: keyof typeof btnVariants;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function Btn({
  href,
  onClick,
  variant = "solid",
  className = "",
  children,
  disabled,
  type = "button",
}: BtnProps) {
  const cls = `${btnBase} ${btnVariants[variant]} ${className} ${
    disabled ? "opacity-50 pointer-events-none" : ""
  }`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

/* ---------- Chip ---------- */
export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-[14px] font-bold transition-colors cursor-pointer ${
        active
          ? "border-limed bg-lime text-ink"
          : "border-line text-mut hover:border-mut hover:text-bone"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({
  index,
  title,
  sub,
  action,
}: {
  index: string;
  title: ReactNode;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="mb-3 flex items-center gap-3 text-[15px] font-bold text-limed">
          <span dir="ltr">{index}</span>
          <Underline className="h-px w-10 bg-line" />
        </div>
        <h2 className="text-4xl font-black leading-[1.1] md:text-6xl">
          {title}
        </h2>
      </div>
      {sub && (
        <p className="max-w-sm text-[15px] leading-relaxed text-mut">{sub}</p>
      )}
      {action}
    </div>
  );
}

/* ---------- Marquee ---------- */
export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div
      dir="ltr"
      className="relative overflow-hidden border-y border-line bg-ink2 py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div className="animate-marquee flex w-max items-center">
        {row.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-10 whitespace-nowrap px-5 text-[15px] font-bold text-mut"
          >
            {t}
            <span className="text-limed">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Icons (custom line set) ---------- */
type I = SVGProps<SVGSVGElement>;
const base = (p: I) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const IconBell = (p: I) => (
  <svg {...base(p)}>
    <path d="M6.2 8.5a5.8 5.8 0 0 1 11.6 0c0 6.5 2.7 7.5 2.7 7.5H3.5s2.7-1 2.7-7.5" />
    <path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" />
  </svg>
);
export const IconLogin = (p: I) => (
  <svg {...base(p)}>
    <path d="M3 12h14M13 7l5 5-5 5" />
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  </svg>
);
export const IconCalendar = (p: I) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M16 3v4M8 3v4M3 10.5h18" />
  </svg>
);
export const IconPin = (p: I) => (
  <svg {...base(p)}>
    <path d="M19.5 10c0 5.5-7.5 11-7.5 11S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0Z" />
    <circle cx="12" cy="10" r="2.8" />
  </svg>
);
export const IconUsers = (p: I) => (
  <svg {...base(p)}>
    <path d="M15 20v-1.8a4 4 0 0 0-4-4H6.4a4 4 0 0 0-4 4V20" />
    <circle cx="8.7" cy="7.5" r="3.6" />
    <path d="M20.9 20v-1.8a4 4 0 0 0-2.9-3.85M15.4 4.1a3.6 3.6 0 0 1 0 6.8" />
  </svg>
);
export const IconArrow = (p: I) => (
  <svg {...base(p)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
export const IconPlus = (p: I) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconCheck = (p: I) => (
  <svg {...base(p)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const IconX = (p: I) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const IconLink = (p: I) => (
  <svg {...base(p)}>
    <path d="M10 13.5a4.5 4.5 0 0 0 6.8.5l2.6-2.6a4.5 4.5 0 1 0-6.4-6.4l-1.5 1.5" />
    <path d="M14 10.5a4.5 4.5 0 0 0-6.8-.5l-2.6 2.6a4.5 4.5 0 1 0 6.4 6.4l1.5-1.5" />
  </svg>
);
export const IconSpark = (p: I) => (
  <svg {...base(p)}>
    <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M18.7 5.3l-2.8 2.8M8.1 15.9l-2.8 2.8" />
  </svg>
);
export const IconClock = (p: I) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2.5" />
  </svg>
);
export const IconSearch = (p: I) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const IconExternal = (p: I) => (
  <svg {...base(p)}>
    <path d="M14 3h7v7M21 3 10.5 13.5" />
    <path d="M21 13.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.5" />
  </svg>
);
export const IconMenu = (p: I) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const IconBolt = (p: I) => (
  <svg {...base(p)}>
    <path d="M13 2 3.5 14H10l-1 8 9.5-12H12l1-8Z" />
  </svg>
);
export const IconMerge = (p: I) => (
  <svg {...base(p)}>
    <path d="M7 3v4a6 6 0 0 0 6 6h4" />
    <path d="M7 21v-4a6 6 0 0 1 6-6" />
    <path d="m13 15 4 4-4 4" transform="translate(0 -4)" />
  </svg>
);
export const IconTicket = (p: I) => (
  <svg {...base(p)}>
    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6Z" />
    <path d="M14 5v2M14 11v2M14 17v2" />
  </svg>
);
/* ---------- Brand share icons (filled logos) ---------- */
export const IconLinkedIn = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.2 8.2h4.6V23H.2V8.2Zm7.8 0h4.4v2h.1c.6-1.15 2.1-2.35 4.3-2.35 4.6 0 5.45 3.02 5.45 6.95V23h-4.6v-7.4c0-1.77-.04-4.05-2.47-4.05-2.47 0-2.85 1.93-2.85 3.92V23H8V8.2Z" transform="translate(0 0.5) scale(1)" />
  </svg>
);
export const IconFacebook = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07Z" />
  </svg>
);
export const IconWhatsApp = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.08-.3-.15-1.26-.47-2.4-1.48-.89-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.19 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34ZM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.89 9.89c0 5.45-4.44 9.88-9.9 9.88Zm8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.47-8.41Z" />
  </svg>
);
export const IconXBrand = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.67l7.74-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
  </svg>
);
export const IconYouTube = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
  </svg>
);
export const IconTelegram = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M11.94 0A12 12 0 1 0 24 12 12 12 0 0 0 11.94 0Zm5.67 8.16-1.97 9.3c-.15.66-.54.82-1.09.51l-3-2.21-1.45 1.4a.76.76 0 0 1-.6.29l.21-3.05 5.55-5.02c.24-.21-.05-.33-.37-.12l-6.86 4.32-2.95-.92c-.64-.2-.66-.64.14-.95l11.54-4.45c.53-.2 1 .12.82.9Z" />
  </svg>
);
export const IconGithub = (p: I) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.1-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.9-.02 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0Z" />
  </svg>
);
