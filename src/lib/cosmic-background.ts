/** Seven exact-color screen emitters; no astronomical state belongs here. */
export const COSMIC_BACKGROUND_OPACITY = 1;
export const COSMIC_FOREGROUND_OPACITY = 1;
export const COSMIC_BACKGROUND_ENGINE = 'seven-screen-nodes-cross-sparks-v1';
export const COSMIC_STELLAR_COUNT = 4800;
export function prepareCosmicForeground(ctx: CanvasRenderingContext2D) {
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none'; ctx.shadowBlur = 0;
}
export function birthColorPalette(colors: readonly string[], fallback: string) {
  return Array.from({ length: 7 }, (_, i) => colors[i] ?? colors[0] ?? fallback);
}
function random(index: number, salt: number, seed: number) {
  let h = Math.imul(index + salt * 997, 1597334677) ^ Math.imul(seed, 958282831);
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
}
const NODE_ANCHORS = [[.18, .19], [.68, .13], [.89, .38], [.72, .73], [.39, .87], [.08, .62], [.37, .35]] as const;
export function emissionNodes(colors: readonly string[], seed: number, fallback: string) {
  return birthColorPalette(colors, fallback).map((color, role) => {
    const anchor = NODE_ANCHORS[role] ?? [.5, .5];
    return { color, role, u: (anchor[0] ?? .5) + (random(role, 11, seed) - .5) * .065,
      v: (anchor[1] ?? .5) + (random(role, 19, seed) - .5) * .065,
      radius: role === 0 ? .57 : .38 + random(role, 23, seed) * .12,
      alpha: role === 0 ? .85 : .62, angle: random(role, 31, seed) * Math.PI };
  });
}
export function stellarSample(index: number, seed: number) {
  const u = random(index, 3, seed), scatter = random(index, 7, seed);
  const v = index % 3 === 0 ? .19 + u * .56 + Math.sin(u * 7) * .09 + (scatter - .5) * .17 : scatter;
  const quiet = .3 + .7 * Math.min(1, Math.hypot((u - .5) * 2, (v - .47) * 2));
  return { u, v: Math.max(0, Math.min(1, v)), role: index % 7, major: index % 61 === 0,
    radius: .00032 + random(index, 17, seed) ** 3 * .00085,
    alpha: (.3 + random(index, 29, seed) * .7) * quiet };
}
function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
  light.addColorStop(0, color + 'd9'); light.addColorStop(.2, color + '9c');
  light.addColorStop(.5, color + '45'); light.addColorStop(.78, color + '17');
  light.addColorStop(1, color + '00');
  ctx.fillStyle = light; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}
export function paintBirthColorSpace(ctx: CanvasRenderingContext2D, size: number, colors: readonly string[], seed: number) {
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue('--cosmic-space-ink').trim();
  const pearl = css.getPropertyValue('--cosmic-star-core').trim();
  const palette = birthColorPalette(colors, pearl);
  ctx.save(); prepareCosmicForeground(ctx);
  // A single opaque base is required to clear any earlier painting, not a color loop.
  ctx.fillStyle = ink; ctx.beginPath(); ctx.rect(0, 0, size, size); ctx.fill();
  ctx.globalCompositeOperation = 'screen';
  for (const node of emissionNodes(palette, seed, pearl)) {
    ctx.save(); ctx.globalAlpha = node.alpha;
    ctx.translate(node.u * size, node.v * size); ctx.rotate(node.angle); ctx.scale(1, .74);
    drawGlow(ctx, 0, 0, node.radius * size, node.color); ctx.restore();
  }
  // Local contrast, never a global opacity cap; the Sun's heart stays restful.
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  const quiet = ctx.createRadialGradient(size * .5, size * .47, size * .035, size * .5, size * .47, size * .38);
  quiet.addColorStop(0, ink + 'db'); quiet.addColorStop(.4, ink + 'a6'); quiet.addColorStop(1, ink + '00');
  ctx.fillStyle = quiet; ctx.beginPath(); ctx.arc(size * .5, size * .47, size * .38, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < COSMIC_STELLAR_COUNT; i++) {
    const star = stellarSample(i, seed + 997), x = star.u * size, y = star.v * size;
    const r = star.radius * size, color = palette[star.role] ?? pearl;
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = i % 3 ? pearl : color;
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * .6, y);
    ctx.lineTo(x, y + r); ctx.lineTo(x - r * .6, y); ctx.fill();
    if (!star.major) continue;
    ctx.globalAlpha = star.alpha * .32;
    drawGlow(ctx, x, y, size * .011, color);
    ctx.strokeStyle = pearl;
    // Exactly four tapered needle rays with color halos behind the white cores.
    for (let ray = 0; ray < 4; ray++) {
      const angle = ray * Math.PI / 2;
      for (let segment = 0; segment < 5; segment++) {
        ctx.globalAlpha = star.alpha * (1 - segment / 5) ** 2;
        ctx.lineWidth = size * .00065 / (segment + 1);
        const from = size * .0012 * segment, to = size * .0012 * (segment + 1);
        ctx.beginPath(); ctx.moveTo(x + Math.cos(angle) * from, y + Math.sin(angle) * from);
        ctx.lineTo(x + Math.cos(angle) * to, y + Math.sin(angle) * to); ctx.stroke();
      }
    }
  }
  ctx.restore(); prepareCosmicForeground(ctx);
}
