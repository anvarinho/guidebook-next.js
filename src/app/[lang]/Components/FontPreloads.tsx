'use client';

import { preload } from 'react-dom';
import type { Locale } from '@/lib/i18n.config';

/** Discover body/heading fonts in the initial response, before CSS downloads. */
export default function FontPreloads({ lang }: { lang: Locale }) {
  // Exo 2 locales (see layout font-exo-2): Cyrillic + Latin subsets, plus the
  // extended Cyrillic subset for languages with letters such as ң, ө, ү, ә, ғ.
  const extendedCyrillic = ['kz', 'kg', 'tg', 'mn'].includes(lang);
  const fonts = ['ru', 'uk', 'be', 'sr', 'bg', 'mk', 'kz', 'kg', 'tg', 'mn'].includes(lang)
    ? ['e967e3e11e121e1e-s.p.woff2', 'cd5bec9268da5b8d-s.woff2', ...(extendedCyrillic ? ['15e555873b2c38f2-s.woff2'] : [])]
    : ['en', 'it', 'fr', 'de', 'es'].includes(lang)
      ? ['46fe284ea6b208dc-s.p.woff2', '62f8ef394edf20f4-s.p.woff2']
      : [];
  for (const font of fonts) preload(`/fonts/${font}`, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return null;
}
