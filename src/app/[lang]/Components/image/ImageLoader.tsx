import getBase64 from "@/lib/getLocalBase64"
import Image from "next/image";
import styles from './imageSlider.module.css'

export default async function ImageLoader({ image, priority }: { image: String, priority: boolean }) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = await getBase64(baseUrl + image)
  return (
    <div className={styles.slider}>
      <picture className={styles.active}>
          <Image
            fill 
            src={baseUrl + image}
            alt={`${image}`}
            placeholder="blur" 
            blurDataURL={blurDataURL} 
            // loading="lazy"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            objectFit='cover'/>
        </picture>
    </div>
  )
}