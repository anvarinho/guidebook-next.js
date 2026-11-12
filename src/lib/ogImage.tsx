import { ImageResponse } from 'next/og';
import { absoluteSiteUrl } from '@/lib/seo';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

// Satori only decodes JPEG/PNG/GIF, so other formats fall back to the gradient.
async function backgroundDataUrl(path?: string): Promise<string | undefined> {
  if (!path) return undefined;
  try {
    const response = await fetch(absoluteSiteUrl(path), { signal: AbortSignal.timeout(4000) });
    const type = response.headers.get('content-type')?.split(';')[0] ?? '';
    if (!response.ok || !['image/jpeg', 'image/png'].includes(type)) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 4 * 1024 * 1024) return undefined;
    return `data:${type};base64,${bytes.toString('base64')}`;
  } catch {
    return undefined;
  }
}

function fitTitle(title: string) {
  return title.length > 70 ? `${title.slice(0, 67).trimEnd()}…` : title;
}

type CardOptions = { eyebrow: string; title: string; detail?: string; image?: string };

// The default OG font is Latin-only, so cards are rendered from the English record.
export async function renderOgCard({ eyebrow, title, detail, image }: CardOptions) {
  const background = await backgroundDataUrl(image);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', position: 'relative',
        background: 'linear-gradient(135deg, #0f3d3e 0%, #1c6b5a 55%, #d9a441 100%)', color: 'white',
      }}>
        {background && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={background} alt="" width={1200} height={630}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.78) 100%)',
        }} />
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          width: '100%', height: '100%', padding: '56px 64px',
        }}>
          <div style={{ display: 'flex', fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.92 }}>
            {eyebrow}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.08 }}>{fitTitle(title)}</div>
            {detail && <div style={{ display: 'flex', fontSize: 34, marginTop: 20, opacity: 0.9 }}>{detail}</div>}
            <div style={{ display: 'flex', fontSize: 28, marginTop: 28, opacity: 0.85 }}>GuideBook of Kyrgyzstan</div>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}

export function renderFallbackCard() {
  return renderOgCard({ eyebrow: 'Kyrgyzstan travel guide', title: 'GuideBook of Kyrgyzstan' });
}
