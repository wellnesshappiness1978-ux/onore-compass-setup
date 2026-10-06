import type { birthColorSpectrum } from "./birth-color-spectrum";

export type BirthPalette = NonNullable<ReturnType<typeof birthColorSpectrum>>;
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function paletteColors(palette: BirthPalette) {
  return [palette.main, palette.sub, palette.money, palette.love, palette.health, palette.mind];
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