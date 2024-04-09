export default async function getAllArticles(lang: string) {
    const url = `${process.env.URL}/api/articles/?lang=${lang}`;
    try {
      const res = await fetch(url);
      // console.log(res)
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      console.log(data.length)
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw the error to handle it at the caller's level
    }
}

export async function getArticle(articleUrl: string, lang: string) {
  const res = await fetch(`${process.env.URL}/api/articles/${articleUrl}?lang=${lang}`, {next: {revalidate: 60}})
  // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
  // if (!res.ok) throw new Error('Failed to fetch place')
  if (!res.ok) return undefined
  // console.log(res.json())
  return res.json()
}

export async function sitemapArticles() {
  // Define an asynchronous function to fetch articles data
  const loadArticles = async () => {
      const url = `${process.env.URL}/api/articles`;
      try {
          const response = await fetch(url);
          console.log(response.status)
          const data = await response.json();
          console.log(data)
          return data;
      } catch (error) {
          console.error("Error fetching articles:", error);
      }
  };

  // Call the loadArticles function to get the Promise<[Article]> data
  const data: Promise<[Article]> = loadArticles();

  // Wait for the Promise to resolve and get the articlesData
  const articlesData = await data;

  // Map over the articlesData array and return a new array of objects
  return articlesData.map((article: Article) => ({
      placeUrl: article.url,
      lastModified: article.createdAt
  }));
}
