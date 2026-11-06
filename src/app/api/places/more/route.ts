import { NextRequest, NextResponse } from 'next/server';
import { ContentApiError, getContent } from '@/lib/contentApi';
import { getApiRequestId, logApiError, requestIdHeaders } from '@/lib/apiDiagnostics';
import { paginatedPlacesSchema } from '@/lib/contentSchemas';
import getBase64 from '@/lib/getLocalBase64';
import { i18n } from '@/lib/i18n.config';

export async function GET(request: NextRequest) {
  const requestId = getApiRequestId(request);
  const lang = request.nextUrl.searchParams.get('lang') || 'en';
  const offset = Number(request.nextUrl.searchParams.get('offset') || 0);
  const validLocale = i18n.locales.some(locale => locale === lang);
  if (!validLocale || !Number.isSafeInteger(offset) || offset < 0) {
    logApiError({
      requestId, route: '/api/places/more', status: 400,
      errorCode: !validLocale ? 'unsupported_locale' : 'invalid_offset',
      locale: validLocale ? lang : undefined,
      field: !validLocale ? 'lang' : 'offset',
    });
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400, headers: requestIdHeaders(requestId) });
  }
  try {
    const data = await getContent('places/more', paginatedPlacesSchema, {
      lang, offset: String(offset), limit: '12',
    }, false, { requestId });
    return NextResponse.json({
      ...data,
      places: data.places.map(place => ({ ...place, blurDataURL: getBase64(place.images[0]) })),
    }, { headers: requestIdHeaders(requestId) });
  } catch (error) {
    const contentError = error instanceof ContentApiError ? error : undefined;
    const traceId = contentError?.requestId ?? requestId;
    logApiError({
      requestId: traceId, route: '/api/places/more', locale: lang, status: 502,
      errorCode: contentError?.errorCode ?? 'places_request_failed',
      ...(contentError?.errorCode === 'invalid_content_response' ? { field: 'places' } : {}),
    });
    return NextResponse.json({ error: 'Places are temporarily unavailable' }, { status: 502, headers: requestIdHeaders(traceId) });
  }
}
