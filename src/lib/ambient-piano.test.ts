import { describe, expect, it } from 'vitest';
import { normalizedPartials, pianoStyles, pianoTones, safePianoVolume } from './ambient-piano';

describe('BGM headroom', () => {
  it('bounds volume including invalid inputs', () => {
    expect([-.1, 0, .6, 1, 4, NaN, Infinity].map(safePianoVolume)).toEqual([0, 0, .6, 1, 1, 0, 0]);
  });
  it.each(pianoTones)('%i Hz has normalized harmonic energy and a softened attack', hz => {
    const style = pianoStyles[hz];
    if (!style) throw new Error('Missing tuning');
    expect(normalizedPartials(style.partials, hz, 48000).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 10);
    expect(style.attack).toBeGreaterThanOrEqual(.05);
  });
  it('removes inaudible/aliasing harmonics rather than folding them into the signal', () => {
    expect(normalizedPartials([1, 1, 1], 4000, 48000)).toEqual([1, 0, 0]);
  });
});