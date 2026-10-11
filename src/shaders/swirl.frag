precision highp float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uIntro;

varying vec2 vUv;

// Value noise + fbm, domain-warped twice for a marbled chocolate/milk pour.
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
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.035;

  // The cursor gently stirs the liquid.
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 d = p - m;
  float md = length(d);
  float stir = exp(-md * 2.6) * 0.9;
  float ang = stir * 1.4;
  p = m + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d;

  vec2 sp = p * 1.25 + vec2(0.0, t * 0.6);
  vec2 q = vec2(fbm(sp + t), fbm(sp + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(sp + 3.2 * q + vec2(1.7, 9.2) + t * 1.4), fbm(sp + 3.2 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm(sp + 2.8 * r);

  vec3 ganache = vec3(0.085, 0.048, 0.032);
  vec3 cocoa = vec3(0.24, 0.13, 0.08);
  vec3 caramel = vec3(0.42, 0.25, 0.14);
  vec3 milk = vec3(0.95, 0.89, 0.79);
  vec3 gold = vec3(0.86, 0.69, 0.38);

  vec3 col = mix(ganache, cocoa, smoothstep(0.25, 0.75, f));
  col = mix(col, caramel, smoothstep(0.55, 0.95, length(q)) * 0.55);

  // Thin milk ribbons folding through the chocolate.
  float band = sin(f * 9.0 + r.x * 5.0 - t * 2.0) * 0.5 + 0.5;
  float ribbon = smoothstep(0.9, 0.985, band) * smoothstep(0.35, 0.75, r.y);
  col = mix(col, milk, ribbon * 0.62 * uIntro);

  // Satin highlight + a whisper of gold on the crests.
  float crest = pow(smoothstep(0.7, 1.0, band), 7.0);
  col += gold * crest * 0.18;
  col += vec3(1.0, 0.92, 0.8) * pow(max(0.0, 1.0 - abs(f - 0.62) * 9.0), 4.0) * 0.06;

  // Vignette, darker on the left so the headline reads.
  vec2 vp = gl_FragCoord.xy / uRes;
  col *= mix(0.45, 1.0, smoothstep(0.0, 0.65, vp.x));
  col *= 1.0 - 0.5 * smoothstep(0.35, 1.25, length(p * vec2(0.75, 1.0)));
  col *= uIntro;

  gl_FragColor = vec4(col, 1.0);
}
