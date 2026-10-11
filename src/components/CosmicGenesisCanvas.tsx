import { useCallback, useEffect, useRef } from "react";
import cosmicBase from "@/assets/cosmic-genesis-deep-field.jpg";
import planetAtlas from "@/assets/cosmic-planets-atlas.jpg";
import { COSMIC_GUARDIANS, cosmicColorRoles, cosmicPlacements } from "@/lib/cosmic-art";
import type { CosmicGenesis, CosmicPlanet } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import type { Capture } from "./MandalaCanvas";

type Props = { genesis: CosmicGenesis; colors: string[]; language: Language; onCapture: (capture: Capture | null) => void };
type Point = { x: number; y: number };
type ArtAssets = { base: HTMLImageElement | null; planets: HTMLImageElement | null };

const GOLD = "#F6E3A2";
const MID_GOLD = "#D1A84C";
const DEEP_GOLD = "#704617";
const VOID = "#030611";
const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function loadArt(): Promise<ArtAssets> {
  return Promise.all([loadImage(cosmicBase), loadImage(planetAtlas)]).then(([base, planets]) => ({ base, planets }));
}

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function mix(color: string, target: string, amount: number) {
  const read = (hex: string) => [0, 2, 4].map(offset => Number.parseInt(hex.replace("#", "").padEnd(6, "0").slice(offset, offset + 2), 16) || 0);
  const a = read(color), b = read(target);
  return `#${a.map((channel, index) => Math.round(channel + ((b[index] ?? 0) - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(.22, `${color}cc`);
  gradient.addColorStop(.58, `${color}55`);
  gradient.addColorStop(1, `${color}00`);
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
}

function sphere(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, stops: [number, string][]) {
  const gradient = ctx.createRadialGradient(x - radius * .38, y - radius * .44, radius * .03, x + radius * .08, y + radius * .08, radius * 1.08);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
}

function paintNebula(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number, scale: number) {
  ctx.save();
  // Birth colors live only in astronomical light: translucent gas, emission filaments and reflected dust.
  ctx.globalCompositeOperation = "screen";
  colors.forEach((color, index) => {
    const direction = -.72 + index * .235;
    for (let plume = 0; plume < 5; plume++) {
      const salt = seed + index * 193 + plume * 47;
      const progress = .08 + unit(salt) * .84;
      const x = size * progress;
      const y = size * (.2 + progress * .62) + Math.sin(direction * 3 + plume) * size * .11;
      const rx = size * (.13 + unit(salt + 9) * .14);
      const ry = rx * (.22 + unit(salt + 12) * .18);
      ctx.save(); ctx.translate(x, y); ctx.rotate(direction + (unit(salt + 2) - .5) * .22);
      const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      haze.addColorStop(0, `${color}42`); haze.addColorStop(.34, `${color}24`); haze.addColorStop(.72, `${color}0c`); haze.addColorStop(1, `${color}00`);
      ctx.fillStyle = haze; ctx.globalAlpha = .42; ctx.scale(1, ry / rx); ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (let filament = 0; filament < 3; filament++) {
      const salt = seed + index * 503 + filament * 67;
      const startX = -size * .08 + unit(salt) * size * .3;
      const startY = size * (.1 + unit(salt + 1) * .52);
      const endX = size * (.7 + unit(salt + 2) * .38);
      const endY = startY + size * (.18 + unit(salt + 3) * .4);
      const bend = (unit(salt + 4) - .5) * size * .26;
      ctx.lineCap = "round";
      ([[13, .012], [4.5, .035], [.6, .16]] as const).forEach(([width, alpha]) => {
        ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width * scale;
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.bezierCurveTo(size * .33, startY + bend, size * .67, endY - bend, endX, endY); ctx.stroke();
      });
    }
  });
  ctx.globalCompositeOperation = "source-over";
  // Dark molecular dust creates depth and prevents a uniformly luminous digital look.
  for (let i = 0; i < 34; i++) {
    const salt = seed * 5 + i * 83, x = unit(salt) * size, y = unit(salt + 7) * size;
    const r = size * (.025 + unit(salt + 11) * .075);
    const dust = ctx.createRadialGradient(x, y, 0, x, y, r);
    dust.addColorStop(0, "#01030bc4"); dust.addColorStop(.55, "#02051065"); dust.addColorStop(1, "#02051000");
    ctx.fillStyle = dust; ctx.globalAlpha = .44; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

function paintImpasto(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, colors: string[], seed: number, scale: number, bands = false) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius * .97, 0, Math.PI * 2); ctx.clip();
  ctx.globalCompositeOperation = "soft-light";
  for (let i = 0; i < 74; i++) {
    const salt = seed + i * 71;
    const angle = unit(salt) * Math.PI * 2;
    const distance = Math.sqrt(unit(salt + 1)) * radius * .9;
    const px = x + Math.cos(angle) * distance;
    const py = y + Math.sin(angle) * distance;
    const length = radius * (.08 + unit(salt + 2) * .34);
    const width = Math.max(scale * .7, radius * (.018 + unit(salt + 4) * .055));
    ctx.strokeStyle = colors[i % colors.length] ?? GOLD;
    ctx.globalAlpha = .2 + unit(salt + 6) * .38; ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(px - length * .55, py - length * .18); ctx.quadraticCurveTo(px, py + (unit(salt + 8) - .5) * length, px + length * .55, py + length * .18); ctx.stroke();
  }
  if (bands) {
    ctx.globalCompositeOperation = "overlay";
    for (let i = -4; i <= 4; i++) {
      ctx.strokeStyle = i % 2 ? colors[0] ?? GOLD : colors[1] ?? MID_GOLD; ctx.globalAlpha = .28;
      ctx.lineWidth = Math.max(scale, radius * .09); ctx.beginPath(); ctx.ellipse(x, y + i * radius * .19, radius * 1.05, radius * (.09 + Math.abs(i) * .012), -.12, 0, Math.PI * 2); ctx.stroke();
    }
  }
  ctx.restore();
}

function paintPlanetSurface(ctx: CanvasRenderingContext2D, planet: CosmicPlanet, point: Point, radius: number, seed: number, scale: number) {
  ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, radius * .97, 0, Math.PI * 2); ctx.clip();
  const line = (color: string, alpha: number, width: number) => { ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = Math.max(scale, width); ctx.lineCap = "round"; };
  if (planet.id === "mercury") {
    for (let i = 0; i < 56; i++) { const s = seed + i * 37, a = unit(s) * Math.PI * 2, d = Math.sqrt(unit(s + 2)) * radius * .82, r = radius * (.018 + unit(s + 4) * .09), x = point.x + Math.cos(a) * d, y = point.y + Math.sin(a) * d; const g = ctx.createRadialGradient(x - r * .38, y - r * .42, r * .08, x, y, r); g.addColorStop(0, "#f8edcfcc"); g.addColorStop(.24, "#8f8272bb"); g.addColorStop(.62, "#37312f99"); g.addColorStop(1, "#17151911"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); if (i % 7 === 0) { line("#eee0bf", .35, r * .12); ctx.beginPath(); ctx.arc(x, y, r * 1.16, .8, 3.9); ctx.stroke(); } }
  } else if (planet.id === "venus") {
    for (let i = -9; i <= 9; i++) { line(i % 3 ? "#ffeab2" : "#9d472c", .2 + (i % 4) * .04, radius * (.018 + (i % 3) * .012)); ctx.beginPath(); ctx.bezierCurveTo(point.x - radius, point.y + i * radius * .09, point.x - radius * .2, point.y + (i + .8) * radius * .085, point.x + radius, point.y + i * radius * .075); ctx.stroke(); }
  } else if (planet.id === "mars") {
    for (let i = 0; i < 34; i++) { const s = seed + i * 29, y = point.y - radius * .76 + unit(s) * radius * 1.52; line(i % 4 ? "#742414" : "#ffd09b", .18 + unit(s + 2) * .22, radius * (.009 + unit(s + 1) * .024)); ctx.beginPath(); ctx.moveTo(point.x - radius, y); ctx.quadraticCurveTo(point.x + (unit(s + 3) - .5) * radius, y - radius * .13, point.x + radius, y + radius * .08); ctx.stroke(); }
    ctx.fillStyle = "#f6ddc9aa"; ctx.beginPath(); ctx.ellipse(point.x, point.y - radius * .82, radius * .38, radius * .08, 0, 0, Math.PI * 2); ctx.fill();
  } else if (planet.id === "jupiter" || planet.id === "saturn") {
    for (let i = -13; i <= 13; i++) { line(i % 4 === 0 ? "#fff0c0" : i % 2 ? "#8d4636" : "#d7ac78", .18 + Math.abs(i % 4) * .04, radius * (i % 4 === 0 ? .042 : .018)); ctx.beginPath(); ctx.moveTo(point.x - radius, point.y + i * radius * .059); ctx.bezierCurveTo(point.x - radius * .25, point.y + (i - .8) * radius * .059, point.x + radius * .35, point.y + (i + .9) * radius * .059, point.x + radius, point.y + i * radius * .059); ctx.stroke(); }
    if (planet.id === "jupiter") { ctx.fillStyle = "#b64231cc"; ctx.beginPath(); ctx.ellipse(point.x + radius * .35, point.y + radius * .2, radius * .25, radius * .11, -.08, 0, Math.PI * 2); ctx.fill(); line("#ffd6a1", .55, radius * .025); ctx.stroke(); }
  } else if (planet.id === "uranus") {
    for (let i = -10; i <= 10; i++) { line(i % 3 ? "#d9ffff" : "#268aa4", .16, radius * .018); ctx.beginPath(); ctx.moveTo(point.x + i * radius * .075, point.y - radius); ctx.quadraticCurveTo(point.x + (i + .45) * radius * .075, point.y, point.x + i * radius * .075, point.y + radius); ctx.stroke(); }
  } else if (planet.id === "neptune") {
    for (let i = 0; i < 25; i++) { const s = seed + i * 41, y = point.y - radius * .76 + unit(s) * radius * 1.52; line(i % 5 ? "#7ebdff" : "#e9ffff", .16 + unit(s + 4) * .18, radius * (.009 + unit(s + 2) * .024)); ctx.beginPath(); ctx.moveTo(point.x - radius * .8, y); ctx.bezierCurveTo(point.x - radius * .15, y - radius * .18, point.x + radius * .3, y + radius * .16, point.x + radius * .78, y); ctx.stroke(); }
    ctx.fillStyle = "#07173999"; ctx.beginPath(); ctx.ellipse(point.x + radius * .2, point.y + radius * .25, radius * .2, radius * .1, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function paintEarth(ctx: CanvasRenderingContext2D, point: Point, radius: number, seed: number, scale: number) {
  glow(ctx, point.x, point.y, radius * 2.1, "#72d8ff", .3);
  ctx.save(); ctx.shadowColor = "#8ce8ff"; ctx.shadowBlur = radius * .45;
  sphere(ctx, point.x, point.y, radius, [[0, "#F1FFFF"], [.12, "#67F0FF"], [.42, "#0876C9"], [.76, "#07377F"], [1, "#010717"]]);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, radius * .97, 0, Math.PI * 2); ctx.clip();
  const land = ctx.createLinearGradient(point.x - radius, point.y - radius, point.x + radius, point.y + radius);
  land.addColorStop(0, "#C7FFE0"); land.addColorStop(.35, "#22D99A"); land.addColorStop(.72, "#0B825D"); land.addColorStop(1, "#043B35");
  ctx.fillStyle = land; ctx.globalAlpha = .95; ctx.beginPath();
  ctx.moveTo(point.x - radius * .7, point.y - radius * .26);
  ctx.bezierCurveTo(point.x - radius * .45, point.y - radius * .78, point.x + radius * .05, point.y - radius * .5, point.x - radius * .02, point.y - radius * .09);
  ctx.bezierCurveTo(point.x + radius * .52, point.y + radius * .02, point.x + radius * .42, point.y + radius * .56, point.x - radius * .08, point.y + radius * .32);
  ctx.bezierCurveTo(point.x - radius * .4, point.y + radius * .7, point.x - radius * .76, point.y + radius * .18, point.x - radius * .7, point.y - radius * .26); ctx.fill();
  paintImpasto(ctx, point.x, point.y, radius, ["#E8FFFF", "#18B8EC", "#20D49B", "#075982"], seed + 400, scale);
  ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "#D8FFFF"; ctx.lineCap = "round";
  for (let i = -3; i <= 3; i++) {
    ctx.globalAlpha = .2 + (3 - Math.abs(i)) * .07; ctx.lineWidth = Math.max(scale, radius * .025);
    ctx.beginPath(); ctx.arc(point.x, point.y + i * radius * .18, radius * (.58 + Math.abs(i) * .08), .06 * Math.PI, .94 * Math.PI); ctx.stroke();
  }
  ctx.strokeStyle = "#8df7cf"; ctx.globalAlpha = .62; ctx.lineWidth = Math.max(scale * 1.2, radius * .028);
  ctx.beginPath(); ctx.bezierCurveTo(point.x - radius, point.y - radius * .15, point.x - radius * .18, point.y - radius * .75, point.x + radius * .72, point.y - radius * .3); ctx.stroke();
  ctx.globalCompositeOperation = "screen";
  for (let facet = 0; facet < 12; facet++) { const a = facet * Math.PI / 6 + unit(seed + facet) * .12; ctx.strokeStyle = facet % 2 ? "#9cfff1" : "#b4d8ff"; ctx.globalAlpha = .18 + (facet % 3) * .08; ctx.lineWidth = Math.max(scale, radius * .02); ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(point.x + Math.cos(a) * radius * .92, point.y + Math.sin(a) * radius * .92); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = "#C8FFFF"; ctx.globalAlpha = .9; ctx.lineWidth = Math.max(scale, radius * .045);
  ctx.beginPath(); ctx.arc(point.x, point.y, radius * 1.08, Math.PI * 1.05, Math.PI * 1.83); ctx.stroke(); ctx.restore();
}

function planetPalette(id: CosmicPlanet["id"]): string[] {
  const palettes: Record<CosmicPlanet["id"], string[]> = {
    mercury: ["#FFF6DC", "#A99A87", "#27201D"], venus: ["#FFF3B9", "#E4A354", "#5A2415"], earth: [],
    mars: ["#FFE0B0", "#D75A31", "#421313"], jupiter: ["#FFF4D5", "#D6A17A", "#81462F", "#281017"],
    saturn: ["#FFF8CD", "#D7B97A", "#55402B"], uranus: ["#F0FFFF", "#70DCEB", "#123D5B"], neptune: ["#E0EDFF", "#3568E2", "#071747"],
  };
  const native = palettes[id];
  return native.length ? native : ["#67f0ff", "#0876c9", "#010717"];
}

function paintAtlasPlanet(ctx: CanvasRenderingContext2D, atlas: HTMLImageElement, planet: CosmicPlanet, point: Point, radius: number) {
  const index = planet.orbitIndex, sw = atlas.naturalWidth / 4, sh = atlas.naturalHeight / 2;
  const sx = (index % 4) * sw, sy = Math.floor(index / 4) * sh;
  const saturn = planet.id === "saturn";
  const dw = radius * (saturn ? 3.72 : 2.06), dh = radius * (saturn ? 1.86 : 2.06);
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .98;
  ctx.drawImage(atlas, sx, sy, sw, sh, point.x - dw / 2, point.y - dh / 2, dw, dh); ctx.restore();
}

function paintPlanet(ctx: CanvasRenderingContext2D, planet: CosmicPlanet, point: Point, radius: number, seed: number, scale: number, atlas?: HTMLImageElement | null) {
  if (atlas) {
    paintAtlasPlanet(ctx, atlas, planet, point, radius);
    const edge = planet.id === "earth" ? "#8ce8ff" : planetPalette(planet.id)[0] ?? GOLD;
    ctx.save(); ctx.strokeStyle = edge; ctx.globalAlpha = planet.id === "earth" ? .62 : .32; ctx.lineWidth = Math.max(scale, radius * .018);
    ctx.beginPath(); ctx.arc(point.x, point.y, radius * 1.01, Math.PI * 1.08, Math.PI * 1.78); ctx.stroke(); ctx.restore();
    return;
  }
  if (planet.id === "earth") { paintEarth(ctx, point, radius, seed, scale); return; }
  const palette = planetPalette(planet.id);
  const edge = palette[0] ?? GOLD;
  glow(ctx, point.x, point.y, radius * 1.7, edge, .18);
  ctx.save(); ctx.shadowColor = edge; ctx.shadowBlur = radius * .28;
  sphere(ctx, point.x, point.y, radius, palette.map((color, index) => [index / Math.max(palette.length - 1, 1), color] as [number, string])); ctx.restore();
  paintImpasto(ctx, point.x, point.y, radius, [mix(edge, "#FFFFFF", .25), palette[1] ?? edge, palette[2] ?? mix(edge, "#000000", .5)], seed + planet.orbitIndex * 701, scale, planet.id === "jupiter" || planet.id === "saturn" || planet.id === "uranus" || planet.id === "neptune");
  paintPlanetSurface(ctx, planet, point, radius, seed + planet.orbitIndex * 997, scale);
  // Directional terminator glaze gives every world a consistent physical light source.
  ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, radius * .985, 0, Math.PI * 2); ctx.clip();
  const shade = ctx.createLinearGradient(point.x - radius, point.y - radius, point.x + radius, point.y + radius);
  shade.addColorStop(0, "#00000000"); shade.addColorStop(.5, "#00000012"); shade.addColorStop(1, "#000000d9"); ctx.fillStyle = shade; ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2); ctx.restore();
  ctx.save(); ctx.strokeStyle = mix(edge, "#FFFFFF", .62); ctx.globalAlpha = .64; ctx.lineWidth = Math.max(scale, radius * .02);
  ctx.beginPath(); ctx.arc(point.x, point.y, radius * .98, Math.PI * 1.08, Math.PI * 1.78); ctx.stroke(); ctx.restore();
  if (planet.id === "saturn") {
    ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(-.22); ctx.lineCap = "round";
    [[radius * .36, DEEP_GOLD, .78], [radius * .24, "#b69a68", .62], [radius * .1, GOLD, .94]].forEach(([width, color, alpha]) => {
      ctx.strokeStyle = color as string; ctx.globalAlpha = alpha as number; ctx.lineWidth = width as number; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.72, radius * .48, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.strokeStyle = GOLD; ctx.globalAlpha = .78; ctx.lineWidth = Math.max(scale, radius * .03); ctx.setLineDash([radius * .14, radius * .06, radius * .04, radius * .08]); ctx.stroke(); ctx.restore();
  }
}

function paintOrbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, index: number, seed: number, scale: number) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.22 + (index - 3.5) * .012); ctx.scale(1, .72 - (index % 3) * .015);
  ctx.lineCap = "round"; ctx.globalCompositeOperation = "screen";
  for (let fragment = 0; fragment < 10; fragment++) {
    const salt = seed + index * 227 + fragment * 31;
    const angle = unit(salt) * Math.PI * 2;
    const length = .015 + unit(salt + 3) * .07;
    ctx.strokeStyle = fragment % 3 ? "#a9bed0" : MID_GOLD; ctx.globalAlpha = .055 + unit(salt + 4) * .11; ctx.lineWidth = (.3 + unit(salt + 5) * .8) * scale;
    ctx.beginPath(); ctx.arc(0, 0, radius, angle, angle + length); ctx.stroke();
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius; ctx.fillStyle = fragment % 3 ? "#d9efff" : GOLD; ctx.globalAlpha = .18 + unit(salt + 6) * .24; ctx.beginPath(); ctx.arc(x, y, (.35 + unit(salt + 7) * .8) * scale, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function guardianPath(ctx: CanvasRenderingContext2D, animal: number, x: number, y: number, size: number) {
  const id = COSMIC_GUARDIANS[animal] ?? "dragon"; const s = size;
  ctx.beginPath();
  if (id === "rat") { ctx.ellipse(x, y, s * .34, s * .2, -.12, 0, Math.PI * 2); ctx.moveTo(x + s * .3, y); ctx.quadraticCurveTo(x + s * .65, y - s * .34, x + s * .72, y + s * .08); ctx.moveTo(x - s * .2, y - s * .15); ctx.arc(x - s * .22, y - s * .19, s * .1, 0, Math.PI * 2); }
  else if (id === "ox" || id === "goat") { ctx.ellipse(x, y, s * .3, s * .27, 0, 0, Math.PI * 2); ctx.moveTo(x - s * .22, y - s * .18); ctx.quadraticCurveTo(x - s * .62, y - s * .55, x - s * .5, y - s * .02); ctx.moveTo(x + s * .22, y - s * .18); ctx.quadraticCurveTo(x + s * .62, y - s * .55, x + s * .5, y - s * .02); }
  else if (id === "tiger" || id === "dog" || id === "boar") { ctx.moveTo(x - s * .5, y + s * .2); ctx.bezierCurveTo(x - s * .38, y - s * .35, x + s * .2, y - s * .38, x + s * .48, y + s * .08); ctx.quadraticCurveTo(x + s * .15, y + s * .42, x - s * .5, y + s * .2); ctx.moveTo(x - s * .18, y - s * .24); ctx.lineTo(x - s * .3, y - s * .52); ctx.lineTo(x, y - s * .3); ctx.lineTo(x + s * .25, y - s * .52); ctx.lineTo(x + s * .3, y - s * .2); }
  else if (id === "rabbit") { ctx.ellipse(x, y + s * .08, s * .26, s * .3, 0, 0, Math.PI * 2); ctx.moveTo(x - s * .16, y - s * .15); ctx.bezierCurveTo(x - s * .32, y - s * .75, x - s * .05, y - s * .88, x, y - s * .2); ctx.moveTo(x + s * .08, y - s * .2); ctx.bezierCurveTo(x + s * .06, y - s * .82, x + s * .35, y - s * .72, x + s * .18, y - s * .12); }
  else if (id === "dragon" || id === "serpent") { ctx.moveTo(x - s * .62, y + s * .22); ctx.bezierCurveTo(x - s * .3, y - s * .55, x + s * .12, y + s * .55, x + s * .52, y - s * .15); ctx.bezierCurveTo(x + s * .7, y - s * .4, x + s * .38, y - s * .52, x + s * .28, y - s * .32); if (id === "dragon") { ctx.moveTo(x + s * .36, y - s * .32); ctx.lineTo(x + s * .6, y - s * .66); ctx.moveTo(x + s * .42, y - s * .26); ctx.lineTo(x + s * .75, y - s * .35); } }
  else if (id === "horse") { ctx.moveTo(x - s * .5, y + s * .34); ctx.bezierCurveTo(x - s * .4, y + s * .05, x - s * .28, y - s * .12, x - s * .12, y - s * .28); ctx.bezierCurveTo(x - s * .02, y - s * .52, x + s * .18, y - s * .66, x + s * .4, y - s * .5); ctx.lineTo(x + s * .55, y - s * .62); ctx.lineTo(x + s * .51, y - s * .39); ctx.quadraticCurveTo(x + s * .68, y - s * .19, x + s * .35, y + s * .02); ctx.lineTo(x + s * .48, y + s * .48); ctx.moveTo(x + s * .1, y + s * .04); ctx.lineTo(x - s * .02, y + s * .5); ctx.moveTo(x - s * .24, y + s * .06); ctx.lineTo(x - s * .38, y + s * .48); ctx.moveTo(x - s * .28, y - s * .14); ctx.bezierCurveTo(x - s * .52, y - s * .38, x - s * .6, y - s * .02, x - s * .52, y + s * .18); }
  else if (id === "monkey") { ctx.arc(x, y, s * .3, 0, Math.PI * 2); ctx.moveTo(x - s * .28, y - s * .05); ctx.arc(x - s * .36, y - s * .05, s * .13, 0, Math.PI * 2); ctx.moveTo(x + s * .28, y - s * .05); ctx.arc(x + s * .36, y - s * .05, s * .13, 0, Math.PI * 2); ctx.moveTo(x + s * .18, y + s * .15); ctx.quadraticCurveTo(x + s * .5, y + s * .5, x + s * .62, y + s * .12); }
  else { ctx.ellipse(x, y, s * .32, s * .28, 0, 0, Math.PI * 2); ctx.moveTo(x, y - s * .2); ctx.lineTo(x, y - s * .62); ctx.moveTo(x - s * .2, y - s * .18); ctx.lineTo(x - s * .48, y - s * .48); ctx.moveTo(x + s * .2, y - s * .18); ctx.lineTo(x + s * .48, y - s * .48); }
}

function paintFiligree(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, genesis: CosmicGenesis, scale: number) {
  ctx.save(); ctx.translate(cx, cy); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const strokeLayer = (color: string, width: number, alpha: number, blur: number) => { ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.shadowColor = color; ctx.shadowBlur = blur; };
  const constellation = (sign: number, ox: number, oy: number, span: number, rotation: number) => {
    const points = Array.from({ length: 9 }, (_, index) => { const angle = rotation + index * (.48 + (sign % 3) * .035); const r = span * (.38 + (((index * 17 + sign * 11) % 41) / 100)); return [ox + Math.cos(angle) * r, oy + Math.sin(angle) * r * .72] as const; });
    [[DEEP_GOLD, scale * 3, .5, 3 * scale], [MID_GOLD, scale * 1.5, .72, 1.4 * scale], [GOLD, scale * .55, .92, 0]].forEach(([color, width, alpha, blur]) => { strokeLayer(color as string, width as number, alpha as number, blur as number); ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); });
    points.forEach(([x, y], index) => { glow(ctx, x, y, (index % 3 ? 5 : 8) * scale, GOLD, .55); ctx.fillStyle = GOLD; ctx.globalAlpha = .95; ctx.beginPath(); ctx.arc(x, y, (index % 3 ? 1.5 : 2.7) * scale, 0, Math.PI * 2); ctx.fill(); });
  };
  constellation(genesis.sunSign, -radius * .54, -radius * .48, radius * .62, -.7); constellation(genesis.moonSign, radius * .52, radius * .38, radius * .68, .3);
  strokeLayer(GOLD, scale * 1.2, .92, 5 * scale); ctx.font = `${Math.round(82 * scale)}px serif`;
  ctx.fillText(ZODIAC_GLYPHS[genesis.sunSign] ?? "✦", -radius * .74, -radius * .65);
  ctx.fillText(ZODIAC_GLYPHS[genesis.moonSign] ?? "✧", radius * .68, radius * .58);
  const ax = -radius * .6, ay = radius * .5, guardianSize = radius * .34;
  guardianPath(ctx, genesis.animal, ax, ay, guardianSize); const guardianFill = ctx.createLinearGradient(ax - guardianSize, ay - guardianSize, ax + guardianSize, ay + guardianSize); guardianFill.addColorStop(0, "#fff5c72e"); guardianFill.addColorStop(.5, "#d1a84c12"); guardianFill.addColorStop(1, "#7046172e"); ctx.fillStyle = guardianFill; ctx.globalAlpha = .6; ctx.shadowColor = GOLD; ctx.shadowBlur = 12 * scale; ctx.fill();
  ctx.save(); guardianPath(ctx, genesis.animal, ax, ay, guardianSize); ctx.clip();
  for (let i = 0; i < 18; i++) { const r = guardianSize * (.08 + i * .045); ctx.strokeStyle = i % 3 ? MID_GOLD : GOLD; ctx.globalAlpha = .16 + (i % 4) * .035; ctx.lineWidth = (.35 + i % 3 * .25) * scale; ctx.beginPath(); ctx.arc(ax - guardianSize * .16, ay + guardianSize * .08, r, -1.5, 2.2); ctx.stroke(); }
  ctx.restore();
  [[DEEP_GOLD, 10, .14], [MID_GOLD, 4.5, .28], [GOLD, 1.5, .72], ["#fff4c7", .45, .82]].forEach(([color, width, alpha]) => { guardianPath(ctx, genesis.animal, ax, ay, guardianSize); ctx.strokeStyle = color as string; ctx.globalAlpha = alpha as number; ctx.lineWidth = (width as number) * scale; ctx.shadowColor = GOLD; ctx.shadowBlur = (width as number) * scale; ctx.stroke(); });
  for (let i = 0; i < 34; i++) { const a = i * 2.399 + genesis.animal, r = guardianSize * (.25 + (i % 9) * .11); glow(ctx, ax + Math.cos(a) * r, ay + Math.sin(a) * r, (2 + i % 4) * scale, GOLD, .5); }
  ctx.restore();
}

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, colors: string[], assets?: ArtAssets | null) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, scale = size / 1024, cx = size * .47, cy = size * .53;
  const roles = cosmicColorRoles(colors); const placements = cosmicPlacements(genesis, size);
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (assets?.base) { ctx.save(); ctx.globalAlpha = .96; ctx.drawImage(assets.base, 0, 0, size, size); ctx.restore(); }
  else { glow(ctx, size * .22, size * .28, size * .48, roles.secondary, .7); glow(ctx, size * .78, size * .7, size * .44, roles.love, .62); }
  paintNebula(ctx, size, roles.all, genesis.seed, scale);
  paintFiligree(ctx, size / 2, size / 2, size * .5, genesis, scale);
  for (let i = 0; i < 1050; i++) {
    const salt = genesis.seed + i * 43, x = unit(salt) * size, y = unit(salt + 5) * size;
    const color = i % 5 === 0 ? roles.all[i % 7] ?? GOLD : GOLD;
    ctx.fillStyle = color; ctx.globalAlpha = i % 19 === 0 ? .95 : .28 + unit(salt + 11) * .48;
    ctx.beginPath(); ctx.arc(x, y, (i % 29 === 0 ? 2.1 : .35 + unit(salt + 13) * .7) * scale, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  placements.forEach((planet, index) => paintOrbit(ctx, cx, cy, planet.orbitRadius, index, genesis.seed, scale));
  glow(ctx, cx, cy, size * .17, "#f6c95b", .52); glow(ctx, cx, cy, size * .1, "#fff4bd", .72);
  sphere(ctx, cx, cy, size * .055, [[0, "#FFFFFF"], [.14, "#FFF8C8"], [.45, "#f4c95d"], [.78, "#c87925"], [1, "#51200f"]]);
  paintImpasto(ctx, cx, cy, size * .055, ["#FFFFFF", "#ffe08a", "#d78a2d", "#6c2814"], genesis.seed + 9000, scale);
  placements.forEach((planet) => paintPlanet(ctx, planet, planet, planet.radius, genesis.seed, scale, assets?.planets));
  ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
}

export default function CosmicGenesisCanvas({ genesis, colors, language, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null); const images = useRef<ArtAssets | null>(null);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const art = images.current ?? await loadArt(); await paintCosmicGenesis(out, genesis, colors, art);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [genesis, colors]);
  useEffect(() => {
    let active = true;
    if (ref.current) void paintCosmicGenesis(ref.current, genesis, colors, null);
    void loadArt().then((art) => { if (!active) return; images.current = art; if (ref.current) void paintCosmicGenesis(ref.current, genesis, colors, art); onCapture(capture); });
    return () => { active = false; onCapture(null); };
  }, [genesis, colors, capture, onCapture]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "出生瞬間の太陽中心惑星配置を描いた出生宇宙創生図" : "Natal Cosmic Genesis based on heliocentric planetary positions"} data-cosmic-genesis data-renderer="layered-fantasy-real-oil" data-birth-color-role="nebula-emission-light-only" data-guide-spokes="0" data-planet-scale="2" data-birth-colors={cosmicColorRoles(colors).all.join(",")} data-planet-count={genesis.planets.length} data-sun-sign={genesis.sunSign} data-moon-sign={genesis.moonSign} data-animal={genesis.animal} className="block h-full w-full object-contain" />;
}