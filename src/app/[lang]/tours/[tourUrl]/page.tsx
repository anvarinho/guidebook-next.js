import ArrowIcon from '@/components/ArrowIcon';
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
import { absoluteSiteUrl, localizedAlternates, metaDescription, siteUrl } from "@/lib/seo";

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
              <span aria-hidden="true"><ArrowIcon direction={lang === 'ae' ? 'right' : 'left'}/></span>{page.tours.name}
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
        <Suspense fallback={<LoadingSpinner text={page.loading} detail/>}>
          <PlacesReveal className={styles.heroGallery}>
            <TourGallery images={data.images} name={data.title} lang={lang} priority/>
          </PlacesReveal>
          <div className={styles.overview}>
            {transferMessages && <p className={styles.transferComparison}>
              <Link href={`/${lang}/manas-airport-transfers`}>{transferMessages.s216} <span aria-hidden="true"><ArrowIcon direction="up-right"/></span></Link>
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
  const { page } = await getDictionary(lang);
  const tourPage = page.tours.tourPage;
  const duration = `${tour.days.length} ${tour.days.length === 1 ? tourPage.day : tourPage.days}`;
  const availablePrices = tour.price.filter(price => Number.isFinite(price) && price > 0);
  const startingPrice = availablePrices.length ? Math.min(...availablePrices) : null;
  const description = metaDescription(
    tour.description,
    duration,
    startingPrice === null ? "" : `${tourPage.from} $${startingPrice}`,
  );
  const pageUrl = absoluteSiteUrl(`${lang}/tours/${encodeURIComponent(tour.url)}`);
  const images = tour.images.slice(0, 4).map(image => ({
    url: absoluteSiteUrl(image),
    alt: `${tour.title} in Kyrgyzstan`,
  }));
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: tour.title,
    description,
    keywords: tour.keywords,
    applicationName: "GuideBook of Kyrgyzstan",
    category: "Travel",
    openGraph: {
      title: tour.title,
      description: description,
      url: pageUrl,
      siteName: "GuideBook of Kyrgyzstan",
      images,
      locale: page.langCode.replace("-", "_"),
      type: "website",
    },
    alternates: {
      canonical: pageUrl,
      languages: localizedAlternates("tours", tour.url),
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description: description,
      creator: "@anvarinho",
      images: images.map(image => image.url),
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}
