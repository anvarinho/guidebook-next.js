import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { absoluteSiteUrl } from '@/lib/seo';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

function sniffImageType(bytes: Buffer): 'image/jpeg' | 'image/png' | undefined {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length > 4 && bytes.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) return 'image/png';
  return undefined;
}

// Satori only decodes JPEG/PNG/GIF, so other formats fall back to the gradient.
async function backgroundDataUrl(path?: string): Promise<string | undefined> {
  if (!path) return undefined;
  try {
    const response = await fetch(absoluteSiteUrl(path), { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 4 * 1024 * 1024) return undefined;
    // Trust the file's magic bytes, not Content-Type or the extension: a PNG saved as
    // .jpg (served as image/jpeg) makes satori pick the wrong decoder and crash the render.
    const type = sniffImageType(bytes);
    if (!type) return undefined;
    return `data:${type};base64,${bytes.toString('base64')}`;
  } catch {
    return undefined;
  }
}

// The site emblem, drawn in the card's corner so a shared link shows who it is from.
async function emblemDataUrl(): Promise<string | undefined> {
  try {
    const bytes = await readFile(path.join(process.cwd(), 'src/app/icon.png'));
    return `data:image/png;base64,${bytes.toString('base64')}`;
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
  const [background, emblem] = await Promise.all([backgroundDataUrl(image), emblemDataUrl()]);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.92 }}>
              {eyebrow}
            </div>
            {emblem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={emblem} alt="" width={96} height={96} style={{ width: 96, height: 96 }} />
            )}
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
  return renderOgCard({ eyebrow: 'Kyrgyzstan travel guide', title: 'GuideBook of Kyrgyzstan', detail: 'Places, tours and culture of Central Asia' });
}
