import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { connectToDatabase } from './mongodb';

const MAX_AGE_MS = 8 * 60 * 60 * 1000;
const durableWrite = { writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 } };
const digest = (value) => createHash('sha256').update(value).digest('hex');
const validId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
const validHandle = (value) => typeof value === 'string' && /^[a-f\d]{64}$/i.test(value);
const dummyHash = '$2b$12$c29TdB61gfKr8s266BbVLuq01qJyVSfUww7C5e3iHJk4KvFmVxRKS';

// Explicit allowlist: never return hashes, session handles, or arbitrary DB fields.
export function adminDTO(user) {
  return { id: String(user._id), username: user.username, email: user.email, isAdmin: true, isActive: true };
}

export async function createAdminSession(credentials) {
  if (typeof credentials?.email !== 'string' || credentials.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email) ||
      typeof credentials.password !== 'string' || credentials.password.length < 1 || Buffer.byteLength(credentials.password, 'utf8') > 72) return null;
  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ email: credentials.email.trim().toLowerCase() });
  const eligible = user?.isAdmin === true && user?.isActive === true && typeof user?.password === 'string';
  const matches = await bcrypt.compare(credentials.password, eligible ? user.password : dummyHash);
  if (!eligible || !matches) return null;
  const sid = randomBytes(32).toString('hex');
  const sessions = db.collection('admin_sessions');
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const result = await sessions.insertOne({
    _id: digest(sid), userId: user._id,
    passwordFingerprint: digest(user.password),
    expiresAt: new Date(Date.now() + MAX_AGE_MS),
  }, durableWrite);
  if (!result.acknowledged) throw new Error('Session unavailable');
  return { id: String(user._id), sid };
}

// Called only with a token authenticated/decrypted by NextAuth, not browser claims.
export async function validateAdminSession(token) {
  if (!validId(token?.sub) || !validHandle(token?.sid) || !Number.isFinite(token.exp) || token.exp * 1000 <= Date.now()) return null;
  const db = await connectToDatabase();
  const record = await db.collection('admin_sessions').findOne({ _id: digest(token.sid) });
  if (!record || String(record.userId) !== token.sub || !(record.expiresAt instanceof Date) || record.expiresAt.getTime() <= Date.now()) return null;
  const user = await db.collection('users').findOne({ _id: new ObjectId(token.sub) });
  if (!user || user.isAdmin !== true || user.isActive !== true || typeof user.password !== 'string' || digest(user.password) !== record.passwordFingerprint) return null;
  return adminDTO(user);
}

export async function revokeAdminSession(token) {
  if (!validHandle(token?.sid)) return;
  const db = await connectToDatabase();
  const result = await db.collection('admin_sessions').deleteOne({ _id: digest(token.sid) }, durableWrite);
  if (!result.acknowledged) throw new Error('Session unavailable');
}
