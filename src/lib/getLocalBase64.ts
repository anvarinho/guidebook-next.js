import 'server-only';
import placeholders from './generated/image-placeholders.json';

const manifest: Record<string, string> = placeholders;

// Lookup only: no network requests, image decoding or filesystem reads per render.
export default function getBase64(imageUrl?: string): string {
  if (!imageUrl) return '';
  const url = new URL(imageUrl, `${process.env.NEXT_PUBLIC_URL || 'https://central-asia.live'}/`);
  return manifest[url.href] || (url.origin === new URL(process.env.NEXT_PUBLIC_URL || 'https://central-asia.live').origin
    ? manifest[url.pathname] : undefined) || '';
}
