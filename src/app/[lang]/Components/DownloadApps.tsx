import reviewedLabels from '@/translations/ui/reviewed-labels.json';

import Image from 'next/image'
import type { Locale } from '@/lib/i18n.config'
import styles from './download-apps.module.css'

export default function DownloadApps({ lang = 'en' }: { lang?: Locale }) {
  return (
    <div className={styles.downloadLinks}>
      <a className={styles.badge} href="https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810" target="_blank" rel="noopener noreferrer">
        <Image src="/apple-logo.png" alt="" width={28} height={28}/>
        <span><span className={styles.label}>{reviewedLabels[lang].download}</span><span className={styles.store} lang="en" dir="ltr">App Store</span></span>
      </a>
      <a className={styles.badge} href="https://play.google.com/store/apps/details?id=com.anvarinho.guidebook" target="_blank" rel="noopener noreferrer">
        <Image src="/google-logo.png" alt="" width={27} height={27}/>
        <span><span className={styles.label}>{reviewedLabels[lang].download}</span><span className={styles.store} lang="en" dir="ltr">Google Play</span></span>
      </a>
    </div>
  )
}
