import type { Locale } from "@/lib/i18n.config"
import { baiFaces, baiFallback, exo2Faces, exo2Fallback, type FontFace } from "@/lib/fontFaces"

/** Locales set in Exo 2 (Cyrillic scripts); every other locale uses Bai Jamjuree. */
export const exo2Locales: string[] = ["ru", "kz", "kg", "tg", "uk", "mn", "be", "sr", "bg", "mk"]

const css = (f: FontFace) =>
  `@font-face{font-family:"${f.family}";font-style:normal;font-weight:${f.weight};font-display:swap;src:url(${f.file}) format("woff2");unicode-range:${f.range}}`

/**
 * Emits only the @font-face rules the locale can use, instead of every subset of both fonts on every page.
 * The browser already downloads only the files a page needs, so this trims HTML/CSS bytes, not font requests.
 * Latin and Latin-extended stay for every locale (numbers, place names); Vietnamese and Thai only where used.
 */
export default function LocaleFonts({ lang }: { lang: Locale }) {
  const exo2 = exo2Locales.includes(lang)
  const wanted = new Set(exo2 ? ["cyrillic", "cyrillic-ext", "latin", "latin-ext"] : ["latin", "latin-ext"])
  if (lang === "vi") wanted.add("vietnamese")
  if (lang === "th") wanted.add("thai")
  const faces = (exo2 ? exo2Faces : baiFaces).filter(f => wanted.has(f.subset))
  const fallback = `@font-face{${exo2 ? exo2Fallback : baiFallback}}`
  const cls = exo2
    ? `.font-exo-2{font-family:"Exo 2","Exo 2 Fallback",sans-serif}`
    : `.font-bai-jamjuree{font-family:"Bai Jamjuree","Bai Jamjuree Fallback",sans-serif}`
  return <style dangerouslySetInnerHTML={{ __html: faces.map(css).join("") + fallback + cls }}/>
}
