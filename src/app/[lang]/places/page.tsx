import { Suspense } from "react";
import getAllPlaces from "@/lib/getAllPlaces";
import styles from './page.module.css'
import { Metadata } from 'next'
import PlaceListItem from "./components/PlaceListItem";
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/lib/i18n.config'
import { LoadMore } from "./load-more";
import LoadingSpinner from "../Components/LoadingSpinner";
import Meta from "./meta";
import { PlacesReveal } from './components/PlacesMotion';
import Link from 'next/link';
import { aboutContent } from '../about/content';

export default async function Places({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const data: Promise<PlaceAlias[]> = getAllPlaces(lang)
    const places = await data
    return (
        <div className={`${styles.main} ${styles.listingPage} ${styles.sleekMotion}`} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
          <Meta lang={lang} places={places} page={page}/>
            <header className={styles.pageIntro}>
              <PlacesReveal className={styles.introTitle}>
                <p className={styles.eyebrow} data-reveal-copy>{page.sights.name}</p>
                <h1 data-reveal-copy>{page.sights.title}</h1>
              </PlacesReveal>
              <PlacesReveal className={styles.introAside} order={1}>
                <p className={styles.description} data-reveal-copy>{page.sights.description}</p>
                <a href="#destinations" className={styles.exploreLink} data-reveal-copy>{page.sights.sights}<span aria-hidden="true">↓</span></a>
              </PlacesReveal>
            </header>
            <section id="destinations" className={styles.featuredSection} aria-label={page.sights.sights}>
              <div className={styles.featuredGrid}>
                {places.slice(0, 3).map((place, i) => <PlaceListItem key={place._id} place={place} lang={lang} priority featured order={i}/>)}
              </div>
            </section>
            <PlacesReveal className={styles.collectionHeading}>
              <h2 data-reveal-copy>{page.sights.sights}</h2>
              <span className={styles.collectionLine} aria-hidden="true"/>
              <span aria-hidden="true">↙</span>
            </PlacesReveal>
            <div className={styles.placesDiv}>
              <div className={styles.placesList}>
                  <Suspense fallback={
                    <div className={styles.loadingSpinnerWrapper}>
                      <LoadingSpinner text={page.loading} />
                    </div>}>
                    {places.slice(3).map((place, i) => <PlaceListItem key={place._id} place={place} lang={lang} priority order={i}/>)}
                    <LoadMore key={lang} lang={lang} initialIds={places.map(place => place._id)}/>
                  </Suspense>
              </div>
            </div>
            <PlacesReveal className={styles.contactPanel}>
              <div><h2 data-reveal-copy>{aboutContent[lang].invitation}</h2><p data-reveal-copy>{aboutContent[lang].invitationBody}</p></div>
              <Link href={`/${lang}/contact`} data-reveal-copy>{page.about.buttons.contact_us}<span aria-hidden="true">↗</span></Link>
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
  const siteUrl = (process.env.NEXT_PUBLIC_URL || '').replace(/\/$/, '')
  const pageUrl = `${siteUrl}/${lang}/places/`
  const description = page.sights.description.replace(/\s+/g, ' ').trim().slice(0, 160)
  const imageUrl = `${siteUrl}/uploads/kel-suu1.jpg`
  return {
      metadataBase: siteUrl ? new URL(`${siteUrl}/`) : undefined,
      title: {
        absolute: page.sights.title
      },
      description,
      keywords: page.sights.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      openGraph: {
        title: page.sights.title,
        description: page.sights.description,
        url: pageUrl,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: imageUrl,
            secureUrl: imageUrl,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.sights.title,
        description: page.sights.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake",
            type:"image/jpeg"
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
          url: pageUrl,
          should_fallback: true,
        }
      },
      alternates: {
        canonical: pageUrl,
        languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/places/`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/places/`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/places/`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/places/`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/places/`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/places/`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/places/`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/places/`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/places/`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/places/`
        }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}
