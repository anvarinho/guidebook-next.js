export default async function getAllTours(lang:string) {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/tours/?lang=${lang}`;

    try {
      const res = await fetch(url);
      // console.log(res)
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      // console.log(data)
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw the error to handle it at the caller's level
    }
}

export async function getTour(tourId: string, lang: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/tours/${tourId}?lang=${lang}`
  // , {next: {revalidate: 60}}
)
  // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
  // if (!res.ok) throw new Error('Failed to fetch place')
  // console.log(res.json())
  if (!res.ok) return undefined
  return res.json()
}

// Example usage
export async function sitemapTours() {
  try {
      const tours = await getAllTours("en");
      // Handle the tours data, such as mapping it to the required format
      const formattedTours = tours.map((tour: any) => ({
          tourUrl: tour.url,
          // lastModified: tour.createdAt
      }));
      return formattedTours;
  } catch (error) {
      console.error('Error fetching tours:', error);
      return []; // Return an empty array or handle the error as needed
  }
}