import ArrowIcon from '@/components/ArrowIcon';
import { siteUrl, absoluteSiteUrl, localizedPageAlternates } from "@/lib/seo";
import React, { Suspense } from "react";
import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import getAllTours from '@/lib/getAllTours'
import TourListItem from './components/TourListItem'
import LoadingSpinner from '../Components/LoadingSpinner'
import Meta from "./meta";
import shared from '../places/page.module.css';
import { PlacesReveal } from '../places/components/PlacesMotion';
import Link from 'next/link';
import { aboutContent } from '../about/content';

export default async function Tours({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const [{ page }, toursData] = await Promise.all([getDictionary(lang), getAllTours(lang)]);

    return (
      <div className={`${shared.main} ${shared.listingPage}`} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
        <Meta lang={lang} tours={toursData} page={page} />
        <header className={shared.pageIntro}>
          <PlacesReveal className={shared.introTitle}>
            <p className={shared.eyebrow}>{page.tours.name}</p>
            <h1>{page.tours.title}</h1>
          </PlacesReveal>
          <PlacesReveal className={shared.introAside} order={1}>
            <p className={shared.description}>{page.tours.description}</p>
            <a href="#tours" className={shared.exploreLink}>{page.tours.name}<span aria-hidden="true"><ArrowIcon direction="down"/></span></a>
          </PlacesReveal>
        </header>
        <Suspense fallback={<LoadingSpinner text={page.loading}/>}>
          <section id="tours" className={shared.featuredSection} aria-label={page.tours.name}>
            <div className={`${shared.featuredGrid} ${styles.featuredGrid}`}>
              {toursData.slice(0, 3).map((tour, i) => <TourListItem key={tour._id} tour={tour} lang={lang} featured order={i}/>)}
            </div>
            {toursData.length > 3 && <>
              <PlacesReveal className={shared.collectionHeading}>
                <h2>{page.tours.name}</h2>
                <span className={shared.collectionLine} aria-hidden="true"/>
                <span aria-hidden="true"><ArrowIcon direction="down-left"/></span>
              </PlacesReveal>
              <div className={shared.placesList}>
                {toursData.slice(3).map((tour, i) => <TourListItem key={tour._id} tour={tour} lang={lang} order={i}/>)}
              </div>
            </>}
          </section>
        </Suspense>
        <section className={styles.story} aria-labelledby="tour-story-title">
          <PlacesReveal><h2 id="tour-story-title">{page.tours.subtitle}</h2></PlacesReveal>
          <div className={styles.storyCopy}>
            {page.tours.description1.split(/\r?\n\s*\r?\n/).filter(Boolean).map((paragraph, i) => (
              <PlacesReveal key={i}><p>{paragraph}</p></PlacesReveal>
            ))}
          </div>
        </section>
        <PlacesReveal className={shared.contactPanel}>
          <div><h2>{aboutContent[lang].invitation}</h2><p>{aboutContent[lang].invitationBody}</p></div>
          <Link href={`/${lang}/contact`}>{page.about.buttons.contact_us}<span aria-hidden="true"><ArrowIcon direction="up-right"/></span></Link>
        </PlacesReveal>
      </div>
    )
}

export async function generateMetadata({
  params: {lang}
}: {
  params: {lang : Locale}
}): Promise<Metadata> {
  const { page } = await getDictionary(lang)
  const description = page.tours.description.substring(0, 159)
  return {
    title: {
      absolute: page.tours.title
    },
    description: description,
    keywords: page.tours.keywords,
    applicationName:"GuideBook of Kyrgyzstan",
    category: "Travel",
      openGraph: {
        title: page.tours.title,
        description: description,
        url: `${siteUrl}/${lang}/tours/`,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${siteUrl}/uploads/kel-suu1.jpg`,
            secureUrl: `${siteUrl}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake",
            type:"image/jpeg"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.tours.title,
        description: description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: `${siteUrl}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        }
      },
      appLinks: {
        ios: {
          url: "https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810",
          app_store_id: "id1575382810",
          app_name: "GuideBook of Kyrgyzstan"
        },
        android: {
          url: "https://play.google.com/store/apps/details?id=com.anvarinho.guidebook",
          package: "com.anvarinho.guidebook",
          app_name: "GuideBook of Kyrgyzstan"
        },
        web: {
          url: `${siteUrl}/${lang}/tours`,
          should_fallback: true,
        }
      },
      alternates: {
        canonical: `${siteUrl}/${lang}/tours/`,
        languages: localizedPageAlternates("tours")
    },
  }
}
