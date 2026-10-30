import 'server-only';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
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

const PAGE_SIZE = 20;
function pageNumber(page) {
  if (!/^[1-9]\d{0,5}$/.test(String(page))) throw new Error('Invalid page');
  return Number(page);
}
async function list(collectionName, filter, page, projection) {
  const offset = pageNumber(page);
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const [count, places] = await Promise.all([
    collection.countDocuments(filter),
    collection.find(filter, projection ? { projection } : {}).sort({ _id:-1 }).skip((offset-1)*PAGE_SIZE).limit(PAGE_SIZE).toArray(),
  ]);
  return { count, places };
}
export async function readPlaces(query = '', page = 1) {
  await requireAdmin();
  return list('places', { 'name.en': { $regex:searchRegex(query) } }, page, { name:1, url:1, region:1, viewCount:1 });
}
export async function readTours(query = '', page = 1) {
  await requireAdmin();
  return list('tours', { $or:[{ title:searchRegex(query) }, { 'title.en':searchRegex(query) }] }, page, { title:1,url:1,viewCount:1,level:1 });
}
export async function readArticles(query = '', page = 1) {
  await requireAdmin();
  return list('articles', { 'title.en':searchRegex(query) }, page, { title:1,url:1,viewCount:1,createdAt:1 });
}
export async function readStats(query = '', page = 1) {
  await requireAdmin();
  return list('statistics', { route:searchRegex(query) }, page, { timestamp:1,route:1,statusCode:1,'query.lang':1 });
}
export async function readUsers(query = '', page = 1) {
  await requireAdmin();
  const pattern = searchRegex(query);
  const result = await list('users', { $or:[{ username:pattern },{ email:pattern }] }, page, userProjection);
  return { ...result, places:result.places.map(userDTO) };
}
export async function readOverview() {
  await requireAdmin();
  const db = await connectToDatabase();
  const names = ['places','tours','articles','users'];
  const counts = await Promise.all(names.map(name => db.collection(name).countDocuments()));
  return Object.fromEntries(names.map((name,index) => [name,counts[index]]));
}

async function readContent(collectionName, url) {
  validateSlug(url);
  const db = await connectToDatabase();
  const record = await db.collection(collectionName).findOne({ url });
  if (!record) notFound();
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
  if (!user) notFound();
  return userDTO(user);
}
