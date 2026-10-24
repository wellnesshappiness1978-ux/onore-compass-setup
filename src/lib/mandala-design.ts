import { computeCoreLayers, type CoreInput } from './ai/core-layers';
import { paletteSeed } from './mandala-constellations';

export type MandalaDesign = { element: 'fire' | 'water' | 'air' | 'earth'; lifePath: number; motif: 'star' | 'petal' | 'crystal' | 'hexagon'; nodes: number; rotation: number; pigments: string[] };
const elementIds: Record<string, MandalaDesign['element']> = { 火: 'fire', 水: 'water', 風: 'air', 地: 'earth' };
const motifs: Record<MandalaDesign['element'], MandalaDesign['motif']> = { fire: 'star', water: 'petal', air: 'crystal', earth: 'hexagon' };

/** Artistic complementary pigment only; never changes the seven calculated birth colors. */
export function complementPigment(hex: string) {
  const match = /^#([\da-f]{6})$/i.exec(hex);
  if (!match?.[1]) return '#40C4CC';
  const channels = [0, 2, 4].map(i => parseInt(match[1]?.slice(i, i + 2) ?? '00', 16));
  return `#${channels.map(c => (255 - c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/** Birth-fixed design. Groups aggregate each member, never borrow the owner's profile. */
export function mandalaDesign(profiles: CoreInput[], colors: string[], memberColors: string[] = []): MandalaDesign {
  const cores = profiles.map(p => computeCoreLayers(p, new Date(`${p.birthDate}T12:00:00Z`))).filter(c => c !== null);
  const counts = { fire: 0, water: 0, air: 0, earth: 0 };
  cores.forEach(c => { const e = elementIds[c.western.sunElement]; if (e) counts[e] += 1; });
  const element = (Object.keys(counts) as MandalaDesign['element'][]).reduce((a, e) => counts[e] > counts[a] ? e : a, 'earth');
  const lifePath = cores.reduce((sum, c) => sum + c.numerology.lifePath, 0) || 4;
  const main = colors[0] ?? '#E8C86A', soul = colors[6] ?? colors[1] ?? main;
  return { element, lifePath, motif: motifs[element], nodes: memberColors.length >= 2 ? memberColors.length : 6 + lifePath % 7, rotation: (paletteSeed([...colors, ...memberColors]) % 360) * Math.PI / 180, pigments: [main, soul, complementPigment(main), ...colors.slice(1, 6)] };
}