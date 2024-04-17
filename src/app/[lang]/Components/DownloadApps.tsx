import Image from "next/image";
import styles from './page.module.css'
export default function DownloadApps(){
    return (
        <div className={styles.downloadlinks}>
        <a className={styles.badge} href="https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810" target="_blank">
            <Image src={`/apple-logo.png`} alt={`apple-logo.png`} width="20" height="20" title="Download for iOS"/>
            <h5>Download for iOS</h5>
        </a>
        <a className={styles.badge} href="https://play.google.com/store/apps/details?id=com.anvarinho.guidebook" target="_blank">
            <Image src={`/google-logo.png`} alt={`google-logo.png`} width="20" height="20" title="Get it for Android"/>
            <h5>Get it for Android</h5>
        </a>
    </div>
    )
}