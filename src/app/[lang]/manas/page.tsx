import type { Metadata, Viewport } from "next";
import Manas from "./Manas";
import ManasContent from "./ManasContent";
import type { Locale } from "@/lib/i18n.config";
import { getManasMessages, manasLanguages } from "./translations";
import "./manas.css";

type PageProps = { params: { lang: Locale } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const messages = await getManasMessages(params.lang);
  const title = messages.metaTitle;
  const description = messages.metaDescription;
  return {
  title: { absolute: title },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/manas/manas-hero.jpg", width: 1983, height: 793, alt: messages.metaImage }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/manas/manas-hero.jpg"] },
  };
}

export const viewport: Viewport = { themeColor: [
  { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  { media: '(prefers-color-scheme: dark)', color: '#000000' },
] };

export default async function ManasPage({ params }: PageProps) {
  const messages = await getManasMessages(params.lang);
  return <Manas key={params.lang} messages={messages} language={manasLanguages[params.lang]}><ManasContent messages={messages} /></Manas>;
}
