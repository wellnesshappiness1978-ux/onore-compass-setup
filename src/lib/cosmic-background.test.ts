import { afterEach, describe, expect, it, vi } from 'vitest';
import { cosmicCoverCrop, paintCosmicBackground, prepareCosmicForeground, COSMIC_BACKGROUND_OPACITY } from './cosmic-background';
afterEach(() => vi.unstubAllGlobals());
describe('Fixed uploaded cosmic background', () => {
  it('covers square canvas with a centered crop without distortion', () => {
    expect(cosmicCoverCrop(768, 768)).toEqual({ x: 0, y: 0, side: 768 });
    expect(cosmicCoverCrop(1200, 800)).toEqual({ x: 200, y: 0, side: 800 });
    expect(cosmicCoverCrop(800, 1200)).toEqual({ x: 0, y: 200, side: 800 });
    expect(() => cosmicCoverCrop(0, 800)).toThrow();
  });
  it.each([1024, 2048])('draws one gently dimmed image at %ipx over black, with clean foreground state', size => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '#000000' }));
    const image = { naturalWidth: 1200, naturalHeight: 800 } as HTMLImageElement;
    const exposure: number[] = [];
    const ctx = { globalAlpha: .14, globalCompositeOperation: 'screen', filter: 'blur(4px)', shadowBlur: 4, clearRect: vi.fn(), fillRect: vi.fn(), drawImage: vi.fn(() => exposure.push(ctx.globalAlpha)) };
    paintCosmicBackground(ctx as unknown as CanvasRenderingContext2D, size, image);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, size, size);
    expect(ctx.drawImage).toHaveBeenCalledExactlyOnceWith(image, 200, 0, 800, 800, 0, 0, size, size);
    expect(ctx.globalAlpha).toBe(1); expect(ctx.globalCompositeOperation).toBe('source-over');
    expect(ctx.filter).toBe('none'); expect(ctx.shadowBlur).toBe(0);
    expect(COSMIC_BACKGROUND_OPACITY).toBe(.78);
    expect(exposure).toEqual([.78]);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, size, size);
    prepareCosmicForeground(ctx as unknown as CanvasRenderingContext2D);
    expect(ctx.globalAlpha).toBe(1);
  });
});
