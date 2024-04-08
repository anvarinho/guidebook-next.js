export default async function getArticle(articleUrl: string, lang: string) {
    const res = await fetch(`${process.env.URL}/api/articles/${articleUrl}?lang=${lang}`, {next: {revalidate: 60}})
    // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
    // if (!res.ok) throw new Error('Failed to fetch place')
    if (!res.ok) return undefined
    // console.log(res.json())
    return res.json()
}