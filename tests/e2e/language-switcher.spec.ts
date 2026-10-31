import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return host === '127.0.0.1' || host === 'localhost' ? route.continue() : route.abort();
  });
});

test('language popup searches names and codes, traps focus, and restores focus on Escape', async ({ page }) => {
  await page.goto('/en/places/fixture-lake');
  const trigger = page.getByRole('button', { name: 'Choose language', exact: true });
  const popup = page.getByRole('dialog', { name: 'Choose your language', exact: true });
  await expect(popup).toBeHidden();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(popup).toBeVisible();
  const search = popup.getByRole('searchbox', { name: 'Search languages' });
  await expect(search).toBeFocused();
  await expect(popup.getByRole('link')).toHaveCount(50);
  await expect(popup.getByRole('listitem')).toHaveCount(50);
  await expect(popup.locator('button:disabled')).toHaveCount(0);
  await expect(popup.locator('[aria-current="true"]')).toContainText('English');
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  await popup.screenshot({ path: test.info().outputPath('language-popup-desktop.png') });

  for (const [query, expected] of [['francais', 'Français French'], ['日本語', '日本語 Japanese'], ['ja', '日本語 Japanese'], ['ARABIC', 'العربية Arabic'], ['한국어', '한국어 Korean']]) {
    await search.fill(query);
    await expect(popup.getByRole('link')).toHaveCount(1);
    await expect(popup.getByRole('link', { name: expected, exact: true })).toBeVisible();
  }

  await search.fill('unknown-language');
  await expect(popup.getByRole('link')).toHaveCount(0);
  await expect(popup.getByRole('status')).toContainText('No languages found');
  await search.fill('fr');
  await page.keyboard.press('ArrowDown');
  await expect(popup.getByRole('link', { name: 'Français French', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(popup.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(popup.getByRole('link', { name: 'Français French', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  await trigger.click();
  await expect(search).toHaveValue('');
  await expect(popup.getByRole('link')).toHaveCount(50);
});

test('all 50 languages are selectable and code searches find the correct destination', async ({ page }) => {
  await page.goto('/en/places/fixture-lake');
  await page.getByRole('button', { name: 'Choose language', exact: true }).click();
  const popup = page.getByRole('dialog', { name: 'Choose your language', exact: true });
  const search = popup.getByRole('searchbox');
  const codes = 'uz kz kg tr hi ur tg ms fa az uk pl nl he cs pt id th bn ne vi ka hy mn be ro sv nb da fi el hr sr sk sl bg bs mk sq lt'.split(' ');
  await expect(popup.getByRole('link')).toHaveCount(50);
  await expect(popup).not.toContainText('Coming soon');
  for (const code of codes) {
    await search.fill(code);
    const language = popup.getByRole('link');
    await expect(language).toHaveCount(1);
    await expect(language).toHaveAttribute('href', '/' + code + '/places/fixture-lake');
  }
  await search.fill('kk');
  await expect(popup.getByRole('link')).toHaveAttribute('hreflang', 'kk');
  await search.fill('ky');
  await expect(popup.getByRole('link')).toHaveAttribute('hreflang', 'ky');
  await search.fill('Українська');
  await expect(popup.getByRole('link', { name: 'Українська Ukrainian', exact: true })).toBeVisible();
});

test('mobile flag list scrolls and selection retains the current page, query, and preference', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/places/fixture-lake?source=language#details');
  const trigger = page.getByRole('button', { name: 'Choose language', exact: true });
  await trigger.click();
  const popup = page.getByRole('dialog', { name: 'Choose your language', exact: true });
  const list = popup.getByRole('list');
  await popup.screenshot({ path: test.info().outputPath('language-popup-mobile.png') });
  expect(await list.evaluate(element => element.scrollHeight > element.clientHeight)).toBe(true);
  const bounds = await list.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => list.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(popup).toBeVisible();
  await expect(popup).toBeInViewport();
  expect(await popup.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await popup.getByRole('searchbox').fill('fr');
  const french = popup.getByRole('link', { name: 'Français French', exact: true });
  await expect(french).toHaveAttribute('href', '/fr/places/fixture-lake?source=language#details');
  await expect(french).toHaveAttribute('hreflang', 'fr');
  await french.click();
  await expect(page).toHaveURL('/fr/places/fixture-lake?source=language#details');
  await expect(page.locator('#site-languages')).toBeHidden();
  expect((await context.cookies()).find(cookie => cookie.name === 'lang')?.value).toBe('fr');
});

test('old and new flags share the flat artwork and white outline in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto('/en/places/fixture-lake');
    await page.getByRole('button', { name: 'Choose language', exact: true }).click();
    const popup = page.getByRole('dialog', { name: 'Choose your language', exact: true });
    for (const locale of ['en', 'uz', 'ne']) {
      await popup.getByRole('searchbox').fill(locale);
      const flag = popup.getByRole('link').locator('img');
      await expect(flag).toHaveAttribute('src', new RegExp(`${locale}\\.[a-zA-Z0-9_-]+\\.png`));
      await expect(flag).toHaveCSS('filter', /drop-shadow\(rgb\(255, 255, 255\)/);
    }
    await popup.getByRole('searchbox').fill('');
    await popup.screenshot({ path: test.info().outputPath(`white-border-flags-${colorScheme}.png`), animations: 'disabled' });
  }
});

test('popup fits short screens, dismisses from backdrop and close button, and supports RTL', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto('/en/manas');
  const trigger = page.getByRole('button', { name: 'Choose language', exact: true });
  await trigger.click();
  const popup = page.locator('#site-languages');
  const bounds = await popup.boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(480);
  await expect(popup.getByRole('searchbox')).toBeInViewport();
  await popup.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.mouse.click(2, 2);
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.goto('/ae/places/fixture-lake');
  await page.getByRole('button', { name: 'اختيار اللغة', exact: true }).click();
  await expect(popup).toHaveAttribute('dir', 'rtl');
  await expect(popup.getByRole('heading', { name: 'اختر لغتك' })).toBeVisible();
  await popup.getByRole('searchbox').fill('العربية');
  await expect(popup.getByRole('link')).toHaveCount(1);
  await expect(popup.getByRole('link')).toHaveAttribute('hreflang', 'ar');
});
