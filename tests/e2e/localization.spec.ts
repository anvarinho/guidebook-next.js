import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { i18n, baseLocales } from '../../src/lib/i18n.config';
import { localeMetadata } from '../../src/lib/localeMetadata';

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
const added = i18n.locales.filter(locale => !baseLocales.some(original => original === locale));

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return host === '127.0.0.1' || host === 'localhost' ? route.continue() : route.abort();
  });
});

test('all 50 homepages render in their own language with localized metadata', async ({ request }) => {
  for (const locale of i18n.locales) {
    const response = await request.get(`/${locale}`);
    expect(response.status(), locale).toBe(200);
    const html = await response.text();
    const messages = json(`src/app/intro/translations/${locale}.json`);
    expect(html, locale).toContain(escapeHtml(messages.heroTitle));
    expect(html, locale).toContain(`lang="${localeMetadata[locale].tag}"`);
    expect(html, locale).toContain(`<title>${escapeHtml(messages.metaTitle)}</title>`);
    expect(html, locale).toContain(`href="https://central-asia.live/${locale}"`);
    expect(html, locale).not.toContain('Application error');
    expect(html, locale).toMatch(/translate="no"[^>]*>GuideBook of Kyrgyzstan/);
  }
});

test('every new locale renders translated about, Manas, and airport transfer pages', async ({ request }) => {
  test.setTimeout(120000);
  for (const locale of added) {
    const dictionary = json(`src/dictionaries/${locale}.json`);
    for (const [path, title] of [['about', dictionary.page.about.title], ['manas', json(`src/app/[lang]/manas/translations/${locale}.json`).s003], ['manas-airport-transfers', json(`src/app/[lang]/manas-airport-transfers/translations/${locale}.json`).s246]]) {
      const response = await request.get(`/${locale}/${path}`);
      expect(response.status(), `${locale}/${path}`).toBe(200);
      const html = await response.text();
      expect(html, `${locale}/${path}`).toContain(escapeHtml(title));
      expect(html, `${locale}/${path}`).not.toContain('Application error');
    }
  }
});

test('new languages switch from the popup and keep the API content usable', async ({ page, context }) => {
  await page.goto('/en/places/fixture-lake?source=language');
  await page.getByRole('button', { name: 'Choose language', exact: true }).click();
  const popup = page.getByRole('dialog', { name: 'Choose your language', exact: true });
  await popup.getByRole('searchbox').fill('uk');
  await popup.getByRole('link', { name: 'Українська Ukrainian', exact: true }).click();
  await expect(page).toHaveURL('/uk/places/fixture-lake?source=language');
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
  await expect(page.locator('[data-place-page]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Тестове озеро', exact: true })).toBeVisible();
  await expect(page.locator('footer')).toContainText(json('src/dictionaries/uk.json').page.about.buttons.contact_us);
  expect((await context.cookies()).find(cookie => cookie.name === 'lang')?.value).toBe('uk');
  const root = await page.request.get('/', { maxRedirects: 0 });
  expect(root.headers().location).toBe('/uk');
});

test('Hebrew, Persian, and Urdu pages and contact forms use RTL and translated labels', async ({ page }) => {
  const contact = json('src/translations/ui/app-lang-contact-content-ts-contactCopy.json');
  const submission = json('src/translations/ui/app-lang-contact-submission-copy-ts-submissionCopy.json');
  for (const locale of ['he', 'fa', 'ur']) {
    await page.goto(`/${locale}/contact`);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('dir', 'rtl');
    await expect(dialog.getByLabel(contact[locale].name, { exact: true })).toBeVisible();
    await expect(dialog.getByRole('button', { name: submission[locale].send, exact: true })).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: test.info().outputPath('localized-rtl-contact.png'), animations: 'disabled' });
});
