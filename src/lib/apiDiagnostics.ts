import { randomUUID } from 'node:crypto';

const SAFE_LABEL = /^[a-zA-Z0-9_./:-]{1,160}$/;
const SAFE_REQUEST_ID = /^[a-zA-Z0-9._:-]{8,128}$/;

export function getApiRequestId(request: Request): string {
  const supplied = request.headers.get('x-request-id');
  return supplied && SAFE_REQUEST_ID.test(supplied) ? supplied : randomUUID();
}

export function logApiError(event: {
  requestId: string;
  route: string;
  status: number;
  errorCode: string;
  locale?: string;
  field?: string;
  recordId?: string;
}) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'error',
    event: 'api_error',
    requestId: SAFE_REQUEST_ID.test(event.requestId) ? event.requestId : randomUUID(),
    route: SAFE_LABEL.test(event.route) ? event.route : '<unknown>',
    status: event.status,
    errorCode: SAFE_LABEL.test(event.errorCode) ? event.errorCode : 'unknown',
    ...(event.locale && SAFE_LABEL.test(event.locale) ? { locale: event.locale } : {}),
    ...(event.field && SAFE_LABEL.test(event.field) ? { field: event.field } : {}),
    ...(event.recordId && SAFE_LABEL.test(event.recordId) ? { recordId: event.recordId } : {}),
  }));
}

export function requestIdHeaders(requestId: string): HeadersInit {
  return { 'x-request-id': requestId };
}
