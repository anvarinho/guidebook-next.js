import ImageLoader from "./ImageLoader"
import ImageSlider from "./ImageSlider"
export default async function ImageRenderer({ images, priority }: { images: [String], priority: boolean }) {
  return (
    images.length == 1 ? (
        <ImageLoader image={images[0]} priority={priority}/>
    ):(
        <ImageSlider items={images} priority={priority}/>
    )
  )
}