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
  await db.collection('places').insertOne({ url:'admin-fixture-lake',name:{en:'Admin fixture lake',ru:'Тестовое озеро'},title:{en:'Lake title',ru:'Озеро'},region:{en:'Chuy'},keywords:{en:'lake'},description:{en:'A fixture description',ru:'Описание озера'},images:['bozteri.jpg'],updatedAt:new Date(Date.now()-3600000),viewCount:4 });
  await db.collection('tours').insertOne({ url:'admin-fixture-tour',title:'Admin fixture tour',description:'A fixture tour',updatedAt:new Date(Date.now()-7200000),viewCount:2 });
  await db.collection('articles').insertOne({ url:'admin-fixture-story',title:{en:'Admin fixture story'},subtitle:{en:'Subtitle'},keywords:{en:'fixture'},paragraphs:[{title:{en:'Introduction'},text:{en:'Fixture paragraph'},image:'keep-this-image.jpg'}],updatedAt:new Date(Date.now()-10800000) });
  const now = Date.now();
  const midnight = Math.floor(now / 86400000) * 86400000;
  const windows = process.env.ADMIN_BENCHMARK === '1' ? 4000 : 1100;
  await db.collection('statistics').insertMany(Array.from({length:windows},(_,index) => ({
    schemaVersion:2, windowStart:new Date(midnight - (index+1)*3600000),
    timestamp:new Date(midnight - index*3600000 - 1),
    responseClasses:['1xx','2xx','3xx','4xx_other','5xx_other','429','503','504'],
    routes:[
      {route:'/api/places',responses:[0,45+(index%27),2,index%4,0,0,0,0]},
      {route:'/api/places/:id',responses:[0,70+(index%40),1,0,1,0,0,0]},
      {route:'/api/tours',responses:[0,20+(index%13),0,1,0,0,0,0]},
      {route:'/api/articles',responses:[0,12+(index%7),0,0,0,0,0,0]},
    ],
  })));
  if(process.env.ADMIN_BENCHMARK !== '1') {
    const classes=['1xx','2xx','3xx','4xx_other','5xx_other','429','503','504'];
    await db.collection('statistics').insertMany([
      {timestamp:new Date('2024-02-27T12:00:00Z'),route:'/api/places',statusCode:200},
      {timestamp:new Date('2024-02-28T23:59:59.999Z'),route:'/api/places',statusCode:200},
      {timestamp:new Date('2024-02-29T00:00:00Z'),schemaVersion:2,responseClasses:classes,routes:[{route:'/api/places',responses:[0,10,0,2,0,1,0,0]}]},
      {timestamp:new Date('2024-02-29T12:00:00Z'),route:'/api/articles',statusCode:503},
      {timestamp:new Date('2024-02-29T13:00:00Z'),route:'/private?token=never-expose-fixture-token',remoteAddress:'192.0.2.99',sessionID:'never-expose-session',statusCode:200},
      {timestamp:new Date('2024-02-29T14:00:00Z'),schemaVersion:99,statusCode:200},
      {timestamp:new Date('2024-02-29T23:59:59.999Z'),schemaVersion:2,responseClasses:classes,routes:[{route:'/api/places',responses:[0,20,0,0,0,0,0,0]}]},
      {timestamp:new Date('2024-03-01T00:00:00Z'),route:'/api/places',statusCode:200},
    ]);
  }
  await db.collection('statistics').createIndex({timestamp:-1});
  if(process.env.ADMIN_BENCHMARK === '1') {
    // Preserve the exact initial benchmark seed while enriching normal browser fixtures.
    await db.collection('places').updateOne({url:'admin-fixture-lake'},{$unset:{images:'',updatedAt:'','name.ru':'','title.ru':'','description.ru':''}});
    await db.collection('tours').updateOne({url:'admin-fixture-tour'},{$unset:{updatedAt:''}});
    await db.collection('articles').updateOne({url:'admin-fixture-story'},{$unset:{updatedAt:''}});
    for(const [kind,size] of [['places',1000],['tours',120],['articles',80]]) {
      await db.collection(kind).insertMany(Array.from({length:size},(_,index) => ({
        url:`benchmark-${kind}-${index}`, name:{en:`Destination ${index}`,ru:index%3?'Перевод':''},
        title:{en:`Travel guide ${index}`,ru:index%3?'Заголовок':''},
        description:{en:index%4?'A synthetic benchmark guide.':'',ru:'Описание'},
        images:index%5?['bozteri.jpg']:[],image:'bozteri.jpg',
        paragraphs:[{title:{en:'Introduction'},text:{en:'A synthetic paragraph.',ru:'Текст'}}],
        viewCount:index*3, updatedAt:new Date(midnight-index*3600000),
      })));
    }
  }
  server = createServer((_request,response) => { response.writeHead(200); response.end('ready'); }).listen(4331,'127.0.0.1');
} catch { console.error('Unable to start isolated admin fixture.'); await stop(); }
