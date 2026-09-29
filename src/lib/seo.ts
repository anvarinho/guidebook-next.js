import type { Locale } from "@/lib/i18n.config";

export const siteUrl = (process.env.NEXT_PUBLIC_URL || "https://central-asia.live").replace(/\/+$/, "");

const hreflangByLocale: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  ru: "ru-RU",
  it: "it-IT",
  jp: "ja-JP",
  kr: "ko-KR",
  ae: "ar-AE",
  cn: "zh-CN",
};

export function absoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.replace(/^\/+/, ""), `${siteUrl}/`).toString();
}

export function localizedAlternates(section: "places" | "tours" | "articles", slug: string) {
  const languages = Object.fromEntries(
    Object.entries(hreflangByLocale).map(([locale, language]) => [
      language,
      absoluteSiteUrl(`${locale}/${section}/${encodeURIComponent(slug)}`),
    ]),
  );
  return {
    ...languages,
    "x-default": absoluteSiteUrl(`en/${section}/${encodeURIComponent(slug)}`),
  };
}

export function cleanSeoText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function metaDescription(...parts: unknown[]): string {
  const text = parts.map(cleanSeoText).filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 110 ? lastSpace : 157).trimEnd()}…`;
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
