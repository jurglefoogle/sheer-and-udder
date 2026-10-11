import manifest from '../data/image-manifest.json';

interface Entry {
  w: number;
  h: number;
  alpha: boolean;
  widths: number[];
  color: string;
  lqip: string;
}

const images = manifest as Record<string, Entry>;
const base = import.meta.env.BASE_URL;
const url = (id: string, w: number, ext: string) => `${base}img/${id}-${w}.${ext}`;

export const hasImage = (id: string) => id in images;

export interface PicOptions {
  alt?: string;
  sizes?: string;
  eager?: boolean;
}

/** Markup for a responsive <picture>, or '' when the image hasn't been generated yet. */
export function pictureHTML(id: string, { alt = '', sizes = '100vw', eager = false }: PicOptions = {}): string {
  const m = images[id];
  if (!m) return '';
  const set = (ext: string) => m.widths.map((w) => `${url(id, w, ext)} ${w}w`).join(', ');
  const fallback = url(id, m.widths.find((w) => w >= 800) ?? m.widths[m.widths.length - 1], 'webp');
  return `<picture>
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
    <img src="${fallback}" alt="${alt}" width="${m.w}" height="${m.h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;
}

export function imageUrl(id: string, minWidth = 480) {
  const m = images[id];
  if (!m) return '';
  return url(id, m.widths.find((w) => w >= minWidth) ?? m.widths[m.widths.length - 1], 'webp');
}

/** Replaces every `.pic[data-pic]` placeholder under `root` with its picture, blur-up included. */
export function hydratePics(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.pic[data-pic]:not([data-hydrated])').forEach((el) => {
    el.dataset.hydrated = '';
    let id = el.dataset.pic!;
    if (!hasImage(id) && el.dataset.fallback && hasImage(el.dataset.fallback)) {
      id = el.dataset.fallback;
      el.classList.add('pic--fallback');
    }
    const html = pictureHTML(id, { alt: el.dataset.alt ?? '', sizes: el.dataset.sizes, eager: 'eager' in el.dataset });
    if (!html) {
      el.classList.add('pic--placeholder');
      return;
    }
    const m = images[id];
    if (!m.alpha) {
      el.style.backgroundImage = `url(${m.lqip})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    }
    el.classList.add('is-loading');
    el.innerHTML = html;
    const img = el.querySelector('img')!;
    const done = () => {
      el.classList.remove('is-loading');
      el.style.backgroundImage = '';
    };
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener('load', done, { once: true });
  });
}

/** Resolves when the given element's images have loaded (or failed). */
export function imagesReady(root: ParentNode) {
  const imgs = [...root.querySelectorAll('img')];
  return Promise.all(
    imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((r) => {
      img.addEventListener('load', r, { once: true });
      img.addEventListener('error', r, { once: true });
    }))),
  );
}
