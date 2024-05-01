// Import the required modules
import { MongoClient } from 'mongodb';

// Define the connection URL and the database name
const url = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}`;
const dbName = `${process.env.DB_NAME}`;

// Create a global variable to store the database connection
let cachedDb = null;

// Create a helper function that connects to the database and returns the database object
export async function connectToDatabase() {
  // Check if the database connection is cached
  if (cachedDb) {
    // Return the cached connection
    return cachedDb;
  }

  // Create a new connection to the database
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Select the database
  const db = await client.db(dbName);

  // Cache the database connection
  cachedDb = db;
  console.log("Connected:", db.databaseName)
  // Return the database object
  return db;
}