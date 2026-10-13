/** Original procedural space painting. This module never owns natal positions. */
export const COSMIC_BACKGROUND_OPACITY = 0.14;
export const COSMIC_BACKGROUND_MAX_OPACITY = 0.18;
export const COSMIC_FOREGROUND_OPACITY = 1;
export const COSMIC_REAR_VIGNETTE_OPACITY = 0.08;
export const COSMIC_BACKGROUND_ENGINE = 'volumetric-fibers-v1';

export function prepareCosmicForeground(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = COSMIC_FOREGROUND_OPACITY;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
}
export function birthColorPalette(colors: readonly string[], fallback: string) {
  return Array.from({ length: 7 }, (_, i) => colors[i] ?? colors[0] ?? fallback);
}
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const hash = (x: number, y: number, seed: number) => {
  let v = Math.imul(x, 1597334677) ^ Math.imul(y, 3812015801) ^ Math.imul(seed, 958282831);
  v = Math.imul(v ^ (v >>> 16), 2246822519);
  return ((v ^ (v >>> 13)) >>> 0) / 4294967296;
};
function lattice(x: number, y: number, seed: number) {
  const a = Math.floor(x), b = Math.floor(y);
  let u = x - a, v = y - b;
  u = u * u * u * (u * (u * 6 - 15) + 10);
  v = v * v * v * (v * (v * 6 - 15) + 10);
  return (hash(a, b, seed) * (1 - u) + hash(a + 1, b, seed) * u) * (1 - v)
    + (hash(a, b + 1, seed) * (1 - u) + hash(a + 1, b + 1, seed) * u) * v;
}
function turbulence(x: number, y: number, seed: number) {
  let sum = 0, amplitude = .52;
  for (let octave = 0; octave < 5; octave++) {
    sum += lattice(x, y, seed + octave * 101) * amplitude;
    const next = x * 1.73 + y * 1.04 + 17.8;
    y = y * 1.73 - x * 1.04 - 9.2; x = next;
    amplitude *= .48;
  }
  return sum;
}
/** Domain-warped emissive sheet, thin turbulent ridges and crisp absorbing lanes.
 * Normalized coordinates make all spatial features independent of output size.
 * The two crossing fields are continuous sheets, not circular gradient blobs.
 */
