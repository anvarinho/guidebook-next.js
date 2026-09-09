import type { Metadata, Viewport } from "next";
import Intro from "@/app/intro/Intro";
import type { Locale } from "@/lib/i18n.config";
import { getIntroMessages, introLanguages } from "@/app/intro/translations";

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
  const messages = await getIntroMessages(params.lang);
  return <Intro key={params.lang} messages={messages} language={introLanguages[params.lang]} />;
}
