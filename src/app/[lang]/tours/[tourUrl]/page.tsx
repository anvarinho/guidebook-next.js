import { isRtlLocale } from '@/lib/localeMetadata';
import ArrowIcon from '@/components/ArrowIcon';
import { Locale } from "@/lib/i18n.config";
import getTour from "@/lib/getTour";
import styles from "./page.module.css";
import shared from "../../places/page.module.css";
import { Metadata } from "next";
import { Suspense } from "react";
import BrandLoader from "../../Components/BrandLoader";
import DayView from "./DayView";
import { getDictionary } from "@/lib/dictionary";
import { formatTourDuration } from '@/lib/formatTourDuration';
import Link from "next/link";
import Meta from "./meta";
import { notFound } from "next/navigation";
import TourGallery from "./TourGallery";
import TourDescription from "./TourDescription";
import HeroOverlay from "../../Components/motion/HeroOverlay";
import SectionDots from "../../Components/SectionDots";
import { getTransferMessages } from "../../manas-airport-transfers/translations/load";
import { absoluteSiteUrl, localizedAlternates, metaDescription, siteUrl } from "@/lib/seo";

export const revalidate = 60;
export async function generateStaticParams() { return []; }

type Params = {
  params: Promise<{ tourUrl: string; lang: Locale }>;
};

export default async function Tour(props: Params) {
  const params = await props.params;

  const {
    tourUrl,
    lang
  } = params;

  const { page } = await getDictionary(lang);
  const data = await getTour(tourUrl, lang);
  if (!data) notFound();
  const t = page.tours.tourPage;
  const preparation = page.tours.TourPreparation;
  const transferMessages = tourUrl === "manas-airport-transfers" ? await getTransferMessages(lang) : null;
  const dir = isRtlLocale(lang) ? 'rtl' : 'ltr';
  const duration = formatTourDuration(data.days.length, lang);
  const sections = [
    { id: 'tour-overview', label: data.title },
    { id: 'itinerary', label: t.details },
    { id: 'note', label: t.addInfo },
    { id: 'essentials', label: preparation.title },
  ];

  return (
    <div className={styles.main} dir={dir}>
      <Meta lang={lang} tour={data} page={page} />
      <article>
        <header className={styles.header} data-hero-header>
          <div className={styles.heading} data-intro="0">
            <Link href={`/${lang}/tours`} className={styles.breadcrumb}>
              <span aria-hidden="true"><ArrowIcon direction={isRtlLocale(lang) ? 'right' : 'left'}/></span>{page.tours.name}
            </Link>
            <h1>{data.title}</h1>
          </div>
          <div className={styles.summaryCard} data-intro="1">
            <p className={styles.priceLabel}>{t.from}</p>
            <p className={styles.heroPrice}><bdi>${data.price[data.price.length - 1]}</bdi></p>
            <dl className={styles.facts}>
              <div><dt>{t.duration}</dt><dd>{duration}</dd></div>
              <div><dt>{t.level}</dt><dd>{data.level}</dd></div>
            </dl>
            <a href="#itinerary" className={styles.detailsLink}>
              {t.details}<span className={shared.cardArrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
            </a>
          </div>
        </header>
        <Suspense fallback={<BrandLoader label={page.loading}/>}>
          <div id="tour-overview" className={styles.heroGallery} data-hero-track>
            <div data-hero-sticky>
              <TourGallery images={data.images} name={data.title} lang={lang} priority>
                <HeroOverlay dir={dir} eyebrow={page.tours.name} title={data.title} cards={[
                  { value: `$${data.price[data.price.length - 1]}`, text: t.from },
                  { value: duration, text: t.duration },
                  { value: data.level, text: t.level },
                ]}/>
              </TourGallery>
            </div>
          </div>
          <div className={styles.overview} data-reveal>
            {transferMessages && <p className={styles.transferComparison}>
              <Link href={`/${lang}/manas-airport-transfers`}>{transferMessages.s216} <span aria-hidden="true"><ArrowIcon direction="up-right"/></span></Link>
            </p>}
            <TourDescription description={data.description} lang={lang} />
          </div>
          <section id="itinerary" className={styles.itinerary} aria-labelledby="itinerary-title">
            <div className={styles.sectionHeading} data-reveal>
              <h2 id="itinerary-title">{t.details}</h2><span aria-hidden="true"/>
            </div>
            <nav className={styles.daysNavigation} aria-label={t.details} data-reveal="fade">
              {data.days.map((_, index) => <a href={`#day${index + 1}`} key={index}>{t.day} {index + 1}</a>)}
              <a href="#note">{t.note}</a>
            </nav>
            <div className={styles.days}>
              {data.days.map((day, index) => <DayView key={index} params={{ day, index, lang }}/>) }
            </div>
          </section>
          <section className={styles.extra} id="note" aria-labelledby="info-title">
            <div className={styles.sectionHeading} data-reveal>
              <h2 id="info-title">{t.addInfo}</h2><span aria-hidden="true"/>
            </div>
            <div className={styles.infoList}>
              {data.price.length > 1 && <div className={styles.infoCard} data-reveal>
                <h3>{t.price}</h3>
                <table className={styles.pricingTable}>
                  <tbody>{data.price.map((fee, index) => <tr key={index}>
                    <th scope="row">{index + 1} {index === data.price.length - 1 ? t.andMore : index === 0 ? t.person : t.persons}</th>
                    <td><bdi>${fee}</bdi></td>
                  </tr>)}</tbody>
                </table>
              </div>}
              <div className={styles.infoCard} data-reveal>
                <h3>{t.includings}</h3>
                <ul className={styles.included}>{data.includings.map((text, index) => <li key={index}>{text}</li>)}</ul>
              </div>
              <div className={styles.infoCard} data-reveal>
                <h3>{t.excludings}</h3>
                <ul className={styles.excluded}>{data.excludings.map((text, index) => <li key={index}>{text}</li>)}</ul>
              </div>
            </div>
          </section>
          <section id="essentials" className={styles.essentials} aria-labelledby="essentials-title">
            <div className={styles.essentialsIntro} data-reveal>
              <p className={shared.eyebrow}>{t.note}</p>
              <h2 id="essentials-title">{preparation.title}</h2>
              <p>{preparation.Description}</p>
            </div>
            <div className={styles.packingList}>
              {Object.entries(preparation.Options).map(([key, value]) => <div key={key} data-reveal>
                <div className={styles.packingItem}><h3>{key}</h3><p>{value}</p></div>
              </div>)}
              <p className={styles.preparationNote}>{preparation.overview}</p>
            </div>
          </section>
        </Suspense>
        <SectionDots sections={sections} lang={lang} dir={dir}/>
      </article>
    </div>
  );
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;

  const {
    tourUrl,
    lang
  } = params;

  const tourData = getTour(tourUrl, lang);
  const tour = await tourData;
  if (!tour) notFound();
  const { page } = await getDictionary(lang);
  const tourPage = page.tours.tourPage;
  const duration = formatTourDuration(tour.days.length, lang);
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
