export default async function getAllPlaces() {
    const url = 'http://172.20.10.4:4000/places/';
    
    try {
      const res = await fetch(url);
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