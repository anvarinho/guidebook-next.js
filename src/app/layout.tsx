import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
import Navbar from '@/Components/Navbar'
import ContactButton from '@/Components/ContactButton'
import styles from '@/app/page.module.css'

export const metadata: Metadata = {
    metadataBase: new URL("https://central-asia.live"),
    title: {
      default: "GuideBook of Kyrgyzstan",
      template: `%s | GuideBook of Kyrgyzstan`
    },
    description: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
    category: 'travel',
    openGraph: {
      images: "karakolcablelift.jpg"
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

    // appLinks: {
    //   ios: {
    //     url: 'https://nextjs.org/ios',
    //     app_store_id: 'app_store_id',
    //   },
    //   android: {
    //     package: 'com.example.android/package',
    //     app_name: 'app_name_android',
    //   },
    //   web: {
    //     url: 'https://nextjs.org/web',
    //     should_fallback: true,
    //   },
    // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head/>
      <body className={inter.className}>
        <main className={styles.main}>
          <Navbar/>
          <section className={styles.section}>
          {children}
          </section>
          <ContactButton/>
        </main>
      </body>
    </html>
  )
}
