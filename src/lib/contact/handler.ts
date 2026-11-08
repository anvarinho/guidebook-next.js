import { i18n } from '../i18n.config'
import { getApiRequestId, logApiError, requestIdHeaders } from '../apiDiagnostics'

export type ContactMessage = { name: string; email: string; phone: string; subject: string; message: string; lang: string }
export type ContactDependencies = {
  origin: string
  consume: (request: Request) => Promise<boolean>
  save: (message: ContactMessage) => Promise<boolean>
}
const locales: readonly string[] = i18n.locales
const maxLocaleLength = Math.max(...locales.map(locale => locale.length))
const MAX_BYTES = 18000
function reply(status: number, requestId: string, error?: string) {
  return Response.json(error ? { error } : { ok: true }, { status, headers: { 'Cache-Control': 'no-store', ...requestIdHeaders(requestId), ...(status === 429 ? { 'Retry-After': '900' } : {}) } })
}
type ValidationResult = { message?: ContactMessage; field?: string; errorCode?: string; locale?: string }
function validate(value: unknown): ValidationResult {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { field: 'body', errorCode: 'invalid_body' }
  const raw = value as Record<string, unknown>
  const data: Record<string, unknown> = { phone: '', subject: '', website: '', ...raw }
  const limits = { name: 120, email: 254, phone: 40, subject: 160, message: 4000, lang: maxLocaleLength, website: 200 }
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof data[key] !== 'string' || data[key].length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data[key])) {
      return { field: key, errorCode: 'invalid_field' }
    }
  }
  if (data.website !== '') return { field: 'website', errorCode: 'honeypot_filled' }
  if (!locales.includes(data.lang as string)) return { field: 'lang', errorCode: 'unsupported_locale' }
  const message = Object.fromEntries(Object.keys(limits).filter(key => key !== 'website').map(key => [key, (data[key] as string).trim()])) as ContactMessage
  if (!message.name) return { field: 'name', errorCode: 'required_field_missing', locale: message.lang }
  if (!message.message) return { field: 'message', errorCode: 'required_field_missing', locale: message.lang }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) return { field: 'email', errorCode: 'invalid_email', locale: message.lang }
  const newlineField = (['name', 'email', 'subject', 'phone'] as const).find(key => /[\r\n]/.test(message[key]))
  if (newlineField) return { field: newlineField, errorCode: 'invalid_field', locale: message.lang }
  return { message }
}

export function createContactHandler(dependencies: ContactDependencies) {
  return async (request: Request): Promise<Response> => {
    const requestId = getApiRequestId(request)
    if (request.headers.get('origin') !== dependencies.origin || request.headers.get('sec-fetch-site') === 'cross-site') return reply(403, requestId, 'origin')
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return reply(415, requestId, 'content_type')
    let value: unknown
    try {
      const reader = request.body?.getReader()
      if (!reader) {
        logApiError({ requestId, route: '/api/contact', status: 400, errorCode: 'missing_body', field: 'body' })
        return reply(400, requestId, 'invalid')
      }
      const chunks: Uint8Array[] = []
      let size = 0
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        size += chunk.value.byteLength
        if (size > MAX_BYTES) { await reader.cancel(); return reply(413, requestId, 'too_large') }
        chunks.push(chunk.value)
      }
      const bytes = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
      value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    } catch {
      logApiError({ requestId, route: '/api/contact', status: 400, errorCode: 'invalid_json', field: 'body' })
      return reply(400, requestId, 'invalid')
    }
    const validation = validate(value)
    if (!validation.message) {
      logApiError({ requestId, route: '/api/contact', status: 400, errorCode: validation.errorCode ?? 'invalid_body', field: validation.field ?? 'body', locale: validation.locale })
      return reply(400, requestId, 'invalid')
    }
    const message = validation.message
    try {
      if (!await dependencies.consume(request)) return reply(429, requestId, 'rate_limit')
    } catch {
      logApiError({ requestId, route: '/api/contact', status: 503, errorCode: 'rate_limit_store_unavailable', field: 'rate_limit', locale: message.lang })
      return reply(503, requestId, 'unavailable')
    }
    try {
      if (!await dependencies.save(message)) {
        logApiError({ requestId, route: '/api/contact', status: 503, errorCode: 'message_store_unavailable', field: 'contact_message', locale: message.lang })
        return reply(503, requestId, 'unavailable')
      }
      return reply(201, requestId)
    } catch {
      logApiError({ requestId, route: '/api/contact', status: 503, errorCode: 'message_store_unavailable', field: 'contact_message', locale: message.lang })
      return reply(503, requestId, 'unavailable')
    }
  }
}
