import 'server-only';
import { MongoClient } from 'mongodb';

let connection;

export async function connectToDatabase() {
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
