import type { birthColorSpectrum } from "./birth-color-spectrum";

export type BirthPalette = NonNullable<ReturnType<typeof birthColorSpectrum>>;
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const PHI = (1 + Math.sqrt(5)) / 2;
export type MandalaIntention = "overall" | "wealth" | "work" | "love" | "health";
export type MandalaPattern = "spiral" | "octagonal" | "hexagonal" | "paired-waves" | "flower-of-life";
export type GemCut = "diamond" | "citrine" | "sapphire" | "ruby" | "emerald";
export type MandalaStyle = {
  pattern: MandalaPattern;
  gem: GemCut;
  sides: number;
  rays: number;
  particles: number;
  rotationSpeed: number;
  accent: string;
  secondaryAccent: string;
};

export const MANDALA_STYLES: Record<MandalaIntention, MandalaStyle> = {
  overall: { pattern: "spiral", gem: "diamond", sides: 12, rays: 84, particles: 132, rotationSpeed: .003, accent: "#FFF4C7", secondaryAccent: "#9DEBFF" },
  wealth: { pattern: "octagonal", gem: "citrine", sides: 8, rays: 64, particles: 180, rotationSpeed: .0022, accent: "#FFD21C", secondaryAccent: "#FF8A00" },
  work: { pattern: "hexagonal", gem: "sapphire", sides: 6, rays: 96, particles: 96, rotationSpeed: .0018, accent: "#1677FF", secondaryAccent: "#00E5FF" },
  love: { pattern: "paired-waves", gem: "ruby", sides: 10, rays: 56, particles: 156, rotationSpeed: .004, accent: "#FF176B", secondaryAccent: "#A733FF" },
  health: { pattern: "flower-of-life", gem: "emerald", sides: 6, rays: 72, particles: 120, rotationSpeed: .0026, accent: "#00D96F", secondaryAccent: "#00D8C8" },
};

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

export function flowerOfLifeCenters(rings = 3, spacing = 1, z = 0) {
  const safeRings = Math.max(0, Math.floor(rings));
  const centers: [number, number, number][] = [[0, 0, z]];
  for (let ring = 1; ring <= safeRings; ring++) {
    for (let side = 0; side < 6; side++) {
      const a = side * Math.PI / 3;
      const b = (side + 1) * Math.PI / 3;
      for (let step = 0; step < ring; step++) {
        const t = step / ring;
        centers.push([
          (Math.cos(a) * (1 - t) + Math.cos(b) * t) * ring * spacing,
          (Math.sin(a) * (1 - t) + Math.sin(b) * t) * ring * spacing,
          z,
        ]);
      }
    }
  }
  return centers;
}

export function pairedWavePoint(index: number, count: number, radius = 1, phase = 0) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const angle = t * Math.PI * 2;
  const ripple = .72 + Math.sin(angle * 3 + phase) * .19 + Math.sin(angle * 7 - phase) * .07;
  return [Math.cos(angle) * radius * ripple, Math.sin(angle) * radius * ripple] as const;
}

export function facetTone(index: number, count: number) {
  const safeCount = Math.max(1, count);
  const wave = Math.sin(index / safeCount * Math.PI * 2 + .7) * .5 + .5;
  return .58 + wave * .42;
}