// Run after adding/replacing images; never on a page request.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
require('dotenv').config();

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'src/lib/generated/image-placeholders.json');
const origin = new URL(process.env.NEXT_PUBLIC_URL || 'https://central-asia.live').origin;
const refresh = process.argv.includes('--refresh');

async function main() {
  const manifest = JSON.parse(await fs.readFile(output, 'utf8').catch(() => '{}'));
  const sources = new Map();
  let generated = 0;
  let failed = 0;
  const addRemote = value => {
    if (typeof value !== 'string' || !value) return;
    const url = new URL(value, `${origin}/`);
    if (url.origin === origin) sources.set(url.href, url.href);
  };
  const collect = data => {
    if (!data || typeof data !== 'object') return;
    for (const [key, value] of Object.entries(data)) {
      if (key === 'image') addRemote(value);
      else if (key === 'images' && Array.isArray(value)) value.forEach(addRemote);
      else if (typeof value === 'object') collect(value);
    }
  };
  async function json(route) {
    const response = await fetch(`${origin}/api/${route}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Content API returned ${response.status}`);
    return response.json();
  }
  if (process.argv.includes('--remote')) {
    // The content API caps places/more at 100 per page, so walk the offsets.
    const pages = async () => {
      const places = [];
      for (let offset = 0; ; offset += 100) {
        const data = await json(`places/more?lang=en&offset=${offset}&limit=100`);
        collect(data);
        const batch = data.places || [];
        places.push(...batch);
        if (batch.length < 100 || (data.count && places.length >= data.count)) return places;
      }
    };
    const lists = [
      ['places', await pages()],
      ...await Promise.all(['tours', 'articles'].map(async name => {
        const data = await json(`${name}/?lang=en`);
        collect(data);
        return [name, Array.isArray(data) ? data : data[name] || []];
      })),
    ];
    for (const [name, items] of lists) {
      // These listing responses omit day/paragraph images.
      for (const item of items) {
        try { collect(await json(`${name}/${encodeURIComponent(item.url)}?lang=en`)); }
        catch { failed++; console.warn(`Could not read detail: ${item.url}`); }
      }
    }
  }
  for (const file of await fs.readdir(path.join(root, 'public/intro/optimized'))) {
    if (file.endsWith('.webp')) sources.set(`/intro/optimized/${file}`, path.join(root, 'public/intro/optimized', file));
  }
  console.log(`Preparing previews for ${sources.size} images (existing entries are reused).`);

  // Four workers bound downloads and image decoding without serial network waits.
  const queue = [...sources].filter(([key]) => refresh || !manifest[key]);
  async function worker() {
    while (queue.length) {
      const [key, source] = queue.shift();
      try {
        let input = source;
        if (source.startsWith('https://') || source.startsWith('http://')) {
          const response = await fetch(source, { signal: AbortSignal.timeout(45000) });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const chunks = [];
          let bytes = 0;
          for await (const chunk of response.body) {
            bytes += chunk.length;
            if (bytes > 12 * 1024 * 1024) throw new Error('Image exceeds 12 MB');
            chunks.push(chunk);
          }
          input = Buffer.concat(chunks);
        }
        const buffer = await sharp(input, { limitInputPixels: 40000000 })
          .rotate().resize(16, 16, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 60 }).toBuffer();
        manifest[key] = `data:image/webp;base64,${buffer.toString('base64')}`;
        generated++;
        if (generated % 25 === 0) console.log(`Generated ${generated} previews.`);
      } catch (error) {
        failed++;
        console.warn(`Skipped ${key}: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n');
  console.log(JSON.stringify({ generated, failed, total: Object.keys(manifest).length }));
  if (failed) process.exitCode = 1;
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
