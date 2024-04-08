export default async function getTour(tourId: string) {
    const res = await fetch(`${process.env.URL}/api/tours/${tourId}`, {next: {revalidate: 60}})
    // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
    // if (!res.ok) throw new Error('Failed to fetch place')
    // console.log(res.json())
    if (!res.ok) return undefined
    return res.json()
}