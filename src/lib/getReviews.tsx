export default async function getReviews() {
    try {
      const res = await fetch('/api/reviews', { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  }