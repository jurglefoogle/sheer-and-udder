#!/usr/bin/env node
// Builds responsive AVIF + WebP renditions and a manifest the site reads at runtime.
// Sources (later wins): assets/source/*.png, assets/raw/*.png, assets/cut/*.png (alpha cutouts).
// Output: public/img/<id>-<w>.{avif,webp} and src/data/image-manifest.json
import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'img');
const manifestPath = path.join(root, 'src', 'data', 'image-manifest.json');
const WIDTHS = [480, 800, 1200, 1600];

const sources = new Map();
for (const dir of ['assets/source', 'assets/raw', 'assets/cut']) {
  const abs = path.join(root, dir);
  if (!existsSync(abs)) continue;
  for (const f of await readdir(abs)) {
    if (/\.png$/i.test(f)) sources.set(f.replace(/\.png$/i, ''), path.join(abs, f));
  }
}

await mkdir(outDir, { recursive: true });
const manifest = {};
for (const [id, file] of [...sources].sort()) {
  const meta = await sharp(file).metadata();
  const alpha = Boolean(meta.hasAlpha) && file.includes(`${path.sep}cut${path.sep}`);
  const widths = [...new Set(WIDTHS.filter((w) => w < meta.width).concat(Math.min(meta.width, 1600)))].sort((a, b) => a - b);
  const srcMtime = (await stat(file)).mtimeMs;

  for (const w of widths) {
    const base = path.join(outDir, `${id}-${w}`);
    if (existsSync(`${base}.webp`) && (await stat(`${base}.webp`)).mtimeMs > srcMtime) continue;
    const pipe = sharp(file).resize({ width: w, withoutEnlargement: true });
    if (!alpha) pipe.flatten({ background: '#1a0f0a' });
    await pipe.clone().avif({ quality: alpha ? 60 : 52, effort: 5 }).toFile(`${base}.avif`);
    await pipe.clone().webp({ quality: alpha ? 82 : 78, alphaQuality: 90, effort: 5 }).toFile(`${base}.webp`);
  }

  // Tiny blurred placeholder for blur-up loading.
  const lqip = await sharp(file).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(file).stats();
  manifest[id] = {
    w: meta.width,
    h: meta.height,
    alpha,
    widths,
    color: `rgb(${dominant.r},${dominant.g},${dominant.b})`,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
  console.log(`✔ ${id.padEnd(30)} ${meta.width}x${meta.height}${alpha ? ' alpha' : ''} → ${widths.join('/')}`);
}

// Prune renditions that no longer match the manifest (e.g. after a re-crop).
const keep = new Set(Object.entries(manifest).flatMap(([id, m]) => m.widths.flatMap((w) => [`${id}-${w}.avif`, `${id}-${w}.webp`])));
for (const f of await readdir(outDir)) if (!keep.has(f)) await rm(path.join(outDir, f));

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest: ${Object.keys(manifest).length} images`);
