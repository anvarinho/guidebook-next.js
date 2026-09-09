import type { Locale } from "@/lib/i18n.config";
import type english from "./en.json";

export type IntroMessages = Record<keyof typeof english, string>;

export const introLanguages: Record<Locale, string> = {
  en: "en", it: "it", fr: "fr", de: "de", es: "es",
  jp: "ja", kr: "ko", ae: "ar", cn: "zh-CN", ru: "ru",
};

// Load only the requested translation on the server, then pass it to the intro.
const dictionaries: Record<Locale, () => Promise<IntroMessages>> = {
  en: () => import("./en.json").then(module => module.default),
  it: () => import("./it.json").then(module => module.default),
  fr: () => import("./fr.json").then(module => module.default),
  de: () => import("./de.json").then(module => module.default),
  es: () => import("./es.json").then(module => module.default),
  jp: () => import("./jp.json").then(module => module.default),
  kr: () => import("./kr.json").then(module => module.default),
  ae: () => import("./ae.json").then(module => module.default),
  cn: () => import("./cn.json").then(module => module.default),
  ru: () => import("./ru.json").then(module => module.default),
};

export function getIntroMessages(lang: Locale): Promise<IntroMessages> {
  return dictionaries[lang]();
}
