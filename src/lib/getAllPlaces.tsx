export default async function getAllPlaces(lang: string) {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/places?lang=${lang}`;
    
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
    const url = `${process.env.NEXT_PUBLIC_URL}/api/places/home?lang=${lang}&urls=${urls?.map(encodeURIComponent).join(',')}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      // console.log(url)
      // console.log(data)
      return data
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
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/places/${placeId}?lang=${lang}`)
  // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
  // if (!res.ok) throw new Error('Failed to fetch place')
  if (!res.ok) return undefined
  // console.log(res.json())
  return res.json()
}

export async function getPlacesByRegion(lang: string, region: string, url:string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/places/region?lang=${lang}&region=${region}&url=${url}`)
  // const res = await fetch(`http://127.0.0.1:4000/places/${placeId}`, {cache: 'no-store'})
  // if (!res.ok) throw new Error('Failed to fetch place')
  if (!res.ok) return undefined
  // console.log(res.json())
  return res.json()
}

export async function sitemapPlaces() {
  const loadPlaces = async () => {
      const url = `${process.env.NEXT_PUBLIC_URL}/api/places/more?offset=0&limit=200`;
      try {
          const response = await fetch(url);
          // console.log('Response status:', response.status);
          const data = await response.json();
          // console.log('Received data:', data);
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

export async function getHomePlaces(lang: String) {
    try {
        const url = `${process.env.NEXT_PUBLIC_URL}/api/places/home?lang=${lang}`;
        try {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await res.json();
          // setPlaces(data)
        //   console.log(data)
          return data;
        } catch (error) {
          console.error('Error:', error);
          throw error; // Re-throw the error to handle it at the caller's level
        }
    // console.log(data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}