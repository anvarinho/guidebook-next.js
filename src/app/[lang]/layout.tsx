import './globals.css'
import type { Metadata } from 'next'
import { Bai_Jamjuree, Exo_2 } from 'next/font/google'
import { Locale, i18n } from '@/lib/i18n.config'
import Footer from './Components/Footer'
import { GoogleAnalytics } from '@next/third-parties/google'

import Navbar from './Components/Navbar'
import ContactButton from './Components/ContactButton'
import styles from './page.module.css'
import Flags from './Components/Flags'
import Meta from './metalayout';

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }))
}

const font = Bai_Jamjuree({weight: ['200','300','400','500','600','700'],style: 'normal', subsets: ['latin'], display: 'swap' })
const russianfont = Exo_2({weight: ['200','300','400','500','600','700'],style: 'normal',subsets: ['cyrillic'], display: 'swap' })

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { lang: Locale }
}) {
  return (
    <html lang={params.lang}>
      <head>
        {/* <title>GuideBook of Kyrgyzstan</title> */}
        <link rel="shortcut icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <Meta lang={params.lang}/>
      </head>
      <GoogleAnalytics gaId={`${process.env.GOOGLE_ANALYTICS_ID}`}/>
      {/* <GoogleTagManager gtmId={`${process.env.GOOGLE_TAGS_ID}`}/> */}
      <body className={params.lang === 'ru' ? russianfont.className : font.className}>
        <main className={styles.main}>
          <Navbar lang={params.lang}/>
          <section className={styles.section}>
          {children}
          </section>
          <Footer lang={params.lang}/>
          <ContactButton lang={params.lang}/>
          <Flags lang={params.lang}/>
        </main>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL("https://central-asia.live"),
  title: {
    default: "GuideBook of Kyrgyzstan",
    template: `%s | GuideBook of Kyrgyzstan`
  },
  authors:[{name:"Anvar Jumabaev"}],
  applicationName: "GuideBook of Kyrgyzstan",
  description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
  keywords: "Kyrgyzstan travel guide, Central Asia tourism, Bishkek city attractions, Issyk-Kul Lake, Tien Shan mountains, Silk Road history, Karakol trekking routes, Nomadic culture, Ala Archa National Park, Osh bazaar, Cultural festivals, Burana Tower, Kyrgyz cuisine, Son-Kul Lake, Sary-Chelek Nature Reserve, Historical sites, Petroglyphs, Kyrgyz yurts, Horseback riding tours, Pamir Highway, Arslanbob walnut forests, Kyrgyz handicrafts, Nomadic yurt stays, Song Kol horse trek, Sary-Mogol village, Tash Rabat caravanserai, Jyrgalan Valley, Sulaiman-Too Sacred Mountain, Kyrgyz art and music, Cultural etiquette in Kyrgyzstan",
  category: 'Travel',
  openGraph: {
    siteName:"GuideBook of Kyrgyzstan",
    title: "Welcome to Kyrgyzstan! | GuideBook of Kyrgyzstan",
    description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
    url: `${process.env.NEXT_PUBLIC_URL}/en/`,
    type: "website",
    images:{
      url: `${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
      secureUrl: `${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
      width: 800,
      height: 600,
      alt: "Karakol Cable Lift",
      type:"image/jpeg"
    },
    locale: 'en_US',
  },
  verification: {
    google: "google-site-verification=353073521"
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
      url: "https://central-asia.live",
      should_fallback: true,
    }
  },
  twitter:{
    card:"summary_large_image",
    title: "Welcome to Kyrgyzstan!",
    description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
    images:{
      url: `${process.env.NEXT_PUBLIC_URL}/uploads/bozteri.jpg`,
      width: 800,
      height: 600,
      alt: "Karakol Cable Lift"
    }
  }
}