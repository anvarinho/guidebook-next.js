export default async function getReviews() {
    try {
      const res = await fetch(`http://159.65.95.44/api/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }