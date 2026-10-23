import { birthColorNameForHex, birthColorSpectrum } from "./birth-color-spectrum";
import type { BirthColorRole } from "./birth-color-copy";

type ParentBirth = { birthDate: string; birthPlace?: string; birthCity?: string };
export type GroupBirth = { birthDate: string; birthTime?: string; birthTimeUnknown?: boolean; birthPlace?: string; father?: ParentBirth | null; mother?: ParentBirth | null };
export const groupPaletteRoles: BirthColorRole[] = ["main", "sub", "money", "work", "love", "health", "mind"];
type Swatch = { slot: number; name: string; code: string };

const toHsl = (code: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(code);
  const [r, g, b] = m ? [0, 2, 4].map(i => parseInt(m[1]!.slice(i, i + 2), 16) / 255) as [number, number, number] : [0.83, 0.69, 0.22];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: d ? d / (1 - Math.abs(2 * l - 1)) : 0, l };
};
const fromHsl = (h: number, s: number, l: number) => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0"); };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/** "Fortune-raising" color for one role (illustrative, deterministic):
 * - members already resonate (hue vectors agree) → amplify the shared hue, brighter and more saturated;
 * - members diverge → fill the widest missing hue gap, the energy nobody carries alone.
 * Never a plain RGB mean, which muddies toward grey. */
export function elevatedGroupColor(codes: string[]): string {
  if (!codes.length) return "#D4AF37";
  const hsl = codes.map(toHsl);
  if (hsl.length === 1) { const c = hsl[0]!; return fromHsl(c.h, Math.min(0.85, c.s + 0.12), Math.min(0.62, Math.max(0.5, c.l + 0.04))); }
  const x = hsl.reduce((a, c) => a + Math.cos(c.h * Math.PI / 180), 0) / hsl.length;
  const y = hsl.reduce((a, c) => a + Math.sin(c.h * Math.PI / 180), 0) / hsl.length;
  const coherence = Math.hypot(x, y);
  const meanL = hsl.reduce((a, c) => a + c.l, 0) / hsl.length;
  let hue: number;
  if (coherence >= 0.5) hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  else {
    const hues = hsl.map(c => c.h).sort((a, b) => a - b);
    let best = 0, mid = 0;
    hues.forEach((h, i) => { const next = i === hues.length - 1 ? hues[0]! + 360 : hues[i + 1]!; if (next - h > best) { best = next - h; mid = (h + (next - h) / 2) % 360; } });
    hue = mid;
  }
  const sat = Math.min(0.85, 0.6 + coherence * 0.22);
  const light = Math.min(0.62, Math.max(0.5, meanL + 0.05));
  return fromHsl(Math.round(hue * 10) / 10, sat, light);
}

/** Seven group colors computed from every member's role colors to raise the group's shared fortune (illustrative). */
export function groupBirthPalette(members: GroupBirth[]) {
  const palettes = members.map(m => birthColorSpectrum({ birthDate: m.birthDate, birthTime: m.birthTime ?? "", birthTimeUnknown: m.birthTimeUnknown ?? true, birthPlace: m.birthPlace ?? "", father: m.father ?? null, mother: m.mother ?? null })).filter(p => p !== null);
  if (!palettes.length) return null;
  const entry = (role: BirthColorRole): Swatch => {
    const code = elevatedGroupColor(palettes.map(p => p[role].code));
    return { slot: 0, name: birthColorNameForHex(code), code };
  };
  return { main: entry("main"), sub: entry("sub"), money: entry("money"), work: entry("work"), love: entry("love"), health: entry("health"), mind: entry("mind"), provisional: palettes.some(p => p.provisional), placeDefault: palettes.some(p => p.placeDefault), parentInfluence: null };
}
