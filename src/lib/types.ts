import type { Lang } from "./i18n";

export type EventRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  price: string;
  url: string;
  urlKey: string;
  imageUrl: string;
  community: string;
  ownerDevice: string;
  merges: number;
  attendeesCount: number;
  startsAt: Date | string;
  endsAt: Date | string | null;
  agenda: string;
};

/** Serializable shape safe to pass to client components. */
export type EventPublic = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  price: string;
  url: string;
  imageUrl: string;
  community: string;
  merges: number;
  attendeesCount: number;
  startsAt: string;
  endsAt: string | null;
  agenda: AgendaItem[];
};

export type AgendaItem = {
  time: string;
  title: string;
  desc: string;
};

export function toPublic(row: EventRow): EventPublic {
  let agenda: AgendaItem[] = [];
  try {
    agenda = JSON.parse(row.agenda || "[]");
  } catch {
    agenda = [];
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    location: row.location,
    city: row.city,
    price: row.price,
    url: row.url,
    imageUrl: row.imageUrl,
    community: row.community,
    merges: row.merges,
    attendeesCount: row.attendeesCount,
    startsAt: new Date(row.startsAt).toISOString(),
    endsAt: row.endsAt ? new Date(row.endsAt).toISOString() : null,
    agenda,
  };
}

export const CATEGORIES = [
  "تطوير",
  "ذكاء اصطناعي",
  "تصميم",
  "هاكاثون",
  "ستارت أب",
  ".cybersecurity",
] as const;

/** Communities/groups whose events Notec aggregates. */
export const COMMUNITIES = [
  "UXawya",
  "GDG Cairo",
  "Women Who Code Cairo",
  "DevOps Egypt",
  "Alexandria.js",
  "Egypt.js",
  "Cairo Security Club",
  "Flutter Egypt",
  "PyCairo",
  "ML Cairo",
  "Startup Grind Cairo",
  "Crescent Hacks",
] as const;

/** Social platforms a community can be joined through. */
export type CommunityPlatform =
  | "youtube"
  | "facebook"
  | "linkedin"
  | "x"
  | "whatsapp"
  | "telegram"
  | "github";

export type CommunityLinks = Partial<Record<CommunityPlatform, string>>;

/**
 * Join links per community. Placeholders for now — replace with real
 * profile/group URLs as each community provides them.
 */
