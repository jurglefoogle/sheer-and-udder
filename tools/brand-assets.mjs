#!/usr/bin/env node
// Favicon, apple-touch icon and the Open Graph share card, composed from the generated art.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);
const asset = (f) => path.join(root, 'assets', f);

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6c987"/><stop offset="1" stop-color="#a77f3a"/></linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="#1a0f0a"/>
  <rect x="3.5" y="3.5" width="57" height="57" rx="11" fill="none" stroke="#c9a25a" stroke-opacity=".5"/>
  <text x="32" y="47" text-anchor="middle" font-family="'Snell Roundhand','Pinyon Script','Brush Script MT',cursive" font-size="44" fill="url(#g)">&amp;</text>
</svg>`;
await writeFile(pub('favicon.svg'), icon);
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile(pub('apple-touch-icon.png'));

// OG card: 1200x630
const W = 1200;
const H = 630;
const layers = [];
if (existsSync(asset('raw/story-bar.png'))) {
  layers.push({ input: await sharp(asset('raw/story-bar.png')).resize(W, H, { fit: 'cover' }).modulate({ brightness: 0.55 }).toBuffer() });
}
layers.push({
  input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><linearGradient id="v" x1="0" x2="1"><stop offset="0" stop-color="#1a0f0a" stop-opacity=".95"/><stop offset=".6" stop-color="#1a0f0a" stop-opacity=".55"/><stop offset="1" stop-color="#1a0f0a" stop-opacity=".2"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#v)"/>
    <rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="#c9a25a" stroke-opacity=".45"/>
    <text x="80" y="150" font-family="Georgia, serif" font-size="20" letter-spacing="6" fill="#c9a25a">ADULT CHOCOLATE MILK MIX</text>
    <text x="76" y="290" font-family="Georgia, serif" font-size="118" fill="#f6ecdc">Sheer <tspan fill="#c9a25a" font-style="italic">&amp;</tspan></text>
    <text x="76" y="410" font-family="Georgia, serif" font-size="118" fill="#f6ecdc">Udder</text>
    <text x="80" y="500" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#e6c987">Chocolate milk, all grown up.</text>
  </svg>`),
});
if (existsSync(asset('cut/hero-tin.png'))) {
  const tin = await sharp(asset('cut/hero-tin.png')).resize({ height: 540 }).toBuffer();
  const { width } = await sharp(tin).metadata();
  layers.push({ input: tin, top: 50, left: W - width - 90 });
}
await sharp({ create: { width: W, height: H, channels: 3, background: '#1a0f0a' } })
  .composite(layers)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(pub('og.jpg'));
console.log('favicon.svg, apple-touch-icon.png, og.jpg written');
