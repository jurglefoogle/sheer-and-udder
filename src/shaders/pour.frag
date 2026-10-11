precision highp float;

uniform sampler2D tFrom;
uniform sampler2D tTo;
uniform float uMix; // 0 → 1 across one step change
uniform float uTime;
uniform float uZoom;
uniform vec2 uRes;
uniform float uImgAspect;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + 17.1;
    a *= 0.5;
  }
  return v;
}

// object-fit: cover, plus a slow push-in.
vec2 cover(vec2 uv) {
  float ca = uRes.x / uRes.y;
  vec2 s = ca > uImgAspect ? vec2(1.0, uImgAspect / ca) : vec2(ca / uImgAspect, 1.0);
  return (uv - 0.5) * s / uZoom + 0.5;
}

void main() {
  vec2 uv = vUv;
  float depth = 1.0 - uv.y; // 0 at the top of the frame, 1 at the bottom

  // A liquid front pours down from the top: wavy, turbulent, never a straight wipe.
  float n = fbm(vec2(uv.x * 3.2, depth * 2.0 - uTime * 0.35));
  float front = mix(-0.3, 1.3, uMix);
  float d = depth + (n - 0.5) * 0.42 - front;
  float reveal = 1.0 - smoothstep(-0.07, 0.07, d);
  float edge = 1.0 - smoothstep(0.0, 0.16, abs(d));

  // Refraction around the front: both images bend and smear downward as it passes.
  vec2 bend = vec2((n - 0.5) * 0.05, 0.05) * edge;
  float swell = sin(uMix * 3.14159);
  vec2 drift = vec2(0.0, (n - 0.5) * 0.012 * swell);
  vec3 a = texture2D(tFrom, cover(uv + bend * 0.6 + drift)).rgb;
  vec3 b = texture2D(tTo, cover(uv - bend + drift * 0.5)).rgb;
  vec3 col = mix(a, b, reveal);

  // A satin cream highlight rides the leading edge, with a little gold in it.
  float gloss = pow(edge, 4.0) * swell;
  col += vec3(1.0, 0.9, 0.74) * gloss * 0.16;
  col = mix(col, col * vec3(1.06, 0.98, 0.9), edge * 0.35 * swell);

  gl_FragColor = vec4(col, 1.0);
}
