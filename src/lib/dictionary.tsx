import 'server-only'
import type { Locale } from './i18n.config'

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then(module => module.default),
  fr: () => import('@/dictionaries/fr.json').then(module => module.default),
  it: () => import('@/dictionaries/it.json').then(module => module.default),
  de: () => import('@/dictionaries/de.json').then(module => module.default),
  es: () => import('@/dictionaries/es.json').then(module => module.default),
  jp: () => import('@/dictionaries/jp.json').then(module => module.default),
  kr: () => import('@/dictionaries/kr.json').then(module => module.default),
  ae: () => import('@/dictionaries/ae.json').then(module => module.default),
  ru: () => import('@/dictionaries/ru.json').then(module => module.default),
  cn: () => import('@/dictionaries/cn.json').then(module => module.default),
}

export const getDictionary = async (lang: Locale) => dictionaries[lang]()