const COMMUNITY_LINKS: Record<string, CommunityLinks> = {
  "UXawya": {
    youtube: "https://youtube.com/@uxawya",
    facebook: "https://facebook.com/uxawya",
    linkedin: "https://linkedin.com/company/uxawya",
    x: "https://x.com/uxawya",
    whatsapp: "https://chat.whatsapp.com/uxawya",
    telegram: "https://t.me/uxawya",
    github: "https://github.com/uxawya",
  },
  "GDG Cairo": {
    youtube: "https://youtube.com/@gdgcairo",
    facebook: "https://facebook.com/gdgcairo",
    linkedin: "https://linkedin.com/company/gdgcairo",
    x: "https://x.com/gdgcairo",
    whatsapp: "https://chat.whatsapp.com/gdgcairo",
    telegram: "https://t.me/gdgcairo",
    github: "https://github.com/gdgcairo",
  },
  "Women Who Code Cairo": {
    youtube: "https://youtube.com/@wwcodecairo",
    facebook: "https://facebook.com/wwcodecairo",
    linkedin: "https://linkedin.com/company/wwcodecairo",
    x: "https://x.com/wwcodecairo",
    whatsapp: "https://chat.whatsapp.com/wwcodecairo",
    telegram: "https://t.me/wwcodecairo",
    github: "https://github.com/wwcodecairo",
  },
  "DevOps Egypt": {
    youtube: "https://youtube.com/@devopsegypt",
    facebook: "https://facebook.com/devopsegypt",
    linkedin: "https://linkedin.com/company/devopsegypt",
    x: "https://x.com/devopsegypt",
    whatsapp: "https://chat.whatsapp.com/devopsegypt",
    telegram: "https://t.me/devopsegypt",
    github: "https://github.com/devopsegypt",
  },
  "Alexandria.js": {
    youtube: "https://youtube.com/@alexandriajs",
    facebook: "https://facebook.com/alexandriajs",
    linkedin: "https://linkedin.com/company/alexandriajs",
    x: "https://x.com/alexandriajs",
    whatsapp: "https://chat.whatsapp.com/alexandriajs",
    telegram: "https://t.me/alexandriajs",
    github: "https://github.com/alexandriajs",
  },
  "Egypt.js": {
    youtube: "https://youtube.com/@egyptjs",
    facebook: "https://facebook.com/egyptjs",
    linkedin: "https://linkedin.com/company/egyptjs",
    x: "https://x.com/egyptjs",
    whatsapp: "https://chat.whatsapp.com/egyptjs",
    telegram: "https://t.me/egyptjs",
    github: "https://github.com/egyptjs",
  },
  "Cairo Security Club": {
    youtube: "https://youtube.com/@cairosecurityclub",
    facebook: "https://facebook.com/cairosecurityclub",
    linkedin: "https://linkedin.com/company/cairosecurityclub",
    x: "https://x.com/cairosecurityclub",
    whatsapp: "https://chat.whatsapp.com/cairosecurityclub",
    telegram: "https://t.me/cairosecurityclub",
    github: "https://github.com/cairosecurityclub",
  },
  "Flutter Egypt": {
    youtube: "https://youtube.com/@flutteregypt",
    facebook: "https://facebook.com/flutteregypt",
    linkedin: "https://linkedin.com/company/flutteregypt",
    x: "https://x.com/flutteregypt",
    whatsapp: "https://chat.whatsapp.com/flutteregypt",
    telegram: "https://t.me/flutteregypt",
    github: "https://github.com/flutteregypt",
  },
  "PyCairo": {
    youtube: "https://youtube.com/@pycairo",
    facebook: "https://facebook.com/pycairo",
    linkedin: "https://linkedin.com/company/pycairo",
    x: "https://x.com/pycairo",
    whatsapp: "https://chat.whatsapp.com/pycairo",
    telegram: "https://t.me/pycairo",
    github: "https://github.com/pycairo",
  },
  "ML Cairo": {
    youtube: "https://youtube.com/@mlcairo",
    facebook: "https://facebook.com/mlcairo",
    linkedin: "https://linkedin.com/company/mlcairo",
    x: "https://x.com/mlcairo",
    whatsapp: "https://chat.whatsapp.com/mlcairo",
    telegram: "https://t.me/mlcairo",
    github: "https://github.com/mlcairo",
  },
  "Startup Grind Cairo": {
    youtube: "https://youtube.com/@startupgrindcairo",
    facebook: "https://facebook.com/startupgrindcairo",
    linkedin: "https://linkedin.com/company/startupgrindcairo",
    x: "https://x.com/startupgrindcairo",
    whatsapp: "https://chat.whatsapp.com/startupgrindcairo",
    telegram: "https://t.me/startupgrindcairo",
    github: "https://github.com/startupgrindcairo",
  },
  "Crescent Hacks": {
    youtube: "https://youtube.com/@crescenthacks",
    facebook: "https://facebook.com/crescenthacks",
    linkedin: "https://linkedin.com/company/crescenthacks",
    x: "https://x.com/crescenthacks",
    whatsapp: "https://chat.whatsapp.com/crescenthacks",
    telegram: "https://t.me/crescenthacks",
    github: "https://github.com/crescenthacks",
  },
};

/** Join links for a community (may be partial — platforms without a link are absent). */
export function communityLinks(c: string): CommunityLinks {
  return COMMUNITY_LINKS[c] ?? {};
}

const TZ = "Africa/Cairo";

/** Slug + logo path for a community, used by the community cards & pages. */
export function communitySlug(c: string): string {
  return c.toLowerCase().replace(/\.|\s+/g, "-");
}

export function communityLogo(c: string): string {
  return `/logos/${communitySlug(c)}.svg`;
}

function locale(lang: Lang): string {
  return lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB";
}

export function fmtDate(v: string | Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(new Date(v));
}

export function fmtDateShort(v: string | Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  }).format(new Date(v));
}

export function fmtDayNum(v: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    timeZone: TZ,
  }).format(new Date(v));
}

export function fmtMonth(v: string | Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    month: "short",
    timeZone: TZ,
  }).format(new Date(v));
}

export function fmtTime(v: string | Date, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  }).format(new Date(v));
}

export function fmtCountdown(ms: number, lang: Lang): string {
  if (ms <= 0) return lang === "ar" ? "بدأ دلوقتي" : "Started now";
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (lang === "en") {
    if (days > 0)
      return hours % 24 > 0
        ? `In ${days}d ${hours % 24}h`
        : `In ${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `In ${hours}h`;
    return `In ${mins}m`;
  }
  if (days > 0) {
    const h = hours % 24;
    const dWord = days === 1 ? "يوم" : days === 2 ? "يومين" : "أيام";
    return h > 0 ? `بعد ${days} ${dWord} و ${h} ساعات` : `بعد ${days} ${dWord}`;
  }
  if (hours > 0) {
    const hWord = hours === 1 ? "ساعة" : hours === 2 ? "ساعتين" : "ساعات";
    return `بعد ${hours} ${hWord}`;
  }
  return `بعد ${mins} دقيقة`;
}

export function priceLabel(p: string): string {
  if (!p || p === "0") return p;
  return p;
}
