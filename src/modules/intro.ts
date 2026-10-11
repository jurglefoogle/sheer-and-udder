import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { $, $$, lockScroll, reducedMotion, finePointer } from './ui';
import { imagesReady } from './media';

/* ---------- Preloader: a glass fills while fonts + hero art load ---------- */
export async function runPreloader() {
  const el = $('.preloader');
  const count = $('.preloader__count span', el);
  const fill = $('.preloader__fill', el);
  const progress = { v: 0 };
  const draw = () => {
    count.textContent = String(Math.round(progress.v));
    fill.setAttribute('y', String(160 - 1.6 * progress.v));
  };
  draw();
  const fast = document.documentElement.classList.contains('is-verified');
  const loading = Promise.all([document.fonts.ready, imagesReady($('.hero__tin')), new Promise((r) => setTimeout(r, fast ? 300 : 900))]);
  const creep = gsap.to(progress, { v: 85, duration: fast ? 0.6 : 1.6, ease: 'power2.out', onUpdate: draw });
  await Promise.race([loading, new Promise((r) => setTimeout(r, 4000))]);
  creep.kill();
  await gsap.to(progress, { v: 100, duration: 0.45, ease: 'power2.inOut', onUpdate: draw });
  await gsap.to(el, { autoAlpha: 0, duration: reducedMotion ? 0.01 : 0.7, ease: 'power2.inOut' });
  el.remove();
}

/* ---------- Age gate ---------- */
export function runAgeGate(): Promise<void> {
  const gate = document.querySelector<HTMLElement>('[data-agegate]');
  if (!gate || document.documentElement.classList.contains('is-verified')) {
    gate?.remove();
    return Promise.resolve();
  }
  lockScroll(true);
  const card = $('.agegate__card', gate);
  const ask = $('[data-gate-ask]', gate);
  const nope = $('[data-gate-nope]', gate);
  gsap.from(card, { y: 40, autoAlpha: 0, duration: 1, ease: 'expo.out' });
  $('[data-gate-yes]', gate).focus({ preventScroll: true });

  // Keep focus inside the gate.
  gate.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = $$<HTMLElement>('button', gate).filter((b) => b.offsetParent !== null);
    const i = items.indexOf(document.activeElement as HTMLElement);
    e.preventDefault();
    items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
  });

  $('[data-gate-no]', gate).addEventListener('click', () => {
    ask.hidden = true;
    nope.hidden = false;
    gsap.from(nope, { y: 16, autoAlpha: 0, duration: 0.6, ease: 'power3.out' });
    $('[data-gate-back]', gate).focus();
  });
  $('[data-gate-back]', gate).addEventListener('click', () => {
    nope.hidden = true;
    ask.hidden = false;
    $('[data-gate-yes]', gate).focus();
  });

  return new Promise((resolve) => {
    $('[data-gate-yes]', gate).addEventListener('click', () => {
      try {
        localStorage.setItem('su-age', 'yes');
      } catch {}
      const tl = gsap.timeline({
        onComplete: () => {
          gate.remove();
          document.documentElement.classList.add('is-verified');
          lockScroll(false);
        },
      });
      tl.to(card, { y: -30, autoAlpha: 0, duration: 0.5, ease: 'power2.in' })
        .to('.agegate__curtain--l', { xPercent: -102, duration: 1.4, ease: 'expo.inOut' }, '-=0.1')
        .to('.agegate__curtain--r', { xPercent: 102, duration: 1.4, ease: 'expo.inOut' }, '<')
        .add(resolve, '-=1.1');
      if (reducedMotion) tl.progress(1);
    });
  });
}

/* ---------- Hero entrance + parallax ---------- */
export function heroIntro() {
  const title = $('[data-hero-title]');
  const tin = $('.hero__tin');
  if (reducedMotion) return;

  const split = SplitText.create(title.querySelectorAll('.line'), { type: 'chars', charsClass: 'char', aria: 'hidden' });
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  tl.from(split.chars, { yPercent: 110, rotate: 6, duration: 1.4, stagger: 0.025 })
    .from('[data-hero-in]', { y: 30, autoAlpha: 0, duration: 1.2, stagger: 0.1 }, 0.35)
    .from(tin, { y: 120, rotate: -6, autoAlpha: 0, duration: 1.8 }, 0.1)
    .from('.hero__splash--back', { x: -120, autoAlpha: 0, scale: 0.8, duration: 1.8 }, 0.4)
    .from('.hero__splash--front', { x: 120, autoAlpha: 0, scale: 0.8, duration: 1.8 }, 0.5)
    .from('.hero__seal', { scale: 0, rotate: -90, duration: 1.4, ease: 'back.out(1.6)' }, 0.9)
    .from('.hero__scroll', { autoAlpha: 0, duration: 1 }, 1.2);

  // Idle float on the tin.
  gsap.to(tin, { yPercent: -2.5, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 });

  // Pointer parallax on layered elements.
  if (finePointer) {
    const layers = $$('[data-depth]').map((el) => ({
      d: Number(el.dataset.depth),
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
    }));
    const rx = gsap.quickTo(tin, 'rotationY', { duration: 1.2, ease: 'power3' });
    const ry = gsap.quickTo(tin, 'rotationX', { duration: 1.2, ease: 'power3' });
    addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => {
        l.x(nx * 40 * l.d);
        l.y(ny * 30 * l.d);
      });
      rx(nx * 14);
      ry(-ny * 10);
    });
  }

  // Scroll: product rises out, copy drifts.
  gsap.to('.hero__product', {
    yPercent: -18,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__copy', {
    yPercent: 20,
    autoAlpha: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  return tl;
}
