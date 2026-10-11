import { gsap } from 'gsap';
import { $, openOverlay, closeOverlay, reducedMotion, toast } from './ui';
import { imageUrl } from './media';
import { flavors, products, WAITLIST_ENDPOINT, type ProductId } from '../data/content';

/* =================== Cart (demo) =================== */
const CART_KEY = 'su-cart';
const FREE_SHIP = 50;
type Cart = Partial<Record<ProductId, number>>;

let cart: Cart = load();
function load(): Cart {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function save() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

const money = (n: number) => `$${n.toFixed(n % 1 ? 2 : 0)}`;
const count = () => Object.values(cart).reduce((a, b) => a + (b ?? 0), 0);
const subtotal = () => (Object.entries(cart) as [ProductId, number][]).reduce((s, [id, q]) => s + products[id].price * q, 0);

function render() {
  const body = $('[data-cart-body]');
  const items = (Object.entries(cart) as [ProductId, number][]).filter(([, q]) => q > 0);
  const n = count();

  const badge = $('[data-cart-count]');
  badge.textContent = String(n);
  badge.classList.toggle('has-items', n > 0);
  $('[data-cart-open]').setAttribute('aria-label', `Open bag, ${n} item${n === 1 ? '' : 's'}`);

  body.innerHTML = items.length
    ? items
        .map(([id, q]) => {
          const p = products[id];
          const src = imageUrl(p.image, 480);
          return `
          <div class="cart-item">
            <div class="cart-item__img">${src ? `<img src="${src}" alt="" width="84" height="104">` : ''}</div>
            <div>
              <h3>${p.name}</h3>
              <p>${p.detail}</p>
              <div class="qty" role="group" aria-label="Quantity for ${p.name}">
                <button data-qty="${id}" data-d="-1" aria-label="Decrease quantity">&minus;</button>
                <span aria-live="polite">${q}</span>
                <button data-qty="${id}" data-d="1" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div class="cart-item__price">${money(p.price * q)}<button class="cart-item__remove" data-remove="${id}">Remove</button></div>
          </div>`;
        })
        .join('')
    : `<div class="cart__empty"><strong>Your bag is empty.</strong>Even grown-ups need a little something.</div>`;

  const other: ProductId | null = cart.tin && !cart.pouch ? 'pouch' : !cart.tin ? 'tin' : null;
  $('[data-cart-upsell]').innerHTML = other
    ? `<div class="upsell"><span>${other === 'pouch' ? 'Add a refill pouch for the bar cart?' : 'Make it a Signature Tin?'} <strong>${money(products[other].price)}</strong></span><button data-add-to-cart="${other}" data-no-open>Add</button></div>`
    : '';

  const total = subtotal();
  $('[data-cart-total]').textContent = money(total);
  const left = FREE_SHIP - total;
  const ship = $('[data-cart-ship]');
  ship.innerHTML =
    total === 0
      ? `Free shipping on orders over ${money(FREE_SHIP)}.`
      : left > 0
        ? `You're <strong>${money(left)}</strong> away from free shipping.<i></i>`
        : `You've unlocked <strong>free shipping</strong>. Cheers.<i></i>`;
  ship.style.setProperty('--p', `${Math.min(100, (total / FREE_SHIP) * 100)}%`);
  ($('[data-checkout]') as HTMLButtonElement).disabled = total === 0;
}

function flyToBag(from: Element, id: ProductId) {
  const src = imageUrl(products[id].image, 480);
  const bag = $('[data-cart-open]');
  if (!src || reducedMotion) return Promise.resolve();
  const a = from.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  const img = Object.assign(document.createElement('img'), { src, className: 'fly', alt: '' });
  document.body.appendChild(img);
  const x0 = a.left + a.width / 2 - 35;
  const y0 = a.top + a.height / 2 - 45;
  const x1 = b.left + b.width / 2 - 35;
  const y1 = b.top + b.height / 2 - 45;
  return new Promise<void>((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          img.remove();
          bag.classList.remove('is-bump');
          void bag.offsetWidth;
          bag.classList.add('is-bump');
          resolve();
        },
      })
      .set(img, { x: x0, y: y0, scale: 0.4, autoAlpha: 0 })
      .to(img, { scale: 1.1, autoAlpha: 1, duration: 0.25, ease: 'back.out(2)' })
      .to(img, { x: x1, duration: 0.8, ease: 'power2.inOut' })
      .to(img, { y: y0 - 140, duration: 0.35, ease: 'power2.out' }, '<')
      .to(img, { y: y1, duration: 0.45, ease: 'power2.in' }, '>')
      .to(img, { scale: 0.2, autoAlpha: 0, rotate: 20, duration: 0.3, ease: 'power2.in' }, '-=0.25');
  });
}

