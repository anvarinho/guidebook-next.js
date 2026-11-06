import 'server-only';
import { cache } from 'react';
import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import { contentLocale } from './i18n.config';
import { ContentQueueError, contentRequestPool } from './contentRequestPool';

const CONTENT_REVALIDATE_SECONDS = 60;

function recordContext(value: unknown, issuePath: PropertyKey[]) {
  const issueIndex = issuePath.find((part): part is number => typeof part === 'number');
  let record: unknown;
  let itemIndex: number | undefined;

  if (Array.isArray(value)) {
    itemIndex = issueIndex;
    record = itemIndex === undefined ? undefined : value[itemIndex];
  } else if (typeof value === 'object' && value !== null) {
    const root = value as Record<string, unknown>;
    const listKey = ['places', 'tours', 'articles'].find(key => Array.isArray(root[key]));
    if (listKey && issueIndex !== undefined) {
      itemIndex = issueIndex;
      record = (root[listKey] as unknown[])[itemIndex];
    } else {
      record = value;
    }
  }

  if (typeof record !== 'object' || record === null) return itemIndex === undefined ? {} : { itemIndex };
  const fields = record as Record<string, unknown>;
  return {
    ...(itemIndex === undefined ? {} : { itemIndex }),
    ...(typeof fields._id === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(fields._id)
      ? { recordId: fields._id } : {}),
    ...(typeof fields.url === 'string' && /^[\p{L}\p{N}._~-]{1,300}$/u.test(fields.url)
      ? { recordUrl: fields.url } : {}),
  };
}

function contentRequestContext(path: string, query: string, requestId: string) {
  return {
    requestId,
    route: `/api/${path}`,
    endpoint: `/api/${path}`,
    locale: new URLSearchParams(query).get('lang') ?? 'en',
  };
}

export class ContentApiError extends Error {
  constructor(message: string, readonly requestId: string, readonly errorCode: string) {
    super(message);
    this.name = 'ContentApiError';
  }
}

// An AbortSignal opts out of Next's render memoization. React cache restores it
// using stable primitive request keys, including calls made by metadata.
const requestContent = cache(async (path: string, query: string, schema: z.ZodType, allowMissing: boolean, revalidate: number, suppliedRequestId?: string) => {
  const requestId = suppliedRequestId ?? randomUUID();
  const context = contentRequestContext(path, query, requestId);
  const configured = process.env.CONTENT_API_URL;
  if (!configured) {
    console.error(JSON.stringify({ event: 'content_api_failure', ...context, status: 503, errorCode: 'content_api_url_missing' }));
    throw new ContentApiError('CONTENT_API_URL must be configured', requestId, 'content_api_url_missing');
  }
  let base: URL;
  try { base = new URL(configured); } catch {
    console.error(JSON.stringify({ event: 'content_api_failure', ...context, status: 503, errorCode: 'content_api_url_invalid' }));
    throw new ContentApiError('Invalid CONTENT_API_URL configuration', requestId, 'content_api_url_invalid');
  }
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    console.error(JSON.stringify({ event: 'content_api_failure', ...context, status: 503, errorCode: 'content_api_url_invalid' }));
    throw new ContentApiError('Invalid CONTENT_API_URL configuration', requestId, 'content_api_url_invalid');
  }
  const configuredTimeout = Number(process.env.CONTENT_API_TIMEOUT_MS || 10000);
  const timeout = Number.isInteger(configuredTimeout) && configuredTimeout > 0 && configuredTimeout <= 60000
    ? configuredTimeout : 10000;
  const signal = AbortSignal.timeout(timeout);
  let value: unknown;
  try {
    const url = `${base.href.replace(/\/$/, '')}/api/${path}${query ? `?${query}` : ''}`;
    // Coalesce public reads across renders; retain Next's existing cache policy.
    value = await contentRequestPool.run(JSON.stringify([url, revalidate, allowMissing]), async () => {
      const response = await fetch(url, { next: { revalidate }, signal });
      if (allowMissing && response.status === 404) return undefined;
      if (!response.ok) {
        console.error(JSON.stringify({
          event: 'content_api_failure', ...context, status: response.status,
          errorCode: `upstream_http_${response.status}`,
        }));
        throw new ContentApiError(`Content API returned HTTP ${response.status}`, requestId, `upstream_http_${response.status}`);
      }
      return response.json();
    });
    if (allowMissing && value === undefined) return undefined;
  } catch (error) {
    if (error instanceof ContentApiError) throw error;
    if (error instanceof ContentQueueError) {
      console.error(JSON.stringify({ event: 'content_api_failure', ...context, status: 503, errorCode: 'content_queue_busy' }));
      throw new ContentApiError('Content API is busy; retry shortly', requestId, 'content_queue_busy');
    }
    const errorCode = signal.aborted ? 'upstream_timeout' : 'upstream_network_or_json_error';
    console.error(JSON.stringify({ event: 'content_api_failure', ...context, status: 503, errorCode }));
    // Never include backend URLs, response bodies, or credentials in errors.
    throw new ContentApiError(signal.aborted ? 'Content API request timed out' : 'Content API request failed', requestId, errorCode);
  }
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues;
    // Log schema paths and safe record identifiers only, never response values.
    console.error(JSON.stringify({
      event: 'content_api_schema_mismatch',
      ...context,
      status: 503,
      errorCode: 'invalid_content_response',
      issues: issues.slice(0, 20).map(issue => ({
        path: issue.path.map(String).join('.') || '<root>',
        field: issue.path.map(String).join('.') || '<root>',
        code: issue.code,
        ...recordContext(value, issue.path),
      })),
      omittedIssueCount: Math.max(0, issues.length - 20),
    }));
    throw new ContentApiError('Invalid content response from API', requestId, 'invalid_content_response');
  }
  return result.data;
});

export type ContentRequestContext = { requestId: string };
export function getContent<T>(path: string, schema: z.ZodType<T>, params?: Record<string, string>): Promise<T>;
export function getContent<T>(path: string, schema: z.ZodType<T>, params: Record<string, string>, allowMissing: true): Promise<T | undefined>;
export function getContent<T>(path: string, schema: z.ZodType<T>, params: Record<string, string>, allowMissing: false, context?: ContentRequestContext): Promise<T>;
export function getContent<T>(path: string, schema: z.ZodType<T>, params: Record<string, string>, allowMissing: boolean, context: ContentRequestContext): Promise<T | undefined>;
export async function getContent<T>(
  path: string,
  schema: z.ZodType<T>,
  params: Record<string, string> = {},
  allowMissing = false,
  context?: ContentRequestContext,
): Promise<T | undefined> {
  const query = new URLSearchParams(params.lang ? { ...params, lang: contentLocale(params.lang) } : params).toString();
  return requestContent(path, query, schema, allowMissing, CONTENT_REVALIDATE_SECONDS, context?.requestId) as Promise<T | undefined>;
}

// Sitemap fetches must not lower the whole sitemap's hourly revalidation to
// the 60-second policy used for visible content pages.
export function getSitemapContent<T>(path: string, schema: z.ZodType<T>, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams(params.lang ? { ...params, lang: contentLocale(params.lang) } : params).toString();
  return requestContent(path, query, schema, false, 3600) as Promise<T>;
}
