import getBase64 from "@/lib/getLocalBase64"
import Image from "next/image";

export default async function ImageLoader({ image }: { image: String }) {
  const baseUrl = 'http://127.0.0.1:4000/';
  const blurDataURL = await getBase64(baseUrl + image)
  return (
          <Image
                fill 
              src={baseUrl + image}
              alt={`${image}`}
              placeholder="blur" 
              blurDataURL={blurDataURL} 
              priority/>
  )
}