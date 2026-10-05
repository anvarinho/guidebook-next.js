import { absoluteSiteUrl, localizedPageAlternates, hreflangByLocale } from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import Intro from "@/app/intro/Intro";
import type { Locale } from "@/lib/i18n.config";
import { getIntroMessages, introLanguages } from "@/app/intro/translations";
import { getDictionary } from "@/lib/dictionary";
import introImages from "../../../public/intro/optimized/manifest.json";
import getBase64 from "@/lib/getLocalBase64";

type HomeProps = { params: { lang: Locale } };

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const messages = await getIntroMessages(params.lang);
  const heroImage = {
    url: absoluteSiteUrl("/intro/optimized/mountain-midground-v3.webp"),
    width: introImages["mountain-midground-v3"].width,
    height: introImages["mountain-midground-v3"].height,
    type: "image/webp",
    alt: messages.metaTitle,
  };
  return {
    title: { absolute: messages.metaTitle },
    description: messages.metaDescription,
    alternates: { canonical: absoluteSiteUrl(params.lang), languages: localizedPageAlternates() },
    openGraph: { title: messages.metaTitle, description: messages.metaDescription,
      url: absoluteSiteUrl(params.lang), type: "website", locale: hreflangByLocale[params.lang].replace("-", "_"),
      images: [heroImage] },
    twitter: { card: "summary_large_image", title: messages.metaTitle, description: messages.metaDescription, images: [heroImage] },
  };
}

export const viewport: Viewport = { themeColor: "#1b3e32" };

export default async function Home({ params }: HomeProps) {
  const [messages, { page }] = await Promise.all([
    getIntroMessages(params.lang), getDictionary(params.lang),
  ]);
  const links = [
    { label: page.sights.name, href: `/${params.lang}/places` },
    { label: page.tours.name, href: `/${params.lang}/tours` },
  ];
  return <Intro key={params.lang} messages={messages} language={introLanguages[params.lang]} locale={params.lang} links={links}
    heroBlurDataURL={getBase64("/intro/optimized/sky-clouds-hero.webp")} />;
}
