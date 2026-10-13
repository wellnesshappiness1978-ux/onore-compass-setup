import { describe, expect, it, vi } from 'vitest';
import { birthColorPalette, emissionNodes, stellarSample, paintBirthColorSpace, prepareCosmicForeground, COSMIC_BACKGROUND_OPACITY, COSMIC_STELLAR_COUNT } from './cosmic-background';
const colors = ['#bb2266', '#3366bb', '#aa7722', '#228866', '#7733aa', '#2299aa', '#aa3322'];
describe('Seven screen emitters and cross sparks', () => {
  it('retains every exact Hex in seven distinct dispersed nodes', () => {
    const nodes = emissionNodes(colors, 42, '#edf5ff');
    expect(nodes.map(n => n.color)).toEqual(colors);
    expect(new Set(nodes.map(n => `${n.u},${n.v}`)).size).toBe(7);
    expect(nodes[0]?.alpha).toBeGreaterThan(nodes[1]?.alpha ?? 0);
    expect(birthColorPalette([], '#edf5ff')).toEqual(Array(7).fill('#edf5ff'));
    for (const node of nodes) {
      expect(node.u).toBeGreaterThan(0); expect(node.u).toBeLessThan(1);
      expect(node.v).toBeGreaterThan(0); expect(node.v).toBeLessThan(1);
    }
  });
  it('uses reproducible normalized coordinates for live and export', () => {
    expect(emissionNodes(colors, 42, '#edf5ff')).toEqual(emissionNodes(colors, 42, '#edf5ff'));
    expect(emissionNodes(colors, 42, '#edf5ff')).not.toEqual(emissionNodes(colors, 43, '#edf5ff'));
    const n = emissionNodes(colors, 42, '#edf5ff')[0];
    expect((n?.u ?? 0) * 1024 / 1024).toBe((n?.u ?? 0) * 2048 / 2048);
  });
  it('exceeds 300 diamond grains with major stars in all seven colors', () => {
    expect(COSMIC_STELLAR_COUNT).toBeGreaterThan(300);
    const roles = new Set<number>(); let major = 0;
    for (let i = 0; i < COSMIC_STELLAR_COUNT; i++) {
      const s = stellarSample(i, 42);
      expect(s.u).toBeGreaterThanOrEqual(0); expect(s.u).toBeLessThanOrEqual(1);
      expect(s.v).toBeGreaterThanOrEqual(0); expect(s.v).toBeLessThanOrEqual(1);
      expect(s.alpha).toBeGreaterThanOrEqual(0); expect(s.alpha).toBeLessThanOrEqual(1);
      if (s.major) { roles.add(s.role); major++; }
    }
    expect(roles.size).toBe(7); expect(major).toBeGreaterThan(50);
    expect(stellarSample(27, 42)).toEqual(stellarSample(27, 42));
    expect(stellarSample(27, 42)).not.toEqual(stellarSample(27, 43));
  });
  it('draws screen radial nodes and color halos, then restores full-opacity foreground', () => {
    const stops: string[] = [], modes: string[] = []; let mode = 'source-over';
    const ctx = { globalAlpha: 1, filter: 'none', shadowBlur: 0,
      get globalCompositeOperation() { return mode; }, set globalCompositeOperation(v: string) { mode = v; modes.push(v); },
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), rect: vi.fn(), arc: vi.fn(), fill: vi.fn(),
      translate: vi.fn(), rotate: vi.fn(), scale: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: (_: number, color: string) => stops.push(color) })) };
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: (name: string) => name === '--cosmic-space-ink' ? '#020208' : '#edf5ff' }));
    try {
      paintBirthColorSpace(ctx as unknown as CanvasRenderingContext2D, 1024, colors, 42);
      expect(modes).toContain('screen');
      for (const color of colors) expect(stops).toContain(color + 'd9');
      expect(ctx.createRadialGradient.mock.calls.length).toBeGreaterThan(7);
      expect(ctx.globalAlpha).toBe(1); expect(mode).toBe('source-over');
      prepareCosmicForeground(ctx as unknown as CanvasRenderingContext2D);
      expect(ctx.filter).toBe('none'); expect(ctx.shadowBlur).toBe(0);
    } finally { vi.unstubAllGlobals(); }
    expect(COSMIC_BACKGROUND_OPACITY).toBe(1);
    expect(paintBirthColorSpace.toString()).not.toContain('fillRect');
  });
});
