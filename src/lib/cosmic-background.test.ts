import { describe, expect, it } from 'vitest';
import { birthColorPalette, spaceComposition, spacePaintingPixels } from './cosmic-background';

const colors = ['#bb2266', '#3366bb', '#aa7722', '#228866', '#7733aa', '#2299aa', '#aa3322'];
describe('Unified seven-color space painting', () => {
  it('retains all seven exact inputs with Overall first and safe missing-color fallback', () => {
    expect(birthColorPalette(colors, '#edf5ff')).toEqual(colors);
    expect(birthColorPalette([], '#edf5ff')).toEqual(Array(7).fill('#edf5ff'));
  });
  it('is reproducible, birth-seeded and opaque at every pixel', () => {
    const pixels = spacePaintingPixels(48, colors, 42, '#010105', '#edf5ff');
    expect(pixels).toEqual(spacePaintingPixels(48, colors, 42, '#010105', '#edf5ff'));
    expect(pixels).not.toEqual(spacePaintingPixels(48, colors, 43, '#010105', '#edf5ff'));
    for (let i = 3; i < pixels.length; i += 4) expect(pixels[i]).toBe(255);
    for (let role = 0; role < 7; role++) {
      const changed = colors.map((c, i) => i === role ? '#ffffff' : c);
      expect(spacePaintingPixels(48, changed, 42, '#010105', '#edf5ff')).not.toEqual(pixels);
    }
  });
  it('shares the spatial composition across preview/export and reserves the solar heart', () => {
    expect(spaceComposition(256 / 1024, 768 / 1024, 42)).toEqual(spaceComposition(512 / 2048, 1536 / 2048, 42));
    expect(spaceComposition(.5, .47, 42).quiet).toBeCloseTo(.13);
    expect(spaceComposition(.1, .1, 42).quiet).toBeGreaterThan(.9);
    for (let i = 0; i < 100; i++) {
      const s = spaceComposition(i / 100, (i * 7 % 100) / 100, 42);
      expect(s.light).toBeGreaterThanOrEqual(0); expect(s.light).toBeLessThanOrEqual(.75);
    }
  });
});