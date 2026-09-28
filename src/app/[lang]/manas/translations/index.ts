import type { Locale } from "@/lib/i18n.config";
import english from "./en.json";
import arabicOverrides from "./ae";

export type ManasMessages = Record<keyof typeof english, string>;

export const manasLanguages: Record<Locale, string> = {
  en: "en", it: "it", fr: "fr", de: "de", es: "es",
  jp: "ja", kr: "ko", ae: "ar", cn: "zh-CN", ru: "ru",
};

const translations: Partial<Record<Locale, () => Promise<ManasMessages>>> = {
  it: () => import("./it.json").then(module => module.default),
  fr: () => import("./fr.json").then(module => module.default),
  de: () => import("./de.json").then(module => module.default),
  es: () => import("./es.json").then(module => module.default),
  jp: () => import("./jp.json").then(module => module.default),
  kr: () => import("./kr.json").then(module => module.default),
  cn: () => import("./cn.json").then(module => module.default),
  ru: () => import("./ru.json").then(module => module.default),
};

export async function getManasMessages(lang: Locale): Promise<ManasMessages> {
  if (lang === "ae") return { ...english, ...arabicOverrides } as ManasMessages;
  return translations[lang]?.() ?? english;
}
