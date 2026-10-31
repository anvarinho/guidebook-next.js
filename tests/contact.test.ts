import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

const valid = { name: 'Test Visitor', email: 'visitor@example.invalid', phone: '', subject: '', message: 'Synthetic test message', lang: 'en', website: '' }
const request = (body: unknown = valid, headers: Record<string, string> = {}) => new Request('https://guide.test/api/contact', { method: 'POST', headers: { origin: 'https://guide.test', 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })

test('contact accepts new website locales and keeps the submitted language', async () => {
  const { createContactHandler } = await import('../src/lib/contact/handler')
  const saved: { lang: string }[] = []
  const handler = createContactHandler({ origin: 'https://guide.test', consume: async () => true, save: async value => { saved.push(value); return true } })
  for (const lang of ['uk', 'kg', 'he', 'uz']) assert.equal((await handler(request({ ...valid, lang }))).status, 201)
  assert.deepEqual(saved.map(value => value.lang), ['uk', 'kg', 'he', 'uz'])
})

test('contact succeeds only after acknowledged durable storage', async () => {
  const { createContactHandler } = await import('../src/lib/contact/handler')
  const saved: unknown[] = []
  const handler = createContactHandler({ origin: 'https://guide.test', consume: async () => true, save: async (value) => { saved.push(value); return true } })
  assert.equal((await handler(request())).status, 201)
  assert.equal(saved.length, 1)
  const unavailable = createContactHandler({ origin: 'https://guide.test', consume: async () => true, save: async () => false })
  assert.equal((await unavailable(request())).status, 503)
})

test('rejects invalid, overlong, honeypot and cross-origin requests without writing', async () => {
  const { createContactHandler } = await import('../src/lib/contact/handler')
  let writes = 0
  const handler = createContactHandler({ origin: 'https://guide.test', consume: async () => true, save: async () => { writes++; return true } })
  for (const body of [null, {}, { ...valid, name: ' ' }, { ...valid, email: 'bad' }, { ...valid, phone: [] }, { ...valid, subject: 'x'.repeat(161) }, { ...valid, message: 'x'.repeat(4001) }, { ...valid, lang: 'xx' }, { ...valid, website: 'bot' }, { ...valid, email: 'a@b.test\r\nBcc: bad' }]) {
    assert.equal((await handler(request(body))).status, 400)
  }
  assert.equal((await handler(request(valid, { origin: 'https://evil.test' }))).status, 403)
  assert.equal((await handler(request(valid, { origin: '' }))).status, 403)
  assert.equal((await handler(request(valid, { 'content-type': 'text/plain' }))).status, 415)
  assert.equal((await handler(request({ ...valid, message: 'x'.repeat(20000) }))).status, 413)
  assert.equal(writes, 0)
})

test('rate limit and infrastructure failures fail closed with retry guidance', async () => {
  const { createContactHandler } = await import('../src/lib/contact/handler')
  const limited = createContactHandler({ origin: 'https://guide.test', consume: async () => false, save: async () => { throw new Error('must not save') } })
  const response = await limited(request())
  assert.equal(response.status, 429)
  assert.ok(response.headers.get('retry-after'))
  const broken = createContactHandler({ origin: 'https://guide.test', consume: async () => { throw new Error('secret backend detail') }, save: async () => true })
  const failure = await broken(request())
  assert.equal(failure.status, 503)
  assert.equal((await failure.text()).includes('secret'), false)
})

test('shared limiter uses atomic fixed-window increments and majority writes', async () => {
  const { consumeContactLimit } = await import('../src/lib/contact/limiter')
  const counts = new Map<string, number>()
  const collection = {
    async findOneAndUpdate(filter: { _id: string }, update: { $inc: { count: number }; $setOnInsert: { expiresAt: Date } }, options: unknown) {
      assert.equal(update.$inc.count, 1)
      assert.ok(update.$setOnInsert.expiresAt instanceof Date)
      assert.deepEqual(options, { upsert: true, returnDocument: 'after', writeConcern: { w: 'majority', wtimeoutMS: 5000 } })
      const count = (counts.get(filter._id) || 0) + 1
      counts.set(filter._id, count)
      return { count }
    },
  }
  const results = await Promise.all(Array.from({ length: 10 }, () => consumeContactLimit(collection, '203.0.113.2', 'test-secret', 123456789)))
  assert.equal(results.filter(Boolean).length, 5)
  assert.equal([...counts.keys()].some(key => key.includes('203.0.113.2')), false)
  assert.equal(await consumeContactLimit(collection, '203.0.113.2', 'test-secret', 123456789 + 900000), true)
})

test('address-limited attempts cannot exhaust the global quota for other visitors', async () => {
  const { consumeContactLimit } = await import('../src/lib/contact/limiter')
  const counts = new Map<string, number>()
  const collection = { async findOneAndUpdate(filter: { _id: string }) {
    const count = (counts.get(filter._id) || 0) + 1
    counts.set(filter._id, count)
    return { count }
  } }
  let accepted = 0
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await consumeContactLimit(collection, '203.0.113.2', 'test-only', 123456789)) accepted++
  }
  assert.equal(accepted, 5)
  assert.equal([...counts.entries()].find(([key]) => key.startsWith('global:'))?.[1], 5)
  assert.equal(await consumeContactLimit(collection, '203.0.113.3', 'test-only', 123456789), true)
})

