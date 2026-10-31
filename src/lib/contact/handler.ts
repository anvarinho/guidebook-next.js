import { i18n } from '../i18n.config'

export type ContactMessage = { name: string; email: string; phone: string; subject: string; message: string; lang: string }
export type ContactDependencies = {
  origin: string
  consume: (request: Request) => Promise<boolean>
  save: (message: ContactMessage) => Promise<boolean>
}
const locales: readonly string[] = i18n.locales
const MAX_BYTES = 18000
function reply(status: number, error?: string) {
  return Response.json(error ? { error } : { ok: true }, { status, headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '900' } : {}) } })
}
function validate(value: unknown): ContactMessage | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const data: Record<string, unknown> = { phone: '', subject: '', website: '', ...raw }
  const limits = { name: 120, email: 254, phone: 40, subject: 160, message: 4000, lang: 2, website: 200 }
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof data[key] !== 'string' || data[key].length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(data[key])) return null
  }
  if (data.website !== '' || !locales.includes(data.lang as string)) return null
  const message = Object.fromEntries(Object.keys(limits).filter(key => key !== 'website').map(key => [key, (data[key] as string).trim()])) as ContactMessage
  if (!message.name || !message.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) return null
  if ([message.name, message.email, message.subject, message.phone].some(value => /[\r\n]/.test(value))) return null
  return message
}

export function createContactHandler(dependencies: ContactDependencies) {
  return async (request: Request): Promise<Response> => {
    if (request.headers.get('origin') !== dependencies.origin || request.headers.get('sec-fetch-site') === 'cross-site') return reply(403, 'origin')
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return reply(415, 'content_type')
    let value: unknown
    try {
      const reader = request.body?.getReader()
      if (!reader) return reply(400, 'invalid')
      const chunks: Uint8Array[] = []
      let size = 0
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        size += chunk.value.byteLength
        if (size > MAX_BYTES) { await reader.cancel(); return reply(413, 'too_large') }
        chunks.push(chunk.value)
      }
      const bytes = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
      value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
    } catch { return reply(400, 'invalid') }
    const message = validate(value)
    if (!message) return reply(400, 'invalid')
    try {
      if (!await dependencies.consume(request)) return reply(429, 'rate_limit')
      if (!await dependencies.save(message)) return reply(503, 'unavailable')
      return reply(201)
    } catch { return reply(503, 'unavailable') }
  }
}
