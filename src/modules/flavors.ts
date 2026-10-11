import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, openOverlay, reducedMotion, toast } from './ui';
import { hydratePics } from './media';
import { flavors, recipes, type Flavor } from '../data/content';

const VOTE_KEY = 'su-votes';
// Seed counts make the demo feel lived-in; the visitor's own vote adds one.
const SEED: Record<string, number> = { mexican: 412, smores: 538, 'boston-cream': 297, tiramisu: 466, 'pb-cup': 509, 'german-chocolate': 233 };

function readVotes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VOTE_KEY) ?? '[]');
  } catch {
    return [];
  }
}
function writeVotes(v: string[]) {
  try {
    localStorage.setItem(VOTE_KEY, JSON.stringify(v));
  } catch {}
}

const heart = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>`;

function cardHTML(f: Flavor, voted: boolean) {
  const available = f.status === 'available';
  const count = (SEED[f.id] ?? 0) + (voted ? 1 : 0);
  return `
  <li class="flavor-card" style="--accent:${f.accent}" data-flavor="${f.id}">
    <div class="pic" data-pic="${f.image}" data-alt="${f.name} chocolate milk with its signature garnish" data-sizes="(min-width: 900px) 25vw, 76vw"></div>
    <div class="flavor-card__shade"></div>
    <button class="flavor-card__open" data-open-flavor="${f.id}">
      <span class="flavor-card__top"><span>${f.number}</span><span class="flavor-card__badge ${available ? 'is-available' : ''}">${available ? 'Available now' : 'Coming soon'}</span></span>
      <span class="flavor-card__body">
        <span class="flavor-card__name">${f.name}</span>
        <span class="flavor-card__tag">${f.tagline}</span>
        <span class="flavor-card__more">Tasting notes &rarr;</span>
      </span>
    </button>
    ${available ? '' : `<button class="vote" data-vote="${f.id}" aria-pressed="${voted}" aria-label="Vote for ${f.name}">${heart}<span data-vote-count>${count}</span></button>`}
  </li>`;
}

function drawerHTML(f: Flavor) {
  const r = recipes.find((x) => x.id === f.recipe)!;
  const available = f.status === 'available';
  return `
    <div class="fd__media"><div class="pic" data-pic="${f.image}" data-alt="" data-sizes="560px"></div></div>
    <div class="fd__body" style="--accent:${f.accent}">
      <p class="eyebrow">${f.number} &middot; ${available ? 'Available now' : 'Coming soon'}</p>
      <h2 id="fd-title">${f.name}</h2>
      <p class="fd__tag">${f.tagline}</p>
      <p class="fd__desc">${f.description}</p>
      <div class="fd__cols">
        <div><h3>Tasting notes</h3><ul>${f.notes.map((n) => `<li>${n}</li>`).join('')}</ul></div>
        <div><h3>Pairs with</h3><ul>${f.pairs.map((n) => `<li>${n}</li>`).join('')}</ul></div>
      </div>
      <div class="fd__recipe">
        <p class="eyebrow">Signature pour</p>
        <h3>${r.name}</h3>
        <p>${r.ingredients.join(' &middot; ')}</p>
      </div>
      <div class="fd__actions">
        ${
          available
            ? `<button class="btn btn--gold" data-add-to-cart="tin"><span>Add to bag &mdash; $29</span></button>`
            : `<a class="btn btn--gold" href="#waitlist" data-close data-prefill="${f.id}"><span>Notify me</span></a>`
        }
        <button class="btn btn--ghost" data-close data-recipe-jump="${r.id}"><span>See the recipe</span></button>
      </div>
    </div>`;
}

export function initFlavors() {
  const track = $('[data-flavor-track]');
  const section = $('[data-flavors]');
  const votes = readVotes();
  track.innerHTML = flavors.map((f) => cardHTML(f, votes.includes(f.id))).join('');
  hydratePics(track);

  // Voting
  track.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-vote]');
    if (!btn) return;
    const id = btn.dataset.vote!;
    const list = readVotes();
    const on = !list.includes(id);
    writeVotes(on ? [...list, id] : list.filter((v) => v !== id));
    btn.setAttribute('aria-pressed', String(on));
    const c = $('[data-vote-count]', btn);
    c.textContent = String(Number(c.textContent) + (on ? 1 : -1));
    if (on) toast(`Vote counted. ${flavors.find((f) => f.id === id)!.name} thanks you.`);
  });

  // Drawer
  const drawer = $('[data-flavor-drawer]');
  const body = $('[data-flavor-drawer-body]');
  track.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-open-flavor]');
    if (!btn) return;
    const f = flavors.find((x) => x.id === btn.dataset.openFlavor)!;
    body.innerHTML = drawerHTML(f);
    hydratePics(body);
    drawer.scrollTop = 0;
    openOverlay(drawer);
    if (!reducedMotion) gsap.from(body.querySelectorAll('.fd__body > *'), { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.8, ease: 'expo.out', delay: 0.2 });
  });

  // Section tint follows the flavor in focus.
  const setTint = (f: Flavor) => {
    section.style.setProperty('--flavor-bg', f.bg);
    section.style.setProperty('--accent', f.accent);
  };
  setTint(flavors[0]);
  const cards = $$('.flavor-card', track);

  if (reducedMotion) return;
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      const distance = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: '.flavors__pin',
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set('[data-flavor-progress]', { scaleX: self.progress });
            setTint(flavors[Math.min(flavors.length - 1, Math.round(self.progress * (flavors.length - 1)))]);
          },
        },
      });
      // Cards lean in as they travel.
      cards.forEach((card) => {
        gsap.fromTo(card, { rotate: 3, y: 40 }, {
          rotate: -1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'center center', scrub: true },
        });
      });
    },
    '(max-width: 900px)': () => {
      const vp = $('.flavors__viewport');
      const onScroll = () => {
        const p = vp.scrollLeft / Math.max(1, vp.scrollWidth - vp.clientWidth);
        gsap.set('[data-flavor-progress]', { scaleX: p });
        setTint(flavors[Math.round(p * (flavors.length - 1))]);
      };
      vp.addEventListener('scroll', onScroll, { passive: true });
      return () => vp.removeEventListener('scroll', onScroll);
    },
  });
}
