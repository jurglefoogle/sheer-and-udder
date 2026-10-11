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

/* ---------- How It Pours: pinned, scroll-scrubbed glass ---------- */
export function initPour() {
  const section = $('[data-pour]');
  const steps = $$('li', $('[data-pour-steps]'));
  const num = $('[data-pour-num]');
  const liquid = $('[data-liquid]');
  const spirit = $('[data-spirit]');
  const foam = $('[data-foam]');
  const whisk = $('[data-whisk]');
  const cocoa = $('[data-cocoa]');

  // Cocoa granules that fall in at step two.
  const NS = 'http://www.w3.org/2000/svg';
  const grains = Array.from({ length: 34 }, () => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', String(gsap.utils.random(1.4, 3.4)));
    c.setAttribute('cx', String(gsap.utils.random(70, 150)));
    c.setAttribute('cy', '-20');
    cocoa.appendChild(c);
    return c;
  });

  const setStep = (i: number) => {
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    num.textContent = String(i + 1).padStart(2, '0');
  };

  if (reducedMotion) {
    gsap.set(liquid, { y: 70, '--liquid': '#6b3f27' });
    gsap.set(foam, { opacity: 1 });
    steps.forEach((s) => s.classList.add('is-active'));
    num.textContent = String(steps.length).padStart(2, '0');
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  // 1. Milk pours in
  tl.to(liquid, { y: 150, duration: 1, ease: 'power1.out' }, 0)
    // 2. Mix: cocoa falls and the milk turns to chocolate
    .addLabel('mix', 1.1)
    .to(grains, { attr: { cy: () => gsap.utils.random(160, 230) }, opacity: 0, duration: 0.8, stagger: 0.01, ease: 'power2.in' }, 'mix')
    .to(liquid, { '--liquid': '#8a5a3b', y: 140, duration: 0.9 }, 'mix+=0.2')
    // 3. Spirit: amber warmth
    .addLabel('spirit', 2.2)
    .to(spirit, { opacity: 0.4, duration: 0.6 }, 'spirit')
    .to(liquid, { y: 110, '--liquid': '#7a4a2c', duration: 0.8 }, 'spirit')
    // 4. Froth: whisk spins, foam rises
    .addLabel('froth', 3.3)
    .fromTo(whisk, { opacity: 0, y: -40 }, { opacity: 1, y: 30, duration: 0.3, immediateRender: false }, 'froth')
    .to(whisk, { scaleX: -1, duration: 0.1, repeat: 5, yoyo: true, transformOrigin: '50% 50%' }, 'froth+=0.3')
    .to(liquid, { y: 72, '--liquid': '#5e3721', duration: 0.9 }, 'froth+=0.2')
    .to(spirit, { opacity: 0.12, duration: 0.9 }, 'froth+=0.2')
    .to(foam, { opacity: 1, y: -8, duration: 0.6 }, 'froth+=0.4')
    .fromTo(whisk, { opacity: 1, y: 30 }, { opacity: 0, y: -60, duration: 0.3, immediateRender: false }, 'froth+=0.95')
    // 5. Sip
    .addLabel('sip', 4.4)
    .to('.pour__glass', { rotate: -3, scale: 1.04, duration: 0.6, ease: 'power2.inOut' }, 'sip')
    .to({}, { duration: 0.4 });

  const marks = [0, 1.1, 2.2, 3.3, 4.4].map((t) => t / tl.duration());

  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=320%',
        pin: '.pour__pin',
        anticipatePin: 1,
        scrub: 0.5,
        animation: tl,
        onUpdate: (self) => setStep(marks.filter((m) => self.progress >= m - 0.02).length - 1),
      });
    },
    '(max-width: 900px)': () => {
      ScrollTrigger.create({
        trigger: '.pour__stage',
        start: 'top 70%',
        end: () => `+=${$('[data-pour-steps]').offsetHeight}`,
        scrub: 0.6,
        animation: tl,
        onUpdate: (self) => setStep(marks.filter((m) => self.progress >= m - 0.02).length - 1),
      });
    },
  });
}
