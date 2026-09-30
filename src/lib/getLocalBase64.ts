import { unstable_cache } from "next/cache"
import { getPlaiceholder } from "plaiceholder"

async function createBase64(imageUrl: string) {
    try {
        const res = await fetch(imageUrl)

        if (!res.ok) {
            throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`)
        }

        const buffer = await res.arrayBuffer()

        const { base64 } = await getPlaiceholder(Buffer.from(buffer))

        // console.log(`base64: ${base64}`)

        return base64

    } catch (e) {
        if (e instanceof Error) console.log(e.stack)
    }
}

// Cache the generated placeholder as well as the fetch; image decoding is expensive.
export default unstable_cache(createBase64, ["image-placeholder-v1"], { revalidate: 86400 });
