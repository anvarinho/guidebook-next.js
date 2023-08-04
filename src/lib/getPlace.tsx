export default async function getPlace(placeId: string) {
    const res = await fetch(`http://172.20.10.4:4000/places/${placeId}`)
    if (!res.ok) throw new Error('Failed to fetch place')
    return res.json()
}
