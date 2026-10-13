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
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (const field of distantPhenomena(seed)) {
    const color = colors[field.role] ?? colors[0] ?? starlight;
    ctx.save(); ctx.translate(field.x * size, field.y * size); ctx.rotate(field.tilt);
    const radius = field.radius * size;
    for (let i = 0; i < Math.round(520 + field.weight * 420); i++) {
      const salt = seed + field.role * 911 + i * 43, t = Math.sqrt(unit(salt));
      const point = distantGrain(field.kind, t, unit(salt + 5) * Math.PI * 2, unit(salt + 7) - .5);
      const x = point.x * radius, y = point.y * radius;
      const glow = size * (.0007 + unit(salt + 13) ** 2 * .0028);
      ctx.fillStyle = i % 31 === 0 ? starlight : color;
      ctx.globalAlpha = (.075 + field.weight * .2) * (.35 + unit(salt + 17) * .65);
      if (i % 5 === 0) {
        const mist = ctx.createRadialGradient(x, y, 0, x, y, glow * 5);
        mist.addColorStop(0, color); mist.addColorStop(1, 'transparent');
        ctx.fillStyle = mist; ctx.globalAlpha *= .22;
        ctx.beginPath(); ctx.arc(x, y, glow * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = i % 31 === 0 ? starlight : color; ctx.globalAlpha /= .22;
      }
      ctx.beginPath(); ctx.arc(x, y, glow, 0, Math.PI * 2); ctx.fill();
      if (i % 31 === 0) {
        ctx.globalAlpha *= .7; ctx.strokeStyle = starlight; ctx.lineWidth = size * .0004;
        ctx.beginPath(); ctx.moveTo(x-glow*2,y); ctx.lineTo(x+glow*2,y); ctx.moveTo(x,y-glow*2); ctx.lineTo(x,y+glow*2); ctx.stroke();
      }
    }
    if (field.kind !== 'cluster' && field.kind !== 'elliptical') {
      ctx.strokeStyle = color; ctx.lineWidth = size * .00065;
      for (let thread = 0; thread < 14; thread++) {
        ctx.globalAlpha = (.07 + field.weight * .08) * (1 - thread / 18); ctx.beginPath();
        for (let step = 0; step <= 64; step++) {
          const t = step / 64;
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
const hash2 = (x: number, y: number, seed: number) => unit(x * 157.31 + y * 311.7 + seed * .618);
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

/** Photographic interstellar medium: ridged gas filaments tinted by the exact birth colors and dark absorbing lanes. */
export function paintInterstellarMedium(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const grid = 192, palette = (colors.length ? colors : ['#8899cc']).map(rgb);
  const glow = ctx.createImageData(grid, grid), dark = ctx.createImageData(grid, grid);
  for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++) {
    const u = x / grid * 4, v = y / grid * 4;
    const warp = fbm(u + 3.1, v - 1.7, seed + 5) * 2.2;
    const base = fbm(u + warp, v + warp * .6, seed);
    const ridge = 1 - Math.abs(fbm(u * 1.8 + warp, v * 1.8, seed + 31) * 2 - 1);
    const filament = Math.pow(ridge, 7) * base;
    const pick = fbm(u * .55 + 9, v * .55 - 4, seed + 77) * palette.length * 1.6;
    const c0 = palette[Math.floor(pick) % palette.length]!, c1 = palette[(Math.floor(pick) + 1) % palette.length]!, f = pick % 1;
    const dx = x / grid - .5, dy = y / grid - .47, quiet = Math.min(1, Math.hypot(dx, dy) / .42);
    const a = Math.min(1, (Math.pow(base, 2.4) * .55 + filament * 1.5) * (.35 + .65 * quiet)), i = (y * grid + x) * 4;
    glow.data[i] = c0[0] + (c1[0] - c0[0]) * f; glow.data[i + 1] = c0[1] + (c1[1] - c0[1]) * f; glow.data[i + 2] = c0[2] + (c1[2] - c0[2]) * f; glow.data[i + 3] = a * 150;
    const lane = Math.max(0, fbm(u * 1.3 - warp * .5, v * 1.3, seed + 211) - .56) * 2.6;
    dark.data[i] = 2; dark.data[i + 1] = 3; dark.data[i + 2] = 10; dark.data[i + 3] = Math.min(1, lane) * 150 * quiet;
  }
  const layer = document.createElement('canvas'); layer.width = grid; layer.height = grid;
  const l = layer.getContext('2d'); if (!l) return;
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  l.putImageData(glow, 0, 0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .9; ctx.drawImage(layer, 0, 0, size, size);
  ctx.filter = `blur(${size * .006}px)`; ctx.globalAlpha = .5; ctx.drawImage(layer, 0, 0, size, size); ctx.filter = 'none';
  l.clearRect(0, 0, grid, grid); l.putImageData(dark, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .8; ctx.drawImage(layer, 0, 0, size, size);
  // Scattered starlight: tiny clusters and remnant shells kept faint.
  ctx.globalCompositeOperation = 'screen';
  for (let k = 0; k < 5; k++) {
    const cx = (.08 + unit(seed + k * 41) * .84) * size, cy = (.06 + unit(seed + k * 43) * .88) * size;
    if (Math.hypot(cx / size - .5, cy / size - .47) < .3) continue;
    const color = colors[k % colors.length] ?? '#ffffff';
    if (k % 2) { ctx.strokeStyle = color; ctx.lineWidth = size * .0012; ctx.globalAlpha = .18; ctx.beginPath(); ctx.ellipse(cx, cy, size * .022, size * .017, unit(seed + k) * 3, 0, Math.PI * 2); ctx.stroke(); }
    for (let s = 0; s < 40; s++) { const r = size * .02 * unit(seed + k * 7 + s) ** 1.6, a = unit(seed + k * 9 + s * 3) * Math.PI * 2; ctx.fillStyle = s % 4 ? '#f4f1e6' : color; ctx.globalAlpha = .35 + unit(seed + s) * .5; ctx.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, size * .0018, size * .0018); }
  }
  ctx.restore();
}
