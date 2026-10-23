/** The bundled painting stays the artwork; this module only composes the
 * personal birth-color finishing layer (center gem + seven-color crown) on
 * top of it, identically for live view and raster export. The live view
 * shows the crown as HTML above the frame; exports bake it into a dark
 * band above the painting so the saved PNG keeps the same balance. */

import { CONSTELLATIONS, SIGN_GLYPHS, cornerSlots, paletteSeed } from "./mandala-constellations";

/** signs: up to four Sun-sign indices for faint corner star charts.
 * members: group members' main colors; when two or more, the group composition is used. */
export type MandalaFinish = { colors: string[]; labels: string[]; signs?: number[]; members?: string[] };

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

/** A local pigment raster, not stroked geometry. Underpainting is opaque;
 * fine directional ridges, glazes and broken gold leaf share the same pixels.
 * Cache only this small personal finish, never the original painting. */
function paintGemSurface(color: string) {
  const cached = gemPaintings.get(color);
  if (cached) return cached;
  const surface = document.createElement("canvas");
  surface.width = 640;
  surface.height = 640;
  const context = surface.getContext("2d");
  if (!context) return surface;
  const rgb = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  const channels = rgb ? rgb.slice(1).map(value => Number.parseInt(value, 16)) : [160, 110, 180];
  const pixels = context.createImageData(640, 640);
  const radius = 250;
  const sector = Math.PI / 4;
  for (let py = 0; py < 640; py += 1) {
    for (let px = 0; px < 640; px += 1) {
      const x = (px - 319.5) / radius, y = (py - 319.5) / radius;
      const distance = Math.hypot(x, y);
      const angle = Math.atan2(y, x);
      const local = ((angle + Math.PI / 2 + sector * 8) % sector) - sector / 2;
      const boundary = Math.cos(sector / 2) / Math.cos(local);
      const broad = pigmentNoise(x * 7, y * 7, 3) - 0.5;
      const brush = pigmentNoise(x * 68 + y * 21, y * 13, 19) - 0.5;
      const tooth = pigmentNoise(x * 185, y * 185, 31) - 0.5;
       // Hand-cut outline: a gentle, deterministic wobble instead of a CAD line.
       const edge = boundary + broad * 0.012 + brush * 0.004;
       const body = 1 - smoothEdge(edge - 0.004, edge + 0.006, distance);
      const offset = (py * 640 + px) * 4;
      if (body > 0) {
        // Hand-polished facets: boundaries drift slightly like a natural stone.
        const facetPosition = (angle + Math.PI / 2 + sector * 8) / sector + broad * 0.06 + brush * 0.02;
        const facetIndex = Math.floor(facetPosition);
         const transition = smoothEdge(0.93, 1, facetPosition - facetIndex);
         const facetLight = (index: number) => Math.sin(index * 2.37 + 0.7) * 0.43
           + Math.cos(index * sector + 2.3) * 0.29;
        const cutLight = facetLight(facetIndex) * (1 - transition) + facetLight(facetIndex + 1) * transition;
         const crown = smoothEdge(0.475, 0.487, distance / boundary);
         const coreLight = -0.06 - x * 0.23 - y * 0.29 - distance * 0.12;
        const deepReflection = Math.exp(-((x - 0.28) ** 2 / 0.045 + (y - 0.27) ** 2 / 0.14));
        const glaze = coreLight * (1 - crown) + cutLight * crown
           + broad * 0.05 + brush * 0.065 + tooth * 0.04 - deepReflection * 0.34;
        // A fine, broken brush-shaped reflection, not a circular CG flash.
         const reflection = Math.exp(-((x + 0.27 + y * 0.16) ** 2 / 0.0007 + (y + 0.28) ** 2 / 0.028));
         const secondary = Math.exp(-((x - 0.39 + y * 0.38) ** 2 / 0.00045 + (y - 0.23) ** 2 / 0.025));
         const edgeFlash = Math.exp(-((distance / boundary - 0.482) ** 2) / 0.000045)
           * Math.max(0, -x * 0.8 - y * 0.65);
         const sheen = Math.min(1, Math.max(0, reflection * (0.97 + brush * 0.09) + secondary * 0.72 + edgeFlash * 0.6));
        for (let channel = 0; channel < 3; channel += 1) {
          const base = channels[channel] ?? 160;
          const pigment = glaze >= 0 ? base + (255 - base) * glaze : base * (1 + glaze);
          pixels.data[offset + channel] = Math.max(0, Math.min(255, pigment + (255 - pigment) * sheen));
        }
        pixels.data[offset + 3] = Math.round(body * 255);
      } else {
        // Irregular leaf in the existing octagonal setting; no continuous stroke.
        const rimDistance = distance / boundary;
         const leaf = smoothEdge(1.01 + brush * 0.01, 1.02 + brush * 0.01, rimDistance)
           * (1 - smoothEdge(1.09 + broad * 0.03, 1.1 + broad * 0.03, rimDistance));
         const broken = smoothEdge(0.10, 0.26, pigmentNoise(x * 39, y * 39, 71));
        const relief = Math.max(0, Math.min(1, 0.48 - y * 0.21 + brush * 0.65 + tooth * 0.38));
        pixels.data[offset] = 127 + relief * 122;
        pixels.data[offset + 1] = 88 + relief * 137;
        pixels.data[offset + 2] = 34 + relief * 108;
        pixels.data[offset + 3] = Math.round(leaf * broken * 238);
      }
    }
  }
  context.putImageData(pixels, 0, 0);
  if (gemPaintings.size >= 8) {
    const oldest = gemPaintings.keys().next().value;
    if (oldest) gemPaintings.delete(oldest);
  }
  gemPaintings.set(color, surface);
  return surface;
}

