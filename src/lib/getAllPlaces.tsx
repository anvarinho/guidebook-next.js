export default async function getAllPlaces(lang: string) {
    const url = `http://159.65.95.44/api/places?lang=${lang}`;
    
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
    const url = `http://127.0.0.1:4000/api/places/home?lang=${lang}&urls=${urls?.map(encodeURIComponent).join(',')}`;
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