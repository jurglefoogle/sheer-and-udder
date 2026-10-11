import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, reducedMotion } from './ui';
import { lenis } from './smooth';
import { puns } from '../data/content';

/* ---------- Reveal-on-scroll ---------- */
export function initReveals() {
  if (reducedMotion) return;
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08, ease: 'expo.out', overwrite: true }),
  });
  gsap.set('[data-reveal]', { autoAlpha: 0 });

  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.words, {
          yPercent: 115,
          duration: 1.3,
          stagger: 0.035,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }),
    });
  });

  // Count-up numbers.
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = String(Math.round(o.v))),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ---------- Pun marquee with scroll-velocity skew ---------- */
export function initMarquee() {
  const track = $('[data-marquee-track]');
  const html = puns.map((p) => `<span class="marquee__item">${p}</span>`).join('');
  track.innerHTML = html + html;
  if (reducedMotion) return;
  let x = 0;
  let skew = 0;
  const setX = gsap.quickSetter(track, 'x', 'px');
  const setSkew = gsap.quickSetter(track, 'skewX', 'deg');
  gsap.ticker.add((_, dt) => {
    const v = lenis?.velocity ?? 0;
    const half = track.scrollWidth / 2;
    x -= (dt / 1000) * (60 + Math.abs(v) * 28) * (v < -0.5 ? -1 : 1);
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    skew += (gsap.utils.clamp(-12, 12, -v * 0.9) - skew) * 0.12;
    setX(x);
    setSkew(skew);
  });
}

/* ---------- Story: framed label reveal + background parallax ---------- */
export function initStory() {
  if (reducedMotion) return;
  gsap.fromTo(
    '.story__frame',
    { clipPath: 'inset(100% 0% 0% 0%)', rotate: 4, scale: 0.92 },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      rotate: -2.5,
      scale: 1,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: '.story__art', start: 'top 80%', once: true },
    },
  );
  gsap.fromTo('.story__frame img', { scale: 1.25 }, {
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true },
  });
  gsap.fromTo('.story__bg', { yPercent: -10 }, {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}
