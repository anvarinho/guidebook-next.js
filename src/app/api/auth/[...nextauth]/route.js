import NextAuth from 'next-auth';
import { authOptions, requireAuthConfiguration } from '@/app/admin/lib/auth';

const nextAuth = NextAuth(authOptions);

async function handler(request, context) {
  try { requireAuthConfiguration(); } catch {
    return Response.json({ error: 'Authentication unavailable' }, { status: 503 });
  }
  return nextAuth(request, context);
}

export { handler as GET, handler as POST };
