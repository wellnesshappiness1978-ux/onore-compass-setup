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
      expect(s.light).toBeGreaterThanOrEqual(0); expect(s.light).toBeLessThanOrEqual(.9);
    }
  });
  it('opens the colored depths without flattening the central light hierarchy', () => {
    const pixels = spacePaintingPixels(96, colors, 42, '#010105', '#edf5ff');
    let black = 0, bright = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const maximum = Math.max(pixels[i] ?? 0, pixels[i+1] ?? 0, pixels[i+2] ?? 0);
      if (maximum < 18) black++;
      if (maximum > 100) bright++;
    }
    expect(black / (96 * 96)).toBeLessThan(.05);
    expect(bright / (96 * 96)).toBeGreaterThan(.15);
    expect(spaceComposition(.5, .47, 42).light).toBeLessThan(spaceComposition(.15, .35, 42).light);
  });
});