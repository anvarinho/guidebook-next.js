import type { Instrumentation } from 'next';

// Server-side render/route errors as one JSON line each, in the same style as the
// content API logs, so `journalctl -u guidebook-frontend@3000` can be filtered by event.
// Only non-sensitive fields are logged: no headers, cookies, query strings or bodies.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const err = error as { name?: string; message?: string; digest?: string };
  console.error(JSON.stringify({
    event: 'request_error',
    digest: err.digest,
    errorName: err.name,
    message: String(err.message ?? '').slice(0, 300),
    method: request.method,
    path: request.path.split('?')[0],
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  }));
};
