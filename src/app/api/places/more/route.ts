import { NextRequest, NextResponse } from 'next/server';
import { getContent } from '@/lib/contentApi';
import getBase64 from '@/lib/getLocalBase64';
import { i18n } from '@/lib/i18n.config';

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') || 'en';
  const offset = Number(request.nextUrl.searchParams.get('offset') || 0);
  if (!i18n.locales.some(locale => locale === lang) || !Number.isSafeInteger(offset) || offset < 0) {
    return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
  }
  const data = await getContent<{ count: number; places: PlaceAlias[] }>('places/more', {
    lang, offset: String(offset), limit: '12',
  });
  return NextResponse.json({
    ...data,
    places: data.places.map(place => ({ ...place, blurDataURL: getBase64(place.images[0]) })),
  });
}