export function initCart() {
  const drawer = $('[data-cart]');
  render();

  document.addEventListener('click', async (e) => {
    const t = e.target as Element;
    const add = t.closest<HTMLElement>('[data-add-to-cart]');
    if (add) {
      const id = add.dataset.addToCart as ProductId;
      cart[id] = (cart[id] ?? 0) + 1;
      save();
      if (add.hasAttribute('data-no-open')) {
        render();
        return;
      }
      const inDrawer = add.closest('.drawer');
      if (inDrawer) closeOverlay(inDrawer as HTMLElement, false);
      await flyToBag(add, id);
      render();
      toast(`${products[id].name} added to your bag.`);
      return;
    }
    const qty = t.closest<HTMLElement>('[data-qty]');
    if (qty) {
      const id = qty.dataset.qty as ProductId;
      cart[id] = Math.max(0, (cart[id] ?? 0) + Number(qty.dataset.d));
      if (!cart[id]) delete cart[id];
      save();
      render();
      return;
    }
    const rm = t.closest<HTMLElement>('[data-remove]');
    if (rm) {
      delete cart[rm.dataset.remove as ProductId];
      save();
      render();
    }
  });

  $('[data-cart-open]').addEventListener('click', () => openOverlay(drawer));
  $('[data-checkout]').addEventListener('click', () => openOverlay($('[data-modal]')));
}

/* =================== Waitlist =================== */
export function initWaitlist() {
  const form = $<HTMLFormElement>('[data-waitlist]');
  const select = $<HTMLSelectElement>('[data-flavor-select]');
  const msg = $('[data-waitlist-msg]');
  const done = $('[data-waitlist-done]');
  select.insertAdjacentHTML('beforeend', flavors.map((f) => `<option value="${f.id}">${f.name}</option>`).join(''));

  document.addEventListener('click', (e) => {
    const pre = (e.target as Element).closest<HTMLElement>('[data-prefill]');
    if (pre) select.value = pre.dataset.prefill!;
  });

  try {
    if (localStorage.getItem('su-waitlist')) {
      form.hidden = true;
      done.hidden = false;
    }
  } catch {}

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      msg.textContent = 'That email looks a little shaken. Try again?';
      form.classList.remove('is-invalid');
      void form.offsetWidth;
      form.classList.add('is-invalid');
      (form.elements.namedItem('email') as HTMLInputElement).focus();
      return;
    }
    msg.textContent = '';
    form.classList.remove('is-invalid');
    const button = form.querySelector('button')!;
    button.disabled = true;
    button.querySelector('span')!.textContent = 'Pouring…';
    const data = { email, flavor: select.value };
    try {
      if (WAITLIST_ENDPOINT) {
        await fetch(WAITLIST_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      localStorage.setItem('su-waitlist', JSON.stringify(data));
    } catch {}
    splash(button);
    form.hidden = true;
    done.hidden = false;
    if (!reducedMotion) gsap.from(done.children, { y: 30, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'expo.out' });
  });
}

/** A burst of milk droplets from an element. */
function splash(from: Element) {
  if (reducedMotion) return;
  const r = from.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < 28; i++) {
    const d = document.createElement('i');
    d.className = 'milk-drop';
    const s = gsap.utils.random(5, 16);
    Object.assign(d.style, { left: `${cx}px`, top: `${cy}px`, width: `${s}px`, height: `${s}px` });
    if (i % 3 === 0) d.style.background = 'var(--gold-2)';
    document.body.appendChild(d);
    const ang = gsap.utils.random(-Math.PI, 0);
    const dist = gsap.utils.random(80, 260);
    gsap
      .timeline({ onComplete: () => d.remove() })
      .to(d, { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, duration: 0.6, ease: 'power3.out' })
      .to(d, { y: '+=220', autoAlpha: 0, duration: 0.9, ease: 'power2.in' });
  }
}
