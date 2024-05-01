import { ObjectId } from "mongodb";
import { connectToDatabase } from "./mongodb";

export async function readPlaces(query = "", page = 1) {
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('places');

  // Create a regex pattern for the search query
  const searchPattern = new RegExp(query, "i");

  // Construct the filter based on the nested title.en field
  const filter = {
    "name.en": { $regex: searchPattern },
  };

  // Calculate pagination values
  const pageSize = 20; // Number of places per page
  const skip = (page - 1) * pageSize;

  // Find places with pagination
  const count = await placesCollection.find(filter).count();
  const places = await placesCollection.find(filter)
    .skip(skip)
    .limit(pageSize)
    .toArray();

  return { count, places };
}

export async function readTours(query = "") {
  'use server'
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('tours');

  const searchPattern = new RegExp(query, "i");
  // Find all places and convert to array
  const count = await placesCollection.find({ title: searchPattern }).length
  const places = await placesCollection.find({ title: searchPattern }).toArray();

  return { count, places };
}

export async function readArticles() {
  'use server'
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('articles');
  // Find all places and convert to array
  const count = await placesCollection.find().length
  const places = await placesCollection.find().sort({ createdAt: -1 }).toArray();

  return { count, places };
}

export async function readStats() {
  // Connect to the database
  const db = await connectToDatabase();
  
  // Get the 'statistics' collection
  const placesCollection = db.collection('statistics');
  
  // Get the count of documents in the collection
  const count = await placesCollection.countDocuments();
  
  // Find all places and convert to array
  const collection = await placesCollection.find().sort({ timestamp: -1 }).toArray();

  // Map through each place object
  const places = collection.map(place => {
    // Here you can manipulate each 'place' object as needed
    // For example, let's add an additional property called 'modifiedName'
    let lang = (place.query && place.query.lang) ? place.query.lang : "";
    let userAgent = (place.requestHeaders) ? place.requestHeaders['user-agent'] : ""
    // Return a new object with the modified property
    return {
      id: place._id, // Spread the existing properties of 'place'
      lang: lang,
      sessionID: place.sessionID,
      route: place.route,
      userAgent: userAgent,
      statusCode: place.statusCode,
      timestamp: place.timestamp,
      ip: place.remoteAddress
    };
  });

  return { count, places };
}

export async function readUsers() {
  'use server'
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('users');
  // Find all places and convert to array
  const count = await placesCollection.find().length
  const places = await placesCollection.find().toArray();

  return { count, places };
}

export async function readPlace(url) {
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('places');

  try {
    // Find the place by its ID
    const place = await placesCollection.findOne({ url: url });

    if (!place) {
      throw new Error("Place not found");
    }

    return place;
  } catch (error) {
    throw new Error("Error fetching place by ID");
  }
}

export async function readArticle(url) {
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('articles');

  try {
    // Find the place by its ID
    const place = await placesCollection.findOne({ url: url });

    if (!place) {
      throw new Error("Place not found");
    }

    return place;
  } catch (error) {
    throw new Error("Error fetching place by ID");
  }
}

export async function readTour(url) {
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'places' collection
  const placesCollection = db.collection('tours');

  try {
    // Find the place by its ID
    const place = await placesCollection.findOne({ url: url });

    if (!place) {
      throw new Error("Place not found");
    }

    return place;
  } catch (error) {
    throw new Error("Error fetching place by ID");
  }
}
export async function readUser(id) {
  // Connect to the database
  const db = await connectToDatabase();
  // Get the 'users' collection
  const usersCollection = db.collection('users');

  try {
    // Find the user by its ID
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error.message);
    throw new Error("Error fetching user by ID");
  }
}



// DUMMY DATA

export const cards = [
  {
    id: 1,
    title: "Total Users",
    number: 10.928,
    change: 12,
  },
  {
    id: 2,
    title: "Stock",
    number: 8.236,
    change: -2,
  },
  {
    id: 3,
    title: "Revenue",
    number: 6.642,
    change: 18,
  },
];