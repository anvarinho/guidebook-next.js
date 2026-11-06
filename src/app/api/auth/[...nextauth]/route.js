import NextAuth from 'next-auth';
import { authOptions, requireAuthConfiguration } from '@/app/admin/lib/auth';
import { getApiRequestId, logApiError, requestIdHeaders } from '@/lib/apiDiagnostics';

const nextAuth = NextAuth(authOptions);
export const dynamic = 'force-dynamic';

async function handler(request, context) {
  const requestId = getApiRequestId(request);
  try { requireAuthConfiguration(); } catch {
    logApiError({ requestId, route: '/api/auth', status: 503, errorCode: 'auth_configuration_missing', field: 'environment' });
    return Response.json({ error: 'Authentication unavailable' }, { status: 503, headers:{'Cache-Control':'private, no-store, max-age=0', ...requestIdHeaders(requestId)} });
  }
  const response = await nextAuth(request, context);
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('x-request-id', requestId);
  return response;
}

export { handler as GET, handler as POST };
