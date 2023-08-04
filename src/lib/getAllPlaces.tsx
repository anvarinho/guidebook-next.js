export default async function getAllPlaces() {
    const res = await fetch('http://172.20.10.4:4000/places/')
    if (!res.ok) throw new Error('Failed to fetch data')
    return res.json()
}