import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Locale, i18n } from '@/lib/i18n.config'
import Footer from './Components/Footer'

const inter = Inter({ subsets: ['latin'] })
import Navbar from './Components/Navbar'
import ContactButton from './Components/ContactButton'
import styles from './page.module.css'
import Flags from './Components/Flags'


export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }))
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { lang: Locale }
}) {
  return (
    <html lang={params.lang}>
      <head/>
      <body className={inter.className}>
        <main className={styles.main}>
          <Navbar lang={params.lang}/>
          <section className={styles.section}>
          {children}
          <Footer lang={params.lang}/>
          </section>
          <ContactButton/>
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
  description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
  keywords: "Kyrgyzstan travel guide, Central Asia tourism, Bishkek city attractions, Issyk-Kul Lake, Tien Shan mountains, Silk Road history, Karakol trekking routes, Nomadic culture, Ala Archa National Park, Osh bazaar, Cultural festivals, Burana Tower, Kyrgyz cuisine, Son-Kul Lake, Sary-Chelek Nature Reserve, Historical sites, Petroglyphs, Kyrgyz yurts, Horseback riding tours, Pamir Highway, Arslanbob walnut forests, Kyrgyz handicrafts, Nomadic yurt stays, Song Kol horse trek, Sary-Mogol village, Tash Rabat caravanserai, Jyrgalan Valley, Sulaiman-Too Sacred Mountain, Kyrgyz art and music, Cultural etiquette in Kyrgyzstan",
  category: 'travel',
  openGraph: {
    images: "karakolcablelift.jpg",
  },
  verification: {
    google: "google-site-verification=353073521"
  },
  appLinks: {
    ios: {
      url: "https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810",
      app_store_id: "id1575382810"
    },
    android: {
      package: "com.anvarinho.guidebook",
      app_name: "GuideBook of Kyrgyzstan"
    },
    web: {
      url: "https://central-asia.live",
      should_fallback: true,
    }
  }
}
