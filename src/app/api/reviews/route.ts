import { NextResponse } from 'next/server';
import { ContentApiError, getContent } from '@/lib/contentApi';
import { getApiRequestId, logApiError, requestIdHeaders } from '@/lib/apiDiagnostics';
import { reviewsSchema } from '@/lib/contentSchemas';

export async function GET(request: Request) {
  const requestId = getApiRequestId(request);
  try {
    return NextResponse.json(await getContent('reviews', reviewsSchema, {}, false, { requestId }), { headers: requestIdHeaders(requestId) });
  } catch (error) {
    const contentError = error instanceof ContentApiError ? error : undefined;
    const traceId = contentError?.requestId ?? requestId;
    logApiError({
      requestId: traceId, route: '/api/reviews', status: 502,
      errorCode: contentError?.errorCode ?? 'reviews_request_failed',
      ...(contentError?.errorCode === 'invalid_content_response' ? { field: 'reviews' } : {}),
    });
    return NextResponse.json({ error: 'Reviews are temporarily unavailable' }, { status: 502, headers: requestIdHeaders(traceId) });
  }
}
