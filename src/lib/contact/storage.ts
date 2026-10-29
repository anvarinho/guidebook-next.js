import type { ContactMessage } from './handler'

type InboxCollection = {
  insertOne: (document: ContactMessage & { createdAt: Date; status: string }, options: { writeConcern: { w: 'majority'; j: true; wtimeoutMS: number } }) => Promise<{ acknowledged: boolean }>
}
export async function storeContactMessage(collection: InboxCollection, message: ContactMessage): Promise<boolean> {
  const result = await collection.insertOne({ ...message, createdAt: new Date(), status: 'new' }, { writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 } })
  return result.acknowledged
}
