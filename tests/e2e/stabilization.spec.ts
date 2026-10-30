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
    await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2);
    // Static pages emit HTML links; streamed pages may use the HTTP Link header.
    expect(`${response!.headers()['link'] || ''}${await response!.text()}`).toContain('as="font"');
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

test('public detail pages reuse one-minute cached renders without caching private responses', async ({ request }) => {
  for (const path of ['/en/places/fixture-lake', '/ru/places/fixture-lake', '/en/tours/fixture-tour', '/en/articles/fixture-story']) {
    const first = await request.get(path);
    expect(first.status()).toBe(200);
    const repeat = await request.get(path);
    expect(repeat.status()).toBe(200);
    expect(repeat.headers()['x-nextjs-cache']).toBe('HIT');
    expect(repeat.headers()['cache-control']).toContain('s-maxage=60');
    expect(await repeat.text()).toContain('https://central-asia.live' + path);
  }
  const admin = await request.get('/admin', { maxRedirects: 0 });
  expect(admin.status()).toBe(307);
  expect(admin.headers()['cache-control']).toContain('no-store');
  expect(admin.headers()['x-nextjs-cache']).toBeUndefined();
  const missing = await request.get('/en/places/unknown-destination');
  expect(missing.status()).toBe(404);
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

test('mobile detail prioritizes its hero, sizes thumbnails, and waits to load the map', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/en/places/fixture-lake');
  const hero = page.getByRole('img', { name: 'Fixture lake — Photo 1', exact: true });
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(hero).toHaveAttribute('loading', 'eager');
  expect(await response!.text()).toMatch(/<link[^>]+as="image"[^>]+fetchPriority="high"/);
  const map = page.locator('[data-place-map]');
  await expect(map).toHaveCount(1);
  await expect(map.locator('iframe')).toHaveCount(0);
  // The first thumbnail may reuse the already-downloaded hero at a larger width.
  const thumbnail = page.locator('[data-gallery-thumbnails] img').nth(1);
  await expect(thumbnail).toHaveAttribute('sizes', '(max-width: 600px) 72px, 88px');
  await thumbnail.scrollIntoViewIfNeeded();
  await expect.poll(async () => new URL(await thumbnail.evaluate(image => (image as HTMLImageElement).currentSrc)).searchParams.get('w')).toBe('72');
  await map.scrollIntoViewIfNeeded();
  await expect(map.locator('iframe')).toHaveCount(1);
  await expect(map.locator('iframe')).toHaveAttribute('src', /google\.com\/maps\/embed/);
  // Scrolling and resizing must not leave the cached progress geometry stale.
  await page.setViewportSize({ width: 600, height: 844 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(page.locator('[data-reading-progress]')).toHaveCSS('transform', 'matrix(0, 0, 0, 1, 0, 0)');
});

test('analytics preserves early events and loads the library with the idle strategy', async ({ page }) => {
  await page.addInitScript(() => { window.dataLayer = [{ event: 'early-test-event' }]; });
  await page.route('https://www.googletagmanager.com/**', route => route.fulfill({
    contentType: 'application/javascript', body: 'window.testAnalyticsLoaded = true;',
  }));
  await page.goto('/en');
  await expect(page.locator('#guidebook-analytics')).toHaveAttribute('data-nscript', 'lazyOnload');
  expect(await page.evaluate(() => window.dataLayer?.some(event => (event as { event?: string }).event === 'early-test-event'))).toBe(true);
  expect(await page.evaluate(() => window.dataLayer?.some(event => {
    const command = Array.from(event as ArrayLike<unknown>);
    return command[0] === 'config' && command[1] === 'G-TESTONLY';
  }))).toBe(true);
});

test('initial hero is stable through hydration and scroll motion starts on scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const state = window as typeof window & { heroFrameAnimations: number };
    state.heroFrameAnimations = 0;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (this.hasAttribute('data-reveal-gallery')) state.heroFrameAnimations++;
      return animate.call(this, keyframes, options);
    };
  });
  await page.goto('/en/places/fixture-lake');
  const hero = page.getByRole('img', { name: 'Fixture lake — Photo 1', exact: true });
  await expect(hero).toHaveCSS('background-image', 'none');
  const gallery = page.locator('section[data-place-detail-motion]');
  const viewport = hero.locator('..').locator('..');
  await expect(viewport).toHaveCSS('animation-name', 'none');
  expect(await page.evaluate(() => (window as typeof window & { heroFrameAnimations: number }).heroFrameAnimations)).toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 150, behavior: 'instant' }));
  await expect(gallery).toHaveAttribute('data-gallery-scrolled', '');
  if (await page.evaluate(() => CSS.supports('animation-timeline: view()'))) {
    expect(await viewport.evaluate(element => getComputedStyle(element).animationName)).not.toBe('none');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(viewport).toHaveCSS('animation-name', 'none');
});

test('first photo renders without waiting for JavaScript hydration', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3217/en/places/fixture-lake');
    const hero = page.getByRole('img', { name: 'Fixture lake — Photo 1', exact: true });
    await expect(hero).toBeVisible();
    await expect(hero).toHaveCSS('background-image', 'none');
    await expect.poll(() => hero.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  } finally {
    await context.close();
  }
});

test('shared control styles preserve keyboard language selection and the contact button', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/places/fixture-lake');
  const languages = page.locator('#site-languages');
  await expect(languages).toBeHidden();
  const toggle = page.getByRole('button', { name: 'Toggle language menu', exact: true });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(languages).toBeVisible();
  await expect(languages.getByRole('link', { name: 'fr', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(languages).toBeHidden();
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
  await expect(page.getByRole('link', { name: 'Whatsapp contact', exact: true })).toBeInViewport();
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
