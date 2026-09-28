import { Locale } from "@/lib/i18n.config";
import getTour from "@/lib/getTour";
import styles from "./page.module.css";
import shared from "../../places/page.module.css";
import { Metadata } from "next";
import { Suspense } from "react";
import LoadingSpinner from "../../Components/LoadingSpinner";
import DayView from "./DayView";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import Meta from "./meta";
import { notFound } from "next/navigation";
import TourGallery from "./TourGallery";
import TourDescription from "./TourDescription";
import { PlacesReveal } from "../../places/components/PlacesMotion";
import { getTransferMessages } from "../../manas-airport-transfers/translations/load";

type Params = {
  params: { tourUrl: string; lang: Locale };
};

export default async function Tour({ params: { tourUrl, lang } }: Params) {
  const { page } = await getDictionary(lang);
  const data: TourInfo = await getTour(tourUrl, lang);
  if (!data) notFound();
  const t = page.tours.tourPage;
  const preparation = page.tours.TourPreparation;
  const transferMessages = tourUrl === "manas-airport-transfers" ? await getTransferMessages(lang) : null;

  return (
    <div className={styles.main} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
      <Meta lang={lang} tour={data} page={page} />
      <article>
        <header className={styles.header}>
          <PlacesReveal className={styles.heading}>
            <Link href={`/${lang}/tours`} className={styles.breadcrumb}>
              <span aria-hidden="true">{lang === 'ae' ? '→' : '←'}</span>{page.tours.name}
            </Link>
            <h1>{data.title}</h1>
          </PlacesReveal>
          <PlacesReveal className={styles.summaryCard} order={1}>
            <p className={styles.priceLabel}>{t.from}</p>
            <p className={styles.heroPrice}><bdi>${data.price[data.price.length - 1]}</bdi></p>
            <dl className={styles.facts}>
              <div><dt>{t.duration}</dt><dd>{data.days.length} {data.days.length === 1 ? t.day : t.days}</dd></div>
              <div><dt>{t.level}</dt><dd>{data.level}</dd></div>
            </dl>
            <a href="#itinerary" className={styles.detailsLink}>
              {t.details}<span className={shared.cardArrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
            </a>
          </PlacesReveal>
        </header>
        <Suspense fallback={<LoadingSpinner text={page.loading} />}>
          <PlacesReveal className={styles.heroGallery}>
            <TourGallery images={data.images} name={data.title} lang={lang} priority/>
          </PlacesReveal>
          <div className={styles.overview}>
            {transferMessages && <p className={styles.transferComparison}>
              <Link href={`/${lang}/manas-airport-transfers`}>{transferMessages.s216} <span aria-hidden="true">↗</span></Link>
            </p>}
            <TourDescription description={data.description} lang={lang} />
          </div>
          <section id="itinerary" className={styles.itinerary} aria-labelledby="itinerary-title">
            <PlacesReveal className={styles.sectionHeading}>
              <h2 id="itinerary-title">{t.details}</h2><span aria-hidden="true"/>
            </PlacesReveal>
            <nav className={styles.daysNavigation} aria-label={t.details}>
              {data.days.map((_, index) => <a href={`#day${index + 1}`} key={index}>{t.day} {index + 1}</a>)}
              <a href="#note">{t.note}</a>
            </nav>
            <div className={styles.days}>
              {data.days.map((day, index) => <DayView key={index} params={{ day, index, lang }}/>) }
            </div>
          </section>
          <section className={styles.extra} id="note" aria-labelledby="info-title">
            <PlacesReveal className={styles.sectionHeading}>
              <h2 id="info-title">{t.addInfo}</h2><span aria-hidden="true"/>
            </PlacesReveal>
            <div className={styles.infoList}>
              {data.price.length > 1 && <PlacesReveal className={styles.infoCard}>
                <h3>{t.price}</h3>
                <table className={styles.pricingTable}>
                  <tbody>{data.price.map((fee, index) => <tr key={index}>
                    <th scope="row">{index + 1} {index === data.price.length - 1 ? t.andMore : index === 0 ? t.person : t.persons}</th>
                    <td><bdi>${fee}</bdi></td>
                  </tr>)}</tbody>
                </table>
              </PlacesReveal>}
              <PlacesReveal className={styles.infoCard} order={1}>
                <h3>{t.includings}</h3>
                <ul className={styles.included}>{data.includings.map((text, index) => <li key={index}>{text}</li>)}</ul>
              </PlacesReveal>
              <PlacesReveal className={styles.infoCard} order={2}>
                <h3>{t.excludings}</h3>
                <ul className={styles.excluded}>{data.excludings.map((text, index) => <li key={index}>{text}</li>)}</ul>
              </PlacesReveal>
            </div>
          </section>
          <section className={styles.essentials} aria-labelledby="essentials-title">
            <PlacesReveal className={styles.essentialsIntro}>
              <p className={shared.eyebrow}>{t.note}</p>
              <h2 id="essentials-title">{preparation.title}</h2>
              <p>{preparation.Description}</p>
            </PlacesReveal>
            <div className={styles.packingList}>
              {Object.entries(preparation.Options).map(([key, value]) => <PlacesReveal key={key}>
                <div className={styles.packingItem}><h3>{key}</h3><p>{value}</p></div>
              </PlacesReveal>)}
              <p className={styles.preparationNote}>{preparation.overview}</p>
            </div>
          </section>
        </Suspense>
      </article>
    </div>
  );
}

export async function generateMetadata({
  params: { tourUrl, lang },
}: Params): Promise<Metadata> {
  const tourData: Promise<TourInfo> = getTour(tourUrl, lang);
  const tour = await tourData;
  if (!tour) notFound();
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const description = tour.description.substring(0, 159);
  const { page } = await getDictionary(lang);
  return {
    title: {
      absolute: tour.title,
    },
    description: description,
    keywords: tour.keywords,
    applicationName: "GuideBook of Kyrgyzstan",
    category: "Travel",
    openGraph: {
      title: tour.title + " | " + "GuideBook of Kyrgyzstan",
      description: description,
      url: `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tour.url}`,
      siteName: "GuideBook of Kyrgyzstan",
      images: {
        url: `${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`,
        secureUrl: `${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`,
        width: 800,
        height: 600,
        alt: tour.title,
        type: "image/jpeg",
      },
      locale: page.langCode.replace("-", "_"),
      type: "website",
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tour.url}`,
      languages: {
        "en-US": `${process.env.NEXT_PUBLIC_URL}/en/tours/${tour.url}`,
        "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/tours/${tour.url}`,
        "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/tours/${tour.url}`,
        "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/tours/${tour.url}`,
        "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/tours/${tour.url}`,
        "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/tours/${tour.url}`,
        "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/tours/${tour.url}`,
        "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/tours/${tour.url}`,
        "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/tours/${tour.url}`,
        "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/tours/${tour.url}`,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description: description,
      siteId: "",
      creator: "@anvarinho",
      creatorId: "@anvarinho",
      images: {
        url: `${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`,
        width: 800,
        height: 600,
        alt: tour.title,
      },
    },
    appLinks: {
      ios: {
        url: "https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810",
        app_store_id: "id1575382810",
        app_name: "GuideBook of Kyrgyzstan",
      },
      android: {
        url: "https://play.google.com/store/apps/details?id=com.anvarinho.guidebook",
        package: "com.anvarinho.guidebook",
        app_name: "GuideBook of Kyrgyzstan",
      },
      web: {
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tour.url}`,
        should_fallback: true,
      },
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}
