import { describe, expect, it, vi } from 'vitest';
import { birthColorPalette, cosmicMedium, spacePaintingPixels, stellarSample, paintBirthColorSpace, prepareCosmicForeground, COSMIC_BACKGROUND_OPACITY, COSMIC_BACKGROUND_MAX_OPACITY, COSMIC_STELLAR_COUNT } from './cosmic-background';
const colors = ['#bb2266', '#3366bb', '#aa7722', '#228866', '#7733aa', '#2299aa', '#aa3322'];
describe('Replacement volumetric cosmic engine', () => {
  it('retains seven exact inputs and safe missing-color fallbacks', () => {
    expect(birthColorPalette(colors, '#edf5ff')).toEqual(colors);
    expect(birthColorPalette([], '#edf5ff')).toEqual(Array(7).fill('#edf5ff'));
  });
  it('is birth-seeded, opaque and responds to every source color', () => {
    const pixels = spacePaintingPixels(48, colors, 42, '#020208', '#edf5ff');
    expect(pixels).toEqual(spacePaintingPixels(48, colors, 42, '#020208', '#edf5ff'));
    expect(pixels).not.toEqual(spacePaintingPixels(48, colors, 43, '#020208', '#edf5ff'));
    for (let i = 3; i < pixels.length; i += 4) expect(pixels[i]).toBe(255);
    for (let role = 0; role < 7; role++) {
      expect(spacePaintingPixels(48, colors.map((c, i) => i === role ? '#ffffff' : c), 42, '#020208', '#edf5ff')).not.toEqual(pixels);
    }
  });
  it('has bright resolved emission and sharp absorption rather than an almost-black field', () => {
    const pixels = spacePaintingPixels(96, colors, 42, '#020208', '#edf5ff');
    let bright = 0, dark = 0, sharp = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const peak = Math.max(pixels[i] ?? 0, pixels[i + 1] ?? 0, pixels[i + 2] ?? 0);
      if (peak > 80) bright++;
      if (peak < 15) dark++;
      if (i >= 4 && Math.abs((pixels[i] ?? 0) - (pixels[i - 4] ?? 0)) > 15) sharp++;
    }
    expect(bright / (96 * 96)).toBeGreaterThan(.4);
    expect(dark / (96 * 96)).toBeLessThan(.05);
    expect(sharp).toBeGreaterThan(200);
  });
  it('shares normalized geometry between preview/export and protects the solar heart', () => {
    expect(cosmicMedium(256 / 1024, 768 / 1024, 42)).toEqual(cosmicMedium(512 / 2048, 1536 / 2048, 42));
    expect(cosmicMedium(.5, .47, 42).quiet).toBe(.17);
    let fibers = 0, lanes = 0;
    for (let i = 0; i < 10000; i++) {
      const m = cosmicMedium((i % 100) / 100, Math.floor(i / 100) / 100, 42);
      expect(m.emission).toBeGreaterThanOrEqual(0);
      expect(m.extinction).toBeLessThanOrEqual(1);
      if (m.fibers > .3) fibers++;
      if (m.extinction > .5) lanes++;
    }
    expect(fibers).toBeGreaterThan(200); expect(lanes).toBeGreaterThan(100);
  });
  it('replaces the old stripe paths with dense irregular seeded crystalline stars', () => {
    expect(COSMIC_STELLAR_COUNT).toBeGreaterThan(20000);
    let major = 0;
    for (let i = 0; i < COSMIC_STELLAR_COUNT; i++) {
      const s = stellarSample(i, 42);
      expect(s.u).toBeGreaterThanOrEqual(0); expect(s.u).toBeLessThanOrEqual(1);
      expect(s.v).toBeGreaterThanOrEqual(0); expect(s.v).toBeLessThanOrEqual(1);
      expect(s.alpha).toBeGreaterThanOrEqual(0); expect(s.alpha).toBeLessThanOrEqual(1);
      if (s.major) major++;
    }
    expect(major).toBeGreaterThan(40); expect(major).toBeLessThan(100);
    expect(stellarSample(27, 42)).toEqual(stellarSample(27, 42));
    expect(stellarSample(27, 42)).not.toEqual(stellarSample(27, 43));
  });
  it('composites only once at the retained cap and resets foreground state', () => {
    const draws: number[] = [];
    const rear = { createImageData: () => ({ data: new Uint8ClampedArray(8 * 8 * 4) }), putImageData: vi.fn(), beginPath: vi.fn(), fill: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn() };
    const ctx = { globalAlpha: 1, globalCompositeOperation: 'source-over', filter: 'none', shadowBlur: 0, save: vi.fn(), restore: vi.fn(), fillRect: vi.fn(), drawImage() { draws.push(this.globalAlpha); } };
    vi.stubGlobal('document', { documentElement: {}, createElement: () => ({ getContext: () => rear }) });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: (name: string) => name === '--cosmic-space-ink' ? '#020208' : '#edf5ff' }));
    try {
      paintBirthColorSpace(ctx as unknown as CanvasRenderingContext2D, 8, colors, 42);
      expect(draws).toEqual([.14]); expect(rear.putImageData).toHaveBeenCalledOnce();
      prepareCosmicForeground(ctx as unknown as CanvasRenderingContext2D);
      expect(ctx.globalAlpha).toBe(1); expect(ctx.globalCompositeOperation).toBe('source-over');
      expect(ctx.filter).toBe('none'); expect(ctx.shadowBlur).toBe(0);
    } finally { vi.unstubAllGlobals(); }
    expect(COSMIC_BACKGROUND_OPACITY).toBeGreaterThanOrEqual(.10);
    expect(COSMIC_BACKGROUND_OPACITY).toBeLessThanOrEqual(COSMIC_BACKGROUND_MAX_OPACITY);
    expect(COSMIC_BACKGROUND_MAX_OPACITY).toBe(.18);
    expect(paintBirthColorSpace.toString()).not.toContain('createRadialGradient');
    expect(paintBirthColorSpace.toString()).not.toContain('blur(');
  });
});
