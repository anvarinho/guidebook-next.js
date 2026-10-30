import 'server-only';
import { requireAdmin } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from './mongodb';
import { collectionQuery, periodRange, readyExpr, textCompleteExpr, localizedExpr, responseRows, supportedResponseRecord } from './metrics';

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
async function list(collectionName, filter, page, projection, options = {}) {
  const offset = pageNumber(page);
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  const settings = collectionQuery(options, collectionName === 'statistics' ? 'reports' : collectionName);
  const sort = settings.sort === 'oldest' ? { _id:1 } : settings.sort === 'views' ? { viewCount:-1,_id:-1 } : settings.sort === 'updated' ? { updatedAt:-1,_id:-1 } : { _id:-1 };
  if (collectionName === 'statistics') { delete sort._id; sort.timestamp = settings.sort === 'oldest' ? 1 : -1; sort._id = -1; }
  const rows = settings.sort === 'name' ? collection.aggregate([
    { $match:filter }, { $set:{ __name:collectionName === 'users' ? '$username' : localizedExpr(collectionName === 'places' ? '$name' : '$title') } },
    { $sort:{ __name:1,_id:-1 } }, { $skip:(offset-1)*PAGE_SIZE }, { $limit:PAGE_SIZE }, { $project:projection },
  ], { maxTimeMS:5000,allowDiskUse:false }).toArray() : collection.find(filter, { projection,maxTimeMS:5000 }).sort(sort).skip((offset-1)*PAGE_SIZE).limit(PAGE_SIZE).toArray();
  const [count, places] = await Promise.all([collection.countDocuments(filter,{ maxTimeMS:5000 }), rows]);
  return { count, places };
}
function contentFilter(kind, query, options) {
  const pattern = searchRegex(query);
  const filter = kind === 'places' ? { 'name.en':{ $regex:pattern } } : { $or:[{ title:pattern },{ 'title.en':pattern }] };
  const settings = collectionQuery(options,kind);
  if (settings.state === 'ready') filter.$expr = readyExpr(kind);
  if (settings.state === 'attention') filter.$expr = { $not:[readyExpr(kind)] };
  if (settings.state === 'missing') filter.$expr = { $not:[textCompleteExpr(kind,settings.lang)] };
  return filter;
}
export async function readPlaces(query = '', page = 1, options = {}) {
  await requireAdmin();
  return list('places', contentFilter('places',query,options), page, { name:1,url:1,region:1,viewCount:1,ready:readyExpr('places'),translated:textCompleteExpr('places',collectionQuery(options,'places').lang) },options);
}
export async function readTours(query = '', page = 1, options = {}) {
  await requireAdmin();
  return list('tours', contentFilter('tours',query,options), page, { title:1,url:1,viewCount:1,ready:readyExpr('tours'),translated:textCompleteExpr('tours',collectionQuery(options,'tours').lang) },options);
}
export async function readArticles(query = '', page = 1, options = {}) {
  await requireAdmin();
  return list('articles', contentFilter('articles',query,options), page, { title:1,url:1,viewCount:1,ready:readyExpr('articles'),translated:textCompleteExpr('articles',collectionQuery(options,'articles').lang) },options);
}
export async function readStats(query = '', page = 1, options = {}) {
  await requireAdmin();
  const pattern = searchRegex(query);
  const period = periodRange(options);
  const settings = collectionQuery(options,'reports');
  const filter = { timestamp:{ $gte:period.from,$lt:period.end } };
  if (query) filter.$or = [{ route:pattern },{ 'routes.route':pattern }];
  if (settings.state !== 'all') {
    filter.$and = [{ $or:settings.state === 'errors' ? [
      { statusCode:{ $gte:400,$lte:599 } },
      ...[3,4,5,6,7].map(index=>({ ['routes.responses.'+index]:{ $gt:0 } })),
    ] : [{ statusCode:{ $gte:100,$lt:400 } },...[0,1,2].map(index=>({ ['routes.responses.'+index]:{ $gt:0 } }))] }];
  }
  const result = await list('statistics',filter,page,{timestamp:1,windowStart:1,schemaVersion:1,responseClasses:1,routes:1,route:1,statusCode:1},options);
  return { ...result,places:result.places.map(record=>{
    const rows=responseRows(record).filter(row=>pattern.test(row.route));
    return { _id:String(record._id),timestamp:record.timestamp,kind:!supportedResponseRecord(record)?'Unsupported record':record.schemaVersion===2?'Response window':'Legacy request',
      routes:rows.map(row=>row.route).join(', '),responses:rows.reduce((n,row)=>n+row.responses,0),errors:rows.reduce((n,row)=>n+row.errors,0),supported:supportedResponseRecord(record) };
  }),period };
}
export async function readUsers(query = '', page = 1, options = {}) {
  await requireAdmin();
  const pattern = searchRegex(query);
  const filter = { $or:[{ username:pattern },{ email:pattern }] };
  const { state } = collectionQuery(options,'users');
  if (state === 'active' || state === 'active-admin') filter.isActive = true;
  if (state === 'inactive') filter.isActive = { $ne:true };
  if (state === 'admin' || state === 'active-admin') filter.isAdmin = true;
  if (state === 'member') filter.isAdmin = { $ne:true };
  const result = await list('users',filter,page,userProjection,options);
  return { ...result, places:result.places.map(userDTO) };
}
export async function readOverview(query = {}) {
  await requireAdmin();
  const db = await connectToDatabase();
  const period = periodRange(query);
  const { queryOverview } = await import('./overview');
  return { ...await queryOverview(db,period), period };
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
