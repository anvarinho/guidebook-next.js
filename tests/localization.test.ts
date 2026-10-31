import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contentLocale, contentLocales, i18n } from '../src/lib/i18n.config';
import { isRtlLocale, localeMetadata } from '../src/lib/localeMetadata';
import { formatTourDuration } from '../src/lib/formatTourDuration';

const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const domains = ['src/dictionaries', 'src/app/intro/translations', 'src/app/[lang]/manas/translations', 'src/app/[lang]/manas-airport-transfers/translations'];
const placeholders = (value: string) => [...value.matchAll(/\{\w+\}/g)].map(match => match[0]).sort();

test('tour duration uses native day plurals and the application locale aliases', () => {
  for (const [count, expected] of [[1, '1 день'], [2, '2 дня'], [5, '5 дней'], [21, '21 день']] as const) {
    assert.equal(formatTourDuration(count, 'ru'), expected);
  }
  assert.equal(formatTourDuration(2, 'uk'), '2 дні');
  assert.equal(formatTourDuration(5, 'uk'), '5 днів');
  assert.equal(formatTourDuration(2, 'kg'), '2 күн');
  assert.equal(formatTourDuration(2, 'kz'), '2 күн');
  assert.match(formatTourDuration(2, 'jp'), /2\s*日/);
  assert.equal(formatTourDuration(2, 'cn'), '2天');
  for (const locale of i18n.locales) assert.ok(formatTourDuration(2, locale).trim());
});

function validate(source: unknown, translated: unknown, path: string) {
  if (typeof source === 'string') {
    assert.equal(typeof translated, 'string', path);
    const text = translated as string;
    assert.ok(!source.trim() || text.trim(), `Empty translation: ${path}`);
    assert.deepEqual(placeholders(text), placeholders(source), `Changed placeholders: ${path}`);
    assert.ok(!text.includes('⟦80'), `Unresolved translation token: ${path}`);
    if (/\.(url|icon|email|phone)$/.test(path) && (/^[+/]|@|\.svg$/.test(source))) assert.equal(text, source, path);
    return;
  }
  if (Array.isArray(source)) {
    assert.ok(Array.isArray(translated), path);
    assert.equal(translated.length, source.length, path);
    source.forEach((value, index) => validate(value, translated[index], `${path}.${index}`));
    return;
  }
  assert.ok(source && typeof source === 'object' && translated && typeof translated === 'object', path);
  const original = source as Record<string, unknown>;
  const target = translated as Record<string, unknown>;
  if (path.endsWith('.Options')) {
    // These keys are displayed as headings, so they are translated too.
    assert.equal(Object.keys(target).length, Object.keys(original).length, path);
    Object.values(target).forEach(value => assert.ok(typeof value === 'string' && value.trim(), path));
    return;
  }
  assert.deepEqual(Object.keys(target).sort(), Object.keys(original).sort(), `Changed structure: ${path}`);
  for (const [key, value] of Object.entries(original)) validate(value, target[key], `${path}.${key}`);
}

test('all 50 locales have valid language metadata and the original API language behavior', () => {
  assert.equal(i18n.locales.length, 50);
  assert.equal(new Set(i18n.locales).size, 50);
  for (const locale of i18n.locales) {
    const info = localeMetadata[locale];
    assert.ok(info.name && info.nativeName && info.og);
    assert.doesNotThrow(() => new Intl.NumberFormat(info.languageTag));
    assert.equal(info.dir, isRtlLocale(locale) ? 'rtl' : 'ltr');
    assert.equal(contentLocale(locale), contentLocales.find(value => value === locale) ?? 'en');
  }
  assert.equal(localeMetadata.kz.tag, 'kk');
  assert.equal(localeMetadata.kg.tag, 'ky');
});

test('all 50 languages preserve the English brand and complete, distinct intro descriptions', () => {
  const english = json('src/app/intro/translations/en.json');
  const descriptionKeys = Object.keys(english).filter(key => key.endsWith('Description'));
  for (const locale of i18n.locales) {
    const dictionary = json(`src/dictionaries/${locale}.json`);
    const intro = json(`src/app/intro/translations/${locale}.json`);
    const transfers = json(`src/app/[lang]/manas-airport-transfers/translations/${locale}.json`);
    assert.equal(dictionary.page.name, 'GuideBook of Kyrgyzstan', `${locale}: translated brand`);
    assert.equal(transfers.s208, 'Central Asia · GuideBook of Kyrgyzstan', `${locale}: translated publisher`);
    assert.ok(transfers.publisherText.includes('GuideBook of Kyrgyzstan'), locale);
    assert.deepEqual(Object.keys(intro).sort(), Object.keys(english).sort(), `${locale}: incomplete intro`);
    const descriptions = descriptionKeys.map(key => intro[key]);
    assert.ok(descriptions.every(value => typeof value === 'string' && value.trim()), locale);
    assert.equal(new Set(descriptions).size, descriptions.length, `${locale}: repeated description`);
  }
});

test('cultural terms describe summer pastures and yurts without literal mistranslations', () => {
  for (const [locale, wrong] of [['tr', 'hapishane'], ['he', 'כלא'], ['fa', 'زندان'], ['bn', 'অনুভূত'], ['ne', 'महसुस गरिएको'], ['ur', 'محسوس']] as const) {
    const intro = json(`src/app/intro/translations/${locale}.json`);
    assert.ok(!`${intro.steppeDescription} ${intro.peaksDescription}`.includes(wrong), `${locale}: incorrect cultural term`);
  }
});

test('all 40 new languages have complete static translations with preserved placeholders and URLs', () => {
  for (const locale of i18n.locales.filter(code => !contentLocales.some(original => original === code))) {
    for (const directory of domains) validate(json(`${directory}/en.json`), json(`${directory}/${locale}.json`), `${locale}:${directory}`);
    const dictionary = json(`src/dictionaries/${locale}.json`);
    assert.equal(dictionary.page.langCode, localeMetadata[locale].languageTag);
    assert.notDeepEqual(dictionary.page.navigation.map((link: { text: string }) => link.text), ['Home', 'Sights', 'Tours', 'Stories', 'About'], `${locale}: untranslated navigation`);
    const contact = json('src/translations/ui/app-lang-contact-content-ts-contactCopy.json')[locale];
    assert.notEqual(contact.email, 'Your email', `${locale}: untranslated email label`);
    assert.notEqual(contact.phone, 'Phone number', `${locale}: untranslated phone label`);
    const about = json('src/translations/ui/app-lang-about-content-ts-aboutContent.json')[locale];
    for (const pair of [...about.cards, ...about.steps]) {
      assert.equal(pair.length, 2, `${locale}: incomplete about-page card`);
      assert.ok(pair.every((value: unknown) => typeof value === 'string' && value.trim()));
    }
  }
});