/** Keep the existing scale and personal color; light comes from the pigment
 * and textured gold leaf, with no facet strokes or uniform metallic border. */
function drawCenterGem(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
   drawHalo(context, cx, cy, radius * 1.65, color);
  const surface = paintGemSurface(color);
  const extent = radius * (640 / 250);
  context.save();
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
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
    context.globalCompositeOperation = "screen";
    // star chart: ring, graduations and a soft glyph
    context.globalAlpha = 0.46;
    context.strokeStyle = GOLD;
    context.lineWidth = Math.max(1, size * 0.0009);
    context.beginPath(); context.arc(cx, cy, box * 0.5, 0, Math.PI * 2); context.stroke();
    context.globalAlpha = 0.18;
    context.beginPath(); context.arc(cx, cy, box * 0.36, 0, Math.PI * 2); context.stroke();
    for (let t = 0; t < 24; t += 1) {
      const a = t / 24 * Math.PI * 2, inner = box * (t % 2 ? 0.47 : 0.44);
      context.beginPath(); context.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner); context.lineTo(cx + Math.cos(a) * box * 0.5, cy + Math.sin(a) * box * 0.5); context.stroke();
    }
    context.globalAlpha = 0.22;
    context.fillStyle = shade(tint, 0.35);
    context.font = `${Math.round(box * 0.55)}px "Noto Serif JP", serif`;
    context.textAlign = "center"; context.textBaseline = "middle";
    context.fillText(SIGN_GLYPHS[sign] ?? "", cx, cy);
    // constellation lines
    const inset = box * 0.14, span = box - inset * 2;
    const pt = (s: [number, number, number]) => [x0 + inset + s[0] * span, y0 + inset + s[1] * span] as const;
    context.globalAlpha = 0.42;
    context.strokeStyle = shade(tint, 0.55);
    context.lineWidth = Math.max(1, size * 0.0011);
    shape.lines.forEach(([a, b]) => { const p = shape.stars[a], q = shape.stars[b]; if (!p || !q) return; const [ax, ay] = pt(p), [bx, by] = pt(q); context.beginPath(); context.moveTo(ax, ay); context.lineTo(bx, by); context.stroke(); });
    shape.stars.forEach(star => {
      const [px, py] = pt(star);
      const r = size * 0.0028 * star[2];
      const glow = context.createRadialGradient(px, py, 0, px, py, r * 4);
      glow.addColorStop(0, "rgba(255,250,235,0.9)");
      glow.addColorStop(0.3, rgba(shade(tint, 0.5), 0.45));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      context.globalAlpha = 0.75;
      context.fillStyle = glow;
      context.fillRect(px - r * 4, py - r * 4, r * 8, r * 8);
    });
  });
  context.restore();
}

/** Group composition: the same painting, interlaced with a rotated copy so the
 * motif becomes an N-fold group design, plus one satellite gem per member. */
function drawGroupComposition(context: CanvasRenderingContext2D, image: HTMLImageElement, size: number, top: number, members: string[], filter: string) {
  const n = Math.min(12, members.length);
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
  const ring = size * 0.17;
  members.slice(0, n).forEach((color, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    drawCenterGem(context, cx + Math.cos(a) * ring, cy + Math.sin(a) * ring, size * 0.016, color);
  });
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
  const members = finish.members ?? [];
  if (members.length >= 2) drawGroupComposition(context, image, size, band, members, filter);
  drawPersonalAura(context, size, band, finish.colors);
  if (finish.signs?.length) drawCornerConstellations(context, size, band, finish.signs, finish.colors);
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
