const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, mocks = {}, env = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require(name) {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === 'server-only') return {};
    if (name === './loginLimit') return { consumeLoginLimit: async () => true };
    return require(name);
  }, process: { env }, Buffer, Date, URL, console: { log() { throw Error('Unexpected logging'); }, error() { throw Error('Unexpected logging'); } } }, { filename });
  return module.exports;
}

function options(overrides = {}, env = {}) {
  return load('src/app/admin/lib/auth.js', {
    '../../../../next.config': { authConfig: {} },
    './utils': {}, './models': {}, 'next-auth': () => ({}),
    './sessions': { createAdminSession: async () => null, validateAdminSession: async () => null, revokeAdminSession: async () => {}, ...overrides },
  }, { NEXTAUTH_SECRET: 'test-only-secret-with-at-least-32-characters', NODE_ENV: 'production', NEXTAUTH_URL: 'https://example.test', ...env }).authOptions;
}

test('NextAuth v4 uses finite server-owned HttpOnly secure SameSite cookies', () => {
  const config = options();
  assert.ok(config, 'A single NextAuth v4 configuration must exist');
  assert.equal(config.session.strategy, 'jwt');
  assert.equal(config.session.maxAge, 28800);
  assert.equal(config.cookies.sessionToken.options.httpOnly, true);
  assert.equal(config.cookies.sessionToken.options.secure, true);
  assert.equal(config.cookies.sessionToken.options.sameSite, 'lax');
  assert.equal(config.cookies.sessionToken.options.maxAge, 28800);
});

function sessionStore() {
  const records = new Map();
  const user = { _id: new (require('mongodb').ObjectId)(), email: 'admin@example.test', username: 'admin', isActive: true, isAdmin: true, password: 'test-hash', sessionSecret: 'must-not-leak' };
  let connections = 0;
  const sessions = {
    createIndex: async () => {},
    insertOne: async (record) => { records.set(record._id, record); return { acknowledged: true }; },
    findOne: async (filter) => records.get(filter._id),
    deleteOne: async (filter) => { records.delete(filter._id); return { acknowledged: true }; },
  };
  const users = { findOne: async () => user };
  const filename = 'src/app/admin/lib/sessions.js';
  assert.ok(fs.existsSync(path.resolve(__dirname, '..', filename)), 'Persisted revocable sessions must exist');
  const api = load(filename, { './mongodb': { connectToDatabase: async () => { connections++; return { collection: (name) => name === 'users' ? users : sessions }; } }, bcrypt: { compare: async (value) => value === 'correct-password' } });
  return { api, records, user, sessions, get connections() { return connections; } };
}

test('login stores only a hashed session handle; logout revokes replayed tokens', async () => {
  const { api, records, user } = sessionStore();
  const principal = await api.createAdminSession({ email: user.email, password: 'correct-password' });
  assert.ok(principal.sid);
  assert.equal(records.size, 1);
  assert.equal(records.has(principal.sid), false);
  const token = { sub: principal.id, sid: principal.sid, exp: Math.floor(Date.now() / 1000) + 3600 };
  const current = await api.validateAdminSession(token);
  assert.equal(current.id, String(user._id));
  assert.equal(current.password, undefined);
  assert.equal(current.sessionSecret, undefined);
  await api.revokeAdminSession(token);
  assert.equal(await api.validateAdminSession(token), null);
});

test('session creation and logout require acknowledged durable writes', async () => {
  const { api, user, sessions } = sessionStore();
  sessions.insertOne = async (_record, options) => {
    assert.equal(options?.writeConcern?.w, 'majority');
    assert.equal(options?.writeConcern?.j, true);
    return { acknowledged: false };
  };
  await assert.rejects(api.createAdminSession({ email: user.email, password: 'correct-password' }), /Session unavailable/);
  sessions.deleteOne = async (_filter, options) => {
    assert.equal(options?.writeConcern?.w, 'majority');
    assert.equal(options?.writeConcern?.j, true);
    return { acknowledged: false };
  };
  await assert.rejects(api.revokeAdminSession({ sid: 'a'.repeat(64) }), /Session unavailable/);
});

