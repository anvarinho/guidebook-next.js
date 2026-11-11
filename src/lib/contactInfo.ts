import type { getDictionary } from './dictionary'

type Page = Awaited<ReturnType<typeof getDictionary>>['page']

/** Public contact details: deployment overrides first, then the locale dictionary. */
export function contactInfo(page: Page) {
  const info = page.footer.sections.find(section => section.info)?.info
  return {
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || info?.phone || '',
    email: process.env.NEXT_PUBLIC_EMAIL || info?.email || '',
    address: info?.address || '',
  }
}
