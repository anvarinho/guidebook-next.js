// Public content shares a short cache lifetime, including calls from metadata.
// Next.js also deduplicates identical GET requests within a server render.
const CONTENT_REVALIDATE_SECONDS = 60;

export async function getContent<T = any>(
  path: string,
  params: Record<string, string> = {},
  allowMissing = false,
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, '');
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${baseUrl}/api/${path}${query ? `?${query}` : ''}`, {
    next: { revalidate: CONTENT_REVALIDATE_SECONDS },
  });

  if (allowMissing && response.status === 404) return undefined as T;
  if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return response.json();
}
