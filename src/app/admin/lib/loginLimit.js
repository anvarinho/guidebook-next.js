import 'server-only';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { connectToDatabase } from './mongodb';

// Atomic fixed windows shared by every worker/restart. No raw emails/IPs stored.
export async function consumeLoginLimit(email, headers = {}, now = Date.now()) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('Authentication unavailable');
  const db = await connectToDatabase();
  const counters = db.collection('admin_login_limits');
  await counters.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const hash = value => createHmac('sha256', secret).update(value).digest('hex');
  const limits = [['global', 120], [`email:${hash(String(email).trim().toLowerCase().slice(0, 254))}`, 10]];
  // Opt in only when ingress overwrites this header and direct app access is blocked.
  const header = process.env.ADMIN_TRUSTED_IP_HEADER?.toLowerCase();
  const ip = header && headers[header];
  if (typeof ip === 'string' && isIP(ip)) limits.push([`ip:${hash(ip)}`, 30]);
  const window = Math.floor(now / 900000);
  for (const [key, limit] of limits) {
    const record = await counters.findOneAndUpdate(
      { _id: `${key}:${window}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * 900000) } },
      { upsert: true, returnDocument: 'after', writeConcern: { w: 'majority', j: true, wtimeoutMS: 5000 } },
    );
    if (!record || record.count > limit) return false;
  }
  return true;
}
