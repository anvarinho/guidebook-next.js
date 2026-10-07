import type { Metadata, Viewport } from "next";
import "../../cormorant-sc.css";
import assets from "./assets.json";
import Manas from "./Manas";
import { interactiveMessages } from "./interactive-messages";
import ManasContent from "./ManasContent";
import { absoluteSiteUrl, localizedPageAlternates, safeJsonLd, hreflangByLocale } from "@/lib/seo";
import type { Locale } from "@/lib/i18n.config";
import { getManasMessages, manasLanguages } from "./translations";
import "./manas.css";

type PageProps = { params: Promise<{ lang: Locale }> };

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const messages = await getManasMessages(params.lang);
  const title = messages.metaTitle;
  const description = messages.metaDescription;
  return {
  title: { absolute: title },
  description,
  alternates: { canonical: absoluteSiteUrl(`${params.lang}/manas`), languages: localizedPageAlternates("manas") },
  openGraph: {
    title,
    description,
    type: "website",
    url: absoluteSiteUrl(`${params.lang}/manas`),
    locale: hreflangByLocale[params.lang].replace("-", "_"),
    images: [{ url: "/manas/manas-hero.jpg", width: assets["/manas/manas-hero.jpg"].width, height: assets["/manas/manas-hero.jpg"].height, alt: messages.metaImage }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/manas/manas-hero.jpg"] },
  };
}

export const viewport: Viewport = { themeColor: [
  { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  { media: '(prefers-color-scheme: dark)', color: '#000000' },
] };

export default async function ManasPage(props: PageProps) {
  const params = await props.params;
  const messages = await getManasMessages(params.lang);
  return <Manas className="font-manas-panel" key={params.lang} messages={interactiveMessages(messages)} language={manasLanguages[params.lang]}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd({
    "@context": "https://schema.org", "@type": "WebPage",
    name: messages.metaTitle, description: messages.metaDescription,
    url: absoluteSiteUrl(`${params.lang}/manas`), inLanguage: manasLanguages[params.lang],
    image: absoluteSiteUrl("manas/manas-hero.jpg"),
    isPartOf: { "@type": "WebSite", name: "GuideBook of Kyrgyzstan", url: absoluteSiteUrl("/") },
  }) }} /><ManasContent messages={messages} /></Manas>;
}
