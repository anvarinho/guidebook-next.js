import { test, expect } from '@playwright/test';
import { build } from 'esbuild';

let sliderScript = '';
let sliderStyles = '';
test.beforeAll(async () => {
  // ImageSlider has no public route caller. Mount the actual component without
  // adding a test-only route to the production application.
  const result = await build({
    stdin: {
      contents: `import React from 'react'; import { createRoot } from 'react-dom/client';
        import ImageSlider from './src/app/[lang]/Components/image/ImageSlider';
        createRoot(document.getElementById('root')).render(<ImageSlider items={['bozteri.jpg', 'karakolcablelift.jpg']} priority={false}/>);`,
      loader: 'tsx', resolveDir: process.cwd(),
    },
    bundle: true, write: false, outdir: '/tmp/guidebook-slider-browser',
    loader: { '.css': 'local-css' },
    define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_URL': '""' },
    plugins: [{ name: 'next-image-browser-fixture', setup(builder) {
      builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: 'image', namespace: 'fixture' }));
      builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
        contents: `import React from 'react'; export default function Image({fill,priority,placeholder,blurDataURL,...props}) { return React.createElement('img',props); }`,
        loader: 'js', resolveDir: process.cwd(),
      }));
    } }],
  });
  sliderScript = result.outputFiles.find(file => file.path.endsWith('.js'))!.text;
  sliderStyles = result.outputFiles.find(file => file.path.endsWith('.css'))!.text;
});

test.beforeEach(async ({ page }) => {
  // Browser smoke tests must never call external providers or production APIs.
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return host === '127.0.0.1' || host === 'localhost' ? route.continue() : route.abort();
  });
});

test('root preference is private, allowlisted, and does not override explicit URLs', async ({ request }) => {
  for (const [cookie, destination] of [['ru', 'ru'], ['invalid', 'en'], ['', 'en']]) {
    const response = await request.get('/', { headers: { cookie: `lang=${cookie}` }, maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe(`/${destination}`);
    expect(response.headers()['cache-control']).toContain('no-store');
  }
  const response = await request.get('/fr', { headers: { cookie: 'lang=ru' }, maxRedirects: 0 });
  expect(response.status()).toBe(200);
});

test('public pages render with production canonical URLs and localized alternates', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/en', '/ru/manas', '/en/places', '/en/places/fixture-lake', '/en/manas-airport-transfers', '/en/articles/fixture-story']) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://central-asia.live${path}`);
    await expect(page.locator('link[rel="alternate"][hreflang="ru-RU"], link[rel="alternate"][hreflang="ru"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('body')).not.toContainText('Application error');
    if (path === '/en/places/fixture-lake') {
      await expect(page.locator('[data-place-page]')).toBeVisible();
      await expect(page.locator('[data-place-detail-card]').first()).toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test('production responses protect content and keep admin routes out of search', async ({ request }) => {
  for (const path of ['/en', '/en/places', '/login', '/admin', '/api/auth/session']) {
    const response = await request.get(path, { maxRedirects: 0 });
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
    expect(headers['content-security-policy']).toContain("object-src 'none'");
    expect(headers['strict-transport-security']).toBe('max-age=31536000');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['x-powered-by']).toBeUndefined();
    if (path !== '/en' && path !== '/en/places') {
      expect(headers['x-robots-tag']).toBe('noindex, nofollow');
    }
    if (path === '/admin') expect(headers['cache-control']).toContain('no-store');
  }
});

test('login metadata is descriptive and privacy artwork respects reduced motion', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle('Admin login | GuideBook');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/privacy-policy');
  await expect(page.locator('#text')).toBeInViewport();
  const moon = page.locator('#moon');
  await page.evaluate(async () => {
    window.scrollTo(0, 500);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  expect(await moon.evaluate(element => element.style.top)).toBe('0px');
  await expect(page.locator('section img[alt=""]')).toHaveCount(4);
});

test('login renders and admin rejects missing and forged legacy cookies', async ({ page, context }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login/);
  await context.addCookies([
    { name: 'token', value: 'not-a-valid-session', url: 'http://127.0.0.1:3217' },
    { name: 'userID', value: '000000000000000000000001', url: 'http://127.0.0.1:3217' },
    { name: 'isAdmin', value: 'true', url: 'http://127.0.0.1:3217' },
  ]);
  await page.goto('/admin/users/add');
  await expect(page).toHaveURL(/\/login/);
});

test('carousel controls work by keyboard and interaction suspends autoplay', async ({ page }) => {
  await page.clock.install();
  await page.goto('/login');
  await page.setContent('<main><div id="root"></div></main>');
  await page.addStyleTag({ content: sliderStyles });
  await page.addScriptTag({ content: sliderScript });
  const carousel = page.locator('[aria-roledescription="carousel"]').first();
  await expect(carousel).toBeVisible();
  const next = carousel.getByRole('button', { name: 'Next slide', exact: true });
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(carousel.locator('[aria-current="true"]')).toHaveAccessibleName('Go to slide 2');
  await page.clock.fastForward(6000);
  await expect(carousel.locator('[aria-current="true"]')).toHaveAccessibleName('Go to slide 2');
  await expect(carousel.locator('[aria-roledescription="slide"][aria-hidden="false"]')).toHaveCount(1);
  await expect(carousel.locator('[aria-roledescription="slide"][inert]')).toHaveCount(1);
  await expect(carousel.getByRole('button', { name: /Resume slideshow/ })).toBeVisible();
});

test('carousel respects reduced motion and exposes an explicit resume control', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('/login');
  await page.setContent('<main><div id="root"></div></main>');
  await page.addStyleTag({ content: sliderStyles });
  await page.addScriptTag({ content: sliderScript });
  const carousel = page.locator('[aria-roledescription="carousel"]').first();
  await expect(carousel.locator('[aria-current="true"]')).toHaveAccessibleName('Go to slide 1');
  await page.clock.fastForward(12000);
  await expect(carousel.locator('[aria-current="true"]')).toHaveAccessibleName('Go to slide 1');
  await expect(carousel.getByRole('button', { name: 'Resume slideshow', exact: true })).toBeVisible();
});

test('unconfigured contact never reports delivery success', async ({ page, request }) => {
  const response = await request.post('/api/contact', { data: { name: 'Fixture visitor', email: 'visitor@example.test', message: 'A test enquiry', lang: 'en' }, headers: { origin: 'http://127.0.0.1:3217' } });
  expect(response.status()).toBe(503);
  await page.goto('/en/contact');
  const form = page.locator('dialog form');
  await expect(form).toBeVisible();
  await form.locator('[name="name"]').fill('Fixture visitor');
  await form.locator('[name="email"]').fill('visitor@example.test');
  await form.locator('[name="message"]').fill('A test enquiry that must not be delivered');
  await form.getByRole('button', { name: /send/i }).click();
  await expect(form.getByRole('status')).toContainText('could not confirm receipt');
  await expect(form.locator('[name="message"]')).toHaveValue('A test enquiry that must not be delivered');
});
