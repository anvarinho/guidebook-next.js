import type { Metadata, Viewport } from "next";
import Intro from "@/app/intro/Intro";
import type { Locale } from "@/lib/i18n.config";
import { getIntroMessages, introLanguages } from "@/app/intro/translations";
import { getDictionary } from "@/lib/dictionary";
import { getTransferMessages } from "./manas-airport-transfers/translations/load";

type HomeProps = { params: { lang: Locale } };

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const messages = await getIntroMessages(params.lang);
  return {
    title: { absolute: messages.metaTitle },
    description: messages.metaDescription,
    icons: { icon: "/intro/flag.png" },
  };
}

export const viewport: Viewport = { themeColor: "#1b3e32" };

export default async function Home({ params }: HomeProps) {
  const [messages, { page }, transfers] = await Promise.all([
    getIntroMessages(params.lang), getDictionary(params.lang), getTransferMessages(params.lang),
  ]);
  const links = [
    { label: page.sights.name, href: `/${params.lang}/places`, image: "/manas-airport-transfers/karakol-road-640.webp" },
    { label: page.tours.name, href: `/${params.lang}/tours`, image: "/manas-airport-transfers/cholpon-ata-lake-640.webp" },
    { label: page.articles.name, href: `/${params.lang}/articles`, image: "/manas/manas-hero.jpg" },
    { label: transfers.s77, href: `/${params.lang}/manas-airport-transfers`, image: "/manas-airport-transfers/airport-pickup-640.webp" },
  ];
  return <Intro key={params.lang} messages={messages} language={introLanguages[params.lang]} locale={params.lang} links={links} />;
}
