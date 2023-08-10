import styles from './page.module.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tours - Explore Kyrgyzstan',
  description: 'Discover amazing places in Kyrgyzstan. Explore the beauty of the country through its diverse landscapes and captivating destinations.',
  keywords: "Kyrgyzstan tours, adventure tours Kyrgyzstan, guided tours Kyrgyzstan, cultural tours Kyrgyzstan, trekking tours Kyrgyzstan, horse riding tours Kyrgyzstan, nomadic experiences Kyrgyzstan, Kyrgyzstan travel packages, best tours in Kyrgyzstan, explore Kyrgyzstan through tours"
}

export default function Home() {
  return (
    <div className={styles.main}>
      <h1>Most popular tours of Kyrgyzstan</h1>
    </div>
  )
}