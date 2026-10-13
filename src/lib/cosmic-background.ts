/** Fixed image background; no procedural stars or astronomical state. */
export const COSMIC_BACKGROUND_OPACITY = .78;
export const COSMIC_FOREGROUND_OPACITY = 1;
export const COSMIC_BACKGROUND_ENGINE = 'fixed-uploaded-image-v1';
export function prepareCosmicForeground(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none'; ctx.shadowBlur = 0;
}
export function cosmicCoverCrop(width: number, height: number) {
  if (width <= 0 || height <= 0) throw new Error('Background image unavailable');
  const side = Math.min(width, height);
  return { x: (width - side) / 2, y: (height - side) / 2, side };
}
export function paintCosmicBackground(ctx: CanvasRenderingContext2D, size: number, image: HTMLImageElement) {
  const crop = cosmicCoverCrop(image.naturalWidth, image.naturalHeight);
  prepareCosmicForeground(ctx);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cosmic-mask-ink').trim();
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = COSMIC_BACKGROUND_OPACITY;
  ctx.drawImage(image, crop.x, crop.y, crop.side, crop.side, 0, 0, size, size);
  prepareCosmicForeground(ctx);
}
