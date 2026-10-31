import 'server-only';
import { cache } from 'react';
import type { z } from 'zod';
import { contentLocale } from './i18n.config';

const CONTENT_REVALIDATE_SECONDS = 60;

// An AbortSignal opts out of Next's render memoization. React cache restores it
// using stable primitive request keys, including calls made by metadata.
const requestContent = cache(async (path: string, query: string, schema: z.ZodType, allowMissing: boolean) => {
  const configured = process.env.CONTENT_API_URL;
  if (!configured) throw new Error('CONTENT_API_URL must be configured');
  let base: URL;
  try { base = new URL(configured); } catch { throw new Error('Invalid CONTENT_API_URL configuration'); }
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error('Invalid CONTENT_API_URL configuration');
  }
  const configuredTimeout = Number(process.env.CONTENT_API_TIMEOUT_MS || 10000);
  const timeout = Number.isInteger(configuredTimeout) && configuredTimeout > 0 && configuredTimeout <= 60000
    ? configuredTimeout : 10000;
  const signal = AbortSignal.timeout(timeout);
  let value: unknown;
  try {
    const response = await fetch(`${base.href.replace(/\/$/, '')}/api/${path}${query ? `?${query}` : ''}`, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS }, signal,
    });
    if (allowMissing && response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Content API returned HTTP ${response.status}`);
    value = await response.json();
  } catch (error) {
    if (signal.aborted) throw new Error('Content API request timed out');
    if (error instanceof Error && /^Content API returned HTTP \d+$/.test(error.message)) throw error;
    // Never include backend URLs, response bodies, or credentials in errors.
    throw new Error('Content API request failed');
  }
  const result = schema.safeParse(value);
  if (!result.success) throw new Error('Invalid content response from API');
  return result.data;
});

export function getContent<T>(path: string, schema: z.ZodType<T>, params?: Record<string, string>): Promise<T>;
export function getContent<T>(path: string, schema: z.ZodType<T>, params: Record<string, string>, allowMissing: true): Promise<T | undefined>;
export async function getContent<T>(
  path: string,
  schema: z.ZodType<T>,
  params: Record<string, string> = {},
  allowMissing = false,
): Promise<T | undefined> {
  const query = new URLSearchParams(params.lang ? { ...params, lang: contentLocale(params.lang) } : params).toString();
  return requestContent(path, query, schema, allowMissing) as Promise<T | undefined>;
}