export function cosmicMedium(u: number, v: number, seed: number) {
  const drift = hash(19, 41, seed) * 5;
  const wx = lattice(u * 3.6 + drift, v * 3.6, seed + 11) - .5;
  const wy = lattice(u * 3.6, v * 3.6 - drift, seed + 23) - .5;
  const x = u + wx * .19, y = v + wy * .19;
  const density = turbulence(x * 7.3 + drift, y * 7.3, seed + 47);
  const vein = lattice(x * 39 + density * 9, y * 13 - density * 6, seed + 89);
  const contour = Math.abs(density - .49 + Math.sin(x * 8 + y * 3 + drift) * .075);
  const fibers = Math.exp(-contour * 80) * (.35 + vein * .65);
  const sheet = clamp(1 - Math.abs(y - (.27 + .34 * x + Math.sin(x * 6 + drift) * .1)) * 3.3);
  const secondary = clamp(1 - Math.abs(x + y * .65 - .85 - wx * .4) * 2.4);
  const edge = Math.abs(vein - .43 + (density - .5) * .6);
  const extinction = clamp((.06 - edge) * 24) * (.4 + .6 * sheet);
  const quiet = .17 + .83 * clamp(Math.hypot((u - .5) * 2.3, (v - .47) * 2.3));
  const emission = (.16 + sheet * (.26 + density * .68) + secondary * .2 + fibers * .95)
    * (1 - extinction * .86) * quiet;
  const colorFlow = clamp(.5 + wx * .6 + wy * .35 + Math.sin(x * 4 - y * 3 + drift) * .37);
  return { emission, fibers, extinction, quiet, colorFlow, density };
}
const rgb = (hex: string) => {
  const value = Number.parseInt(hex.replace('#', '').slice(0, 6), 16) || 0;
  return [(value >>> 16) & 255, (value >>> 8) & 255, value & 255];
};
/** Optical screen transfer is computed per pixel, before the one bounded composite. */
export function spacePaintingPixels(size: number, colors: readonly string[], seed: number, ink: string, starlight: string) {
  const palette = birthColorPalette(colors, starlight).map(rgb);
  const base = rgb(ink), pearl = rgb(starlight);
  // Spectral mixtures retain every exact source; no replacement hue or desaturation.
  const spectrum = Array.from({ length: 256 }, (_, index) => {
    const t = index / 255;
    const weights = palette.map((_, role) => role === 0 ? .9 : Math.exp(-((t - (role - 1) / 5) ** 2) / .035) + .045);
    const total = weights.reduce((a, b) => a + b, 0);
    return [0, 1, 2].map(c => weights.reduce((sum, weight, role) => sum + weight * (palette[role]?.[c] ?? 0), 0) / total);
  });
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const m = cosmicMedium(x / size, y / size, seed);
    const pigment = spectrum[Math.min(255, Math.floor(m.colorFlow * 255))] ?? base;
    const i = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) {
      const radiance = (pigment[c] ?? 0) / 255 * m.emission * 3.1
        + (pearl[c] ?? 0) / 255 * m.fibers * .2 * m.quiet;
      pixels[i + c] = 255 - (255 - (base[c] ?? 0)) * Math.exp(-radiance);
    }
    pixels[i + 3] = 255;
  }
  return pixels;
}
export const COSMIC_STELLAR_COUNT = 22400;
/** New fractured stellar stream plus irregular associations, never a star catalogue. */
export function stellarSample(index: number, seed: number) {
  const a = hash(index, 7, seed), b = hash(index, 17, seed);
  let u = a, v = b;
  if (index % 4 < 2) {
    v = .14 + .64 * a + Math.sin(a * 9 + hash(7, 9, seed) * 4) * .12
      + (b + hash(index, 29, seed) - 1) * .16;
  } else if (index % 4 === 2) {
    const group = index % 19;
    const angle = a * Math.PI * 2, r = b ** 1.7 * .065;
    u = .08 + hash(group, 61, seed) * .84 + Math.cos(angle) * r;
    v = .08 + hash(group, 71, seed) * .84 + Math.sin(angle) * r * .55;
  }
  const brightness = hash(index, 37, seed);
  const major = index % 317 === 0;
  const quiet = .17 + .83 * clamp(Math.hypot((u - .5) * 2.3, (v - .47) * 2.3));
  return { u: clamp(u), v: clamp(v), major, role: index % 7,
    radius: major ? .001 + brightness * .00085 : .00017 + brightness ** 5 * .00066,
    alpha: (.42 + brightness * .58) * quiet };
}
export function paintBirthColorSpace(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--cosmic-space-ink').trim();
  const pearl = css.getPropertyValue('--cosmic-star-core').trim();
  const palette = birthColorPalette(colors, pearl);
  const layer = document.createElement('canvas'); layer.width = size; layer.height = size;
  const rear = layer.getContext('2d');
  if (!rear) throw new Error('Background canvas unavailable');
  const image = rear.createImageData(size, size);
  image.data.set(spacePaintingPixels(size, palette, seed, ink, pearl));
  rear.putImageData(image, 0, 0);
  rear.globalCompositeOperation = 'screen';
  for (let i = 0; i < COSMIC_STELLAR_COUNT; i++) {
    const s = stellarSample(i, seed + 997), x = s.u * size, y = s.v * size, r = s.radius * size;
    rear.globalAlpha = s.alpha;
    rear.fillStyle = i % 3 ? pearl : palette[s.role] ?? pearl;
    rear.beginPath();
    // Four unequal points resolve into crystalline grains, not uniform round dots.
    rear.moveTo(x, y - r); rear.lineTo(x + r * .6, y);
    rear.lineTo(x, y + r * .8); rear.lineTo(x - r * .6, y); rear.fill();
    if (!s.major) continue;
    rear.strokeStyle = pearl;
    for (let ray = 0; ray < 4; ray++) {
      const angle = ray * Math.PI / 2 + .27;
      for (let segment = 0; segment < 5; segment++) {
        rear.globalAlpha = s.alpha * (1 - segment / 5) ** 2;
        rear.lineWidth = size * .00055 / (segment + 1);
        const from = r * (1 + segment * 2), to = r * (3 + segment * 2);
        rear.beginPath(); rear.moveTo(x + Math.cos(angle) * from, y + Math.sin(angle) * from);
        rear.lineTo(x + Math.cos(angle) * to, y + Math.sin(angle) * to); rear.stroke();
      }
    }
  }
  ctx.save(); prepareCosmicForeground(ctx);
  ctx.fillStyle = ink; ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = COSMIC_BACKGROUND_OPACITY;
  ctx.drawImage(layer, 0, 0);
  // Quiet contrast is already encoded in each pixel, avoiding gradient overlays.
  ctx.restore();
}
