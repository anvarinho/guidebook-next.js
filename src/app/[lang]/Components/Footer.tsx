import styles from './footer.module.css'
import Image from 'next/image'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import DownloadApps from './DownloadApps'
import Link from 'next/link'

type FooterSection = {
  title: string
  links?: { text: string; url: string; icon?: string }[]
  info?: { phone: string; email: string; address: string }
}

const appHeadings: Record<Locale, string> = {
  en: 'Kyrgyzstan, in your pocket.',
  fr: 'Le Kirghizistan, dans votre poche.',
  de: 'Kirgisistan für die Hosentasche.',
  es: 'Kirguistán, en tu bolsillo.',
  it: 'Il Kirghizistan, in tasca.',
  ru: 'Кыргызстан у вас в кармане.',
  ae: 'قيرغيزستان في جيبك.',
  cn: '把吉尔吉斯斯坦装进口袋。',
  jp: 'キルギスを、ポケットに。',
  kr: '주머니 속의 키르기스스탄.',
}

export default async function Footer({ lang }: { lang: Locale }) {
  const { page } = await getDictionary(lang)
  const sections: FooterSection[] = page.footer.sections
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
      <div className={styles.inner}>
        <section className={styles.appPanel} aria-labelledby="footer-app-title">
          <div className={styles.appCopy}>
            <h2 id="footer-app-title">{appHeadings[lang]}</h2>
            <p>{page.download.text}</p>
          </div>
          <DownloadApps lang={lang}/>
        </section>

        <div className={styles.grid}>
          <Link href={`/${lang}`} className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true"><Image src="/intro/flag.png" alt="" width={40} height={40}/></span>
            <span>{page.name}</span>
          </Link>
          {sections.map((section, index) => {
            const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || section.info?.phone
            const email = process.env.NEXT_PUBLIC_EMAIL || section.info?.email
            return (
              <section className={`${styles.column} ${section.info ? styles.contact : ''} ${section.links?.some(link => link.icon) ? styles.social : ''}`} aria-labelledby={`footer-section-${index}`} key={section.title}>
                <h3 id={`footer-section-${index}`}>{section.title}</h3>
                {section.links ? (
                  <ul className={styles.links}>
                    {section.links.map(link => {
                      const external = /^https?:\/\//.test(link.url)
                      const href = external || link.url === '/privacy-policy' ? link.url : `/${lang}${link.url}`
                      return <li key={link.url}>
                        <Link href={href} className={styles.link}>
                          {link.icon && <span className={styles.socialIcon} aria-hidden="true">
                            {link.icon === 'twitter.svg' ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/></svg> : <Image src={`/${link.icon}`} alt="" width={18} height={18}/>}
                          </span>}
                          <bdi>{link.text}</bdi>
                        </Link>
                      </li>
                    })}
                  </ul>
                ) : (
                  <address className={styles.contactDetails}>
                    {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}><bdi>{section.info?.phone || phone}</bdi></a>}
                    {email && <a href={`mailto:${email}`}><bdi>{email}</bdi></a>}
                    <p>{section.info?.address}</p>
                  </address>
                )}
              </section>
            )
          })}
        </div>

        <div className={styles.bottom}>
          <p><bdi>© {currentYear} GuideBook of Kyrgyzstan</bdi></p>
          <Link href={`/${lang}/contact`} className={styles.contactLink}>{page.about.buttons.contact_us}<span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </footer>
  )
}
