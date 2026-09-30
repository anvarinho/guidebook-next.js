// Use pristine source assets (e.g. from git) as input to avoid repeated lossy encoding.
// node scripts/optimize-manas.cjs /path/to/original/manas
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const source = process.argv[2];
  if (!source) throw new Error('Pass a directory containing pristine Manas assets.');
  const output = path.resolve('public/manas');
  if (path.resolve(source) === output) throw new Error('Source must differ from output.');
  const manifest = {};
  let before = 0, after = 0, responsive = 0;
  for (const name of (await fs.readdir(source)).sort()) {
    if (!/\.(jpg|webp)$/.test(name) || /-\d+\.webp$/.test(name)) continue;
    const original = await fs.readFile(path.join(source, name));
    const meta = await sharp(original).metadata();
    // Preserve aligned hero layers; cap artwork at its useful display resolution.
    const maxWidth = name.startsWith('hero-') ? meta.width
      : name === 'manas-hero.jpg' ? 1200
      : name === 'origin.jpg' ? 1024
      : name === 'manaschi.jpg' ? 800
      : meta.width / meta.height < 1 ? 640 : 960;
    const pipeline = sharp(original).resize({ width: maxWidth, withoutEnlargement: true });
    const encoded = name.endsWith('.jpg')
      ? await pipeline.jpeg({ quality: 38, mozjpeg: true }).toBuffer()
      : await pipeline.webp({ quality: 28, alphaQuality: 75, effort: 6 }).toBuffer();
    const smallest = encoded.length < original.length ? encoded : original;
    await fs.writeFile(path.join(output, name), smallest);
    before += original.length; after += smallest.length;
    const optimizedMeta = await sharp(smallest).metadata();
    const variants = [];
    for (const width of (name.startsWith("hero-") ? [] : [480])) {
      if (width >= optimizedMeta.width) continue;
      const variant = `${path.parse(name).name}-${width}.webp`;
      const buffer = await sharp(original).resize({ width }).webp({ quality: 26, alphaQuality: 75, effort: 6 }).toBuffer();
      await fs.writeFile(path.join(output, variant), buffer);
      variants.push(`/manas/${variant} ${width}w`);
      responsive += buffer.length;
    }
    for (const width of [480, 800]) {
      const stale = `${path.parse(name).name}-${width}.webp`;
      if (!variants.some(value => value.includes(`/manas/${stale} `))) {
        await fs.unlink(path.join(output, stale)).catch(error => { if (error.code !== "ENOENT") throw error; });
      }
    }
    variants.push(`/manas/${name} ${optimizedMeta.width}w`);
    manifest[`/manas/${name}`] = { width: optimizedMeta.width, height: optimizedMeta.height, srcSet: variants.join(', ') };
  }
  await fs.writeFile('src/app/[lang]/manas/assets.json', JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify({ originalBytes: before, optimizedBytes: after, responsiveBytes: responsive, reduction: `${(100 * (1 - after / before)).toFixed(1)}%` }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
