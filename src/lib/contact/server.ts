import { MongoClient } from 'mongodb'
import { isIP } from 'node:net'
import { createContactHandler } from './handler'
import { consumeContactLimit } from './limiter'
import { storeContactMessage } from './storage'

// Imported exclusively by the Node route. Never import this module from a client component.
let connection: Promise<MongoClient> | undefined
export async function submitContact(request: Request): Promise<Response> {
  const uri = process.env.CONTACT_MONGODB_URI
  const database = process.env.CONTACT_MONGODB_DATABASE
  const origin = process.env.CONTACT_ORIGIN
  const secret = process.env.CONTACT_RATE_LIMIT_SECRET
  const ipHeader = process.env.CONTACT_TRUSTED_IP_HEADER
  if (!uri || !database || !origin || !secret || secret.length < 32 || !/^[a-zA-Z0-9_-]+$/.test(database)) {
    return Response.json({ error: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
  try {
    if (new URL(origin).origin !== origin || !['https:', 'http:'].includes(new URL(origin).protocol)) throw new Error('Invalid origin')
  } catch { return Response.json({ error: 'unavailable' }, { status: 503 }) }
  const getDatabase = async () => {
    if (!connection) {
      connection = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, socketTimeoutMS: 10000, maxPoolSize: 5 }).connect()
      connection.catch(() => { connection = undefined })
    }
    return (await connection).db(database)
  }
  return createContactHandler({
    origin,
    consume: async () => {
      // Do NOT implicitly trust X-Forwarded-For. Only an explicitly configured,
      // proxy-overwritten single-address header is trusted. Otherwise one shared bucket.
      const candidate = ipHeader ? request.headers.get(ipHeader)?.trim() : undefined
      const identity = candidate && isIP(candidate) ? candidate : 'unknown'
      const db = await getDatabase()
      return consumeContactLimit(db.collection<{ _id: string; count: number; expiresAt: Date }>('contact_rate_limits'), identity, secret)
    },
    save: async message => {
      const db = await getDatabase()
      return storeContactMessage(db.collection('contact_messages'), message)
    },
  })(request)
}
