/** The bundled painting stays the artwork; this module only composes the
 * personal birth-color finishing layer (center gem + seven-color crown) on
 * top of it, identically for live view and raster export. The live view
 * shows the crown as HTML above the frame; exports bake it into a dark
 * band above the painting so the saved PNG keeps the same balance. */

export type MandalaFinish = { colors: string[]; labels: string[] };

const GOLD = "#E8C86A";
const GOLD_DEEP = "#8A6A2F";
const BAND_RATIO = 0.12;

function shade(hexColor: string, amount: number) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hexColor);
  if (!match) return hexColor;
  const channels = match.slice(1).map(channel => Number.parseInt(channel, 16));
  const mixed = channels.map(channel => Math.round(amount >= 0 ? channel + (255 - channel) * amount : channel * (1 + amount)));
  return `#${mixed.map(value => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function polygon(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, sides: number, phase = -Math.PI / 2) {
  context.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = phase + (index / sides) * Math.PI * 2;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
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
  context.globalAlpha = 0.6;
  context.globalCompositeOperation = "screen";
  context.fillStyle = glow;
  context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  context.restore();
}

/** Oil-paint grain: tiny semi-transparent dabs clipped to the gem body. */
function paintGrain(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  context.save();
  polygon(context, cx, cy, radius, 8);
  context.clip();
  const dabs = 90;
  for (let index = 0; index < dabs; index += 1) {
    const angle = grain(index * 3 + 1) * Math.PI * 2;
    const distance = Math.sqrt(grain(index * 3 + 2)) * radius;
    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;
    const dab = radius * (0.015 + grain(index * 3 + 3) * 0.03);
    const lighten = grain(index * 7 + 5) > 0.5;
    context.globalAlpha = 0.05 + grain(index * 11 + 7) * 0.08;
    context.fillStyle = lighten ? shade(color, 0.55) : shade(color, -0.4);
    context.beginPath();
    context.arc(x, y, dab, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

/** Faceted octagonal center gem in the overall (main) birth color, painted
 * with softened brush-like tones so it sits inside the oil painting. */
function drawCenterGem(context: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  drawHalo(context, cx, cy, radius * 3.2, color);

  // Soft contact shadow so the gem feels set into the paint, not floating.
  context.save();
  context.globalAlpha = 0.35;
  const shadow = context.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.25);
  shadow.addColorStop(0, "rgba(0,0,0,0)");
  shadow.addColorStop(0.8, "rgba(10,8,20,0.55)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = shadow;
  context.beginPath();
  context.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
  context.fill();
  context.restore();

  // Gold setting ring, echoing the painting's filigree.
  context.save();
  context.globalAlpha = 0.85;
  context.lineWidth = radius * 0.07;
  context.strokeStyle = GOLD_DEEP;
  polygon(context, cx, cy, radius * 1.12, 8);
  context.stroke();
  context.lineWidth = radius * 0.032;
  context.strokeStyle = GOLD;
  polygon(context, cx, cy, radius * 1.06, 8);
  context.stroke();
  context.restore();

  // Outer facets: eight crown facets with gentle painterly tone shifts and
  // slightly organic (jittered) inner points instead of CG-sharp geometry.
  for (let index = 0; index < 8; index += 1) {
    const a0 = -Math.PI / 2 + (index / 8) * Math.PI * 2;
    const a1 = -Math.PI / 2 + ((index + 1) / 8) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    const inner = radius * (0.52 + grain(index * 13 + 2) * 0.08);
    context.beginPath();
    context.moveTo(cx + Math.cos(a0) * radius, cy + Math.sin(a0) * radius);
    context.lineTo(cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius);
    context.lineTo(cx + Math.cos(mid) * inner, cy + Math.sin(mid) * inner);
    context.closePath();
    context.fillStyle = index % 2 === 0 ? shade(color, 0.2) : shade(color, -0.16);
    context.fill();
  }

  // Inner table with a luminous, softly blended core.
  const table = context.createRadialGradient(cx - radius * 0.18, cy - radius * 0.22, radius * 0.04, cx, cy, radius * 0.62);
  table.addColorStop(0, shade(color, 0.8));
  table.addColorStop(0.45, shade(color, 0.3));
  table.addColorStop(1, shade(color, -0.28));
  polygon(context, cx, cy, radius * 0.58, 8);
  context.fillStyle = table;
  context.fill();

  paintGrain(context, cx, cy, radius, color);

  // Facet separation lines in soft, translucent gold — kept faint so the
  // cuts read as brushwork rather than vector strokes.
  context.save();
  context.lineWidth = Math.max(1, radius * 0.02);
  context.strokeStyle = "rgba(232, 200, 106, 0.4)";
  for (let index = 0; index < 8; index += 1) {
    const angle = -Math.PI / 2 + (index / 8) * Math.PI * 2;
    context.beginPath();
    context.moveTo(cx + Math.cos(angle) * radius * 0.58, cy + Math.sin(angle) * radius * 0.58);
    context.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    context.stroke();
  }
  polygon(context, cx, cy, radius, 8);
  context.stroke();
  context.restore();

  // White specular flash, blurred into the paint.
  context.save();
  context.globalCompositeOperation = "screen";
  const flash = context.createRadialGradient(cx - radius * 0.22, cy - radius * 0.26, 0, cx - radius * 0.22, cy - radius * 0.26, radius * 0.34);
  flash.addColorStop(0, "rgba(255,255,255,0.8)");
  flash.addColorStop(0.5, "rgba(255,255,255,0.25)");
  flash.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = flash;
  context.beginPath();
  context.arc(cx - radius * 0.22, cy - radius * 0.26, radius * 0.34, 0, Math.PI * 2);
  context.fill();
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
  const main = finish.colors[0];
  if (main) drawCenterGem(context, size / 2, band + size / 2, size * 0.08, main);
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
