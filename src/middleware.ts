import { NextResponse, type NextRequest } from 'next/server'
import { i18n } from '@/lib/i18n.config'

const rootRoutes = new Set(['admin', 'login', 'privacy-policy', 'website-creation-bishkek'])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split('/')[1]

  if (
    !firstSegment ||
    i18n.locales.some(locale => locale === firstSegment) ||
    rootRoutes.has(firstSegment) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${i18n.defaultLocale}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/((?!api|_next).*)'],
}
