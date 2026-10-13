/** Rear-only exposure masks; never touch birth positions or foreground illumination. */
export function cosmicSilenceRegions(sun: { x: number; y: number; radius: number }, planets: readonly { x: number; y: number; radius: number; id: string; ringOuterRadius: number }[]) {
  return [
    { x: sun.x, y: sun.y, core: sun.radius * 1.55, outer: sun.radius * 3.4, opacity: 1 },
    ...planets.map(p => { const r = p.id === 'saturn' ? p.ringOuterRadius : p.radius; return { x: p.x, y: p.y, core: r * 1.08, outer: r * 2.4, opacity: .94 }; }),
  ];
}

export function paintCosmicSilence(ctx: CanvasRenderingContext2D, sun: Parameters<typeof cosmicSilenceRegions>[0], planets: Parameters<typeof cosmicSilenceRegions>[1]) {
  const black = getComputedStyle(document.documentElement).getPropertyValue('--cosmic-mask-ink').trim();
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.shadowBlur = 0;
  for (const region of cosmicSilenceRegions(sun, planets)) {
    const gradient = ctx.createRadialGradient(region.x, region.y, region.core, region.x, region.y, region.outer);
    gradient.addColorStop(0, black); gradient.addColorStop(.22, black + 'dc'); gradient.addColorStop(.65, black + '55'); gradient.addColorStop(1, black + '00');
    ctx.globalAlpha = region.opacity; ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(region.x, region.y, region.outer, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}