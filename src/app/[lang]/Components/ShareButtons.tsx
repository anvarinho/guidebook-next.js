import Image from "next/image";
import styles from './page.module.css'
export default function ShareButtons(){
    return (
        <div className={styles.downloadlinks}>
        <a href="http://urls.api.twitter.com/1/urls/count.json?url=simplesharingbuttons.com&callback=twttr.receiveCount" target="_blank">
            <Image src={`/twitter1.png`} alt={`twitter1.png`} width="40" height="40" title="Share on Twitter"/>
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcentral-asia.live" target="_blank">
            <Image src={`/facebook.png`} alt={`facebook.png`} width="40" height="40" title="Share on Facebook"/>
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.anvarinho.guidebook" target="_blank">
            <Image src={`/pinterest.png`} alt={`facebook.png`} width="40" height="40" title="Share on Pinterest"/>
        </a>
        <a href="https://reddit.com/submit?url=http%3A%2F%2Fyour-website.com%2F%26amp%3Btitle%3DYour%20Post%20Title" target="_blank">
            <Image src={`/reddit.png`} alt={`facebook.png`} width="40" height="40" title="Share on Reddit"/>
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.anvarinho.guidebook" target="_blank">
            <Image src={`/whatsapp.png`} alt={`facebook.png`} width="40" height="40" title="Share on WhatsApp"/>
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.anvarinho.guidebook" target="_blank">
            <Image src={`/link.png`} alt={`facebook.png`} width="40" height="40" title="Copy Link"/>
        </a>
    </div>
    )
}