test('all fifty languages have honest localized submission states', async () => {
  const { contactCopy } = await import('../src/app/[lang]/contact/content')
  assert.equal(Object.keys(contactCopy).length, 50)
  for (const copy of Object.values(contactCopy)) {
    for (const key of ['pending', 'success', 'error', 'invalid', 'rateLimit', 'send'] as const) assert.ok(copy[key]?.length > 5, key)
    assert.equal(/draft|email app/i.test(copy.send + copy.hint), false)
  }
})

test('browser submission requires confirmed 201 response and distinguishes safe failures', async () => {
  const { sendContact } = await import('../src/lib/contact/client')
  const fields = new FormData()
  for (const [key, value] of Object.entries(valid)) fields.set(key, value)
  assert.equal(await sendContact(fields, 'en', async () => Response.json({ ok: true }, { status: 201 })), 'success')
  for (const [status, expected] of [[400, 'invalid'], [429, 'rateLimit'], [503, 'error'], [200, 'error']] as const) {
    assert.equal(await sendContact(fields, 'en', async () => Response.json({ ok: false }, { status })), expected)
  }
  assert.equal(await sendContact(fields, 'en', async () => { throw new Error('offline') }), 'error')
})

test('unconfigured production adapter returns 503 without any credentials or network', () => {
  const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', `
    const module = await import('./src/lib/contact/server.ts');
    const submitContact = module.submitContact || module.default.submitContact;
    const response = await submitContact(new Request('https://guide.test/api/contact', { method: 'POST' }));
    if (response.status !== 503) process.exit(1);
    console.log('unconfigured:503');
  `], { cwd: process.cwd(), env: { NODE_ENV: 'test' }, encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /unconfigured:503/)
})

test('storage requires journaled majority acknowledgement and stamps inbox metadata', async () => {
  const { storeContactMessage } = await import('../src/lib/contact/storage')
  let acknowledged = false
  const collection = { async insertOne(document: Record<string, unknown>, options: unknown) {
    assert.equal(document.status, 'new')
    assert.ok(document.createdAt instanceof Date)
    assert.deepEqual(options, { writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 } })
    return { acknowledged }
  } }
  assert.equal(await storeContactMessage(collection, valid), false)
  acknowledged = true
  assert.equal(await storeContactMessage(collection, valid), true)
})

test('optional fields may be omitted and stored values are trimmed and allowlisted', async () => {
  const { createContactHandler } = await import('../src/lib/contact/handler')
  const saved: unknown[] = []
  const handler = createContactHandler({ origin: 'https://guide.test', consume: async () => true, save: async value => { saved.push(value); return true } })
  const result = await handler(request({ name: '  Synthetic Visitor  ', email: 'visitor@example.invalid', message: '  Test only  ', lang: 'jp', status: 'handled' }))
  assert.equal(result.status, 201)
  assert.deepEqual(saved[0], { name: 'Synthetic Visitor', email: 'visitor@example.invalid', message: 'Test only', lang: 'jp', phone: '', subject: '' })
})
