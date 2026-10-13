import { COSMIC_NEBULA_WEIGHTS } from './cosmic-optics';

const unit = (seed: number) => { const v = Math.sin(seed * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
export type DistantPhenomenon = { x: number; y: number; radius: number; tilt: number; weight: number; role: number; kind: 'spiral' | 'elliptical' | 'nebula' | 'cluster' | 'curtain' | 'disk' | 'dust' };

/** Imagined distant objects, not additional natal bodies or measured sky positions. */
export function distantPhenomena(seed: number): DistantPhenomenon[] {
  const anchors = [[.22,.59],[.76,.3],[.72,.74],[.18,.24],[.84,.52],[.17,.79],[.51,.12]];
  const kinds: DistantPhenomenon['kind'][] = ['spiral','nebula','elliptical','cluster','curtain','disk','dust'];
  return anchors.map(([x = 0, y = 0], role) => ({ x, y, role, kind: kinds[role] ?? 'dust', radius: .052 + (COSMIC_NEBULA_WEIGHTS[role] ?? .24) * .065, tilt: (unit(seed + role * 131) - .5) * 1.5, weight: COSMIC_NEBULA_WEIGHTS[role] ?? .24 }));
}

/** Distinct projected morphology, independent of natal positions. */
export function distantGrain(kind: DistantPhenomenon['kind'], t: number, angle: number, scatter: number) {
  if (kind === 'spiral') {
    const a = t * 11.4 + Math.floor(angle / (Math.PI * 2) * 3) * Math.PI * 2 / 3 + scatter * .32;
    return { x: Math.cos(a) * t, y: Math.sin(a) * t * .58 };
  }
  if (kind === 'curtain') return { x: (t * 2 - 1) * 1.5, y: Math.sin(t * 8.5) * .3 + scatter * .52 };
  if (kind === 'dust') return { x: (t * 2 - 1) * 1.5, y: Math.sin(t * 7.5) * .28 + scatter * .27 };
  const radial = kind === 'cluster' ? t ** 2.4 : kind === 'elliptical' ? t ** 1.8 : kind === 'nebula' ? .48 + t * .52 : .32 + t * .68;
  const flatten = kind === 'disk' ? .2 : kind === 'elliptical' ? .46 : .8;
  const turbulence = kind === 'nebula' ? 1 + Math.sin(angle * 5 + t * 7) * .16 : 1;
  return { x: Math.cos(angle) * radial * turbulence, y: Math.sin(angle) * radial * flatten * turbulence };
}

/** Bounded deep-space grains and broken filaments, never opaque color fields. */
export function paintFantasyDepth(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const starlight = getComputedStyle(document.documentElement).getPropertyValue('--craft-pearl').trim();
  ctx.save(); ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'screen';
  for (const field of distantPhenomena(seed)) {
    const color = colors[field.role] ?? colors[0] ?? starlight;
    ctx.save(); ctx.translate(field.x * size, field.y * size); ctx.rotate(field.tilt);
    const radius = field.radius * size;
    for (let i = 0; i < Math.round(1600 + field.weight * 1200); i++) {
      const salt = seed + field.role * 911 + i * 43, t = Math.sqrt(unit(salt));
      const point = distantGrain(field.kind, t, unit(salt + 5) * Math.PI * 2, unit(salt + 7) - .5);
      const x = point.x * radius, y = point.y * radius;
      const glow = size * (.00016 + unit(salt + 13) ** 3 * .00048);
      ctx.fillStyle = i % 31 === 0 ? starlight : color;
      ctx.globalAlpha = (.16 + field.weight * .34) * (.35 + unit(salt + 17) * .65);
      ctx.beginPath(); ctx.arc(x, y, glow, 0, Math.PI * 2); ctx.fill();
      if (i % 31 === 0) {
        ctx.globalAlpha *= .7; ctx.strokeStyle = starlight; ctx.lineWidth = size * .0004;
        ctx.beginPath(); ctx.moveTo(x-glow*2,y); ctx.lineTo(x+glow*2,y); ctx.moveTo(x,y-glow*2); ctx.lineTo(x,y+glow*2); ctx.stroke();
      }
    }
    if (field.kind !== 'cluster' && field.kind !== 'elliptical') {
      ctx.strokeStyle = color; ctx.lineWidth = size * .00032;
      for (let thread = 0; thread < 44; thread++) {
        ctx.globalAlpha = (.07 + field.weight * .08) * (1 - thread / 58); ctx.beginPath();
        for (let step = 0; step <= 192; step++) {
          const t = step / 192;
          let x: number, y: number;
          if (field.kind === 'curtain' || field.kind === 'dust') { x = (t * 2 - 1) * radius * 1.5; y = Math.sin(t * 7.5 + thread * .055) * radius * .35 + (thread - 6.5) * radius * .028; }
          else { const a = t * (field.kind === 'spiral' ? 11.4 : Math.PI * 2) + thread * .12, r = radius * (field.kind === 'spiral' ? .12 + t * .85 : .42 + thread * .038); x = Math.cos(a) * r; y = Math.sin(a) * r * (field.kind === 'disk' ? .2 : .68); }
          if (step) ctx.lineTo(x,y); else ctx.moveTo(x,y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}
// Integer lattice hash avoids expensive trigonometry in the native-resolution pass.
const hash2 = (x: number, y: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed), c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
/** Deterministic fractal noise in 0..1, independent of output resolution. */
export function fbm(x: number, y: number, seed: number, octaves = 5) {
  let total = 0, amp = .5, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) { total += valueNoise(x * freq, y * freq, seed + o * 17) * amp; norm += amp; amp *= .5; freq *= 2.03; }
  return total / norm;
}
const rgb = (hex: string) => { const n = parseInt(hex.replace('#', '').slice(0, 6), 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const; };

/** Same spatial field at every resolution: fine ridges, sharp absorption, a quiet solar core. */
export function interstellarSample(u: number, v: number, seed: number) {
  const x = u * 7, y = v * 7;
  const warp = fbm(x + 3.1, y - 1.7, seed + 5, 3) * 1.8;
  const base = fbm(x + warp, y + warp * .6, seed, 4);
  const ridged = Math.abs(fbm(x * 3.8 + warp, y * 3.8, seed + 31, 4) - .5);
  const fiber = Math.max(0, 1 - ridged * 24) ** 3;
  const detail = valueNoise(x * 96 + warp, y * 96, seed + 401);
  const laneNoise = valueNoise(x * 2.3 - warp, y * 2.3, seed + 211);
  const extinction = Math.min(1, Math.max(0, (laneNoise - .54) * 22));
  const quiet = Math.min(1, Math.hypot(u - .5, v - .47) / .4) ** 1.6;
  const density = Math.max(0, (base - .38) * 1.8);
  const emission = Math.min(1, (density ** 2 * .3 + fiber * density * (1.2 + detail * .8)) * quiet) * (1 - extinction * .97);
  return { emission, extinction, core: fiber ** 3 * density * quiet * (1 - extinction), role: Math.min(6, Math.floor(valueNoise(x * .4 + 9, y * .4 - 4, seed + 77) * 7)), quiet };
}

/** No scaled bitmap, blur, gradient fog or post-sharpening: compute each output pixel. */
export function interstellarPixels(size: number, colors: readonly string[], seed: number, ink: string, light: string) {
  const pixels = new Uint8ClampedArray(size * size * 4);
  const palette = (colors.length ? colors : [light]).map(rgb), black = rgb(ink), white = rgb(light);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sample = interstellarSample(x / size, y / size, seed);
    const color = palette[sample.role % palette.length] ?? white;
    const i = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) pixels[i + c] = (black[c] ?? 0) + (color[c] ?? 0) * sample.emission * .84 + (white[c] ?? 0) * sample.core * .48;
    pixels[i + 3] = 255;
  }
  return pixels;
}

export function paintInterstellarMedium(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const css = getComputedStyle(document.documentElement);
  const image = ctx.createImageData(size, size);
  image.data.set(interstellarPixels(size, colors, seed, css.getPropertyValue('--cosmic-space-ink').trim(), css.getPropertyValue('--cosmic-star-core').trim()));
  ctx.putImageData(image, 0, 0);
}
