const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function load(file,mocks={},env={}) {
  const module = {exports:{}};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  vm.runInNewContext(source,{module,exports:module.exports,require(name) { if (name==='server-only') return {}; return mocks[name] ?? require(name); },process:{env},Buffer,Date,console});
  return module.exports;
}
test('login limits persist across module reloads and reject concurrent excess attempts',async () => {
  const records = new Map();
  const collection = {
    createIndex:async () => {},
    findOneAndUpdate:async (filter,update,options) => {
      assert.equal(options.writeConcern.w,'majority'); assert.equal(options.writeConcern.j,true);
      const record = records.get(filter._id) || {count:0,expiresAt:update.$setOnInsert.expiresAt}; record.count++; records.set(filter._id,record);
      return {...record};
    },
  };
  const mocks = {'./mongodb':{connectToDatabase:async () => ({collection:() => collection})}};
  const env = {NEXTAUTH_SECRET:'isolated-test-secret-at-least-32-characters'};
  const limiter = () => load('src/app/admin/lib/loginLimit.js',mocks,env);
  const results = await Promise.all(Array.from({length:20},(_,index) => limiter().consumeLoginLimit(index%2?'ADMIN@example.test':'admin@example.test',{},1000)));
  assert.equal(results.filter(Boolean).length,10);
  assert.equal(await limiter().consumeLoginLimit('admin@example.test',{},2000),false);
  assert.equal(await limiter().consumeLoginLimit('admin@example.test',{},901000),true);
  assert.equal([...records.keys()].some(key => key.includes('@')),false);
  assert.ok([...records.values()].every(value => value.expiresAt instanceof Date));
});
test('login limiter fails closed on database failure and never trusts default forwarding headers',async () => {
  let keys=[];
  const mocks = {'./mongodb':{connectToDatabase:async () => ({collection:() => ({createIndex:async()=>{},findOneAndUpdate:async filter => { keys.push(filter._id); return {count:1}; }})})}};
  const env = {NEXTAUTH_SECRET:'isolated-test-secret-at-least-32-characters'};
  const api = load('src/app/admin/lib/loginLimit.js',mocks,env);
  await api.consumeLoginLimit('test@example.test',{'x-forwarded-for':'1.2.3.4'});
  assert.equal(keys.length,2);
  keys=[]; await load('src/app/admin/lib/loginLimit.js',mocks,{...env,ADMIN_TRUSTED_IP_HEADER:'x-real-ip'}).consumeLoginLimit('test@example.test',{'x-real-ip':'1.2.3.4'});
  assert.equal(keys.length,3); assert.match(keys[2],/^ip:/);
  const failed = load('src/app/admin/lib/loginLimit.js',{'./mongodb':{connectToDatabase:async()=>{throw Error('Unavailable');}}},env);
  await assert.rejects(failed.consumeLoginLimit('test@example.test'));
});
test('new user and content mutations reject unauthenticated direct invocation',async () => {
  let connected=false;
  const actions=load('src/app/admin/lib/actions.js',{'@/lib/auth':{requireAdmin:async()=>{throw Error('Unauthorized');}},'./mongodb':{connectToDatabase:async()=>{connected=true;}},'next/cache':{},'next/navigation':{}});
  await assert.rejects(actions.saveUser({},new FormData()),/Unauthorized/);
  await assert.rejects(actions.saveContent({},new FormData()),/Unauthorized/);
  assert.equal(connected,false);
});
test('user editing rejects extra fields, password changes and self demotion before DB access',async () => {
  const id='66007a184451b615e3800635';
  const actions=load('src/app/admin/lib/actions.js',{'@/lib/auth':{requireAdmin:async()=>({id})},'./mongodb':{connectToDatabase:async()=>{throw Error('Must not reach DB');}},'next/cache':{},'next/navigation':{}});
  function form(values) { const data = new FormData(); for (const [key,value] of Object.entries({id,username:'admin',email:'admin@example.test',isAdmin:'true',isActive:'true',...values})) data.set(key,value); return data; }
  assert.equal((await actions.saveUser({},form({isAdmin:'false'}))).ok,false);
  assert.match((await actions.saveUser({},form({isAdmin:'false'}))).message,/own account/);
  assert.match((await actions.saveUser({},form({password:'a-new-valid-password'}))).message,/operator/);
  assert.match((await actions.saveUser({},form({sessionSecret:'attacker'}))).message,/Check all fields/);
});
test('operator reset preserves roles and supports bcrypt verification without returning password material',async () => {
  const {writeAdminAccount} = await import('../scripts/admin-account.mjs');
  let changes;
  const user = {_id:'fixture-only',isAdmin:true,isActive:true,password:'old-hash'};
  const db = {collection:()=>({findOne:async()=>user,updateOne:async(filter,update)=>{changes={filter,update};return{acknowledged:true,matchedCount:1};}})};
  assert.equal(await writeAdminAccount(db,'reset','admin@example.test',undefined,'new-valid-fixture-password'),undefined);
  assert.equal(await require('bcrypt').compare('new-valid-fixture-password',changes.update.$set.password),true);
  assert.deepEqual(Object.keys(changes.update.$set).sort(),['password','updatedAt']);
  assert.equal(changes.filter.password,'old-hash');
  user.isAdmin=false;
  await assert.rejects(writeAdminAccount(db,'reset','admin@example.test',undefined,'new-valid-fixture-password'),/No active administrator/);
});
test('operator password prompt hides input and restores terminal state on completion and cancellation',async () => {
  const {hiddenPrompt} = await import('../scripts/admin-account.mjs');
  const {EventEmitter} = require('node:events');
  const input = new EventEmitter(); input.isTTY=true; input.isRaw=false;
  const raw=[]; input.setRawMode=value=>raw.push(value); input.setEncoding=()=>{}; input.resume=()=>{}; input.pause=()=>{};
  const writes=[]; const output={isTTY:true,write:value=>writes.push(value)};
  const completed=hiddenPrompt('Password: ',input,output);
  input.emit('data','secret-value\r');
  assert.equal(await completed,'secret-value');
  assert.deepEqual(writes,['Password: ','\n']);
  assert.deepEqual(raw,[true,false]); assert.equal(input.listenerCount('data'),0);
  const cancelled=hiddenPrompt('Password: ',input,output);
  input.emit('data','partial\u0003');
  await assert.rejects(cancelled,/Cancelled/);
  assert.equal(input.listenerCount('data'),0); assert.equal(raw.at(-1),false);
});
