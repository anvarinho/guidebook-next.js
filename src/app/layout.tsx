import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
import Navbar from '@/Components/Navbar'
import ContactButton from '@/Components/ContactButton'
import styles from '@/app/page.module.css'

export const metadata: Metadata = {
  title: 'GuideBook',
  description: 'GuideBook of Kyrgyzstan',
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
