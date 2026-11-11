import { siteUrl } from "@/lib/seo";
import './globals.css'
import './Components/motion/motion.css'
import type { Metadata } from 'next'
import '../bai-jamjuree.css'
import '../exo-2.css'
import { Locale, i18n } from '@/lib/i18n.config'
import { localeMetadata } from '@/lib/localeMetadata'
import Footer from './Components/Footer'
import FooterVisibility from './Components/FooterVisibility'
import Analytics from './Components/Analytics'
import FontPreloads from './Components/FontPreloads'

import Navbar from './Components/Navbar'
import ContactButton from './Components/ContactButton'
import LanguageShell from './Components/LanguageShell'
import Flags from './Components/Flags'
import Meta from './metalayout';
import { getDictionary } from '@/lib/dictionary'
import { contactInfo } from '@/lib/contactInfo'
import ContactDialog from './contact/components/ContactDialog'

const motionScript = "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='pending'"

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }))
}

export default async function RootLayout(
  props: {
    children: React.ReactNode,
    params: Promise<{ lang: string }>
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const lang = params.lang as Locale
  const { page } = await getDictionary(lang)
  const contact = contactInfo(page)
  return (
    <html lang={localeMetadata[lang].tag} dir={localeMetadata[lang].dir} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Before first paint: allow entrance motion only with JavaScript and no reduced-motion request. */}
        <script dangerouslySetInnerHTML={{ __html: motionScript }}/>
        <FontPreloads lang={lang}/>
        <Meta lang={lang}/>
      </head>

      <body className={['ru', 'kz', 'kg', 'tg', 'uk', 'mn', 'be', 'sr', 'bg', 'mk'].includes(lang) ? 'font-exo-2' : 'font-bai-jamjuree'}>
        {process.env.GOOGLE_ANALYTICS_ID && <Analytics id={process.env.GOOGLE_ANALYTICS_ID}/>}
        <LanguageShell
          loadingLabel={page.loading}
          navbar={<Navbar lang={lang}/>}
          footer={<FooterVisibility><Footer lang={lang}/></FooterVisibility>}
          controls={<><ContactButton lang={lang}/><Flags lang={lang}/></>}
        >
          {children}
        </LanguageShell>
        <ContactDialog lang={lang} title={page.about.buttons.contact_us}
          phone={contact.phone} email={contact.email} address={contact.address}/>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  title: {
    default: "GuideBook of Kyrgyzstan",
    template: `%s | GuideBook of Kyrgyzstan`
  },
  authors:[{name:"Anvar Jumabaev"}],
  applicationName: "GuideBook of Kyrgyzstan",
  description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
  keywords: "Kyrgyzstan travel guide, Central Asia tourism, Bishkek city attractions, Issyk-Kul Lake, Tien Shan mountains, Silk Road history, Karakol trekking routes, Nomadic culture, Ala Archa National Park, Osh bazaar, Cultural festivals, Burana Tower, Kyrgyz cuisine, Son-Kul Lake, Sary-Chelek Nature Reserve, Historical sites, Petroglyphs, Kyrgyz yurts, Horseback riding tours, Pamir Highway, Arslanbob walnut forests, Kyrgyz handicrafts, Nomadic yurt stays, Song Kol horse trek, Sary-Mogol village, Tash Rabat caravanserai, Jyrgalan Valley, Sulaiman-Too Sacred Mountain, Kyrgyz art and music, Cultural etiquette in Kyrgyzstan",
  category: 'Travel',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  openGraph: {
    siteName:"GuideBook of Kyrgyzstan",
    title: "Welcome to Kyrgyzstan! | GuideBook of Kyrgyzstan",
    description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
    url: `${siteUrl}/en/`,
    type: "website",
    images:{
      url: `${siteUrl}/karakolcablelift.jpg`,
      secureUrl: `${siteUrl}/karakolcablelift.jpg`,
      width: 800,
      height: 600,
      alt: "Karakol Cable Lift",
      type:"image/jpeg"
    },
    locale: 'en_US',
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
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
      url: `${siteUrl}/uploads/bozteri.jpg`,
      width: 800,
      height: 600,
      alt: "Boz-Teri valley in Kyrgyzstan"
    }
  }
}
