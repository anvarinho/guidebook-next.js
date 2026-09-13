import "server-only";
import type { Locale } from "@/lib/i18n.config";
import type { TransferMessages } from "./index";

const dictionaries: Record<Locale, () => Promise<TransferMessages>> = {
  en: () => import("./en.json").then(m => m.default),
  it: () => import("./it.json").then(m => m.default),
  fr: () => import("./fr.json").then(m => m.default),
  de: () => import("./de.json").then(m => m.default),
  es: () => import("./es.json").then(m => m.default),
  jp: () => import("./jp.json").then(m => m.default),
  kr: () => import("./kr.json").then(m => m.default),
  ae: () => import("./ae.json").then(m => m.default),
  cn: () => import("./cn.json").then(m => m.default),
  ru: () => import("./ru.json").then(m => m.default),
};
export const getTransferMessages = (lang: Locale) => dictionaries[lang]();
