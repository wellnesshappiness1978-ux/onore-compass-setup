import { describe, expect, it, vi } from 'vitest';
import { cosmicCoverCrop, paintCosmicBackground, prepareCosmicForeground, COSMIC_BACKGROUND_OPACITY } from './cosmic-background';
describe('Fixed uploaded cosmic background', () => {
  it('covers square canvas with a centered crop without distortion', () => {
    expect(cosmicCoverCrop(768, 768)).toEqual({ x: 0, y: 0, side: 768 });
    expect(cosmicCoverCrop(1200, 800)).toEqual({ x: 200, y: 0, side: 800 });
    expect(cosmicCoverCrop(800, 1200)).toEqual({ x: 0, y: 200, side: 800 });
    expect(() => cosmicCoverCrop(0, 800)).toThrow();
  });
  it.each([1024, 2048])('draws one full-opacity image at %ipx, with clean foreground state', size => {
    const image = { naturalWidth: 1200, naturalHeight: 800 } as HTMLImageElement;
    const ctx = { globalAlpha: .14, globalCompositeOperation: 'screen', filter: 'blur(4px)', shadowBlur: 4, clearRect: vi.fn(), drawImage: vi.fn() };
    paintCosmicBackground(ctx as unknown as CanvasRenderingContext2D, size, image);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, size, size);
    expect(ctx.drawImage).toHaveBeenCalledExactlyOnceWith(image, 200, 0, 800, 800, 0, 0, size, size);
    expect(ctx.globalAlpha).toBe(1); expect(ctx.globalCompositeOperation).toBe('source-over');
    expect(ctx.filter).toBe('none'); expect(ctx.shadowBlur).toBe(0);
    expect(COSMIC_BACKGROUND_OPACITY).toBe(1);
    prepareCosmicForeground(ctx as unknown as CanvasRenderingContext2D);
    expect(ctx.globalAlpha).toBe(1);
  });
});
