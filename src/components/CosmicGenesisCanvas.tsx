import { useCallback, useEffect, useRef } from "react";
import cosmicBase from "@/assets/cosmic-genesis-base.jpg";
import type { CosmicGenesis, CosmicPlanet } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import type { Capture } from "./MandalaCanvas";

type Props = {
  genesis: CosmicGenesis;
  colors: string[];
  language: Language;
  onCapture: (capture: Capture | null) => void;
};

const GOLD = "#F6E3A2";
const DEEP_GOLD = "#B98A2D";
const VOID = "#030611";
const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const ANIMAL_GLYPHS = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ORBITS = [.145, .19, .235, .285, .35, .415, .475, .535];

function loadBase() {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = cosmicBase;
  });
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(.26, `${color}88`);
  gradient.addColorStop(1, `${color}00`);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

function sphere(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, stops: [number, string][]) {
  const gradient = ctx.createRadialGradient(x - radius * .36, y - radius * .42, radius * .04, x, y, radius);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function paintEarth(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, scale: number) {
  glow(ctx, x, y, radius * 2.7, "#5DDCFF", .72);
  ctx.save();
  ctx.shadowColor = "#80E8FF";
  ctx.shadowBlur = radius * .8;
  sphere(ctx, x, y, radius, [[0, "#DDFBFF"], [.16, "#38CBE8"], [.52, "#075DA7"], [.8, "#062F78"], [1, "#01091F"]]);
  ctx.beginPath(); ctx.arc(x, y, radius * .96, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#31C78B";
  ctx.globalAlpha = .9;
  ctx.beginPath();
  ctx.moveTo(x - radius * .65, y - radius * .25);
  ctx.bezierCurveTo(x - radius * .22, y - radius * .72, x + radius * .12, y - radius * .38, x + radius * .02, y - radius * .04);
  ctx.bezierCurveTo(x + radius * .48, y + radius * .12, x + radius * .36, y + radius * .5, x - radius * .08, y + radius * .3);
  ctx.bezierCurveTo(x - radius * .35, y + radius * .62, x - radius * .72, y + radius * .16, x - radius * .65, y - radius * .25);
  ctx.fill();
  ctx.strokeStyle = "#B6FFFF"; ctx.globalAlpha = .35; ctx.lineWidth = Math.max(1, scale * 1.4);
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.arc(x, y + i * radius * .22, radius * (.68 + Math.abs(i) * .08), Math.PI * .08, Math.PI * .9); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "#B9FAFF"; ctx.globalAlpha = .82; ctx.lineWidth = Math.max(1, scale * 1.6);
  ctx.beginPath(); ctx.arc(x, y, radius * 1.12, Math.PI * 1.08, Math.PI * 1.82); ctx.stroke();
  ctx.globalAlpha = 1;
}

function paintPlanet(ctx: CanvasRenderingContext2D, planet: CosmicPlanet, x: number, y: number, radius: number, scale: number) {
  if (planet.id === "earth") { paintEarth(ctx, x, y, radius, scale); return; }
  const palettes: Record<CosmicPlanet["id"], [number, string][]> = {
    mercury: [[0, "#F0E4D0"], [.45, "#9C8D7E"], [1, "#211B1A"]],
    venus: [[0, "#FFF0B5"], [.45, "#D69145"], [1, "#4A2416"]],
    earth: [],
    mars: [[0, "#FFD0A0"], [.42, "#C94D2E"], [1, "#391211"]],
    jupiter: [[0, "#FFF0CE"], [.3, "#CE9A73"], [.68, "#8B543A"], [1, "#2A1516"]],
    saturn: [[0, "#FFF4C7"], [.48, "#CDB078"], [1, "#493B2F"]],
    uranus: [[0, "#E9FFFF"], [.5, "#74D7E6"], [1, "#153C5A"]],
    neptune: [[0, "#D6E8FF"], [.45, "#315FD1"], [1, "#07194A"]],
  };
  glow(ctx, x, y, radius * 1.9, palettes[planet.id][1]?.[1] ?? GOLD, .38);
  ctx.save(); ctx.shadowColor = palettes[planet.id][0]?.[1] ?? GOLD; ctx.shadowBlur = radius * .35;
  sphere(ctx, x, y, radius, palettes[planet.id]);
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius * .96, 0, Math.PI * 2); ctx.clip();
  ctx.globalAlpha = .2; ctx.strokeStyle = "#FFF8E7"; ctx.lineWidth = Math.max(1, radius * .1);
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(x, y + i * radius * .28, radius, radius * .12, -.08, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore(); ctx.restore();
  if (planet.id === "saturn") {
    ctx.save(); ctx.translate(x, y); ctx.rotate(-.22); ctx.strokeStyle = "#F7DDA0"; ctx.globalAlpha = .8;
    ctx.lineWidth = Math.max(1.5, radius * .22); ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.75, radius * .48, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "#82DFFC"; ctx.globalAlpha = .24; ctx.lineWidth = Math.max(1, radius * .36); ctx.stroke(); ctx.restore();
  }
}

function paintFiligree(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, genesis: CosmicGenesis, scale: number) {
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = GOLD; ctx.fillStyle = GOLD; ctx.lineWidth = Math.max(1, scale * .7);
  const constellation = (sign: number, ring: number, rotation: number) => {
    const points = Array.from({ length: 7 }, (_, index) => {
      const angle = rotation + index * (.18 + (sign % 3) * .018);
      const r = ring + (((index * 17 + sign * 11) % 29) - 14) * scale;
      return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
    });
    ctx.globalAlpha = .56; ctx.beginPath(); points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    points.forEach(([x, y], index) => { ctx.globalAlpha = index % 2 ? .72 : 1; ctx.beginPath(); ctx.arc(x, y, (index % 3 ? 1.6 : 2.8) * scale, 0, Math.PI * 2); ctx.fill(); });
  };
  constellation(genesis.sunSign, radius * .74, -2.7);
  constellation(genesis.moonSign, radius * .82, .35);
  ctx.globalAlpha = .78; ctx.font = `${Math.round(25 * scale)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const sunAngle = -2.22, moonAngle = .82;
  ctx.fillText(ZODIAC_GLYPHS[genesis.sunSign] ?? "✦", Math.cos(sunAngle) * radius * .87, Math.sin(sunAngle) * radius * .87);
  ctx.fillText(ZODIAC_GLYPHS[genesis.moonSign] ?? "✧", Math.cos(moonAngle) * radius * .9, Math.sin(moonAngle) * radius * .9);
  const animalAngle = 2.35;
  const ax = Math.cos(animalAngle) * radius * .84, ay = Math.sin(animalAngle) * radius * .84;
  ctx.globalAlpha = .26; ctx.lineWidth = Math.max(1, scale * 1.2);
  for (let petal = 0; petal < 12; petal++) {
    const a = petal * Math.PI / 6 + genesis.animal * .03;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(ax + Math.cos(a + .4) * 38 * scale, ay + Math.sin(a + .4) * 38 * scale, ax + Math.cos(a) * 62 * scale, ay + Math.sin(a) * 62 * scale); ctx.stroke();
  }
  ctx.globalAlpha = .88; ctx.font = `${Math.round(34 * scale)}px serif`; ctx.fillText(ANIMAL_GLYPHS[genesis.animal] ?? "✦", ax, ay);
  ctx.globalAlpha = .36; ctx.beginPath(); ctx.arc(ax, ay, 48 * scale, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

async function paint(canvas: HTMLCanvasElement, genesis: CosmicGenesis, colors: string[], base?: HTMLImageElement | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, scale = size / 1024, cx = size / 2, cy = size / 2, field = size * .42;
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (base) { ctx.globalAlpha = .9; ctx.drawImage(base, 0, 0, size, size); ctx.globalAlpha = 1; }
  else {
    glow(ctx, size * .22, size * .28, size * .48, "#075CA8", .38);
    glow(ctx, size * .78, size * .7, size * .44, "#6C216F", .3);
  }
  for (let i = 0; i < 920; i++) {
    const x = ((i * 619 + genesis.seed * 17) % 1009) / 1009 * size;
    const y = ((i * 431 + genesis.seed * 29) % 1013) / 1013 * size;
    const color = i % 19 === 0 ? colors[i % Math.max(colors.length, 1)] ?? GOLD : GOLD;
    ctx.fillStyle = color; ctx.globalAlpha = i % 17 === 0 ? .8 : .18 + (i % 7) * .045;
    ctx.beginPath(); ctx.arc(x, y, (i % 23 === 0 ? 1.8 : .45) * scale, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  colors.slice(0, 7).forEach((color, index) => {
    const radius = field * (.24 + index * .095);
    ctx.strokeStyle = color; ctx.globalAlpha = .1 + (index % 3) * .04; ctx.lineWidth = Math.max(1, scale * (1.2 + index % 2));
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
  });
  genesis.planets.forEach((planet, index) => {
    const orbit = field * (ORBITS[index] ?? .5);
    ctx.strokeStyle = index % 2 ? GOLD : colors[index % Math.max(colors.length, 1)] ?? GOLD;
    ctx.globalAlpha = index % 2 ? .22 : .16; ctx.lineWidth = Math.max(1, scale * .65);
    ctx.beginPath(); ctx.arc(cx, cy, orbit, 0, Math.PI * 2); ctx.stroke();
  });
  glow(ctx, cx, cy, size * .135, "#FFD978", .7);
  sphere(ctx, cx, cy, size * .052, [[0, "#FFFFFF"], [.18, "#FFF4AD"], [.52, "#F8B43B"], [1, "#9D3D0A"]]);
  ctx.strokeStyle = GOLD; ctx.globalAlpha = .42; ctx.lineWidth = Math.max(1, scale);
  genesis.planets.forEach((planet, index) => {
    const angle = (planet.longitude - 90) * Math.PI / 180;
    const orbit = field * (ORBITS[index] ?? .5);
    const x = cx + Math.cos(angle) * orbit, y = cy + Math.sin(angle) * orbit;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * size * .06, cy + Math.sin(angle) * size * .06); ctx.lineTo(x, y); ctx.stroke();
    paintPlanet(ctx, planet, x, y, planet.displayRadius * scale, scale);
  });
  paintFiligree(ctx, cx, cy, field, genesis, scale);
  ctx.globalAlpha = 1;
}

export default function CosmicGenesisCanvas({ genesis, colors, language, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const base = image.current ?? await loadBase();
    await paint(out, genesis, colors, base);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [genesis, colors]);
  useEffect(() => {
    let active = true;
    void loadBase().then((base) => {
      if (!active) return;
      image.current = base;
      if (ref.current) void paint(ref.current, genesis, colors, base);
      onCapture(capture);
    });
    return () => { active = false; onCapture(null); };
  }, [genesis, colors, capture, onCapture]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "出生瞬間の太陽中心惑星配置を描いた出生宇宙創生図" : "Natal Cosmic Genesis based on heliocentric planetary positions"} data-cosmic-genesis data-planet-count={genesis.planets.length} data-sun-sign={genesis.sunSign} data-moon-sign={genesis.moonSign} data-animal={genesis.animal} className="block h-full w-full object-contain" />;
}