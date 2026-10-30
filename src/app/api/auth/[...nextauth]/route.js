import NextAuth from 'next-auth';
import { authOptions, requireAuthConfiguration } from '@/app/admin/lib/auth';

const nextAuth = NextAuth(authOptions);
export const dynamic = 'force-dynamic';

async function handler(request, context) {
  try { requireAuthConfiguration(); } catch {
    return Response.json({ error: 'Authentication unavailable' }, { status: 503, headers:{'Cache-Control':'private, no-store, max-age=0'} });
  }
  const response = await nextAuth(request, context);
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export { handler as GET, handler as POST };
