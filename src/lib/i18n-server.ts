import { cookies } from "next/headers";
import { dict, isLang, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const c = await cookies();
  const v = c.get("notec_lang")?.value;
  return isLang(v) ? v : "ar";
}

export async function getT() {
  const lang = await getLang();
  return {
    t: dict[lang],
    lang,
    dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
  };
}
