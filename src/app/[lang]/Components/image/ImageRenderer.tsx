import ImageLoader from "./ImageLoader"
import ImageSlider from "./ImageSlider"
import getBlurredDataUrls from "@/lib/getBlurredDataUrls"
import type { Locale } from '@/lib/i18n.config'
export default async function ImageRenderer({ images, priority, lang = 'en' }: { images: string[], priority: boolean, lang?: Locale }) {
  return (
    images.length == 1 ? (
        <ImageLoader image={images[0]} priority={priority}/>
    ):(
        <ImageSlider items={images} priority={priority} lang={lang} blurDataURLs={getBlurredDataUrls(images)}/>
    )
  )
}
