// Real-user beacon. Browsers that execute JavaScript POST here once per page view,
// so nginx's JSON access log can count real visitors apart from crawlers and
// scripts that only fetch HTML. The response carries nginx's gb_vid cookie, and the
// Referer header is the page that was viewed. Nothing is stored by the app itself.
export const dynamic = 'force-dynamic';

export function POST(request: Request) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
}
