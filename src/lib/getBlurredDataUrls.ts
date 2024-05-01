import getBase64 from "./getLocalBase64"
export default async function getBlurredDataUrls(images: string[]): Promise<string[]>{
    const base64Promises = images.map(image => getBase64(image))
    const base64Results = await Promise.all(base64Promises)
    var images : string[] = []
    images.map((photo, i) => {
        images.push(base64Results[i]!)
        return images
    })
    return images
}