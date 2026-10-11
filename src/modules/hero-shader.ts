import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { gsap } from 'gsap';
import fragment from '../shaders/swirl.frag?raw';

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

/** Full-bleed marbled chocolate shader behind the hero. Pauses when off-screen or hidden. */
export function initHeroShader(canvas: HTMLCanvasElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2) * 0.5, antialias: false, alpha: false });
  } catch {
    return; // No WebGL: the CSS gradient behind the canvas carries the hero.
  }
  const gl = renderer.gl;
  const uniforms = {
    uTime: { value: Math.random() * 100 },
    uRes: { value: new Vec2() },
    uMouse: { value: new Vec2(0.7, 0.55) },
    uIntro: { value: 0 },
  };
  const program = new Program(gl, { vertex, fragment, uniforms });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  // Size from the hero itself: OGL pins inline px sizes on the canvas, so observing the canvas would lock it.
  const host = canvas.parentElement!;
  const resize = () => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    canvas.style.width = canvas.style.height = '100%';
    uniforms.uRes.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const target = { x: 0.7, y: 0.55 };
  addEventListener('pointermove', (e) => {
    target.x = e.clientX / innerWidth;
    target.y = 1 - e.clientY / innerHeight;
  });

  let visible = true;
  new IntersectionObserver(([en]) => (visible = en.isIntersecting)).observe(canvas);

  gsap.to(uniforms.uIntro, { value: 1, duration: 2.6, ease: 'power2.out', delay: 0.2 });
  canvas.classList.add('is-ready');

  gsap.ticker.add((_, dt) => {
    if (!visible || document.hidden) return;
    uniforms.uTime.value += dt / 1000;
    const mv = uniforms.uMouse.value;
    mv.x += (target.x - mv.x) * 0.04;
    mv.y += (target.y - mv.y) * 0.04;
    renderer.render({ scene: mesh });
  });
}
