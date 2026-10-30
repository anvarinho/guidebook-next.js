// Isolated browser-test database. Never reads project env files or production URIs.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
const directory = await mkdtemp(join(tmpdir(),'guidebook-admin-test-'));
const mongo = spawn('mongod',['--dbpath',directory,'--bind_ip','127.0.0.1','--port','4330','--nounixsocket','--wiredTigerCacheSizeGB','0.25'],{ stdio:'ignore' });
const client = new MongoClient('mongodb://127.0.0.1:4330',{ serverSelectionTimeoutMS:500 });
let server;
let stopping = false;
async function stop() {
  if (stopping) return; stopping = true;
  server?.close(); await client.close();
  if (mongo.exitCode === null) { const exited = new Promise(resolve => mongo.once('exit',resolve)); mongo.kill('SIGTERM'); await exited; }
  await rm(directory,{ recursive:true,force:true });
  process.exit();
}
process.on('SIGTERM',stop); process.on('SIGINT',stop);
mongo.on('error',() => { console.error('Install mongod to run isolated admin browser checks.'); stop(); });
try {
  let connected = false;
  for (let attempt=0; attempt<30; attempt++) {
    try { await client.connect(); connected = true; break; } catch { await new Promise(resolve => setTimeout(resolve,200)); }
  }
  if (!connected) throw new Error('Test MongoDB unavailable');
  const db = client.db('guidebook_admin_fixture');
  await db.collection('users').insertOne({ username:'fixture-admin',email:'admin@example.test',password:await bcrypt.hash('fixture-admin-password',12),isAdmin:true,isActive:true });
  await db.collection('users').insertMany(Array.from({length:24},(_,index) => ({ username:`member-${index}`,email:`member-${index}@example.test`,password:'not-a-valid-hash',isAdmin:false,isActive:true })));
  await db.collection('places').insertOne({ url:'admin-fixture-lake',name:{en:'Admin fixture lake'},title:{en:'Lake title'},region:{en:'Chuy'},keywords:{en:'lake'},description:{en:'A fixture description'},viewCount:4 });
  await db.collection('tours').insertOne({ url:'admin-fixture-tour',title:'Admin fixture tour',description:'A fixture tour',viewCount:2 });
  await db.collection('articles').insertOne({ url:'admin-fixture-story',title:{en:'Admin fixture story'},subtitle:{en:'Subtitle'},keywords:{en:'fixture'},paragraphs:[{title:{en:'Introduction'},text:{en:'Fixture paragraph'},image:'keep-this-image.jpg'}] });
  server = createServer((_request,response) => { response.writeHead(200); response.end('ready'); }).listen(4331,'127.0.0.1');
} catch { console.error('Unable to start isolated admin fixture.'); await stop(); }
