import { gsap } from 'gsap';
import { lenis } from './smooth';

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/* ---------- Scroll lock ---------- */
let locks = 0;
export function lockScroll(on: boolean) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  const locked = locks > 0;
  document.body.classList.toggle('is-locked', locked);
  if (locked) lenis?.stop();
  else lenis?.start();
}

/* ---------- Overlays (drawers + modal) with focus trap ---------- */
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
const scrim = () => $('[data-scrim]');
let stack: { el: HTMLElement; returnTo: Element | null }[] = [];

export function openOverlay(el: HTMLElement) {
  if (stack.some((s) => s.el === el)) return;
  stack.forEach((s) => closeOverlay(s.el, false));
  stack = [{ el, returnTo: document.activeElement }];
  const s = scrim();
  s.hidden = false;
  requestAnimationFrame(() => s.classList.add('is-on'));
  el.removeAttribute('inert');
  el.setAttribute('aria-hidden', 'false');
  el.classList.add('is-open');
  lockScroll(true);
  setTimeout(() => (el.querySelector<HTMLElement>(FOCUSABLE))?.focus({ preventScroll: true }), 80);
}

export function closeOverlay(el: HTMLElement, restoreFocus = true) {
  const idx = stack.findIndex((s) => s.el === el);
  if (idx < 0) return;
  const [{ returnTo }] = stack.splice(idx, 1);
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('inert', '');
  lockScroll(false);
  if (!stack.length) {
    const s = scrim();
    s.classList.remove('is-on');
    setTimeout(() => !stack.length && (s.hidden = true), 500);
  }
  if (restoreFocus && returnTo instanceof HTMLElement) returnTo.focus({ preventScroll: true });
}

export function initOverlays() {
  scrim().addEventListener('click', () => stack.length && closeOverlay(stack[stack.length - 1].el));
  document.addEventListener('keydown', (e) => {
    const top = stack[stack.length - 1]?.el;
    if (!top) return;
    if (e.key === 'Escape') closeOverlay(top);
    if (e.key === 'Tab') {
      const items = $$<HTMLElement>(FOCUSABLE, top).filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener('click', (e) => {
    const close = (e.target as Element).closest('[data-close]');
    if (!close) return;
    const host = close.closest<HTMLElement>('.drawer, .modal');
    if (host) closeOverlay(host, !close.matches('a'));
  });
}

/* ---------- Toast ---------- */
let toastTimer = 0;
export function toast(msg: string) {
  const el = $('[data-toast]');
  el.textContent = msg;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-on'), 2600);
}

/* ---------- Magnetic buttons ---------- */
export function initMagnetic() {
  if (!finePointer || reducedMotion) return;
  $$('.magnetic').forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.28);
      yTo((e.clientY - r.top - r.height / 2) * 0.4);
    });
    btn.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/* ---------- Nav ---------- */
export function initNav() {
  const nav = $('[data-nav]');
  let last = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    const menuOpen = !$('[data-menu]').hidden;
    nav.classList.toggle('is-hidden', !menuOpen && y > 500 && y > last + 4);
    if (y < last - 4) nav.classList.remove('is-hidden');
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the section in view.
  const links = $$<HTMLAnchorElement>('.nav__links a');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-current', a.hash === `#${en.target.id}`));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((a) => {
    const target = document.querySelector(a.hash);
    if (target) io.observe(target);
  });

  // Mobile menu
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const setMenu = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    lockScroll(open);
    if (open) gsap.from(menu.children, { y: 30, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' });
  };
  toggle.addEventListener('click', () => setMenu(Boolean(menu.hidden)));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setMenu(false);
  });

  // Anchor links scroll smoothly through Lenis.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.hash.length < 2) return;
    const target = document.querySelector<HTMLElement>(a.hash);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: a.hash === '#top' ? 0 : -10, duration: 1.4, force: true });
    else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.hash);
  });
}
