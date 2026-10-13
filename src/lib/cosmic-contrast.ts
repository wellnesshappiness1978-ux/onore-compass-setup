/** Rear-only exposure masks; never touch birth positions or foreground illumination. */
export function cosmicSilenceRegions(sun: { x: number; y: number; radius: number }, planets: readonly { x: number; y: number; radius: number; id: string; ringOuterRadius: number }[]) {
  return [
    { x: sun.x, y: sun.y, core: sun.radius * 1.55, outer: sun.radius * 3.4, opacity: 1 },
    ...planets.map(p => { const r = p.id === 'saturn' ? p.ringOuterRadius : p.radius; const giant = p.id === 'jupiter' || p.id === 'saturn'; return { x: p.x, y: p.y, core: r * (giant ? .92 : 1.08), outer: r * (giant ? 1.85 : 2.4), opacity: giant ? .68 : .94 }; }),
  ];
}

/** Local rear-only dust, not a replacement star-field or a change to astronomy. */
export function cosmicGiantDust(sun: Parameters<typeof cosmicSilenceRegions>[0], planets: Parameters<typeof cosmicSilenceRegions>[1], seed: number) {
  const unit = (n: number) => { const v = Math.sin(n * 78.233 + seed) * 43758.5453; return v - Math.floor(v); };
  return planets.filter(p => p.id === 'jupiter' || p.id === 'saturn').flatMap((p, index) => {
    const r = p.id === 'saturn' ? p.ringOuterRadius : p.radius;
    return Array.from({ length: 320 }, (_, i) => {
      const a = unit(i * 7 + index * 2401) * Math.PI * 2, distance = r * (1.12 + unit(i * 7 + 1) * .95);
      return { x: p.x + Math.cos(a) * distance, y: p.y + Math.sin(a) * distance, tone: unit(i * 7 + 2), colorIndex: i % 7 };
    }).filter(p => Math.hypot(p.x - sun.x, p.y - sun.y) > sun.radius * 3.4);
  });
}

export function paintCosmicGiantDust(ctx: CanvasRenderingContext2D, size: number, sun: Parameters<typeof cosmicSilenceRegions>[0], planets: Parameters<typeof cosmicSilenceRegions>[1], colors: readonly string[], seed: number) {
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--cosmic-foil-light').trim();
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.shadowBlur = 0;
  for (const point of cosmicGiantDust(sun, planets, seed)) {
    ctx.globalAlpha = .12 + point.tone * .28; ctx.fillStyle = point.tone > .83 ? gold : colors[point.colorIndex] ?? gold;
    ctx.beginPath(); ctx.arc(point.x, point.y, size / 1024 * (.25 + point.tone * .5), 0, Math.PI * 2); ctx.fill();
  }
  for (const planet of planets.filter(p => p.id === 'jupiter' || p.id === 'saturn')) {
    const r = planet.id === 'saturn' ? planet.ringOuterRadius : planet.radius;
    ctx.save(); ctx.beginPath(); ctx.arc(planet.x, planet.y, r * 2.1, 0, Math.PI * 2); ctx.arc(planet.x, planet.y, r * 1.12, 0, Math.PI * 2, true); ctx.clip('evenodd');
    ctx.beginPath(); ctx.rect(0, 0, size, size); ctx.arc(sun.x, sun.y, sun.radius * 3.4, 0, Math.PI * 2, true); ctx.clip('evenodd');
    for (let i = 0; i < 14; i++) {
      const a = i * 2.399963 + seed % 6; ctx.strokeStyle = colors[i % Math.max(1, colors.length)] ?? gold; ctx.globalAlpha = .10; ctx.lineWidth = size / 1024 * .48;
      ctx.beginPath(); ctx.arc(planet.x + Math.cos(a) * r * .12, planet.y + Math.sin(a) * r * .12, r * (1.28 + i / 22), a, a + .65); ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

export function paintCosmicSilence(ctx: CanvasRenderingContext2D, sun: Parameters<typeof cosmicSilenceRegions>[0], planets: Parameters<typeof cosmicSilenceRegions>[1]) {
  const token = getComputedStyle(document.documentElement).getPropertyValue('--cosmic-mask-ink').trim();
  const black = /^#[\da-f]{3}$/i.test(token) ? '#' + token.slice(1).split('').map(c => c + c).join('') : token;
  ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none'; ctx.shadowBlur = 0;
  for (const region of cosmicSilenceRegions(sun, planets)) {
    const gradient = ctx.createRadialGradient(region.x, region.y, region.core, region.x, region.y, region.outer);
    gradient.addColorStop(0, black); gradient.addColorStop(.22, black + 'dc'); gradient.addColorStop(.65, black + '55'); gradient.addColorStop(1, black + '00');
    ctx.globalAlpha = region.opacity; ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(region.x, region.y, region.outer, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}