test('admin database supports a server-only authenticated/TLS connection URI', async () => {
  let requested;
  const expectedDatabase = {};
  const connector = load('src/app/admin/lib/mongodb.js', {
    mongodb: { MongoClient: { connect: async (uri) => {
      requested = uri;
      return { db: name => { assert.equal(name, 'isolated'); return expectedDatabase; } };
    } } },
  }, { ADMIN_MONGODB_URI: 'mongodb://localhost:27017/?tls=true', DB_NAME: 'isolated' });
  assert.equal(await connector.connectToDatabase(), expectedDatabase);
  assert.equal(requested, 'mongodb://localhost:27017/?tls=true');
});

test('privileged guards await the verified session and fail closed', async () => {
  let session = null;
  const guard = load('src/lib/auth.js', {
    'next-auth': { getServerSession: async () => session },
    'next-auth/jwt': { getToken: async () => null },
    'next/headers': { cookies: async () => ({ getAll: () => [], get: () => undefined }) },
    'next/navigation': { redirect() {} },
    '@/app/admin/lib/data': {},
    '@/app/admin/lib/auth': { authOptions: {}, requireAuthConfiguration() {}, sessionCookieName: 'next-auth.session-token' },
    '@/app/admin/lib/sessions': { revokeAdminSession: async () => {} },
  });
  assert.equal(typeof guard.requireAdmin, 'function', 'Data and actions need an explicit fail-closed guard');
  await assert.rejects(guard.requireAdmin(), /Unauthorized/);
  session = { user: { id: 'verified', isAdmin: false, isActive: true } };
  await assert.rejects(guard.requireAdmin(), /Unauthorized/);
  session.user.isAdmin = true;
  assert.equal((await guard.requireAdmin()).id, 'verified');
  assert.equal(await guard.isAuthenticatedAdmin(), true);
});

test('every admin data function authorizes before touching the database', async () => {
  let connections = 0;
  let checks = 0;
  const data = load('src/app/admin/lib/data.js', {
    '@/lib/auth': { requireAdmin: async () => { checks++; throw Error('Unauthorized'); } },
    './mongodb': { connectToDatabase: async () => { connections++; throw Error('Database must not be reached'); } },
  });
  for (const [name, fn] of Object.entries(data)) {
    if (typeof fn !== 'function') continue;
    await assert.rejects(fn(), /Unauthorized/, name);
  }
  assert.equal(checks, 10);
  assert.equal(connections, 0);
});

test('creating users requires an active admin before processing attacker input', async () => {
  const actions = load('src/app/admin/lib/actions.js', {
    '@/lib/auth': { requireAdmin: async () => { throw Error('Unauthorized'); } },
    './auth': {}, './models': {}, './utils': {}, './mongodb': {},
    'next/cache': {}, 'next/navigation': {},
  });
  await assert.rejects(actions.addUser(new FormData()), /Unauthorized/);
});

