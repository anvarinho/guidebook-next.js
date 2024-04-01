export default async function getAllPlaces(lang: string) {
    const url = `http://159.65.95.44/api/places?lang=${lang}`;
    
    try {
      const res = await fetch(url);
      // console.log(res)
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      console.log(data)
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error; // Re-throw the error to handle it at the caller's level
    }
}