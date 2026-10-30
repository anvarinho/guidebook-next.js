import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const environment = process.env;
let origin;
try { origin = new URL(environment.NEXTAUTH_URL); } catch {}
const checks = {
  'Auth secret (32+ characters)':(environment.NEXTAUTH_SECRET?.length || 0)>=32,
  'HTTPS auth origin':!!origin && origin.protocol==='https:' && !origin.username && !origin.password && origin.pathname==='/' && !origin.search && !origin.hash,
  'Admin database name':!!environment.DB_NAME,
  'Admin database connection':!!environment.ADMIN_MONGODB_URI || !!(environment.DB_HOST && environment.DB_PORT),
};
for (const [name,valid] of Object.entries(checks)) console.log(`${valid?'PASS':'FAIL'} ${name}`);
if (process.argv.includes('--routes') && checks['HTTPS auth origin']) {
  try {
    const response = await fetch(new URL('/api/auth/csrf',origin),{signal:AbortSignal.timeout(10000),redirect:'error'});
    const valid = response.ok && typeof (await response.json()).csrfToken==='string';
    console.log(`${valid?'PASS':'FAIL'} Public NextAuth route (HTTP ${response.status})`);
    if (!valid) process.exitCode=1;
  } catch { console.log('FAIL Public NextAuth route'); process.exitCode=1; }
}
if (Object.values(checks).some(valid=>!valid)) process.exitCode=1;
