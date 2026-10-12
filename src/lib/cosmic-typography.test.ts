import { afterEach, describe, expect, it, vi } from 'vitest';
import { paintCosmicText } from './cosmic-typography';

afterEach(() => vi.unstubAllGlobals());
describe('direct cosmic lettering', () => {
  it('scales delicate shadows and regular-weight lettering without drawing boxes or outlines', () => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: (key: string) => key }));
    const ctx = { save: vi.fn(), restore: vi.fn(), fillText: vi.fn(), fillRect: vi.fn(), strokeText: vi.fn(), font: '', shadowBlur: 0, shadowColor: '', fillStyle: '' };
    paintCosmicText(ctx as unknown as CanvasRenderingContext2D, 1024, 'Earth', 20, 30, 'name');
    expect(ctx.font).toContain('400 11.5px');
    expect(ctx.shadowBlur).toBe(4);
    expect(ctx.shadowColor).toBe('--cosmic-text-shadow');
    expect(ctx.fillStyle).toBe('--cosmic-text-main');
    paintCosmicText(ctx as unknown as CanvasRenderingContext2D, 2048, '1.00 AU', 40, 60);
    expect(ctx.font).toContain('400 19px');
    expect(ctx.shadowBlur).toBe(8);
    expect(ctx.fillStyle).toBe('--cosmic-text-data');
    expect(ctx.fillRect).not.toHaveBeenCalled();
    expect(ctx.strokeText).not.toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
  });
});