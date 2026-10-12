/** Resolution-independent direct lettering; never paints a backing or strokes glyphs. */
export function cosmicTextPalette() {
  const css = getComputedStyle(document.documentElement);
  return {
    main: css.getPropertyValue('--cosmic-text-main').trim(),
    data: css.getPropertyValue('--cosmic-text-data').trim(),
    shadow: css.getPropertyValue('--cosmic-text-shadow').trim(),
    leader: css.getPropertyValue('--cosmic-text-leader').trim(),
  };
}

export function paintCosmicText(ctx: CanvasRenderingContext2D, size: number, value: string, x: number, y: number, role: 'title' | 'name' | 'data' = 'data', maxWidth?: number) {
  const palette = cosmicTextPalette();
  const pixels = { title: 13.5, name: 11.5, data: 9.5 }[role] * size / 1024;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.letterSpacing = '0px';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = role === 'data' ? palette.data : palette.main;
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 4 * size / 1024;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = size / 1024;
  ctx.font = `400 ${pixels}px "${role === 'data' ? 'Noto Sans JP' : 'Noto Serif JP'}", ${role === 'data' ? 'sans-serif' : 'serif'}`;
  if (maxWidth === undefined) ctx.fillText(value, x, y);
  else ctx.fillText(value, x, y, maxWidth);
  ctx.restore();
}