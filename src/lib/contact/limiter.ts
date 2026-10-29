import { createHmac } from 'node:crypto'

type CounterCollection = {
  findOneAndUpdate: (filter: { _id: string }, update: { $inc: { count: number }; $setOnInsert: { expiresAt: Date } }, options: { upsert: true; returnDocument: 'after'; writeConcern: { w: 'majority'; wtimeoutMS: number } }) => Promise<{ count: number } | null>
}
export async function consumeContactLimit(collection: CounterCollection, identity: string, secret: string, now = Date.now()) {
  const hash = createHmac('sha256', secret).update(identity).digest('hex')
  // Reject an exhausted address before charging the shared site-wide allowance.
  for (const [key, duration, limit] of [[`ip:${hash}`, 900000, 5], ['global', 3600000, 100]] as const) {
    const window = Math.floor(now / duration)
    const value = await collection.findOneAndUpdate(
      { _id: `${key}:${window}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * duration) } },
      { upsert: true, returnDocument: 'after', writeConcern: { w: 'majority', wtimeoutMS: 5000 } },
    )
    if (!value || value.count > limit) return false
  }
  return true
}
