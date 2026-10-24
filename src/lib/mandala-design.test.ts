import { describe, expect, it } from 'vitest';
import { complementPigment, mandalaDesign } from './mandala-design';
const p = { nameKanji: '', nameRomaji: '', birthDate: '2000-04-10', birthTime: '', birthTimeUnknown: true, bloodType: '', birthPlace: '' };
describe('birth-fixed mandala design', () => {
  it('uses fire, water, air and earth to select four different motifs', () => {
    expect(['2000-04-10', '2000-07-10', '2000-06-10', '2000-05-10'].map(birthDate => mandalaDesign([{ ...p, birthDate }], ['#FF0000']).motif)).toEqual(['star', 'petal', 'crystal', 'hexagon']);
  });
  it('keeps main and soul pigments exact, adds a complement without mutating birth colors', () => {
    const colors = ['#FF0000', '#ABCD00', '#222222', '#333333', '#444444', '#555555', '#770099'];
    expect(mandalaDesign([p], colors).pigments.slice(0, 3)).toEqual(['#FF0000', '#770099', '#00FFFF']);
    expect(complementPigment('#00FFFF')).toBe('#FF0000');
    expect(colors[0]).toBe('#FF0000');
  });
  it('uses one node per member for two, three, five and thirty people', () => {
    for (const n of [2, 3, 5, 30]) expect(mandalaDesign(Array(n).fill(p), ['#FF0000'], Array(n).fill('#0011FF')).nodes).toBe(n);
  });
  it('is deterministic and life path changes the individual composition', () => {
    const first = mandalaDesign([p], ['#FF0000']);
    expect(first).toEqual(mandalaDesign([p], ['#FF0000']));
    expect(first.nodes).not.toBe(mandalaDesign([{ ...p, birthDate: '2000-04-11' }], ['#FF0000']).nodes);
  });
});