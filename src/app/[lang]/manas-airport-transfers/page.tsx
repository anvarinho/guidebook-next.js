import type { Metadata, Viewport } from "next";
import type { Locale } from "@/lib/i18n.config";
import Transfers from "./Transfers";
import { TransferI18n } from "./TransferI18n";
import { getTransferMessages } from "./translations/load";
import { transferLanguages } from "./translations";
import { getTransferStructuredData, transferAlternates, transferUrl } from "./seo";

const image = { url: "/manas-airport-transfers/airport-pickup.webp", width: 1280, height: 853, alt: "AI-generated illustration of an airport pickup" };
type PageProps = { params: { lang: Locale } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const messages = await getTransferMessages(params.lang);
  const url = transferUrl(params.lang);
  const localizedImage = { ...image, alt: messages.s248 };
  return {
    title: { absolute: messages.s246 }, description: messages.s247,
    alternates: { canonical: url, languages: transferAlternates },
    authors: [{ name: "Central Asia · GuideBook of Kyrgyzstan" }],
    robots: { index: true, follow: true, "max-image-preview": "large" },
    openGraph: { title: messages.s246, description: messages.s247, url, siteName: "Central Asia", type: "website", locale: transferLanguages[params.lang].og, alternateLocale: Object.entries(transferLanguages).filter(([lang]) => lang !== params.lang).map(([, language]) => language.og), images: [localizedImage] },
    twitter: { card: "summary_large_image", title: messages.s246, description: messages.s247, images: [localizedImage] },
  };
}
export const viewport: Viewport = { themeColor: "#f8f7f4" };

export default async function TransfersPage({ params }: PageProps) {
  const messages = await getTransferMessages(params.lang);
  const jsonLd = JSON.stringify(getTransferStructuredData(params.lang, messages)).replace(/</g, "\\u003c");
  return <TransferI18n messages={messages}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    <Transfers lang={params.lang} />
  </TransferI18n>;
}