test('admin user creation validates fields and assigns roles only after authorization', async () => {
  let inserted;
  let acknowledged = true;
  let authorized = false;
  let connected = false;
  const actions = load('src/app/admin/lib/actions.js', {
    '@/lib/auth': { requireAdmin: async () => { authorized = true; return { isAdmin: true, isActive: true }; } },
    './auth': {}, './models': {}, './utils': {},
    './mongodb': { connectToDatabase: async () => { assert.equal(authorized, true); connected = true; return { collection: () => ({ createIndex: async () => {}, insertOne: async (doc, options) => { inserted = doc; assert.equal(options?.writeConcern?.w, 'majority'); return { acknowledged }; } }) }; } },
    bcrypt: { genSalt: async () => 'salt', hash: async () => 'hashed-password' },
    'next/cache': { revalidatePath() {} }, 'next/navigation': { redirect() {} },
  });
  const form = () => { const data = new FormData(); for (const [k, v] of Object.entries({ username: 'tester', email: 'USER@example.test', password: 'a-good-password', isAdmin: 'false', isActive: 'true' })) data.set(k, v); return data; };
  const bad = form(); bad.set('isAdmin', 'yes');
  await assert.rejects(actions.addUser(bad), /Invalid/);
  assert.equal(connected, false);
  const operator = form(); operator.set('email', '{"$ne":null}');
  await assert.rejects(actions.addUser(operator), /Invalid/);
  const long = form(); long.set('password', 'é'.repeat(37));
  await assert.rejects(actions.addUser(long), /Invalid/);
  await actions.addUser(form());
  assert.equal(inserted.isAdmin, false);
  assert.equal(inserted.isActive, true);
  assert.equal(inserted.email, 'user@example.test');
  assert.equal(inserted.password, 'hashed-password');
  const frameworkForm = form(); frameworkForm.set('$ACTION_ID_test', '');
  await actions.addUser(frameworkForm);
  assert.equal(inserted.isAdmin, false);
  const admin = form(); admin.set('isAdmin', 'true');
  await actions.addUser(admin);
  assert.equal(inserted.isAdmin, true);
  acknowledged = false;
  await assert.rejects(actions.addUser(form()), /Failed to create user/);
});

test('user reads return allowlisted DTOs, never passwords or session material', async () => {
  const doc = { _id: new (require('mongodb').ObjectId)(), username: 'admin', password: 'hash', sessionSecret: 'secret', email: 'admin@example.test', isActive: true, isAdmin: true };
  const data = load('src/app/admin/lib/data.js', {
    '@/lib/auth': { requireAdmin: async () => ({ isAdmin: true }) },
    './mongodb': { connectToDatabase: async () => ({ collection: () => ({ countDocuments: async () => 1, findOne: async () => doc, find: () => ({ sort() { return this; }, skip() { return this; }, limit() { return this; }, toArray: async () => [doc] }) }) }) },
  });
  const single = await data.readUser(String(doc._id));
  const list = await data.readUsers();
  for (const user of [single, ...list.places]) {
    assert.equal(user.password, undefined);
    assert.equal(user.sessionSecret, undefined);
    assert.equal(user.username, 'admin');
  }
});

test('login uses NextAuth CSRF-protected credentials flow, with no client-owned cookies', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/app/admin/ui/loginForm/loginForm.jsx'), 'utf8');
  assert.match(source, /next-auth\/react/);
  assert.doesNotMatch(source, /js-cookie|Cookies\.set|userID|user\[0\]/);
  assert.ok(fs.existsSync(path.resolve(__dirname, '../src/app/api/auth/[...nextauth]/route.js')));
});

test('all admin lookup input is bounded and literal, not Mongo or regex operators', async () => {
  let filter;
  let connected = 0;
  const data = load('src/app/admin/lib/data.js', {
    '@/lib/auth': { requireAdmin: async () => ({ isAdmin: true }) },
    './mongodb': { connectToDatabase: async () => { connected++; return { collection: () => ({ countDocuments: async () => 0, find: (value) => { filter = value; return { count: async () => 0, sort() { return this; }, skip() { return this; }, limit() { return this; }, toArray: async () => [] }; } }) }; } },
  });
  await assert.rejects(data.readUser({ $ne: null }), /Invalid/);
  await assert.rejects(data.readPlace({ $ne: null }), /Invalid/);
  await assert.rejects(data.readTours('a'.repeat(201)), /Invalid/);
  await assert.rejects(data.readPlaces('', -1), /Invalid/);
  assert.equal(connected, 0);
  await data.readPlaces('(a+)+$');
  assert.equal(filter['name.en'].$regex.test('aaaaa'), false);
  assert.equal(filter['name.en'].$regex.test('(a+)+$'), true);
});

