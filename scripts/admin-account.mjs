// Uses the application's existing bcrypt and MongoDB driver for hash compatibility.
import nextEnv from '@next/env';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import { pathToFileURL } from 'node:url';

export function hiddenPrompt(label, input = process.stdin, output = process.stderr) {
  if (!input.isTTY || !output.isTTY) throw new Error('Run this command in an interactive terminal.');
  return new Promise((resolve,reject) => {
    let value = '';
    const wasRaw = input.isRaw;
    function finish(error) {
      input.off('data', onData); input.setRawMode(wasRaw); input.pause(); output.write('\n');
      if (error) reject(error); else resolve(value);
    }
    function onData(chunk) {
      for (const character of chunk.toString('utf8')) {
        if (character === '\u0003' || character === '\u0004') { finish(new Error('Cancelled.')); return; }
        if (character === '\r' || character === '\n') { finish(); return; }
        if (character === '\u007f' || character === '\b') value = Array.from(value).slice(0,-1).join('');
        else if (character >= ' ' && character !== '\u001b' && value.length < 1000) value += character;
      }
    }
    output.write(label); input.setRawMode(true); input.setEncoding('utf8'); input.resume(); input.on('data',onData);
  });
}

export async function writeAdminAccount(db, mode, email, username, password) {
  if (!['create','reset'].includes(mode) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || email !== email.trim().toLowerCase()) throw new Error('Invalid command or email.');
  if (password.length < 12 || Buffer.byteLength(password) > 72) throw new Error('Use at least 12 characters and at most 72 UTF-8 bytes.');
  if (mode === 'create' && (!username || username.length<3 || username.length>20)) throw new Error('Username must have 3–20 characters.');
  const users = db.collection('users');
  const existing = await users.findOne({ email });
  if (mode === 'create' && existing) throw new Error('Account exists. Use reset to change its password.');
  if (mode === 'reset' && (!existing || existing.isAdmin !== true || existing.isActive !== true)) throw new Error('No active administrator matches that email. Roles and status will not be changed.');
  const passwordHash = await bcrypt.hash(password,12);
  const options = { writeConcern:{ w:'majority',j:true,wtimeoutMS:5000 } };
  if (mode === 'create') {
    await users.createIndex({ email:1 },{ unique:true });
    await users.createIndex({ username:1 },{ unique:true });
    const result = await users.insertOne({ username,email,password:passwordHash,isAdmin:true,isActive:true,phone:'',address:'',createdAt:new Date(),updatedAt:new Date() },options);
    if (!result.acknowledged) throw new Error('Write was not acknowledged.');
  } else {
    // Compare the old hash to avoid overwriting a concurrent password change.
    const result = await users.updateOne({ _id:existing._id,password:existing.password,isAdmin:true,isActive:true },{ $set:{ password:passwordHash,updatedAt:new Date() } },options);
    if (!result.acknowledged || result.matchedCount !== 1) throw new Error('Account changed. Retry the operation.');
    // Existing sessions fail their password fingerprint check immediately.
  }
}

async function main() {
  const [mode,emailArg,username,...extra] = process.argv.slice(2);
  if (!['create','reset'].includes(mode) || !emailArg || extra.length || (mode==='reset' && username)) throw new Error('Usage: npm run admin:account -- create EMAIL USERNAME | reset EMAIL');
  nextEnv.loadEnvConfig(process.cwd());
  const { ADMIN_MONGODB_URI,DB_HOST,DB_PORT,DB_NAME } = process.env;
  if (!DB_NAME || (!ADMIN_MONGODB_URI && (!DB_HOST || !DB_PORT))) throw new Error('Configure ADMIN_MONGODB_URI and DB_NAME first.');
  const email = emailArg.trim().toLowerCase();
  let password = await hiddenPrompt('New password (input hidden): ');
  const confirmation = await hiddenPrompt('Confirm new password: ');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  const client = new MongoClient(ADMIN_MONGODB_URI || `mongodb://${DB_HOST}:${DB_PORT}`,{ maxPoolSize:1,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000 });
  try {
    await client.connect();
    await writeAdminAccount(client.db(DB_NAME),mode,email,username,password);
    process.stdout.write(mode==='create'?'Administrator created. Sign in at /login.\n':'Password reset. Previous sessions are invalid. Sign in at /login.\n');
  } finally { password=''; await client.close(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    // Driver exceptions can include credentials, PII and connection strings.
    const allowed = ['Usage:','Configure ','Run this command','Cancelled.','Passwords do not match.','Use at least','Invalid command','Username must','Account exists.','No active administrator','Account changed.','Write was not acknowledged.'];
    process.stderr.write((allowed.some(prefix => error.message?.startsWith(prefix))?error.message:'Operation failed. Check database access and unique account fields.')+'\n');
    process.exitCode=1;
  });
}
