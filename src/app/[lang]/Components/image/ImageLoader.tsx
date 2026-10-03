import getBase64 from '@/lib/getLocalBase64';
import { imagePlaceholder } from '@/lib/imagePlaceholder';
import Image from "next/image";
import styles from './imageSlider.module.css'

export default async function ImageLoader({ image, priority }: { image: String, priority: boolean }) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  return (
    <div className={styles.slider}>
      <picture className={styles.active}>
          <Image
            {...imagePlaceholder(getBase64(String(image)))}
            fill 
            src={baseUrl + image}
            alt={`${image}`}
            sizes="(max-width: 991px) 100vw, 900px"
            // loading="lazy"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            style={{ objectFit: 'cover' }}/>
        </picture>
    </div>
  )
}