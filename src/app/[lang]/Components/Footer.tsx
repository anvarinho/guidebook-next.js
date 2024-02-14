import styles from './page.module.css'
import Image from 'next/image'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'

export default async function Footer({ lang }: { lang: Locale }) {
    const { page } = await getDictionary(lang)
    return (
        <footer className={styles.footer}>
        <div className={styles.download}>
            <div className={styles.text}>
                <h4>{page.download.text}</h4>
            </div>
            <div className={styles.downloadlinks}>
                <a className={styles.badge} href="https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810" target="_blank">
                    <Image src={`/apple-logo.png`} alt={`apple-logo.png`} width="20" height="20"/>
                    <h5>Download for iOS</h5>
                </a>
                <a className={styles.badge} href="https://play.google.com/store/apps/details?id=com.anvarinho.guidebook" target="_blank">
                    <Image src={`/google-logo.png`} alt={`google-logo.png`} width="20" height="20"/>
                    <h5>Get it for Android</h5>
                </a>
            </div>
        </div>
        </footer>
    )
}