test('credentials provider never exposes database exception messages', async () => {
  const config = options({ createAdminSession: async () => { throw Error('private-database-secret'); } });
  const provider = config.providers[0].options;
  assert.equal(await provider.authorize({ email: 'admin@example.test', password: 'wrong' }), null);
});

test('NextAuth tokens reject forgery, expiry and wrong encryption keys', async () => {
  const { encode, getToken } = require('next-auth/jwt');
  const { api, user } = sessionStore();
  const principal = await api.createAdminSession({ email: user.email, password: 'correct-password' });
  const secret = 'test-only-secret-with-at-least-32-characters';
  const valid = await encode({ secret, token: { sub: principal.id, sid: principal.sid }, maxAge: 300 });
  const decode = (value, key = secret) => getToken({ secret: key, cookieName: 'test-session', req: { cookies: { 'test-session': value }, headers: {} } });
  assert.ok(await api.validateAdminSession(await decode(valid)));
  assert.equal(await decode(valid.slice(0, -5) + 'wrong'), null);
  assert.equal(await decode(valid, 'another-secret-key-that-is-not-the-same'), null);
  assert.equal(await decode(await encode({ secret, token: { sub: principal.id, sid: principal.sid }, maxAge: -60 })), null);
});

test('sessions reject expired records, changed passwords and changed current roles', async () => {
  const { api, records, user } = sessionStore();
  assert.equal(await api.createAdminSession({ email: { $ne: null }, password: 'correct-password' }), null);
  assert.equal(await api.createAdminSession({ email: user.email, password: 'wrong' }), null);
  user.isActive = false;
  assert.equal(await api.createAdminSession({ email: user.email, password: 'correct-password' }), null);
  user.isActive = true;
  const principal = await api.createAdminSession({ email: user.email, password: 'correct-password' });
  const token = { sub: principal.id, sid: principal.sid, exp: Math.floor(Date.now() / 1000) + 300 };
  assert.equal(await api.validateAdminSession({ ...token, exp: 0 }), null);
  assert.equal(await api.validateAdminSession({ ...token, sub: 'not-an-object-id' }), null);
  user.isAdmin = false;
  assert.equal(await api.validateAdminSession(token), null);
  user.isAdmin = true;
  user.isActive = false;
  assert.equal(await api.validateAdminSession(token), null);
  user.isActive = true;
  const old = user.password; user.password = 'changed-hash';
  assert.equal(await api.validateAdminSession(token), null);
  user.password = old;
  records.values().next().value.expiresAt = new Date(0);
  assert.equal(await api.validateAdminSession(token), null);
});

test('admin database connector uses supported options and never logs connection details', async () => {
  let count = 0;
  const db = {};
  const api = load('src/app/admin/lib/mongodb.js', {
    mongodb: { MongoClient: { connect: async (url, config) => { count++; assert.equal(config?.useNewUrlParser, undefined); assert.equal(config?.useUnifiedTopology, undefined); return { db: () => db }; } } },
  }, { DB_HOST: 'localhost', DB_PORT: '27017', DB_NAME: 'test-only' });
  const [one, two] = await Promise.all([api.connectToDatabase(), api.connectToDatabase()]);
  assert.equal(one, db);
  assert.equal(two, db);
  assert.equal(count, 1);
});

