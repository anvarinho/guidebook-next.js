import { NextResponse, type NextRequest } from 'next/server'
import { i18n } from '@/lib/i18n.config'

const rootRoutes = new Set(['admin', 'login', 'privacy-policy', 'website-creation-bishkek'])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const firstSegment = pathname.split('/')[1]

  if (pathname === '/') {
    const preference = request.cookies.get('lang')?.value
    const locale = i18n.locales.find(value => value === preference) || i18n.defaultLocale
    const destination = request.nextUrl.clone()
    destination.pathname = `/${locale}`
    const response = NextResponse.redirect(destination, 307)
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    response.headers.set('Vary', 'Cookie')
    return response
  }

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

  // Known legacy redirects are handled by next.config.js before Proxy. Unknown
  // roots must not be rewritten to an HTTPS URL on the HTTP-only Node listener.
  return new NextResponse('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export const config = {
  matcher: ['/((?!api|_next|.*\\.[^/]+$).*)'],
}
