import styles from './page.module.css'
import Image from 'next/image'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import DownloadApps from './DownloadApps'
import Link from 'next/link'

interface Link {
    text: string;
    url: string;
    icon?: string;
  }
  
  interface Section {
    title: string;
    links?: Link[];
    info?: {
      phone: string;
      email: string;
      address: string;
    };
  }
  
  interface FooterPage {
    download: {
        text: string;
    },
    footer: {
      sections: Section[];
    };
  }

export default async function Footer({ lang }: { lang: Locale }) {
    const response = await getDictionary(lang);
    const { page } = response as { page: FooterPage };
    const currentYear = new Date().getFullYear()
    console.log(lang)
    return (
        <footer className={styles.footer}>
            <div className={styles.download}>
                <h4>{page.download.text}</h4>
                <DownloadApps/>
            </div>
            <div className={styles.footerContainer}>
                {page.footer.sections.map((section, index) => (
                    <div className={styles.footerCol} key={index}>
                    <h3>{section.title}</h3>
                    {section.links ? (
                        section.links.map((link, linkIndex) => (
                        <Link key={linkIndex} href={link.url == "/privacy-policy" ? link.url : "/" + lang + link.url}>
                            {link.icon && (
                                <Image src={`/${link.icon}`} alt={`${link.icon}`} width="20" height="20"/>
                            )}
                            {link.text}
                        </Link>
                        ))
                    ) : (
                        <div>
                        <Link href={`tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}>{section.info?.phone}</Link>
                        <Link href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}>{process.env.NEXT_PUBLIC_EMAIL}</Link>
                        <p>{section.info?.address}</p>
                        </div>
                    )}
                    </div>
                ))}
            </div>
            <div className={styles.copyright}>
                <p>GuideBook of Kyrgyzstan © {currentYear}</p>
            </div>
        </footer>
    )
}