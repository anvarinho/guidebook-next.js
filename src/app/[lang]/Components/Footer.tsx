import styles from './page.module.css'
import Image from 'next/image'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import DownloadApps from './DownloadApps'

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
                        <a key={linkIndex} href={link.url} target="_blank">
                            {link.icon && (
                                <Image src={`/${link.icon}`} alt={`${link.icon}`} width="20" height="20"/>
                            )}
                            {link.text}
                        </a>
                        ))
                    ) : (
                        <div>
                        <a href={`tel:${section.info?.phone}`}>{section.info?.phone}</a>
                        <a href={`mailto:${section.info?.email}`}>{section.info?.email}</a>
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