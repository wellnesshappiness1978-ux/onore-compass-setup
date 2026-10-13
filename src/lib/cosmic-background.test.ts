import { describe, expect, it, vi } from 'vitest';
import { birthColorPalette, spaceComposition, spacePaintingPixels, paintBirthColorSpace, prepareCosmicForeground, COSMIC_BACKGROUND_OPACITY, COSMIC_BACKGROUND_MAX_OPACITY } from './cosmic-background';

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
  it('locks the combined background opacity, not just individual overlapping passes', () => {
    expect(COSMIC_BACKGROUND_OPACITY).toBeGreaterThanOrEqual(.10);
    expect(COSMIC_BACKGROUND_OPACITY).toBeLessThanOrEqual(COSMIC_BACKGROUND_MAX_OPACITY);
    expect(COSMIC_BACKGROUND_MAX_OPACITY).toBe(.18);
    const draws: number[] = [];
    const rear = { createImageData: () => ({ data: new Uint8ClampedArray(8 * 8 * 4) }), putImageData: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn() };
    const ctx = { globalAlpha: 1, globalCompositeOperation: 'source-over', filter: 'none', shadowBlur: 0, save: vi.fn(), restore: vi.fn(), fillRect: vi.fn(), drawImage() { draws.push(this.globalAlpha); }, createRadialGradient: () => ({ addColorStop: vi.fn() }) };
    vi.stubGlobal('document', { documentElement: {}, createElement: () => ({ getContext: () => rear }) });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: (name: string) => name === '--cosmic-space-ink' ? '#020208' : '#edf5ff' }));
    try {
      paintBirthColorSpace(ctx as unknown as CanvasRenderingContext2D, 8, colors, 42);
      expect(draws).toEqual([COSMIC_BACKGROUND_OPACITY]);
      expect(rear.putImageData).toHaveBeenCalledOnce();
      prepareCosmicForeground(ctx as unknown as CanvasRenderingContext2D);
      expect(ctx.globalAlpha).toBe(1);
      expect(ctx.globalCompositeOperation).toBe('source-over');
      expect(ctx.filter).toBe('none');
      expect(ctx.shadowBlur).toBe(0);
    } finally { vi.unstubAllGlobals(); }
    expect(spaceComposition(.5, .47, 42).light).toBeLessThan(spaceComposition(.15, .35, 42).light);
  });
});