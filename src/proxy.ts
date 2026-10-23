import { NextResponse, type NextRequest } from 'next/server'
import { i18n } from '@/lib/i18n.config'

const rootRoutes = new Set(['admin', 'login', 'privacy-policy', 'website-creation-bishkek'])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split('/')[1]

  // Recover the malformed legacy URL instead of rewriting it to a 5xx route.
  if (pathname === '/$') {
    const destination = new URL('/en', request.url)
    destination.search = request.nextUrl.search
    return NextResponse.redirect(destination, 308)
  }

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
  matcher: ['/((?!api|_next|.*\\.[^/]+$).*)'],
}
