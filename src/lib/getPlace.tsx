export default async function getPlace(placeId: string) {
    const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {next: {revalidate: 60}})
    // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
    // if (!res.ok) throw new Error('Failed to fetch place')
    if (!res.ok) return undefined
    return res.json()
}
