import { Renderer, Program, Mesh, Triangle, Texture, Vec2 } from 'ogl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import fragment from '../shaders/pour.frag?raw';
import { $, $$, reducedMotion } from './ui';
import { imageUrl } from './media';

const STEPS = 5;
const ids = Array.from({ length: STEPS }, (_, i) => `pour-${i + 1}`);

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

/** Scroll position (0–1) → photo position (0–4), resting on each photo between liquid transitions. */
function toPosition(p: number) {
  const raw = gsap.utils.clamp(0, STEPS - 1, p * (STEPS - 0.1) - 0.3);
  const i = Math.floor(raw);
  const f = raw - i;
  const t = gsap.utils.clamp(0, 1, (f - 0.3) / 0.45);
  return i + t * t * (3 - 2 * t);
}

/** WebGL renderer that pours one photo into the next. Returns null when WebGL isn't available. */
function createPourGL(canvas: HTMLCanvasElement, onReady: () => void) {
  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), antialias: false, alpha: false });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  const textures = ids.map(
    () => new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE }),
  );
  const uniforms = {
    tFrom: { value: textures[0] },
    tTo: { value: textures[1] },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uZoom: { value: 1 },
    uRes: { value: new Vec2(1, 1) },
    uImgAspect: { value: 2 / 3 },
  };
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms }) });

  let loaded = 0;
  ids.forEach((id, i) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      textures[i].image = img;
      uniforms.uImgAspect.value = img.naturalWidth / img.naturalHeight;
      if (++loaded === STEPS) onReady();
    };
    img.src = imageUrl(id, 1000);
  });

  const host = canvas.parentElement!;
  const resize = () => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    canvas.style.width = canvas.style.height = '100%';
    uniforms.uRes.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  return {
    render(position: number, time: number) {
      const i = Math.min(Math.floor(position), STEPS - 2);
      uniforms.tFrom.value = textures[i];
      uniforms.tTo.value = textures[i + 1];
      uniforms.uMix.value = position - i;
      uniforms.uTime.value = time;
      uniforms.uZoom.value = 1.015 + position * 0.012; // a slow push-in across the whole pour
      renderer.render({ scene: mesh });
    },
  };
}

/* ---------- How It Pours: pinned photo sequence with liquid transitions ---------- */
export function initPour() {
  const section = $('[data-pour]');
  const steps = $$('li', $('[data-pour-steps]'));
  const num = $('[data-pour-num]');
  const pics = $$('.pic', $('[data-pour-stack]'));
  const canvas = $<HTMLCanvasElement>('[data-pour-canvas]');

  let active = -1;
  const setStep = (i: number) => {
    if (i === active) return;
    active = i;
    steps.forEach((s, j) => s.classList.toggle('is-active', j === i));
    num.textContent = String(i + 1).padStart(2, '0');
  };
  // Without WebGL the stacked photos simply crossfade.
  const crossfade = (position: number) =>
    pics.forEach((p, i) => (p.style.opacity = i === 0 ? '1' : String(gsap.utils.clamp(0, 1, position - i + 1))));

  if (reducedMotion) {
    section.classList.add('pour--static');
    crossfade(STEPS - 1);
    steps.forEach((s) => s.classList.add('is-active'));
    num.textContent = String(STEPS).padStart(2, '0');
    return;
  }

  let glReady = false;
  const view = createPourGL(canvas, () => {
    glReady = true;
    section.classList.add('is-gl');
    dirty = true;
  });

  let target = 0;
  let position = 0;
  let dirty = true;
  let time = 0;
  setStep(0);
  crossfade(0);

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: () => `+=${innerHeight * (innerWidth > 900 ? 4 : 3.2)}`,
    pin: '.pour__pin',
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      target = toPosition(self.progress);
      setStep(Math.round(target));
    },
  });

  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(section);

  gsap.ticker.add((_, dt) => {
    if (!visible || document.hidden) return;
    time += dt / 1000;
    const prev = position;
    position += (target - position) * (1 - Math.pow(0.86, dt / 16.67));
    if (Math.abs(target - position) < 0.0004) position = target;
    const moving = position !== prev;
    const midPour = position % 1 > 0.001 && position % 1 < 0.999;
    if (glReady && view) {
      // The liquid edge keeps flowing mid-transition; at rest, skip the GPU entirely.
      if (moving || midPour || dirty) view.render(position, time);
    } else if (moving || dirty) {
      crossfade(position);
    }
    dirty = false;
  });
}
