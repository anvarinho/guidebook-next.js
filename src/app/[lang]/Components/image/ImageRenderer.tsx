import ImageLoader from "./ImageLoader"
import ImageSlider from "./ImageSlider"
export default async function ImageRenderer({ images }: { images: [String] }) {
  return (
    images.length == 1 ? (
        <ImageLoader image={images[0]}/>
    ):(
        <ImageSlider items={images}/>
    )
  )
}