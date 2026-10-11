import { useCallback, useEffect, useRef } from "react";
import cosmicBase from "@/assets/cosmic-genesis-base.jpg";
import { cosmicColorRoles, cosmicPlacements } from "@/lib/cosmic-art";
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
const ANIMAL_GLYPHS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

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

function paintEarth(ctx: CanvasRenderingContext2D, point: Point, radius: number, aura: string, seed: number, scale: number) {
  glow(ctx, point.x, point.y, radius * 2.8, aura, .92);
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
  ctx.save(); ctx.translate(cx, cy); ctx.rotate((index - 3.5) * .018); ctx.scale(1, .975 - (index % 3) * .012);
  ctx.lineCap = "round";
  [[scale * 8, .08], [scale * 3.2, .28], [scale * .85, .92]].forEach(([width, alpha]) => {
    ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.setLineDash([radius * (.12 + unit(seed + index) * .08), radius * .018, radius * .25, radius * .03]);
    ctx.lineDashOffset = -unit(seed + index * 13) * radius; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.restore();
}

function paintFiligree(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, genesis: CosmicGenesis, scale: number) {
  ctx.save(); ctx.translate(cx, cy); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const strokeLayer = (color: string, width: number, alpha: number, blur: number) => { ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha; ctx.shadowColor = color; ctx.shadowBlur = blur; };
  const constellation = (sign: number, ring: number, rotation: number) => {
    const points = Array.from({ length: 7 }, (_, index) => { const angle = rotation + index * (.18 + (sign % 3) * .018); const r = ring + (((index * 17 + sign * 11) % 29) - 14) * scale; return [Math.cos(angle) * r, Math.sin(angle) * r] as const; });
    [[DEEP_GOLD, scale * 3, .5, 3 * scale], [MID_GOLD, scale * 1.5, .72, 1.4 * scale], [GOLD, scale * .55, .92, 0]].forEach(([color, width, alpha, blur]) => { strokeLayer(color as string, width as number, alpha as number, blur as number); ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); });
    points.forEach(([x, y], index) => { glow(ctx, x, y, (index % 3 ? 5 : 8) * scale, GOLD, .55); ctx.fillStyle = GOLD; ctx.globalAlpha = .95; ctx.beginPath(); ctx.arc(x, y, (index % 3 ? 1.5 : 2.7) * scale, 0, Math.PI * 2); ctx.fill(); });
  };
  constellation(genesis.sunSign, radius * .8, -2.7); constellation(genesis.moonSign, radius * .88, .35);
  strokeLayer(GOLD, scale, .9, 3 * scale); ctx.font = `${Math.round(25 * scale)}px serif`;
  ctx.fillText(ZODIAC_GLYPHS[genesis.sunSign] ?? "✦", Math.cos(-2.22) * radius * .92, Math.sin(-2.22) * radius * .92);
  ctx.fillText(ZODIAC_GLYPHS[genesis.moonSign] ?? "✧", Math.cos(.82) * radius * .93, Math.sin(.82) * radius * .93);
  const animalAngle = 2.35, ax = Math.cos(animalAngle) * radius * .88, ay = Math.sin(animalAngle) * radius * .88;
  [[DEEP_GOLD, 3.8, .42], [MID_GOLD, 1.9, .68], [GOLD, .65, .94]].forEach(([color, width, alpha]) => {
    ctx.strokeStyle = color as string; ctx.globalAlpha = alpha as number; ctx.lineWidth = (width as number) * scale;
    for (let petal = 0; petal < 12; petal++) { const angle = petal * Math.PI / 6 + genesis.animal * .03; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(ax + Math.cos(angle + .4) * 38 * scale, ay + Math.sin(angle + .4) * 38 * scale, ax + Math.cos(angle) * 62 * scale, ay + Math.sin(angle) * 62 * scale); ctx.stroke(); }
  });
  ctx.fillStyle = GOLD; ctx.globalAlpha = .95; ctx.font = `${Math.round(34 * scale)}px serif`; ctx.fillText(ANIMAL_GLYPHS[genesis.animal] ?? "✦", ax, ay);
  ctx.restore();
}

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, colors: string[], base?: HTMLImageElement | null) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, scale = size / 1024, cx = size / 2, cy = size / 2;
  const roles = cosmicColorRoles(colors); const placements = cosmicPlacements(genesis, size);
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (base) { ctx.save(); ctx.globalAlpha = .72; ctx.drawImage(base, 0, 0, size, size); ctx.restore(); }
  else { glow(ctx, size * .22, size * .28, size * .48, roles.secondary, .7); glow(ctx, size * .78, size * .7, size * .44, roles.love, .62); }
  paintNebula(ctx, size, roles.all, genesis.seed, scale);
  for (let i = 0; i < 1050; i++) {
    const salt = genesis.seed + i * 43, x = unit(salt) * size, y = unit(salt + 5) * size;
    const color = i % 5 === 0 ? roles.all[i % 7] ?? GOLD : GOLD;
    ctx.fillStyle = color; ctx.globalAlpha = i % 19 === 0 ? .95 : .28 + unit(salt + 11) * .48;
    ctx.beginPath(); ctx.arc(x, y, (i % 29 === 0 ? 2.1 : .35 + unit(salt + 13) * .7) * scale, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  placements.forEach((planet, index) => paintOrbit(ctx, cx, cy, planet.orbitRadius, roles.all[index % 7] ?? roles.overall, index, genesis.seed, scale));
  glow(ctx, cx, cy, size * .16, roles.overall, .94); glow(ctx, cx, cy, size * .1, roles.wealth, .9);
  sphere(ctx, cx, cy, size * .055, [[0, "#FFFFFF"], [.14, "#FFF8C8"], [.42, mix(roles.overall, "#FFFFFF", .28)], [.72, roles.overall], [1, mix(roles.overall, "#000000", .55)]]);
  paintImpasto(ctx, cx, cy, size * .055, ["#FFFFFF", roles.overall, roles.wealth, mix(roles.overall, "#000000", .4)], genesis.seed + 9000, scale);
  placements.forEach((planet, index) => paintPlanet(ctx, planet, planet, planet.radius, roles.all[(index + 1) % 7] ?? roles.overall, genesis.seed, scale));
  paintFiligree(ctx, cx, cy, size * .46, genesis, scale); ctx.globalAlpha = 1;
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