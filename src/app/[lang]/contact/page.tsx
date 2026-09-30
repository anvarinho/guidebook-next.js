import { localizedPageAlternates } from "@/lib/seo";
import type { Metadata } from 'next'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { contactCopy } from './content'
import styles from './components/contact-dialog.module.css'

export default async function ContactPage({ params: { lang } }: { params: { lang: Locale } }) {
  const { page } = await getDictionary(lang)
  const contact = page.footer.sections.find(section => section.info)?.info
  const email = process.env.NEXT_PUBLIC_EMAIL || contact?.email || 'anvarinho@gmail.com'
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || contact?.phone || '+996 500 490 806'
  return <main className={styles.landing} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
    <h1>{page.about.buttons.contact_us}</h1>
    <p>{contactCopy[lang].intro}</p>
    <a href={`mailto:${email}`}><bdi>{email}</bdi></a>
    <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}><bdi>{phone}</bdi></a>
    <Link href={`/${lang}`}>{page.name}</Link>
  </main>
}

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
  const { page } = await getDictionary(lang)
  return { title: page.about.buttons.contact_us, description: contactCopy[lang].intro, alternates: { canonical: `/${lang}/contact`, languages: localizedPageAlternates("contact") } }
}
