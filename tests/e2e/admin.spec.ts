import { test,expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => ['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
});
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email address').fill('admin@example.test');
  await page.getByLabel('Password',{exact:true}).fill('fixture-admin-password');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test('login labels, password visibility, generic failures and mobile layout',async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/login');
  await page.screenshot({path:'test-results/login-mobile.png',fullPage:true});
  await page.getByLabel('Email address').fill('unknown@example.test');
  const password = page.getByLabel('Password',{exact:true});
  await password.fill('incorrect-password');
  await page.getByRole('button',{name:'Show password'}).click();
  await expect(password).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Hide password'}).click();
  await expect(password).toHaveAttribute('type','password');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page.getByRole('alert').filter({hasText:'Unable to sign in'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
});
test('admin login, real counts, pagination, search, save user and logout',async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading',{name:/Your guidebook/})).toBeVisible();
  await page.screenshot({path:'test-results/admin-desktop.png',fullPage:true});
  await expect(page.locator('.stat-card').filter({hasText:'Users'})).toContainText('25');
  await page.getByRole('link',{name:'Team & users',exact:true}).click();
  await expect(page.locator('tbody tr')).toHaveCount(20);
  await page.getByRole('link',{name:'Next',exact:true}).click();
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await page.getByRole('searchbox').fill('fixture-admin');
  await page.getByRole('button',{name:'Search',exact:true}).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('link',{name:/Edit fixture-admin/}).click();
  await page.getByLabel('Phone').fill('+996000000001');
  await page.getByRole('button',{name:'Save user'}).click();
  await expect(page.getByRole('status')).toHaveText('User updated.');
  await page.reload(); await expect(page.getByLabel('Phone')).toHaveValue('+996000000001');
  await page.getByLabel('Account status').selectOption('false');
  await page.getByRole('button',{name:'Save user'}).click();
  await expect(page.getByRole('alert').filter({hasText:'cannot deactivate'})).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Sign out',exact:true}).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/admin/users'); await expect(page).toHaveURL(/\/login$/);
});
test('mobile drawer traps focus, closes with Escape, and content edits persist',async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await login(page);
  const trigger = page.getByRole('button',{name:'Open menu'});
  await trigger.click();
  const drawer = page.getByRole('dialog',{name:'Administration menu'});
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('button',{name:'Close menu'})).toBeFocused();
  for (let i=0;i<12;i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => document.activeElement?.closest('dialog')!==null)).toBe(true); }
  await page.keyboard.press('Escape'); await expect(drawer).not.toBeVisible(); await expect(trigger).toBeFocused();
  await trigger.click(); await drawer.getByRole('link',{name:'Places',exact:true}).click();
  await expect(drawer).not.toBeVisible();
  await page.getByRole('link',{name:/Edit Admin fixture lake/}).click();
  await page.getByRole('textbox',{name:'Description',exact:true}).fill('Updated fixture description');
  await page.getByRole('button',{name:'Save changes'}).click();
  await expect(page.getByRole('status')).toContainText('Content saved');
  await page.reload(); await expect(page.getByRole('textbox',{name:'Description',exact:true})).toHaveValue('Updated fixture description');
  expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/admin-mobile.png',fullPage:true});
});
test('user creation and tour/article editors save real records',async ({ page }) => {
  await login(page);
  await page.goto('/admin/users/add');
  await page.getByLabel('Username',{exact:true}).fill('new-fixture-member');
  await page.getByLabel('Email address').fill('new-member@example.test');
  await page.getByLabel(/^Initial password/).fill('fixture-new-member-password');
  await page.getByRole('button',{name:'Create user',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('User created');
  await page.goto('/admin/tours/admin-fixture-tour');
  await page.getByLabel('Title',{exact:true}).fill('Updated fixture tour');
  await page.getByRole('button',{name:'Save changes'}).click();
  await expect(page.getByRole('status')).toContainText('Content saved');
  await page.reload(); await expect(page.getByLabel('Title',{exact:true})).toHaveValue('Updated fixture tour');
  await page.goto('/admin/articles/admin-fixture-story');
  await page.getByRole('group',{name:'Paragraph 1'}).getByRole('textbox',{name:'Text',exact:true}).fill('Updated fixture paragraph');
  await page.getByRole('button',{name:'Save changes'}).click();
  await expect(page.getByRole('status')).toContainText('Content saved');
  await page.reload(); await expect(page.getByRole('group',{name:'Paragraph 1'}).getByRole('textbox',{name:'Text',exact:true})).toHaveValue('Updated fixture paragraph');
  const { MongoClient } = await import('mongodb');
  const client = await MongoClient.connect('mongodb://127.0.0.1:4330');
  try {
    const article = await client.db('guidebook_admin_fixture').collection('articles').findOne({url:'admin-fixture-story'});
    expect(article!.paragraphs[0].image).toBe('keep-this-image.jpg');
    const member = await client.db('guidebook_admin_fixture').collection('users').findOne({email:'new-member@example.test'});
    expect(member!.isAdmin).toBe(false); expect(member!.password).not.toBe('fixture-new-member-password');
  } finally { await client.close(); }
});
test('overview sums counter windows and legacy requests across exact UTC date boundaries',async ({page})=>{
  await login(page);
  await page.goto('/admin?from=2024-02-29&to=2024-02-29');
  await expect(page.locator('.response-summary > div').first().locator('strong')).toHaveText('35');
  await expect(page.locator('.response-summary > div').nth(1).locator('strong')).toHaveText('11.43%');
  await expect(page.getByRole('img',{name:/Daily recorded API responses/})).toBeVisible();
  await expect(page.getByText('1 stored record has an unsupported shape')).toBeVisible();
  await page.getByText('Explore daily values',{exact:false}).click();
  await expect(page.getByRole('table',{name:'Recorded responses by UTC day'})).toBeVisible();
  await page.getByRole('link',{name:'2024-02-29',exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/reports\?.*from=2024-02-29/);
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await expect(page.getByText('Unsupported record',{exact:true})).toBeVisible();
  const html=await page.content();
  expect(html).not.toContain('never-expose-fixture-token');expect(html).not.toContain('192.0.2.99');expect(html).not.toContain('never-expose-session');
});
test('empty and invalid overview periods give honest states and accessible mobile data',async ({page})=>{
  await login(page);
  await page.setViewportSize({width:390,height:844});
  await expect(page.getByRole('heading',{name:/Your guidebook/})).toBeVisible();
  await page.screenshot({path:'test-results/admin-overview-mobile.png',fullPage:true});
  await page.goto('/admin?from=2024-01-01&to=2024-01-01');
  await expect(page.getByText('No responses recorded in this date range.',{exact:false})).toBeVisible();
  await expect(page.locator('.response-summary > div').nth(1).locator('strong')).toHaveText('—');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.goto('/admin?from=2024-02-30&to=2024-03-01');
  await expect(page.getByRole('alert').filter({hasText:'Choose valid dates'})).toBeVisible();
});
test('translation drilldowns, server sorting, state filters and pagination retain URL choices',async ({page})=>{
  await login(page);
  await page.getByRole('link',{name:/Review missing French text in places/}).click();
  await expect(page).toHaveURL(/state=missing&lang=fr/);
  await page.getByLabel('Sort by').selectOption('name');
  await page.getByRole('button',{name:'Search',exact:true}).click();
  await expect(page).toHaveURL(/sort=name/);await expect(page).toHaveURL(/lang=fr/);
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.goto('/admin/users?state=member&sort=name&q=member');
  await expect(page.locator('tbody tr')).toHaveCount(20);
  await expect(page.locator('tbody tr').first()).toContainText('member-0');
  await page.getByRole('link',{name:'Next',exact:true}).click();
  await expect(page).toHaveURL(/state=member/);await expect(page).toHaveURL(/sort=name/);await expect(page).toHaveURL(/page=2/);
});
test('editor previews sanitize HTML and leaving unsaved content requires confirmation',async ({page})=>{
  await login(page);await page.goto('/admin/places/admin-fixture-lake');
  const description=page.getByRole('textbox',{name:'Description',exact:true});
  await description.fill('# Draft preview\n\n<script>window.previewExecuted=true</script><img src=x onerror="window.previewExecuted=true">');
  await page.getByRole('button',{name:'Preview body',exact:true}).click();
  await expect(page.getByRole('region',{name:'Content preview'}).getByRole('heading',{name:'Draft preview'})).toBeVisible();
  expect(await page.evaluate(()=>Reflect.get(window,'previewExecuted'))).toBeUndefined();
  expect(await page.locator('.preview-body script,.preview-body [onerror]').count()).toBe(0);
  await expect(page.locator('.save-state')).toHaveText('Unsaved changes');
  page.once('dialog',dialog=>dialog.dismiss());
  await page.getByRole('link',{name:'Back to places'}).click();
  await expect(page).toHaveURL(/\/admin\/places\/admin-fixture-lake$/);
  await expect(description).toHaveValue(/Draft preview/);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('link',{name:'Back to places'}).click();
  await expect(page).toHaveURL(/\/admin\/places$/);
});
test('failed saves preserve entered account fields',async ({page})=>{
  await login(page);await page.goto('/admin/users/add');
  await page.getByLabel('Username',{exact:true}).fill('fixture-admin');
  await page.getByLabel('Email address').fill('duplicate-check@example.test');
  await page.getByLabel(/^Initial password/).fill('fixture-duplicate-password');
  await page.getByRole('button',{name:'Create user',exact:true}).click();
  await expect(page.getByRole('alert').filter({hasText:'Unable to save'})).toBeVisible();
  await expect(page.getByLabel('Email address')).toHaveValue('duplicate-check@example.test');
  await expect(page.locator('.save-state')).toHaveText('Unsaved changes');
});
test('operator reset invalidates a live session and preserves account privileges',async ({ page, context }) => {
  await login(page);
  const { MongoClient } = await import('mongodb');
  // The CLI core is exercised against ONLY the isolated browser-test database.
  const { writeAdminAccount } = await import('../../scripts/admin-account.mjs');
  const client = await MongoClient.connect('mongodb://127.0.0.1:4330');
  try {
    const db = client.db('guidebook_admin_fixture');
    const before = await db.collection('users').findOne({email:'admin@example.test'});
    await writeAdminAccount(db,'reset','admin@example.test',undefined,'fixture-admin-password');
    const after = await db.collection('users').findOne({email:'admin@example.test'});
    expect(after!.password).not.toBe(before!.password);
    expect(after!.isAdmin).toBe(true); expect(after!.isActive).toBe(true);
    const session = await context.request.get('/api/auth/session');
    expect(await session.json()).toBeNull();
    await page.goto('/admin/users'); await expect(page).toHaveURL(/\/login$/);
  } finally { await client.close(); }
});
test('persistent login limits block a correct password after repeated failures',async ({ request }) => {
  const { MongoClient } = await import('mongodb');
  const { writeAdminAccount } = await import('../../scripts/admin-account.mjs');
  const client = await MongoClient.connect('mongodb://127.0.0.1:4330');
  try {
    const db = client.db('guidebook_admin_fixture');
    await writeAdminAccount(db,'create','limited@example.test','limited-admin','fixture-limited-password');
    const csrf = await (await request.get('/api/auth/csrf')).json();
    for (let i=0;i<11;i++) {
      const response = await request.post('/api/auth/callback/credentials',{form:{csrfToken:csrf.csrfToken,email:'limited@example.test',password:i===10?'fixture-limited-password':'wrong-password',json:'true',callbackUrl:'/admin'}});
      expect((await response.json()).url).toContain('CredentialsSignin');
    }
    expect(await (await request.get('/api/auth/session')).json()).toEqual({});
    const records = await db.collection('admin_login_limits').find({_id:/^email:/}).toArray();
    expect(records.some(record => record.count===11)).toBe(true);
  } finally { await client.close(); }
});
