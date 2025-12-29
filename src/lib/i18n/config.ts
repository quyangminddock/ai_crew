export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh'

export function getLocaleFromBrowser(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) return 'zh'
  return 'en'
}

export async function getDictionary(locale: Locale) {
  const dictionaries = {
    zh: () => import('./dictionaries/zh.json').then((m) => m.default),
    en: () => import('./dictionaries/en.json').then((m) => m.default),
  }

  return dictionaries[locale]()
}
