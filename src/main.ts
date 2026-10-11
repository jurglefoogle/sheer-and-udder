import 'lenis/dist/lenis.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { initSmoothScroll } from './modules/smooth';
import { hydratePics } from './modules/media';
import { initOverlays, initCursor, initMagnetic, initNav, $ } from './modules/ui';
import { runPreloader, runAgeGate, heroIntro } from './modules/intro';
import { initHeroShader } from './modules/hero-shader';
import { initReveals, initMarquee, initStory, initPour } from './modules/sections';
import { initFlavors } from './modules/flavors';
import { initRecipes } from './modules/recipes';
import { initCart, initWaitlist } from './modules/commerce';

gsap.registerPlugin(ScrollTrigger, SplitText);

async function boot() {
  initSmoothScroll();
  hydratePics();
  initOverlays();
  initNav();
  initCart();
  initWaitlist();
  initMarquee();
  initRecipes();

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  await document.fonts.ready;
  const intro = heroIntro();
  initHeroShader($<HTMLCanvasElement>('[data-shader]'));
  initStory();
  initPour();
  initFlavors(); // after the pour pin: ScrollTriggers must be created in page order
  initReveals();
  initCursor();
  initMagnetic();
  ScrollTrigger.refresh();

  await runPreloader();
  await runAgeGate();
  intro?.play();
}

boot();

// Pins depend on final image sizes.
addEventListener('load', () => ScrollTrigger.refresh());
