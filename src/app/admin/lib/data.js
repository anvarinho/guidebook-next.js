import 'server-only';
import { requireAdmin } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb';

const userProjection = { _id: 1, username: 1, email: 1, phone: 1, address: 1, isAdmin: 1, isActive: 1 };
const userDTO = (user) => ({ _id: String(user._id), username: user.username, email: user.email, phone: user.phone, address: user.address, isAdmin: user.isAdmin === true, isActive: user.isActive === true });

function searchRegex(query) {
  if (typeof query !== 'string' || query.length > 200) throw new Error('Invalid search');
  return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}
function validateSlug(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 200 || !/^[\p{L}\p{N}_-]+$/u.test(value)) throw new Error('Invalid URL');
}

export async function readPlaces(query = '', page = 1) {
  await requireAdmin();
  const searchPattern = searchRegex(query);
  if (!/^[1-9]\d{0,5}$/.test(String(page)) || !Number.isSafeInteger(Number(page))) throw new Error('Invalid page');
  const db = await connectToDatabase();
  const collection = db.collection('places');
  const filter = { 'name.en': { $regex: searchPattern } };
  const count = await collection.countDocuments(filter);
  const places = await collection.find(filter).skip((Number(page) - 1) * 20).limit(20).toArray();
  return { count, places };
}

export async function readTours(query = '') {
  await requireAdmin();
  const filter = { title: searchRegex(query) };
  const db = await connectToDatabase();
  const collection = db.collection('tours');
  const count = await collection.countDocuments(filter);
  const places = await collection.find(filter).toArray();
  return { count, places };
}

export async function readArticles() {
  await requireAdmin();
  const db = await connectToDatabase();
  const collection = db.collection('articles');
  const count = await collection.countDocuments();
  const places = await collection.find().sort({ createdAt: -1 }).toArray();
  return { count, places };
}

export async function readStats() {
  await requireAdmin();
  const db = await connectToDatabase();
  const collection = db.collection('statistics');
  const count = await collection.countDocuments();
  const records = await collection.find().sort({ timestamp: -1 }).toArray();
  const places = records.map(place => ({
    id: place._id, lang: place.query?.lang || '', sessionID: place.sessionID,
    route: place.route, userAgent: place.requestHeaders?.['user-agent'] || '',
    statusCode: place.statusCode, timestamp: place.timestamp, ip: place.remoteAddress,
  }));
  return { count, places };
}

export async function readUsers() {
  await requireAdmin();
  const db = await connectToDatabase();
  const collection = db.collection('users');
  const count = await collection.countDocuments();
  const places = (await collection.find({}, { projection: userProjection }).toArray()).map(userDTO);
  return { count, places };
}

async function readContent(collectionName, url) {
  validateSlug(url);
  const db = await connectToDatabase();
  const record = await db.collection(collectionName).findOne({ url });
  if (!record) throw new Error('Content not found');
  return record;
}

export async function readPlace(url) {
  await requireAdmin();
  return readContent('places', url);
}
export async function readArticle(url) {
  await requireAdmin();
  return readContent('articles', url);
}
export async function readTour(url) {
  await requireAdmin();
  return readContent('tours', url);
}
export async function readUser(id) {
  await requireAdmin();
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new Error('Invalid user ID');
  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: userProjection });
  if (!user) throw new Error('User not found');
  return userDTO(user);
}

export const cards = [
  { id: 1, title: 'Total Users', number: 10.928, change: 12 },
  { id: 2, title: 'Stock', number: 8.236, change: -2 },
  { id: 3, title: 'Revenue', number: 6.642, change: 18 },
];