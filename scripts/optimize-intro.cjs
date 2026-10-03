const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const sourceDirectory = path.join(root, 'public/intro');
const outputDirectory = path.join(sourceDirectory, 'optimized');

async function main() {
  const files = (await fs.readdir(path.join(root, 'src/app/intro')))
    .filter(file => /\.(tsx?|css)$/.test(file));
  const names = new Set();
  for (const file of files) {
    const source = await fs.readFile(path.join(root, 'src/app/intro', file), 'utf8');
    for (const match of source.matchAll(/\/intro\/(?:optimized\/)?([\w-]+)\.(?:png|webp)/g)) {
      names.add(match[1]);
    }
  }

  await fs.mkdir(outputDirectory, { recursive: true });
  const manifest = {};
  // Sequential encoding bounds memory use and always starts from the original PNG.
  for (const name of [...names].sort()) {
    const source = path.join(sourceDirectory, `${name}.png`);
    const destination = path.join(outputDirectory, `${name}.webp`);
    const original = await fs.stat(source);
    const info = await sharp(source)
      .webp({ quality: 80, alphaQuality: 100, effort: 6 })
      .toFile(destination);
    manifest[name] = { width: info.width, height: info.height, originalBytes: original.size, bytes: info.size };
  }
  await fs.writeFile(path.join(outputDirectory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const totals = Object.values(manifest).reduce((sum, image) => ({
    originalBytes: sum.originalBytes + image.originalBytes,
    bytes: sum.bytes + image.bytes,
  }), { originalBytes: 0, bytes: 0 });
  console.log(JSON.stringify({ images: names.size, ...totals, reduction: `${(100 * (1 - totals.bytes / totals.originalBytes)).toFixed(1)}%` }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
