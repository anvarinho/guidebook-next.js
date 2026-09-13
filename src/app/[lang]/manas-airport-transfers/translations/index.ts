import type { Locale } from "@/lib/i18n.config";
import english from "./en.json";

export type TransferMessages = Record<keyof typeof english, string>;
export type Translate = (text: string, values?: Record<string, string | number>) => string;
export const transferLanguages: Record<Locale, { tag: string; name: string; og: string }> = {
  en: { tag: "en", name: "English", og: "en_US" },
  it: { tag: "it", name: "Italiano", og: "it_IT" },
  fr: { tag: "fr", name: "Français", og: "fr_FR" },
  de: { tag: "de", name: "Deutsch", og: "de_DE" },
  es: { tag: "es", name: "Español", og: "es_ES" },
  jp: { tag: "ja", name: "日本語", og: "ja_JP" },
  kr: { tag: "ko", name: "한국어", og: "ko_KR" },
  ae: { tag: "ar", name: "العربية", og: "ar_AR" },
  cn: { tag: "zh-CN", name: "中文", og: "zh_CN" },
  ru: { tag: "ru", name: "Русский", og: "ru_RU" },
};
const keys = Object.fromEntries(Object.entries(english).map(([key, text]) => [text, key])) as Record<string, keyof TransferMessages>;
export function createTranslator(messages: TransferMessages): Translate {
  return (text, values = {}) => {
    const translated = messages[keys[text]] ?? text;
    return translated.replace(/\{(\w+)\}/g, (token, key: string) => String(values[key] ?? token));
  };
}
