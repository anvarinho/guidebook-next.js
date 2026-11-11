import { isRtlLocale, localeMetadata } from '@/lib/localeMetadata';
import { localizedPageAlternates } from "@/lib/seo";
import type { Metadata } from 'next'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { contactInfo } from '@/lib/contactInfo'
import { contactCopy } from './content'
import styles from './components/contact-dialog.module.css'

export default async function ContactPage(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;

  const {
    lang
  } = params;

  const { page } = await getDictionary(lang)
  const { email, phone } = contactInfo(page)
  return (
    <main className={styles.landing} dir={isRtlLocale(lang) ? 'rtl' : 'ltr'}>
      <h1>{page.about.buttons.contact_us}</h1>
      <p>{contactCopy[lang].intro}</p>
      <a href={`mailto:${email}`}><bdi>{email}</bdi></a>
      <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}><bdi>{phone}</bdi></a>
      <Link href={`/${lang}`} translate="no" lang="en" dir="ltr">{page.name}</Link>
    </main>
  );
}

export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const params = await props.params;

  const {
    lang
  } = params;

  const { page } = await getDictionary(lang)
  const title = page.about.buttons.contact_us
  const description = contactCopy[lang].intro
  return {
    title, description,
    alternates: { canonical: `/${lang}/contact`, languages: localizedPageAlternates("contact") },
    openGraph: { title, description, url: `/${lang}/contact`, locale: localeMetadata[lang].og, type: 'website' },
  }
}
