export default async function getAllPlaces(lang: string) {
    const url = `${process.env.URL}/api/places?lang=${lang}`;
    
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

export async function getPlacesByURLs(lang: string, urls:[string] | null) {
  try {
    const url = `${process.env.URL}/api/places/home?lang=${lang}&urls=${urls?.map(encodeURIComponent).join(',')}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      console.log(url)
      return data
      // console.log(data)
    //   return data;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw the error to handle it at the caller's level
    }
  // console.log(data)
  } catch (error) {
    console.error('Error fetching data:', error);
  } 
}

export async function getPlace(placeId: string, lang: string) {
  const res = await fetch(`${process.env.URL}/api/places/${placeId}?lang=${lang}`, {next: {revalidate: 60}})
  // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
  // if (!res.ok) throw new Error('Failed to fetch place')
  if (!res.ok) return undefined
  // console.log(res.json())
  return res.json()
}

export async function sitemapPlaces() {
  const loadPlaces = async () => {
      const url = `${process.env.URL}/api/places/more?offset=0&limit=160`;
      try {
          const response = await fetch(url);
          const data = await response.json();
          return data;
      } catch (error) {
          console.error("Error fetching places:", error);
      }
  };

  const data: Promise<Places> = loadPlaces();
  const placesData = await data;
  return placesData.places.map((placeItem) => ({
      placeUrl: placeItem.url,
      lastModified: placeItem.created
  }));
}