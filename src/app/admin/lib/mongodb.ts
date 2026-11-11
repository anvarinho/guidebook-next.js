import 'server-only';
import { MongoClient, type Collection, type CreateIndexesOptions, type Db, type IndexSpecification } from 'mongodb';

let connection: Promise<Db> | undefined;

export async function connectToDatabase(): Promise<Db> {
  if (!connection) {
    const { ADMIN_MONGODB_URI, DB_HOST, DB_PORT, DB_NAME } = process.env;
    if (!DB_NAME || (!ADMIN_MONGODB_URI && (!DB_HOST || !DB_PORT))) throw new Error('Database is not configured');
    const uri = ADMIN_MONGODB_URI || `mongodb://${DB_HOST}:${DB_PORT}`;
    connection = MongoClient.connect(uri, { maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 60000, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, socketTimeoutMS: 10000 })
      .then(client => client.db(DB_NAME))
      .catch(() => {
        connection = undefined;
        throw new Error('Database unavailable');
      });
  }
  return connection;
}

const indexes = new Map<string, Promise<unknown>>();

/** Create an index once per process instead of on every request; retried after a failure. */
export function ensureIndex(collection: Pick<Collection, 'collectionName' | 'createIndex'>, spec: IndexSpecification, options: CreateIndexesOptions = {}) {
  const key = JSON.stringify([collection.collectionName, spec, options]);
  let pending = indexes.get(key);
  if (!pending) {
    pending = collection.createIndex(spec, options).catch(error => { indexes.delete(key); throw error; });
    indexes.set(key, pending);
  }
  return pending;
}
