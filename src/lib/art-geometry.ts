import type { birthColorSpectrum } from "./birth-color-spectrum";

export type BirthPalette = NonNullable<ReturnType<typeof birthColorSpectrum>>;
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const PHI = (1 + Math.sqrt(5)) / 2;
export type MandalaIntention = "overall" | "wealth" | "work" | "love" | "health";

export function paletteColors(palette: BirthPalette) {
  return [palette.main, palette.sub, palette.money, palette.work, palette.love, palette.health, palette.mind];
}

const intentionOrder: Record<MandalaIntention, number[]> = {
  overall: [0, 1, 2, 3, 4, 5, 6],
  wealth: [0, 2, 1, 3, 5, 4, 6],
  work: [0, 3, 1, 2, 6, 5, 4],
  love: [0, 4, 1, 6, 5, 2, 3],
  health: [0, 5, 1, 6, 4, 3, 2],
};

export function colorsForIntention(colors: string[], intention: MandalaIntention) {
  if (colors.length === 0) return [];
  return intentionOrder[intention].map(index => colors[index % colors.length] ?? colors[0]).filter((color): color is string => Boolean(color));
}

export function vividHexColor(value: string) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  if (!match) return value;
  const rgb = match.slice(1).map(channel => Number.parseInt(channel ?? "00", 16) / 255);
  const [red = 0, green = 0, blue = 0] = rgb;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue /= 6;
    if (hue < 0) hue += 1;
  }
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const vividSaturation = Math.max(.82, saturation);
  const vividLightness = Math.min(.58, Math.max(.42, lightness));
  const chroma = (1 - Math.abs(2 * vividLightness - 1)) * vividSaturation;
  const segment = hue * 6;
  const x = chroma * (1 - Math.abs(segment % 2 - 1));
  const candidates = segment < 1 ? [chroma, x, 0] : segment < 2 ? [x, chroma, 0] : segment < 3 ? [0, chroma, x] : segment < 4 ? [0, x, chroma] : segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const offset = vividLightness - chroma / 2;
  return `#${candidates.map(channel => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function logarithmicSpiralPoint(index: number, count: number, radius = 1, turns = 3.25) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const angle = turns * Math.PI * 2 * t;
  const growth = Math.log(PHI) / (Math.PI / 2);
  const normalized = (Math.exp(growth * angle) - 1) / (Math.exp(growth * turns * Math.PI * 2) - 1);
  const r = Math.max(0, normalized) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
}

export function seededUnit(seed: number, index: number) {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function spiralPoint(index: number, count: number, radius = 1) {
  const r = Math.sqrt((index + 0.5) / count) * radius;
  const angle = index * GOLDEN_ANGLE;
  return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
}

export function layeredSpiralPoint(index: number, count: number, arm: number, arms = 6, radius = 1) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const angle = t * Math.PI * 7.5 + arm * Math.PI * 2 / arms;
  const r = (.18 + Math.pow(t, .76) * .82) * radius;
  const ripple = 1 + Math.sin(t * Math.PI * 16 + arm * 1.7) * .018;
  return [Math.cos(angle) * r * ripple, Math.sin(angle) * r * ripple] as const;
}

export function goldLeafTransform(seed: number, index: number, radius = 1) {
  const angle = seededUnit(seed + 11, index) * Math.PI * 2;
  const distance = (.18 + Math.sqrt(seededUnit(seed + 29, index)) * .82) * radius;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotation: seededUnit(seed + 47, index) * Math.PI * 2,
    scale: .55 + seededUnit(seed + 71, index) * 1.15,
  };
}

export function regularPolygonPoints(sides: number, radius: number, phase = 0, z = 0) {
  const safeSides = Math.max(3, Math.floor(sides));
  return Array.from({ length: safeSides + 1 }, (_, index) => {
    const angle = phase + index / safeSides * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number];
  });
}

export function crystalRosettePoints(petals: number, outerRadius: number, innerRadius: number, phase = 0, z = 0) {
  const safePetals = Math.max(3, Math.floor(petals));
  return Array.from({ length: safePetals * 2 + 1 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = phase + index / (safePetals * 2) * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number];
  });
}

export function radialRayTransform(seed: number, index: number, count: number, radius = 1) {
  const safeCount = Math.max(1, count);
  const angle = index / safeCount * Math.PI * 2 + (seededUnit(seed + 211, index) - .5) * .035;
  return {
    angle,
    length: radius * (.76 + seededUnit(seed + 223, index) * .24),
    width: .012 + seededUnit(seed + 227, index) * .026,
  };
}

export function sparkleTransform(seed: number, index: number, radius = 1) {
  const angle = seededUnit(seed + 307, index) * Math.PI * 2;
  const distance = Math.sqrt(seededUnit(seed + 311, index)) * radius;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotation: seededUnit(seed + 313, index) * Math.PI * 2,
    scale: .45 + seededUnit(seed + 317, index) * 1.4,
  };
}
/** Lathe profile (radius, height) for a brilliant-cut gem: pavilion apex → girdle → crown → table. */
export function brilliantCutProfile(radius = 1) {
  return [
    [0, -radius * .86], [radius * .98, -radius * .02], [radius, 0], [radius * .98, radius * .04],
    [radius * .62, radius * .34], [0, radius * .34],
  ] as [number, number][];
}

/** Deterministic faint background specks kept outside the mandala radius. */
export function starfieldPoints(seed: number, count: number, inner: number, outer: number) {
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const angle = seededUnit(seed + 401, index) * Math.PI * 2;
    const distance = Math.sqrt(inner * inner + seededUnit(seed + 409, index) * (outer * outer - inner * inner));
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, brightness: .25 + seededUnit(seed + 419, index) * .45 };
  });
}

/** Ribbon outline for a brush band with organic width variation. Returns left/right edges. */
export function brushBandEdges(points: [number, number][], width: number, seed: number) {
  return points.map((point, index) => {
    const prev = points[Math.max(0, index - 1)] ?? point;
    const next = points[Math.min(points.length - 1, index + 1)] ?? point;
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const length = Math.hypot(dx, dy) || 1;
    const t = points.length <= 1 ? 0 : index / (points.length - 1);
    const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * .45 + .55;
    const w = width * taper * (.8 + seededUnit(seed, index) * .4) / 2;
    const nx = -dy / length * w;
    const ny = dx / length * w;
    return { left: [point[0] + nx, point[1] + ny] as [number, number], right: [point[0] - nx, point[1] - ny] as [number, number] };
  });
}
