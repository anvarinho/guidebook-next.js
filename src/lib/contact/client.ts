export type SubmissionResult = 'success' | 'error' | 'invalid' | 'rateLimit'
export async function sendContact(fields: FormData, lang: string, fetcher: typeof fetch = fetch): Promise<SubmissionResult> {
  try {
    const body = Object.fromEntries(['name', 'email', 'phone', 'subject', 'message', 'website'].map(key => [key, String(fields.get(key) ?? '')]))
    const response = await fetcher('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, lang }), signal: AbortSignal.timeout(20000) })
    if (response.status === 400 || response.status === 413) return 'invalid'
    if (response.status === 429) return 'rateLimit'
    if (response.status !== 201) return 'error'
    const result: unknown = await response.json()
    return result && typeof result === 'object' && 'ok' in result && result.ok === true ? 'success' : 'error'
  } catch { return 'error' }
}
