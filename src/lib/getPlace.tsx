export default async function getPlace(placeId: string, lang: string) {
    const res = await fetch(`http://159.65.95.44/api/places/${placeId}?lang=${lang}`, {next: {revalidate: 60}})
    // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
    // if (!res.ok) throw new Error('Failed to fetch place')
    if (!res.ok) return undefined
    // console.log(res.json())
    return res.json()
}
