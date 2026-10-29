import { NextResponse } from 'next/server';
import { getContent } from '@/lib/contentApi';
import { reviewsSchema } from '@/lib/contentSchemas';

export async function GET() {
  try {
    return NextResponse.json(await getContent('reviews', reviewsSchema));
  } catch {
    return NextResponse.json({ error: 'Reviews are temporarily unavailable' }, { status: 502 });
  }
}