test('real NextAuth core enforces CSRF, issues secure cookies and revokes on signout', async () => {
  const { AuthHandler } = require(path.join(path.dirname(require.resolve('next-auth')), 'core/index.js'));
  const { api, user, records } = sessionStore();
  const config = options(api);
  const jar = {};
  const call = async (action, method = 'GET', body = {}) => {
    const response = await AuthHandler({ options: config, req: { action, method, body, providerId: action === 'callback' ? 'credentials' : undefined, query: {}, cookies: { ...jar }, headers: {} } });
    for (const cookie of response.cookies || []) {
      if (cookie.options?.maxAge === 0) delete jar[cookie.name]; else jar[cookie.name] = cookie.value;
    }
    return response;
  };
  const credentials = { email: user.email, password: 'correct-password', callbackUrl: '/admin' };
  await call('callback', 'POST', credentials);
  assert.equal(records.size, 0, 'missing CSRF must not create a session');
  const csrf = (await call('csrf')).body.csrfToken;
  const login = await call('callback', 'POST', { ...credentials, csrfToken: csrf });
  assert.equal(records.size, 1);
  const cookie = login.cookies.find(c => c.name === config.cookies.sessionToken.name);
  assert.ok(cookie, 'NextAuth must issue its encrypted cookie');
  assert.equal(cookie.options.httpOnly, true);
  assert.equal(cookie.options.sameSite, 'lax');
  assert.equal(cookie.options.secure, true);
  assert.ok(cookie.options.expires instanceof Date);
  const snapshot = { ...jar };
  const session = (await call('session')).body;
  assert.equal(session.user.id, String(user._id));
  assert.equal(session.user.password, undefined);
  assert.equal(session.user.sid, undefined);
  await call('signout', 'POST', { csrfToken: csrf });
  assert.equal(records.size, 0);
  Object.assign(jar, snapshot);
  assert.equal((await call('session')).body, null, 'replaying a logged-out cookie is denied');
});

test('server logout awaits persisted revocation before clearing all cookie chunks', async () => {
  const events = [];
  let fail = false;
  const token = { sid: 'a'.repeat(64) };
  const api = load('src/lib/auth.js', {
    'next-auth': {},
    'next-auth/jwt': { getToken: async ({ req, cookieName }) => { assert.equal(cookieName, 'test-session'); assert.equal(req.cookies['test-session.0'], 'encrypted'); return token; } },
    'next/headers': { cookies: async () => ({ getAll: () => [{ name: 'test-session.0', value: 'encrypted' }, { name: 'test-session.1', value: 'chunk' }, { name: 'token', value: 'legacy' }, { name: 'theme', value: 'dark' }], delete: name => events.push(name) }) },
    'next/navigation': { redirect: value => events.push(value) },
    '@/app/admin/lib/auth': { authOptions: {}, requireAuthConfiguration() {}, sessionCookieName: 'test-session' },
    '@/app/admin/lib/sessions': { revokeAdminSession: async value => { assert.equal(value, token); await Promise.resolve(); if (fail) throw Error('revocation failed'); events.push('revoked'); } },
  });
  await api.signOut();
  assert.deepEqual(events, ['revoked', 'test-session.0', 'test-session.1', 'token', '/login']);
  events.length = 0; fail = true;
  await assert.rejects(api.signOut(), /revocation failed/);
  assert.deepEqual(events, []);
});

test('authentication fails closed without secrets and does not require them at import/build time', () => {
  const config = (env) => load('src/app/admin/lib/auth.js', { './sessions': {} }, env);
  assert.throws(() => config({}).requireAuthConfiguration(), /not configured/);
  assert.throws(() => config({ NEXTAUTH_SECRET: 'short' }).requireAuthConfiguration(), /not configured/);
  assert.throws(() => config({ NEXTAUTH_SECRET: 'x'.repeat(32), NODE_ENV: 'production', NEXTAUTH_URL: 'http://localhost' }).requireAuthConfiguration(), /HTTPS/);
  for (const origin of ['https://', 'https://user:password@example.test', 'https://example.test/path', 'https://example.test?token=private']) {
    assert.throws(() => config({ NEXTAUTH_SECRET: 'x'.repeat(32), NODE_ENV: 'production', NEXTAUTH_URL: origin }).requireAuthConfiguration(), /HTTPS/);
  }
  assert.doesNotThrow(() => config({ NEXTAUTH_SECRET: 'x'.repeat(32), NODE_ENV: 'production', NEXTAUTH_URL: 'https://example.test' }).requireAuthConfiguration());
});

module.exports = { load, options };

