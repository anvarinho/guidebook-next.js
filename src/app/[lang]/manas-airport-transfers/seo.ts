import type { Locale } from "@/lib/i18n.config";
import { providers, type ProviderId } from "./transfer-data";
import { transferLanguages, type TransferMessages } from "./translations";

const origin = "https://central-asia.live";
export const transferUrl = (lang: Locale) => `${origin}/${lang}/manas-airport-transfers`;
export const transferAlternates = {
  ...Object.fromEntries(Object.entries(transferLanguages).map(([lang, language]) => [language.tag, transferUrl(lang as Locale)])),
  "x-default": transferUrl("en"),
};

// Keep structured answers identical to the visible, translated FAQ.
export const transferFaq = [
  ["s193", "s194"], ["s195", "s196"], ["s197", "s198"],
  ["s199", "s200"], ["s201", "s202"],
] as const;

export function getTransferStructuredData(lang: Locale, messages: TransferMessages) {
  const url = transferUrl(lang);
  const language = transferLanguages[lang].tag;
  const websites: Partial<Record<ProviderId, string>> = {
    central: `${origin}/${lang}/tours/manas-airport-transfers`,
    manas: "https://manastaxi.kg/en",
    advantour: "https://www.advantour.com/kyrgyzstan/transfers/manas_airport-bishkek.htm",
    concept: "https://kyrgyzconcept.kg/en/trp/transfer/",
    welcome: "https://welcome.taxi/en/airports/bsz",
    cat: "https://cat.kg/en/",
  };
  const companyList = Object.entries(providers).map(([id, provider], index) => ({
    "@type": "ListItem", position: index + 1, url: `${url}#provider-${id}`,
    item: {
      "@type": "Organization", "@id": `${url}#company-${id}`,
      name: provider.name, telephone: provider.phone,
      ...(websites[id as ProviderId] ? { url: websites[id as ProviderId] } : {}),
      areaServed: { "@type": "Country", name: messages.s93 },
    },
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": `${url}#webpage`, url,
        name: messages.s250, description: messages.s247, inLanguage: language,
        publisher: { "@type": "Organization", name: "Central Asia", url: `${origin}/${lang}` },
        mainEntity: { "@id": `${url}#providers` },
        breadcrumb: { "@id": `${url}#breadcrumbs` },
        primaryImageOfPage: {
          "@type": "ImageObject", url: `${origin}/manas-airport-transfers/airport-pickup.webp`,
          width: 1280, height: 853, caption: messages.s248,
        },
      },
      {
        "@type": "ItemList", "@id": `${url}#providers`, name: messages.s216,
        description: messages.s251, numberOfItems: companyList.length,
        itemListOrder: "https://schema.org/ItemListUnordered", itemListElement: companyList,
      },
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: messages.s92, item: `${origin}/${lang}` },
          { "@type": "ListItem", position: 2, name: messages.s93, item: `${origin}/${lang}/places` },
          { "@type": "ListItem", position: 3, name: messages.s77, item: url },
        ],
      },
      {
        "@type": "FAQPage", "@id": `${url}#questions`, inLanguage: language,
        isPartOf: { "@id": `${url}#webpage` },
        mainEntity: transferFaq.map(([question, answer]) => ({
          "@type": "Question", name: messages[question],
          acceptedAnswer: { "@type": "Answer", text: messages[answer] },
        })),
      },
      {
        "@type": "Service", "@id": `${url}#transfer-service`, name: messages.s77,
        provider: { "@id": `${url}#company-central` }, url: `${url}#route-search`,
        areaServed: [messages.s245, messages.s104, messages.s105].map(name => ({ "@type": "City", name })),
      },
    ],
  };
}
