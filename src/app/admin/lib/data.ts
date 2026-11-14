import 'server-only';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ObjectId, type Document, type Filter, type Sort, type WithId } from 'mongodb';
import { connectToDatabase } from './mongodb';
import { type ContentKind, type Query, collectionQuery, readyExpr, textCompleteExpr, localizedExpr } from './metrics';

const userProjection = { _id: 1, username: 1, email: 1, phone: 1, address: 1, isAdmin: 1, isActive: 1 };
export type UserDTO = ReturnType<typeof userDTO>;
const userDTO = (user: Document) => ({ _id: String(user._id), username: user.username, email: user.email, phone: user.phone, address: user.address, isAdmin: user.isAdmin === true, isActive: user.isActive === true });

function searchRegex(query: unknown) {
  if (typeof query !== 'string' || query.length > 200) throw new Error('Invalid search');
  return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}
function validateSlug(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 200 || !/^[\p{L}\p{N}_-]+$/u.test(value)) throw new Error('Invalid URL');
}

const PAGE_SIZE = 20;
function pageNumber(page: unknown) {
  if (!/^[1-9]\d{0,5}$/.test(String(page))) throw new Error('Invalid page');
  return Number(page);
}
async function list(collectionName: string, filter: Filter<Document>, page: unknown, projection: Document, options: Query = {}) {
  const offset = pageNumber(page);
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const settings = collectionQuery(options, collectionName);
  const sort: Record<string, 1 | -1> = settings.sort === 'oldest' ? { _id:1 } : settings.sort === 'views' ? { viewCount:-1,_id:-1 } : settings.sort === 'updated' ? { updatedAt:-1,_id:-1 } : { _id:-1 };
  const rows = settings.sort === 'name' ? collection.aggregate([
    { $match:filter }, { $set:{ __name:collectionName === 'users' ? '$username' : localizedExpr(collectionName === 'places' ? '$name' : '$title') } },
    { $sort:{ __name:1,_id:-1 } as Sort }, { $skip:(offset-1)*PAGE_SIZE }, { $limit:PAGE_SIZE }, { $project:projection },
  ], { maxTimeMS:5000,allowDiskUse:false }).toArray() : collection.find(filter, { projection,maxTimeMS:5000 }).sort(sort).skip((offset-1)*PAGE_SIZE).limit(PAGE_SIZE).toArray();
  const [count, places] = await Promise.all([collection.countDocuments(filter,{ maxTimeMS:5000 }), rows as Promise<WithId<Document>[]>]);
  return { count, places };
}
function contentFilter(kind: ContentKind, query: unknown, options: Query): Filter<Document> {
  const pattern = searchRegex(query);
  const filter: Filter<Document> = kind === 'places' ? { 'name.en':{ $regex:pattern } } : { $or:[{ title:pattern },{ 'title.en':pattern }] };
  const settings = collectionQuery(options,kind);
  if (settings.state === 'ready') filter.$expr = readyExpr(kind);
  if (settings.state === 'attention') filter.$expr = { $not:[readyExpr(kind)] };
  if (settings.state === 'missing') filter.$expr = { $not:[textCompleteExpr(kind,settings.lang)] };
  return filter;
}
export async function readPlaces(query = '', page: unknown = 1, options: Query = {}) {
  await requireAdmin();
  return list('places', contentFilter('places',query,options), page, { name:1,url:1,region:1,viewCount:1,ready:readyExpr('places'),translated:textCompleteExpr('places',collectionQuery(options,'places').lang) },options);
}
export async function readTours(query = '', page: unknown = 1, options: Query = {}) {
  await requireAdmin();
  return list('tours', contentFilter('tours',query,options), page, { title:1,url:1,viewCount:1,ready:readyExpr('tours'),translated:textCompleteExpr('tours',collectionQuery(options,'tours').lang) },options);
}
export async function readArticles(query = '', page: unknown = 1, options: Query = {}) {
  await requireAdmin();
  return list('articles', contentFilter('articles',query,options), page, { title:1,url:1,viewCount:1,ready:readyExpr('articles'),translated:textCompleteExpr('articles',collectionQuery(options,'articles').lang) },options);
}
export async function readUsers(query = '', page: unknown = 1, options: Query = {}) {
  await requireAdmin();
  const pattern = searchRegex(query);
  const filter: Filter<Document> = { $or:[{ username:pattern },{ email:pattern }] };
  const { state } = collectionQuery(options,'users');
  if (state === 'active' || state === 'active-admin') filter.isActive = true;
  if (state === 'inactive') filter.isActive = { $ne:true };
  if (state === 'admin' || state === 'active-admin') filter.isAdmin = true;
  if (state === 'member') filter.isAdmin = { $ne:true };
  const result = await list('users',filter,page,userProjection,options);
  return { ...result, places:result.places.map(userDTO) };
}
export async function readOverview() {
  await requireAdmin();
  const db = await connectToDatabase();
  const { queryOverview } = await import('./overview');
  return queryOverview(db);
}

async function readContent(collectionName: ContentKind, url: unknown) {
  validateSlug(url);
  const db = await connectToDatabase();
  const record = await db.collection(collectionName).findOne({ url });
  if (!record) notFound();
  return record;
}

export async function readPlace(url: unknown) {
  await requireAdmin();
  return readContent('places', url);
}
export async function readArticle(url: unknown) {
  await requireAdmin();
  return readContent('articles', url);
}
export async function readTour(url: unknown) {
  await requireAdmin();
  return readContent('tours', url);
}
export async function readUser(id: unknown) {
  await requireAdmin();
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new Error('Invalid user ID');
  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: userProjection });
  if (!user) notFound();
  return userDTO(user);
}
