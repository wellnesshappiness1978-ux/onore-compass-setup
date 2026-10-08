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