export default async function getReviews() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }