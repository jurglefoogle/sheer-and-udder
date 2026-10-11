import { gsap } from 'gsap';
import { $, $$, finePointer, reducedMotion } from './ui';
import { hydratePics } from './media';
import { lenis } from './smooth';
import { flavors, recipes } from '../data/content';

export function initRecipes() {
  const grid = $('[data-recipe-grid]');
  grid.innerHTML = recipes
    .map((r) => {
      const flavor = flavors.find((f) => f.id === r.flavor)!;
      return `
      <li class="recipe" id="recipe-${r.id}" data-reveal>
        <div class="recipe__card">
          <button class="recipe__toggle" aria-pressed="false" aria-label="${r.name}: flip for the recipe"></button>
          <div class="recipe__inner">
            <div class="recipe__face recipe__front" aria-hidden="true">
              <span class="recipe__flip">Flip &#8635;</span>
              <span class="recipe__media"><span class="pic" data-pic="${r.image}" data-alt="${r.name} cocktail" data-sizes="(min-width: 900px) 25vw, 90vw"></span></span>
              <span class="recipe__meta">
                <span class="recipe__flavor">${flavor.name}</span>
                <span class="recipe__name">${r.name}</span>
                <span class="recipe__hook">${r.hook}</span>
              </span>
            </div>
            <div class="recipe__face recipe__back">
              <span class="recipe__flavor">${flavor.name}${flavor.status === 'coming' ? ' &middot; coming soon' : ''}</span>
              <h3>${r.name}</h3>
              <p class="recipe__glass">${r.glass}</p>
              <ul>${r.ingredients.map((i) => `<li>${i}</li>`).join('')}</ul>
              <p class="recipe__method">${r.method}</p>
            </div>
          </div>
        </div>
      </li>`;
    })
    .join('') +
    `
      <li class="recipe recipe--cta" data-reveal>
        <a class="recipe__pitch" href="mailto:glinden@asininesigns.com?subject=My%20Sheer%20%26%20Udder%20recipe">
          <span class="recipe__flavor">House rules</span>
          <span class="recipe__name">Got a better one?</span>
          <span class="recipe__hook">Send us your after-hours pour. The best get a spot on the menu (and a free tin).</span>
          <span class="recipe__send">Submit a recipe &rarr;</span>
        </a>
      </li>`;
  hydratePics(grid);

  grid.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('.recipe__toggle');
    if (!btn) return;
    const card = btn.closest('.recipe')!;
    const flipped = card.classList.toggle('is-flipped');
    btn.setAttribute('aria-pressed', String(flipped));
  });

  // Flavor drawer → jump to and flip the matching recipe.
  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLElement>('[data-recipe-jump]');
    if (!link) return;
    const card = document.getElementById(`recipe-${link.dataset.recipeJump}`);
    if (!card) return;
    setTimeout(() => {
      if (lenis) lenis.scrollTo(card, { offset: -innerHeight * 0.18, duration: 1.4, force: true });
      else card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => {
        card.classList.add('is-flipped');
        card.querySelector('.recipe__toggle')?.setAttribute('aria-pressed', 'true');
      }, 1300);
    }, 150);
  });

  if (!finePointer || reducedMotion) return;
  $$('.recipe__card', grid).forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(btn, { '--ry': `${x * 12}deg`, '--rx': `${-y * 10}deg`, duration: 0.4, ease: 'power3' });
    });
    btn.addEventListener('pointerleave', () => gsap.to(btn, { '--ry': '0deg', '--rx': '0deg', duration: 0.8, ease: 'elastic.out(1, 0.5)' }));
  });
}
