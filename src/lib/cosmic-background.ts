/** One private, seeded space painting. Color roles never change natal calculations. */
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
      const gleam = Math.max(0, s.light - .38) ** 2 * .8;
      // Optical screen transfer retains exact source colors while opening the deep midtones.
      const emission = Math.min(245, pigment * s.light * 1.95 + (pearl[c] ?? 0) * gleam);
      pixels[i + c] = 255 - (255 - (base[c] ?? 0)) * (1 - emission / 255);
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
  const image = ctx.createImageData(size, size);
  image.data.set(spacePaintingPixels(size, palette, seed, ink, pearl));
  ctx.putImageData(image, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  // Varied, restrained star light gives scale to the continuous colored depths.
  for (let i = 0; i < 2100; i++) {
    const u = random(i, 3, seed), v = random(i, 7, seed);
    const shine = random(i, 11, seed);
    const quiet = spaceComposition(u, v, seed).quiet;
    const radius = size * (.00018 + shine ** 9 * .00072);
    ctx.fillStyle = i % 11 ? pearl : palette[i % 7] ?? pearl;
    ctx.globalAlpha = (.1 + shine ** 3 * .62) * quiet;
    ctx.beginPath(); ctx.arc(u * size, v * size, radius, 0, Math.PI * 2); ctx.fill();
    if (shine > .993) {
      ctx.globalAlpha *= .28; ctx.strokeStyle = pearl; ctx.lineWidth = size * .00032;
      ctx.beginPath(); ctx.moveTo(u * size - radius * 3.5, v * size); ctx.lineTo(u * size + radius * 3.5, v * size);
      ctx.moveTo(u * size, v * size - radius * 3.5); ctx.lineTo(u * size, v * size + radius * 3.5); ctx.stroke();
    }
  }
  ctx.restore();
}