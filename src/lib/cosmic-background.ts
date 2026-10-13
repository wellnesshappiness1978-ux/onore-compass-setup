/** One private, seeded rear layer. Color roles never change natal calculations. */
export const COSMIC_BACKGROUND_OPACITY = 0.14;
export const COSMIC_BACKGROUND_MAX_OPACITY = 0.18;
export const COSMIC_FOREGROUND_OPACITY = 1;
export const COSMIC_REAR_VIGNETTE_OPACITY = 0.08;

export function prepareCosmicForeground(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = COSMIC_FOREGROUND_OPACITY;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
}
const random = (x: number, y: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
function noise(x: number, y: number, seed: number) {
  const ix = Math.floor(x), iy = Math.floor(y), dx = x - ix, dy = y - iy;
  const u = dx * dx * (3 - 2 * dx), v = dy * dy * (3 - 2 * dy);
  const a = random(ix, iy, seed), b = random(ix + 1, iy, seed), c = random(ix, iy + 1, seed), d = random(ix + 1, iy + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function texture(x: number, y: number, seed: number) {
  return noise(x, y, seed) * .57 + noise(x * 2.1, y * 2.1, seed + 17) * .27 + noise(x * 4.3, y * 4.3, seed + 31) * .11 + noise(x * 9.1, y * 9.1, seed + 47) * .05;
}
export function birthColorPalette(colors: readonly string[], fallback: string) {
  return Array.from({ length: 7 }, (_, i) => colors[i] ?? colors[0] ?? fallback);
}
const rgb = (hex: string) => {
  const n = Number.parseInt(hex.replace('#', '').slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export type CosmicStarDepth = 'dust' | 'cluster' | 'diamond';
export const COSMIC_STAR_COUNTS = { dust: 14500, cluster: 2400, diamond: 84 } as const;

/** Normalized, birth-seeded imaginary stars: not a catalogue or a natal sky map. */
export function cosmicStar(depth: CosmicStarDepth, index: number, seed: number) {
  const salt = seed + (depth === 'dust' ? 401 : depth === 'cluster' ? 701 : 1103);
  let u = random(index, 3, salt), v = random(index, 7, salt);
  if (depth === 'dust' && index % 3 !== 0) {
    // A finely resolved flowing stellar river, not a broad painted stripe.
    v = .18 + .48 * u + Math.sin(u * 5.1 + random(1, 2, seed) * .7) * .13
      + (random(index, 13, salt) + random(index, 17, salt) - 1) * .12;
  } else if (depth === 'cluster' && index % 3 !== 0) {
    const group = index % 11;
    const a = random(index, 23, salt) * Math.PI * 2;
    const r = random(index, 29, salt) ** 1.5 * .052;
    u = .09 + random(group, 31, salt) * .82 + Math.cos(a) * r;
    v = .08 + random(group, 37, salt) * .84 + Math.sin(a) * r * .7;
  }
  const quiet = spaceComposition(u, v, seed).quiet;
  const shine = random(index, 11, salt);
  return { u, v, quiet, shine, role: index % 7,
    radius: depth === 'dust' ? .00012 + shine * .00022 : depth === 'cluster' ? .0003 + shine ** 3 * .00045 : .00052 + shine * .00055,
    alpha: (depth === 'dust' ? .22 + shine * .58 : depth === 'cluster' ? .5 + shine * .5 : 1) * quiet };
}

/** Fine independent silk folds, with all seven color roles and Overall longest. */
export function cosmicFilament(t: number, role: number, thread: number, seed: number) {
  const drift = random(1, 2, seed) * .7;
  const u = .025 + t * .95;
  const crest = .18 + .48 * u + Math.sin(u * 5.1 + drift) * .13;
  const v = crest + (role - 3) * .027 + (thread - 11) * .0017
    + Math.sin(t * 11 + role * .8 + thread * .06 + drift) * .014
    + Math.sin(t * 27 + role * .9) * .0025;
  const taper = Math.sin(Math.PI * t) ** .7;
  const quiet = spaceComposition(u, v, seed).quiet;
  return { u, v, alpha: taper * quiet * (role === 0 ? .46 : .28) * (.55 + .45 * Math.sin(thread * 1.7 + 1) ** 2) };
}

/** Normalized composition: sweeping depth around a restful solar heart, not seven stripes. */
export function spaceComposition(u: number, v: number, seed: number) {
  const drift = random(1, 2, seed) * .7;
  const cloud = texture(u * 6 + drift, v * 6, seed);
  const warp = noise(u * 3 + 8, v * 3 - 2, seed + 81) - .5;
  const sweep = .21 + .42 * u + Math.sin(u * 5.1 + drift) * .13;
  const distance = v - sweep - warp * .14;
  const veil = Math.exp(-distance * distance / .014);
  const counter = Math.exp(-((v - (.76 - u * .38 + warp * .15)) ** 2) / .025);
  const quiet = .13 + .87 * (1 - Math.exp(-((u - .5) ** 2 + (v - .47) ** 2) / .043));
  const relief = Math.max(0, cloud - .27);
  // Continuous translucent depths, with luminous crests rather than isolated dark islands.
  const mantle = .15 + cloud * .28;
  const light = (mantle + veil * (.24 + relief * 1.35) + counter * (.12 + relief * .65)) * (.4 + .6 * quiet);
  const fold = .62 + .38 * noise(u * 16 + warp * 3, v * 16, seed + 111);
  const role = noise(u * 2.2 + 7, v * 2.2 - 8, seed + 71) * 6;
  return { light: Math.min(.9, light * fold), role, quiet, cloud };
}

export function spacePaintingPixels(size: number, colors: readonly string[], seed: number, ink: string, starlight: string) {
  const palette = birthColorPalette(colors, starlight).map(rgb), base = rgb(ink), pearl = rgb(starlight);
  const underlight = [0, 1, 2].map(c => palette.slice(1).reduce((sum, color) => sum + (color[c] ?? 0), 0) / 6);
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const s = spaceComposition(x / size, y / size, seed);
    const index = Math.floor(s.role), blend = s.role - index;
    const first = palette[index + 1] ?? palette[0] ?? pearl;
    const next = palette[Math.min(6, index + 2)] ?? first;
    const overall = palette[0] ?? pearl;
    const i = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) {
      const local = (first[c] ?? 0) * (1 - blend) + (next[c] ?? 0) * blend;
      const pigment = (overall[c] ?? 0) * .5 + local * .4 + (underlight[c] ?? 0) * .1;
      // Quiet pigment only: no emissive screen transfer, gas or white-hot crests.
      const depth = .08 + s.light * .28;
      pixels[i + c] = (base[c] ?? 0) * (1 - depth) + pigment * depth;
    }
    pixels[i + 3] = 255;
  }
  return pixels;
}

export function paintBirthColorSpace(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--cosmic-space-ink').trim();
  const pearl = css.getPropertyValue('--cosmic-star-core').trim();
  const palette = birthColorPalette(colors, pearl);
  ctx.save(); ctx.filter = 'none'; ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // Flatten colors and stars privately, then composite ONCE: overlaps cannot
  // accumulate past the fixed opacity. putImageData ignores globalAlpha.
  const layer = document.createElement('canvas'); layer.width = size; layer.height = size;
  const rear = layer.getContext('2d');
  if (!rear) throw new Error('Background canvas unavailable');
  const image = rear.createImageData(size, size);
  image.data.set(spacePaintingPixels(size, palette, seed, ink, pearl));
  rear.putImageData(image, 0, 0);
  rear.globalCompositeOperation = 'screen';
  // Every luminous stitch stays on the private rear canvas. No blur or glow wash.
  for (let role = 6; role >= 0; role--) for (let thread = 0; thread < 23; thread++) {
    rear.strokeStyle = palette[role] ?? pearl;
    rear.lineWidth = size * (role === 0 ? .00055 : .00035);
    for (let segment = 0; segment < 12; segment++) {
      const mid = cosmicFilament((segment + .5) / 12, role, thread, seed);
      rear.globalAlpha = mid.alpha;
      rear.beginPath();
      for (let step = 0; step <= 16; step++) {
        const p = cosmicFilament((segment + step / 16) / 12, role, thread, seed);
        if (step) rear.lineTo(p.u * size, p.v * size); else rear.moveTo(p.u * size, p.v * size);
      }
      rear.stroke();
    }
  }
  for (const depth of ['dust', 'cluster', 'diamond'] as const) {
    for (let i = 0; i < COSMIC_STAR_COUNTS[depth]; i++) {
      const star = cosmicStar(depth, i, seed);
      const x = star.u * size, y = star.v * size, r = star.radius * size;
      rear.fillStyle = i % 5 ? pearl : palette[star.role] ?? pearl;
      rear.globalAlpha = star.alpha;
      rear.beginPath();
      if (depth === 'dust') {
        // Angular subpixel grains keep the far field crystalline rather than dotted.
        rear.moveTo(x, y - r); rear.lineTo(x + r * .65, y);
        rear.lineTo(x, y + r); rear.lineTo(x - r * .65, y);
      } else rear.arc(x, y, r, 0, Math.PI * 2);
      rear.fill();
      if (depth === 'diamond') {
        rear.strokeStyle = pearl;
        // Tapered diffraction rays, with a minute secondary cross; no blurry disks.
        for (let ray = 0; ray < 4; ray++) {
          const a = ray * Math.PI / 2 + .16;
          for (let band = 0; band < 3; band++) {
            const reach = r * (2 + band * 2.4);
            rear.globalAlpha = star.alpha * (.64 / (band + 1));
            rear.lineWidth = size * (.00046 / (band + 1));
            rear.beginPath(); rear.moveTo(x, y);
            rear.lineTo(x + Math.cos(a) * reach, y + Math.sin(a) * reach); rear.stroke();
          }
        }
      }
    }
  }
  ctx.fillStyle = ink; ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = COSMIC_BACKGROUND_OPACITY;
  ctx.drawImage(layer, 0, 0);
  ctx.globalAlpha = COSMIC_REAR_VIGNETTE_OPACITY;
  const vignette = ctx.createRadialGradient(size * .5, size * .47, 0, size * .5, size * .47, size * .49);
  vignette.addColorStop(0, ink); vignette.addColorStop(.65, ink); vignette.addColorStop(1, 'transparent');
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, size, size);
  ctx.restore();
}