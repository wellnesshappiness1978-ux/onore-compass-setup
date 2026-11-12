/** The bundled painting stays the artwork; this module only composes the
 * personal birth-color finishing layer (center gem + seven-color crown) on
 * top of it, identically for live view and raster export. The live view
 * shows the crown as HTML above the frame; exports bake it into a dark
 * band above the painting so the saved PNG keeps the same balance. */

import { CONSTELLATIONS, SIGN_GLYPHS, cornerSlots, paletteSeed } from "./mandala-constellations";
import type { MandalaDesign } from './mandala-design';

/** signs: up to four Sun-sign indices for faint corner star charts.
 * members: group members' main colors; when two or more, the group composition is used. */
export type MandalaFinish = { colors: string[]; labels: string[]; signs?: number[]; members?: string[]; design?: MandalaDesign | undefined };

const GOLD = "#E8C86A";
const BAND_RATIO = 0.12;

function shade(hexColor: string, amount: number) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hexColor);
  if (!match) return hexColor;
  const channels = match.slice(1).map(channel => Number.parseInt(channel, 16));
  const mixed = channels.map(channel => Math.round(amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount)));
  return `#${mixed.map(value => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

/** Deterministic pseudo-random in [0,1) so grain is stable per index. */
function grain(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/** Soft radiant halo behind the gem so light reads as born from the painting. */
function drawHalo(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  const glow = context.createRadialGradient(cx, cy, 0, cx, cy, radius);
  glow.addColorStop(0, shade(color, 0.5));
  glow.addColorStop(0.3, shade(color, 0.15));
  glow.addColorStop(0.65, shade(color, -0.15));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  context.save();
  context.globalAlpha = 0.16;
  context.globalCompositeOperation = "screen";
  context.fillStyle = glow;
  context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  context.restore();
}

/** Smooth, deterministic pigment variation: no random changes on resize/export. */
function pigmentNoise(x: number, y: number, seed: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const sample = (dx: number, dy: number) => grain((ix + dx) * 41.31 + (iy + dy) * 73.17 + seed);
  return (sample(0, 0) * (1 - sx) + sample(1, 0) * sx) * (1 - sy)
    + (sample(0, 1) * (1 - sx) + sample(1, 1) * sx) * sy;
}

function smoothEdge(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

const gemPaintings = new Map<string, HTMLCanvasElement>();

/** Clear, saturated version of the subject's overall color for the jewel. */
function clearJewelColor(color: string): [number, number, number] {
  const rgb = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  const [r, g, b] = (rgb ? rgb.slice(1).map(v => Number.parseInt(v, 16) / 255) : [0.6, 0.4, 0.75]) as [number, number, number];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d < 0.04) return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const sat = Math.max(0.78, d / (1 - Math.abs(2 * l - 1)));
  const light = Math.min(0.56, Math.max(0.44, l));
  const c = (1 - Math.abs(2 * light - 1)) * Math.min(1, sat);
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = light - c / 2;
  const [a, bb, cc] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((a + m) * 255), Math.round((bb + m) * 255), Math.round((cc + m) * 255)];
}

/** Round brilliant jewel in a polished gold bezel: diamond-shaped table with a
 * radiating sunburst, alternating bright/deep crown facets, a luminous lower
 * glow and fine internal sparkle, all in the subject's clear overall color. */
function paintGemSurface(color: string, resolution: number) {
  const cacheKey = `${color}:${resolution}:brilliant-v2`;
  const cached = gemPaintings.get(cacheKey);
  if (cached) return cached;
  const surface = document.createElement("canvas");
  surface.width = resolution;
  surface.height = resolution;
  const context = surface.getContext("2d");
  if (!context) return surface;
  const channels = clearJewelColor(color);
  const pixels = context.createImageData(resolution, resolution);
  const radius = resolution * 250 / 640;
  const center = (resolution - 1) / 2;
  const quarter = Math.PI / 2;
  for (let py = 0; py < resolution; py += 1) {
    for (let px = 0; px < resolution; px += 1) {
      const x = (px - center) / radius, y = (py - center) / radius;
      const distance = Math.hypot(x, y);
      const angle = Math.atan2(y, x);
      const offset = (py * resolution + px) * 4;
      if (distance <= 1.0) {
        const edgeAlpha = 1 - smoothEdge(0.993, 1.0, distance);
        // Diamond (rotated square) table like a top-view brilliant.
        const diamond = Math.abs(x) + Math.abs(y + 0.04);
        const inTable = 1 - smoothEdge(0.6, 0.62, diamond);
        const sparkle = pigmentNoise(x * 22, y * 22, 7);
        const bubbles = smoothEdge(0.62, 0.8, pigmentNoise(x * 9, y * 9, 13)) * smoothEdge(0.55, 0.95, distance);
        // Sunburst rays radiating from the table center.
        const ray = 0.5 + 0.5 * Math.cos(angle * 32);
        const tableLight = 0.08 + ray * 0.16 - (y + 0.04) * 0.32 + Math.exp(-((y - 0.32) ** 2) / 0.03 - x * x / 0.05) * 0.55;
        // Crown: 8 kite/star facets alternating light and deep.
        const local = (((angle + Math.PI / 4) % quarter) + quarter) % quarter / quarter;
        const index = Math.floor((angle + Math.PI * 2 + Math.PI / 4) / (quarter / 2));
        const facet = (Math.sin(index * 2.71 + 1.3) * 0.5 + 0.5);
        const corner = Math.abs(local - 0.5) * 2;
        const refraction = Math.pow(Math.max(0, Math.cos(angle * 16 + distance * 7)), 18) * 0.34;
        const crownLight = -0.62 + facet * 1.16 + corner * 0.2 - y * 0.15 + bubbles * 0.15 + refraction;
        let glaze = tableLight * inTable + crownLight * (1 - inTable) + (sparkle - 0.5) * 0.035;
        // Bright upper facet and luminous bottom glow (the stone's "fire").
        const topFlash = Math.exp(-(x * x) / 0.02 - ((y + 0.5) ** 2) / 0.04) * 0.7;
        const bottomGlow = Math.exp(-(x * x) / 0.06 - ((y - 0.62) ** 2) / 0.035);
        glaze += topFlash;
        const reflection = Math.exp(-((x + 0.28) ** 2) / 0.0006 - ((y + 0.38) ** 2) / 0.013) + Math.exp(-((x - 0.33) ** 2) / 0.012 - ((y - 0.12) ** 2) / 0.0005);
        const white = Math.min(1, reflection * 0.9 + bottomGlow * 0.7 + Math.max(0, glaze - 0.75) * 0.6);
        for (let channel = 0; channel < 3; channel += 1) {
          const base = channels[channel] ?? 160;
          const g = Math.max(-0.75, Math.min(0.75, glaze));
          const pigment = g >= 0 ? base + (255 - base) * g * 0.7 : base * (1 + g);
          pixels.data[offset + channel] = Math.max(0, Math.min(255, pigment + (255 - pigment) * white));
        }
        pixels.data[offset + 3] = Math.round(edgeAlpha * 255);
        if (distance > 0.993) {
          // Blend into the bezel lip.
          pixels.data[offset] = 70; pixels.data[offset + 1] = 44; pixels.data[offset + 2] = 22;
          pixels.data[offset + 3] = 255;
        }
      } else if (distance <= 1.18) {
        // Polished rounded gold bezel with a soft cylindrical highlight.
        const t = (distance - 1.0) / 0.18;
        const profile = Math.sin(t * Math.PI);
        const lightDir = -(x * 0.55 + y * 0.83) / distance;
        const shine = Math.max(0, Math.min(1, 0.35 + profile * 0.45 + lightDir * 0.25 * profile + Math.exp(-((t - 0.38) ** 2) / 0.01) * 0.35));
        const lip = smoothEdge(0, 0.12, t);
        const outer = 1 - smoothEdge(0.93, 1, t);
        pixels.data[offset] = Math.round((120 + shine * 130) * (0.55 + lip * 0.45));
        pixels.data[offset + 1] = Math.round((78 + shine * 128) * (0.55 + lip * 0.45));
        pixels.data[offset + 2] = Math.round((40 + shine * 100) * (0.55 + lip * 0.45));
        pixels.data[offset + 3] = Math.round(outer * 255);
      }
    }
  }
  context.putImageData(pixels, 0, 0);
  if (gemPaintings.size >= 8) {
    const oldest = gemPaintings.keys().next().value;
    if (oldest) gemPaintings.delete(oldest);
  }
  gemPaintings.set(cacheKey, surface);
  return surface;
}

/** Keep the existing scale and personal color; light comes from the pigment
 * and textured gold leaf, with no facet strokes or uniform metallic border. */
function drawCenterGem(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
   drawHalo(context, cx, cy, radius * 1.65, color);
  const resolution = radius >= 64 ? 1024 : 512;
  const surface = paintGemSurface(color, resolution);
  const extent = radius * (640 / 250);
  context.save();
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.filter = "none";
  context.shadowBlur = 0;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(surface, cx - extent / 2, cy - extent / 2, extent, extent);
  context.restore();
}

/** One small round stone of the seven-color crown. */
function drawStone(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  context.save();
  context.shadowColor = shade(color, 0.3);
  context.shadowBlur = radius * 1.4;
  const body = context.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.08, cx, cy, radius);
  body.addColorStop(0, shade(color, 0.75));
  body.addColorStop(0.5, color);
  body.addColorStop(1, shade(color, -0.45));
  context.fillStyle = body;
  context.beginPath();
  context.arc(cx, cy, radius, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.lineWidth = Math.max(1, radius * 0.14);
  context.strokeStyle = GOLD;
  context.stroke();
  context.fillStyle = "rgba(255,255,255,0.85)";
  context.beginPath();
  context.arc(cx - radius * 0.32, cy - radius * 0.38, radius * 0.16, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

/** Elegant horizontal row of the seven personal birth colors, drawn into the
 * dark band above the painting on raster exports (the live view renders the
 * same row as HTML above the frame). */
function drawColorCrown(context: CanvasRenderingContext2D, size: number, band: number, finish: MandalaFinish) {
  const colors = finish.colors.slice(0, 7);
  if (!colors.length) return;
  const count = colors.length;
  const stoneRadius = Math.min(band * 0.22, size * 0.024);
  const spacing = size * 0.088;
  const rowY = band * 0.38;
  const startX = size / 2 - ((count - 1) * spacing) / 2;

  // Fine gold thread linking the stones.
  context.save();
  context.lineWidth = Math.max(1, size * 0.0016);
  context.strokeStyle = "rgba(232, 200, 106, 0.55)";
  context.beginPath();
  context.moveTo(startX, rowY);
  context.lineTo(startX + (count - 1) * spacing, rowY);
  context.stroke();
  context.restore();

  colors.forEach((color, index) => drawStone(context, startX + index * spacing, rowY, stoneRadius, color));

  // Tiny serif labels under each stone.
  const labels = finish.labels;
  if (labels.length) {
    context.save();
    context.fillStyle = "rgba(240, 222, 170, 0.92)";
    context.font = `${Math.round(band * 0.2)}px "Noto Serif JP", serif`;
    context.textAlign = "center";
    context.textBaseline = "top";
    colors.forEach((_, index) => {
      const label = labels[index];
      if (label) context.fillText(label, startX + index * spacing, rowY + stoneRadius * 1.6);
    });
    context.restore();
  }
}

function rgba(hexColor: string, alpha: number) {
  const m = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hexColor);
  const [r, g, b] = m ? m.slice(1).map(v => Number.parseInt(v, 16)) : [232, 200, 106];
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Seven personal light pools glazed over the painting. Their angles, reach and
 * intensity come from the person's own colors, so no two people share the same glow. */
function drawPersonalAura(context: CanvasRenderingContext2D, size: number, top: number, colors: string[]) {
  if (!colors.length) return;
  const seed = paletteSeed(colors);
  const cx = size / 2, cy = top + size / 2;
  const offset = (seed % 3600) / 3600 * Math.PI * 2;
  context.save();
  context.globalCompositeOperation = "screen";
  colors.slice(0, 7).forEach((color, i) => {
    const jitter = grain(seed % 997 + i * 13);
    const angle = offset + (i / Math.min(7, colors.length)) * Math.PI * 2 + (jitter - 0.5) * 0.4;
    const dist = size * (0.2 + 0.14 * grain(seed % 487 + i * 7));
    const x = cx + Math.cos(angle) * dist, y = cy + Math.sin(angle) * dist;
    const r = size * (0.12 + 0.08 * jitter);
    const g = context.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(shade(color, 0.25), 0.2 + 0.1 * jitter));
    g.addColorStop(0.55, rgba(color, 0.07));
    g.addColorStop(1, rgba(color, 0));
    context.fillStyle = g;
    context.fillRect(x - r, y - r, r * 2, r * 2);
  });
  context.restore();
}

/** Faint star charts in the four corners: chart ring, constellation lines and glyph. */
function drawCornerConstellations(context: CanvasRenderingContext2D, size: number, top: number, signs: number[], colors: string[]) {
  const slots = cornerSlots(signs.length);
  const box = size * 0.2, pad = size * 0.025;
  context.save();
  slots.forEach(([sx, sy], i) => {
    const sign = signs[i];
    const shape = sign === undefined ? undefined : CONSTELLATIONS[sign];
    if (!shape || sign === undefined) return;
    const x0 = sx ? size - pad - box : pad, y0 = top + (sy ? size - pad - box : pad);
    const cx = x0 + box / 2, cy = y0 + box / 2;
    const tint = colors[i % Math.max(1, colors.length)] ?? GOLD;
    // Background-only layer: drawn right after the painting, beneath every personal finish, kept very faint.
    context.globalCompositeOperation = "screen";
    // star chart: ring, graduations and a soft glyph
    context.globalAlpha = 0.22;
    context.strokeStyle = GOLD;
    context.lineWidth = Math.max(1, size * 0.0012);
    context.beginPath(); context.arc(cx, cy, box * 0.5, 0, Math.PI * 2); context.stroke();
    context.globalAlpha = 0.12;
    context.beginPath(); context.arc(cx, cy, box * 0.36, 0, Math.PI * 2); context.stroke();
    for (let t = 0; t < 24; t += 1) {
      const a = t / 24 * Math.PI * 2, inner = box * (t % 2 ? 0.47 : 0.44);
      context.beginPath(); context.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner); context.lineTo(cx + Math.cos(a) * box * 0.5, cy + Math.sin(a) * box * 0.5); context.stroke();
    }
    context.globalAlpha = 0.14;
    context.fillStyle = shade(tint, 0.55);
    context.font = `${Math.round(box * 0.55)}px "Noto Serif JP", serif`;
    context.textAlign = "center"; context.textBaseline = "middle";
    context.fillText(SIGN_GLYPHS[sign] ?? "", cx, cy);
    // constellation lines
    const inset = box * 0.14, span = box - inset * 2;
    const pt = (s: [number, number, number]) => [x0 + inset + s[0] * span, y0 + inset + s[1] * span] as const;
    context.globalAlpha = 0.24;
    context.strokeStyle = shade(tint, 0.7);
    context.lineWidth = Math.max(1, size * 0.0014);
    shape.lines.forEach(([a, b]) => { const p = shape.stars[a], q = shape.stars[b]; if (!p || !q) return; const [ax, ay] = pt(p), [bx, by] = pt(q); context.beginPath(); context.moveTo(ax, ay); context.lineTo(bx, by); context.stroke(); });
    shape.stars.forEach(star => {
      const [px, py] = pt(star);
      const r = size * 0.0032 * star[2];
      const glow = context.createRadialGradient(px, py, 0, px, py, r * 4);
      glow.addColorStop(0, "rgba(255,252,240,1)");
      glow.addColorStop(0.3, rgba(shade(tint, 0.6), 0.6));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.globalAlpha = 0.4;
      context.fillStyle = glow;
      context.fillRect(px - r * 4, py - r * 4, r * 8, r * 8);
    });
  });
  context.restore();
}

/** Group composition: the same painting, interlaced with a rotated copy so the
 * motif becomes an N-fold group design, plus one satellite gem per member. */
function drawGroupComposition(context: CanvasRenderingContext2D, image: HTMLImageElement, size: number, top: number, members: string[], filter: string) {
  const n = members.length;
  const cx = size / 2, cy = top + size / 2;
  context.save();
  context.beginPath(); context.arc(cx, cy, size * 0.4, 0, Math.PI * 2); context.clip();
  context.translate(cx, cy);
  context.rotate(Math.PI / n);
  context.globalAlpha = 0.42;
  context.globalCompositeOperation = "lighten";
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
  if (filter) context.filter = filter;
  context.drawImage(image, -size / 2, -size / 2, size, size);
  context.restore();
  const ring = size * (n > 12 ? 0.32 : n > 5 ? 0.25 : 0.17);
  members.slice(0, n).forEach((color, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    drawCenterGem(context, cx + Math.cos(a) * ring, cy + Math.sin(a) * ring, size * Math.min(0.016, 0.24 / n), color);
  });
}

function hexAlpha(hex: string, alpha: number) {
  const m = /^#([\da-f]{6})$/i.exec(hex); const v = m?.[1] ?? 'E8C86A';
  return `rgba(${parseInt(v.slice(0, 2), 16)},${parseInt(v.slice(2, 4), 16)},${parseInt(v.slice(4, 6), 16)},${alpha})`;
}

/** Strictly radially symmetric luminous finish: soft aura, concentric light rings,
 * a flower-of-life / vesica circle lattice with N crossings, motif-shaped gem halo
 * and deterministic particles. No asymmetric wedges, so the painting's symmetry is kept. */
function drawVariableFinish(context: CanvasRenderingContext2D, _image: HTMLImageElement, size: number, top: number, design: MandalaDesign) {
  const cx = size / 2, cy = top + size / 2;
  const main = design.pigments[0] ?? GOLD, soul = design.pigments[1] ?? main;
  context.save();
  // Background aura in the soul color, gentle and centered.
  context.globalCompositeOperation = 'soft-light';
  const aura = context.createRadialGradient(cx, cy, size * .05, cx, cy, size * .5);
  aura.addColorStop(0, hexAlpha(soul, .55)); aura.addColorStop(.6, hexAlpha(main, .22)); aura.addColorStop(1, hexAlpha(soul, 0));
  context.fillStyle = aura; context.fillRect(0, top, size, size);
  context.globalCompositeOperation = 'screen';
  // Concentric rings of light: 2–4 layers from life path.
  const layers = 2 + design.lifePath % 3;
  for (let k = 0; k < layers; k++) {
    const r = size * (.12 + k * (.26 / layers));
    const g = context.createRadialGradient(cx, cy, r * .97, cx, cy, r * 1.03);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, hexAlpha(k % 2 ? soul : GOLD, .22)); g.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = g; context.beginPath(); context.arc(cx, cy, r * 1.04, 0, Math.PI * 2); context.fill();
  }
  // Flower-of-life lattice: N equal circles through the center (vesica crossings).
  const n = Math.max(6, design.nodes), petal = size * .085;
  context.lineWidth = Math.max(1, size * .0016);
  context.strokeStyle = hexAlpha(GOLD, .26);
  context.shadowColor = hexAlpha(main, .6); context.shadowBlur = size * .006;
  for (let i = 0; i < n; i++) {
    const a = design.rotation + i / n * Math.PI * 2;
    context.beginPath(); context.arc(cx + Math.cos(a) * petal, cy + Math.sin(a) * petal, petal, 0, Math.PI * 2); context.stroke();
  }
  context.shadowBlur = 0;
  // Motif-shaped halo behind the center gem (star / petal / crystal / hexagon).
  const sides = design.motif === 'star' ? 16 : design.motif === 'crystal' ? 8 : design.motif === 'hexagon' ? 6 : 12;
  const hr = size * .062;
  const halo = context.createRadialGradient(cx, cy, 0, cx, cy, hr);
  halo.addColorStop(0, hexAlpha(main, .55)); halo.addColorStop(1, hexAlpha(main, 0));
  context.fillStyle = halo; context.beginPath();
  for (let j = 0; j < sides; j++) {
    const a = design.rotation + j / sides * Math.PI * 2;
    const e = design.motif === 'star' && j % 2 ? hr * .5 : design.motif === 'petal' && j % 2 ? hr * .78 : hr;
    const x = cx + Math.cos(a) * e, y = cy + Math.sin(a) * e;
    if (j === 0) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.closePath(); context.fill();
  // Symmetric node jewels on the outer lattice ring.
  const ring = size * .29;
  for (let i = 0; i < n; i++) {
    const a = design.rotation + i / n * Math.PI * 2, x = cx + Math.cos(a) * ring, y = cy + Math.sin(a) * ring, r = size * Math.min(.012, .16 / n);
    const glow = context.createRadialGradient(x, y, 0, x, y, r * 3);
    glow.addColorStop(0, hexAlpha(i % 2 ? soul : main, .7)); glow.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = glow; context.beginPath(); context.arc(x, y, r * 3, 0, Math.PI * 2); context.fill();
  }
  // Deterministic fine particles, mirrored N-fold.
  let seed = Math.round(design.rotation * 1000) + design.lifePath * 97;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let p = 0; p < 18; p++) {
    const d = size * (.1 + rand() * .34), off = rand() * Math.PI * 2 / n, pr = size * (.0015 + rand() * .0025);
    for (let i = 0; i < n; i++) {
      const a = design.rotation + off + i / n * Math.PI * 2;
      context.fillStyle = hexAlpha(p % 3 ? GOLD : soul, .5);
      context.beginPath(); context.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, pr, 0, Math.PI * 2); context.fill();
    }
  }
  context.restore();
}

/** Compose the painting + personal finish into the given square context.
 * `band` reserves a dark strip of that height above the artwork for the
 * seven-color crown (exports only; the live view renders the crown as HTML). */
export function drawMandalaComposition(context: CanvasRenderingContext2D, image: HTMLImageElement, size: number, finish: MandalaFinish, filter = "", band = 0) {
  context.save();
  context.clearRect(0, 0, size, size + band);
  if (band > 0) {
    context.fillStyle = "#0B0F1E";
    context.fillRect(0, 0, size, band);
    const hairline = context.createLinearGradient(0, band - 2, 0, band);
    hairline.addColorStop(0, "rgba(232, 200, 106, 0)");
    hairline.addColorStop(1, "rgba(232, 200, 106, 0.5)");
    context.fillStyle = hairline;
    context.fillRect(0, band - 2, size, 2);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  if (filter) context.filter = filter;
  context.drawImage(image, 0, band, size, size);
  context.restore();
  if (finish.signs?.length) drawCornerConstellations(context, size, band, finish.signs, finish.colors);
  const members = finish.members ?? [];
  if (members.length >= 2) drawGroupComposition(context, image, size, band, members, filter);
  if (finish.design) drawVariableFinish(context, image, size, band, finish.design);
  drawPersonalAura(context, size, band, finish.colors);
  const main = finish.colors[0];
  if (main) drawCenterGem(context, size / 2, band + size / 2, size * 0.04, main);
  if (band > 0) drawColorCrown(context, size, band, finish);
}

/** Raster export at 2048px with the same composition as the live view: the
 * painting with its center gem, plus a dark band above holding the seven
 * birth-color stones that the live view shows above the frame. */
export async function capturePaintedMandala(source: HTMLImageElement, finish: MandalaFinish, filter: string) {
  const canvas = document.createElement("canvas");
  const band = Math.round(2048 * BAND_RATIO);
  canvas.width = 2048;
  canvas.height = 2048 + band;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  // CSS blur lengths scale with the displayed image; keep that scale in export.
  const scale = canvas.width / (source.clientWidth || source.naturalWidth);
  const scaled = filter.replace(/([\d.]+)px/g, (_, value: string) => `${Number(value) * scale}px`);
  drawMandalaComposition(context, source, canvas.width, finish, scaled, band);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png");
  });
  return { blob, width: canvas.width, height: canvas.height };
}
