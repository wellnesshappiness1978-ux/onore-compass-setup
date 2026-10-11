import { useCallback, useEffect, useRef } from "react";
import cosmicBase from "@/assets/cosmic-genesis-master-base.jpg";
import { COSMIC_GUARDIANS, cosmicColorRoles, cosmicPlacements } from "@/lib/cosmic-art";
import type { CosmicGenesis, CosmicPlanet } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import type { Capture } from "./MandalaCanvas";

type Props = { genesis: CosmicGenesis; colors: string[]; language: Language; onCapture: (capture: Capture | null) => void };
type Point = { x: number; y: number };

const GOLD = "#F6E3A2";
const MID_GOLD = "#D1A84C";
const DEEP_GOLD = "#704617";
const VOID = "#030611";
const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

function loadBase() {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = cosmicBase;
  });
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
  ctx.save(); ctx.globalCompositeOperation = "screen";
  colors.forEach((color, index) => {
    for (let plume = 0; plume < 7; plume++) {
      const salt = seed + index * 193 + plume * 47;
      const angle = index * .84 + (unit(salt) - .5) * .65;
      const distance = size * (.17 + unit(salt + 3) * .38);
      const x = size / 2 + Math.cos(angle) * distance;
      const y = size / 2 + Math.sin(angle) * distance;
      const radius = size * (.1 + unit(salt + 9) * .17);
      glow(ctx, x, y, radius, color, .32 + unit(salt + 12) * .26);
    }
  });
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 170; i++) {
    const salt = seed * 3 + i * 31;
    const x = unit(salt) * size, y = unit(salt + 7) * size;
    const length = (5 + unit(salt + 13) * 24) * scale;
    ctx.strokeStyle = colors[i % colors.length] ?? GOLD; ctx.globalAlpha = .2 + unit(salt + 17) * .44;
    ctx.lineWidth = (.35 + unit(salt + 19) * 1.5) * scale; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x - length * .45, y + length * .2); ctx.quadraticCurveTo(x, y - length * .18, x + length * .55, y); ctx.stroke();
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
    for (let i = 0; i < 22; i++) { const s = seed + i * 37, a = unit(s) * Math.PI * 2, d = Math.sqrt(unit(s + 2)) * radius * .75, r = radius * (.035 + unit(s + 4) * .11), x = point.x + Math.cos(a) * d, y = point.y + Math.sin(a) * d; const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .08, x, y, r); g.addColorStop(0, "#fff6d8aa"); g.addColorStop(.36, "#695e56aa"); g.addColorStop(1, "#17151922"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  } else if (planet.id === "venus") {
    for (let i = -5; i <= 5; i++) { line(i % 2 ? "#fff1b8" : "#b95f34", .25, radius * .045); ctx.beginPath(); ctx.bezierCurveTo(point.x - radius, point.y + i * radius * .15, point.x - radius * .2, point.y + (i + .8) * radius * .12, point.x + radius, point.y + i * radius * .11); ctx.stroke(); }
  } else if (planet.id === "mars") {
    for (let i = 0; i < 18; i++) { const s = seed + i * 29, y = point.y - radius * .72 + unit(s) * radius * 1.44; line(i % 3 ? "#762414" : "#ffd09b", .3, radius * (.018 + unit(s + 1) * .025)); ctx.beginPath(); ctx.moveTo(point.x - radius, y); ctx.quadraticCurveTo(point.x + (unit(s + 3) - .5) * radius, y - radius * .13, point.x + radius, y + radius * .08); ctx.stroke(); }
  } else if (planet.id === "jupiter" || planet.id === "saturn") {
    for (let i = -7; i <= 7; i++) { line(i % 3 === 0 ? "#fff0c0" : i % 2 ? "#9a5038" : "#d5a46e", .32, radius * (i % 3 === 0 ? .07 : .035)); ctx.beginPath(); ctx.moveTo(point.x - radius, point.y + i * radius * .105); ctx.bezierCurveTo(point.x - radius * .25, point.y + (i - .5) * radius * .105, point.x + radius * .35, point.y + (i + .55) * radius * .105, point.x + radius, point.y + i * radius * .105); ctx.stroke(); }
    if (planet.id === "jupiter") { ctx.fillStyle = "#b64231cc"; ctx.beginPath(); ctx.ellipse(point.x + radius * .35, point.y + radius * .2, radius * .25, radius * .11, -.08, 0, Math.PI * 2); ctx.fill(); line("#ffd6a1", .55, radius * .025); ctx.stroke(); }
  } else if (planet.id === "uranus") {
    for (let i = -5; i <= 5; i++) { line(i % 2 ? "#d9ffff" : "#268aa4", .25, radius * .035); ctx.beginPath(); ctx.moveTo(point.x + i * radius * .15, point.y - radius); ctx.quadraticCurveTo(point.x + (i + .45) * radius * .15, point.y, point.x + i * radius * .15, point.y + radius); ctx.stroke(); }
  } else if (planet.id === "neptune") {
    for (let i = 0; i < 13; i++) { const s = seed + i * 41, y = point.y - radius * .7 + unit(s) * radius * 1.4; line(i % 4 ? "#7ebdff" : "#e9ffff", .3, radius * (.018 + unit(s + 2) * .035)); ctx.beginPath(); ctx.moveTo(point.x - radius * .8, y); ctx.bezierCurveTo(point.x - radius * .15, y - radius * .18, point.x + radius * .3, y + radius * .16, point.x + radius * .78, y); ctx.stroke(); }
    ctx.fillStyle = "#07173999"; ctx.beginPath(); ctx.ellipse(point.x + radius * .2, point.y + radius * .25, radius * .2, radius * .1, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function paintEarth(ctx: CanvasRenderingContext2D, point: Point, radius: number, aura: string, seed: number, scale: number) {
  glow(ctx, point.x, point.y, radius * 3.8, aura, .96);
  ctx.save(); ctx.shadowColor = aura; ctx.shadowBlur = radius * .9;
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
  paintImpasto(ctx, point.x, point.y, radius, ["#E8FFFF", "#18B8EC", "#20D49B", aura], seed + 400, scale);
  ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "#D8FFFF"; ctx.lineCap = "round";
  for (let i = -3; i <= 3; i++) {
    ctx.globalAlpha = .2 + (3 - Math.abs(i)) * .07; ctx.lineWidth = Math.max(scale, radius * .025);
    ctx.beginPath(); ctx.arc(point.x, point.y + i * radius * .18, radius * (.58 + Math.abs(i) * .08), .06 * Math.PI, .94 * Math.PI); ctx.stroke();
  }
  ctx.strokeStyle = aura; ctx.globalAlpha = .76; ctx.lineWidth = Math.max(scale * 1.2, radius * .035);
  ctx.beginPath(); ctx.bezierCurveTo(point.x - radius, point.y - radius * .15, point.x - radius * .18, point.y - radius * .75, point.x + radius * .72, point.y - radius * .3); ctx.stroke();
  ctx.globalCompositeOperation = "screen";
  for (let facet = 0; facet < 12; facet++) { const a = facet * Math.PI / 6 + unit(seed + facet) * .12; ctx.strokeStyle = facet % 2 ? "#9cfff1" : "#b4d8ff"; ctx.globalAlpha = .18 + (facet % 3) * .08; ctx.lineWidth = Math.max(scale, radius * .02); ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(point.x + Math.cos(a) * radius * .92, point.y + Math.sin(a) * radius * .92); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = "#C8FFFF"; ctx.globalAlpha = .9; ctx.lineWidth = Math.max(scale, radius * .045);
  ctx.beginPath(); ctx.arc(point.x, point.y, radius * 1.08, Math.PI * 1.05, Math.PI * 1.83); ctx.stroke(); ctx.restore();
}

function planetPalette(id: CosmicPlanet["id"], aura: string): string[] {
  const palettes: Record<CosmicPlanet["id"], string[]> = {
    mercury: ["#FFF6DC", "#A99A87", "#27201D"], venus: ["#FFF3B9", "#E4A354", "#5A2415"], earth: [],
    mars: ["#FFE0B0", "#D75A31", "#421313"], jupiter: ["#FFF4D5", "#D6A17A", "#81462F", "#281017"],
    saturn: ["#FFF8CD", "#D7B97A", "#55402B"], uranus: ["#F0FFFF", "#70DCEB", "#123D5B"], neptune: ["#E0EDFF", "#3568E2", "#071747"],
  };
  const native = palettes[id];
  return native.length ? [mix(native[0] ?? aura, aura, .18), mix(native[1] ?? aura, aura, .25), ...(native.slice(2))] : [aura];
}

function paintPlanet(ctx: CanvasRenderingContext2D, planet: CosmicPlanet, point: Point, radius: number, aura: string, seed: number, scale: number) {
  if (planet.id === "earth") { paintEarth(ctx, point, radius, aura, seed, scale); return; }
  const palette = planetPalette(planet.id, aura);
  glow(ctx, point.x, point.y, radius * 2.25, aura, .88);
  ctx.save(); ctx.shadowColor = aura; ctx.shadowBlur = radius * .65;
  sphere(ctx, point.x, point.y, radius, palette.map((color, index) => [index / Math.max(palette.length - 1, 1), color] as [number, string])); ctx.restore();
  paintImpasto(ctx, point.x, point.y, radius, [mix(aura, "#FFFFFF", .35), aura, mix(aura, "#000000", .45)], seed + planet.orbitIndex * 701, scale, planet.id === "jupiter" || planet.id === "saturn" || planet.id === "uranus" || planet.id === "neptune");
  paintPlanetSurface(ctx, planet, point, radius, seed + planet.orbitIndex * 997, scale);
  ctx.save(); ctx.strokeStyle = mix(aura, "#FFFFFF", .62); ctx.globalAlpha = .7; ctx.lineWidth = Math.max(scale, radius * .025);
  ctx.beginPath(); ctx.arc(point.x, point.y, radius * .98, Math.PI * 1.08, Math.PI * 1.78); ctx.stroke(); ctx.restore();
  if (planet.id === "saturn") {
    ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(-.22); ctx.lineCap = "round";
    [[radius * .36, DEEP_GOLD, .78], [radius * .24, aura, .7], [radius * .1, GOLD, .94]].forEach(([width, color, alpha]) => {
      ctx.strokeStyle = color as string; ctx.globalAlpha = alpha as number; ctx.lineWidth = width as number; ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.72, radius * .48, 0, 0, Math.PI * 2); ctx.stroke();
    });
    ctx.strokeStyle = GOLD; ctx.globalAlpha = .78; ctx.lineWidth = Math.max(scale, radius * .03); ctx.setLineDash([radius * .14, radius * .06, radius * .04, radius * .08]); ctx.stroke(); ctx.restore();
  }
}

function paintOrbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string, index: number, seed: number, scale: number) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.22 + (index - 3.5) * .012); ctx.scale(1, .72 - (index % 3) * .015);
  ctx.lineCap = "round"; ctx.globalCompositeOperation = "screen";
  for (let fragment = 0; fragment < 18; fragment++) {
    const salt = seed + index * 227 + fragment * 31;
    const angle = unit(salt) * Math.PI * 2;
    const length = .015 + unit(salt + 3) * .07;
    ctx.strokeStyle = color; ctx.globalAlpha = .12 + unit(salt + 4) * .28; ctx.lineWidth = (.35 + unit(salt + 5) * 1.4) * scale;
    ctx.beginPath(); ctx.arc(0, 0, radius, angle, angle + length); ctx.stroke();
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius; ctx.fillStyle = color; ctx.globalAlpha = .35 + unit(salt + 6) * .45; ctx.beginPath(); ctx.arc(x, y, (.45 + unit(salt + 7) * 1.4) * scale, 0, Math.PI * 2); ctx.fill();
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
  else if (id === "horse") { ctx.moveTo(x - s * .42, y + s * .42); ctx.bezierCurveTo(x - s * .22, y, x - s * .18, y - s * .48, x + s * .18, y - s * .55); ctx.quadraticCurveTo(x + s * .52, y - s * .25, x + s * .28, y + s * .05); ctx.lineTo(x + s * .45, y + s * .48); ctx.moveTo(x - s * .12, y + s * .05); ctx.lineTo(x - s * .3, y + s * .5); }
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
  guardianPath(ctx, genesis.animal, ax, ay, guardianSize); const guardianFill = ctx.createLinearGradient(ax - guardianSize, ay - guardianSize, ax + guardianSize, ay + guardianSize); guardianFill.addColorStop(0, "#fff5c733"); guardianFill.addColorStop(.5, "#d1a84c18"); guardianFill.addColorStop(1, "#70461733"); ctx.fillStyle = guardianFill; ctx.globalAlpha = .72; ctx.shadowColor = GOLD; ctx.shadowBlur = 22 * scale; ctx.fill();
  [[DEEP_GOLD, 15, .2], [MID_GOLD, 7, .38], [GOLD, 2.2, .82], ["#fff4c7", .65, .92]].forEach(([color, width, alpha]) => { guardianPath(ctx, genesis.animal, ax, ay, guardianSize); ctx.strokeStyle = color as string; ctx.globalAlpha = alpha as number; ctx.lineWidth = (width as number) * scale; ctx.shadowColor = GOLD; ctx.shadowBlur = (width as number) * scale; ctx.stroke(); });
  for (let i = 0; i < 34; i++) { const a = i * 2.399 + genesis.animal, r = guardianSize * (.25 + (i % 9) * .11); glow(ctx, ax + Math.cos(a) * r, ay + Math.sin(a) * r, (2 + i % 4) * scale, GOLD, .5); }
  ctx.restore();
}

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, colors: string[], base?: HTMLImageElement | null) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, scale = size / 1024, cx = size * .47, cy = size * .53;
  const roles = cosmicColorRoles(colors); const placements = cosmicPlacements(genesis, size);
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (base) { ctx.save(); ctx.globalAlpha = .9; ctx.drawImage(base, 0, 0, size, size); ctx.restore(); }
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
  placements.forEach((planet, index) => paintOrbit(ctx, cx, cy, planet.orbitRadius, roles.all[index % 7] ?? roles.overall, index, genesis.seed, scale));
  glow(ctx, cx, cy, size * .2, roles.overall, .94); glow(ctx, cx, cy, size * .12, roles.wealth, .9);
  ctx.save(); ctx.translate(cx, cy); ctx.globalCompositeOperation = "screen"; for (let ray = 0; ray < 48; ray++) { const a = ray * Math.PI / 24 + unit(genesis.seed + ray) * .035, inner = size * .055, outer = size * (.075 + unit(genesis.seed + ray * 3) * .09); ctx.strokeStyle = ray % 3 ? roles.overall : GOLD; ctx.globalAlpha = .08 + unit(genesis.seed + ray * 5) * .2; ctx.lineWidth = (.35 + unit(genesis.seed + ray * 7) * 1.4) * scale; ctx.beginPath(); ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner); ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer); ctx.stroke(); } ctx.restore();
  sphere(ctx, cx, cy, size * .055, [[0, "#FFFFFF"], [.14, "#FFF8C8"], [.42, mix(roles.overall, "#FFFFFF", .28)], [.72, roles.overall], [1, mix(roles.overall, "#000000", .55)]]);
  paintImpasto(ctx, cx, cy, size * .055, ["#FFFFFF", roles.overall, roles.wealth, mix(roles.overall, "#000000", .4)], genesis.seed + 9000, scale);
  placements.forEach((planet, index) => paintPlanet(ctx, planet, planet, planet.radius, roles.all[(index + 1) % 7] ?? roles.overall, genesis.seed, scale));
  ctx.globalCompositeOperation = "screen"; glow(ctx, size * .76, size * .2, size * .18, roles.health, .22); glow(ctx, size * .22, size * .78, size * .19, roles.inner, .2); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
}

export default function CosmicGenesisCanvas({ genesis, colors, language, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null); const image = useRef<HTMLImageElement | null>(null);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const base = image.current ?? await loadBase(); await paintCosmicGenesis(out, genesis, colors, base);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [genesis, colors]);
  useEffect(() => {
    let active = true;
    if (ref.current) void paintCosmicGenesis(ref.current, genesis, colors, null);
    void loadBase().then((base) => { if (!active) return; image.current = base; if (ref.current) void paintCosmicGenesis(ref.current, genesis, colors, base); onCapture(capture); });
    return () => { active = false; onCapture(null); };
  }, [genesis, colors, capture, onCapture]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "出生瞬間の太陽中心惑星配置を描いた出生宇宙創生図" : "Natal Cosmic Genesis based on heliocentric planetary positions"} data-cosmic-genesis data-renderer="impasto-oil" data-guide-spokes="0" data-planet-scale="2" data-birth-colors={cosmicColorRoles(colors).all.join(",")} data-planet-count={genesis.planets.length} data-sun-sign={genesis.sunSign} data-moon-sign={genesis.moonSign} data-animal={genesis.animal} className="block h-full w-full object-contain" />;
}