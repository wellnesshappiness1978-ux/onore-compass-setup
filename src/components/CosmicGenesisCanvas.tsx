import { useCallback, useEffect, useMemo, useRef } from "react";
import cosmicField from "@/assets/cosmic-master-field.jpg";
import mercury from "@/assets/cosmic-mercury.png";
import venus from "@/assets/cosmic-venus.png";
import earth from "@/assets/cosmic-earth.png";
import mars from "@/assets/cosmic-mars.png";
import jupiter from "@/assets/cosmic-jupiter.png";
import saturn from "@/assets/cosmic-saturn.png";
import uranus from "@/assets/cosmic-uranus.png";
import neptune from "@/assets/cosmic-neptune.png";
import { COSMIC_GUARDIANS, cosmicColorRoles, cosmicPlacements } from "@/lib/cosmic-art";
import type { CosmicGenesis, CosmicPlanetId } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import type { Capture } from "./MandalaCanvas";

type Props = { genesis: CosmicGenesis; colors: string[]; language: Language; onCapture: (capture: Capture | null) => void };
type Point = { x: number; y: number };
type ArtAssets = { field: HTMLImageElement | null; planets: Partial<Record<CosmicPlanetId, HTMLImageElement>> };

const PLANET_SOURCES: Record<CosmicPlanetId, string> = { mercury, venus, earth, mars, jupiter, saturn, uranus, neptune };
const GOLD = "#eedb9a";
const VOID = "#01030a";

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function loadArt(): Promise<ArtAssets> {
  const entries = await Promise.all(Object.entries(PLANET_SOURCES).map(async ([id, src]) => [id, await loadImage(src)] as const));
  const planets: Partial<Record<CosmicPlanetId, HTMLImageElement>> = {};
  entries.forEach(([id, image]) => { if (image) planets[id as CosmicPlanetId] = image; });
  return { field: await loadImage(cosmicField), planets };
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(.22, `${color}a8`);
  gradient.addColorStop(.62, `${color}28`);
  gradient.addColorStop(1, `${color}00`);
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = alpha; ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
}

function paintBirthLight(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  colors.forEach((color, index) => {
    const salt = seed + index * 419;
    const anchorX = size * (.18 + unit(salt) * .66);
    const anchorY = size * (.18 + unit(salt + 2) * .65);
    const radius = size * (.11 + unit(salt + 7) * .09);
    const haze = ctx.createRadialGradient(anchorX, anchorY, 0, anchorX, anchorY, radius);
    haze.addColorStop(0, `${color}2b`); haze.addColorStop(.36, `${color}18`); haze.addColorStop(1, `${color}00`);
    ctx.globalAlpha = .32; ctx.fillStyle = haze;
    ctx.save(); ctx.translate(anchorX, anchorY); ctx.rotate(-.72 + index * .16); ctx.scale(1.65, .55);
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  });
  ctx.restore();
}

function paintDustConstellation(ctx: CanvasRenderingContext2D, size: number, sign: number, side: -1 | 1, seed: number) {
  const cx = size * (side < 0 ? .24 : .77), cy = size * (side < 0 ? .2 : .76);
  const points = Array.from({ length: 9 }, (_, index) => {
    const angle = index * (.62 + sign * .003) + (side < 0 ? .4 : 2.3);
    const radius = size * (.055 + ((index * 19 + sign * 13) % 37) / 500);
    return { x: cx + Math.cos(angle) * radius * 1.7, y: cy + Math.sin(angle) * radius };
  });
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  ctx.strokeStyle = GOLD; ctx.globalAlpha = .055; ctx.lineWidth = size / 1800;
  ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke();
  points.forEach((point, index) => {
    const radius = size * (.001 + unit(seed + sign * 71 + index) * .0012);
    glow(ctx, point.x, point.y, radius * 8, GOLD, .16);
    ctx.fillStyle = GOLD; ctx.globalAlpha = .28; ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

function guardianPath(ctx: CanvasRenderingContext2D, animal: number, x: number, y: number, size: number) {
  const id = COSMIC_GUARDIANS[animal] ?? "dragon"; const s = size;
  ctx.beginPath();
  if (id === "rat") { ctx.ellipse(x, y, s * .34, s * .2, -.12, 0, Math.PI * 2); ctx.moveTo(x + s * .3, y); ctx.quadraticCurveTo(x + s * .65, y - s * .34, x + s * .72, y + s * .08); }
  else if (id === "ox" || id === "goat") { ctx.ellipse(x, y, s * .3, s * .27, 0, 0, Math.PI * 2); ctx.moveTo(x - s * .22, y - s * .18); ctx.quadraticCurveTo(x - s * .62, y - s * .55, x - s * .5, y - s * .02); ctx.moveTo(x + s * .22, y - s * .18); ctx.quadraticCurveTo(x + s * .62, y - s * .55, x + s * .5, y - s * .02); }
  else if (id === "rabbit") { ctx.ellipse(x, y + s * .08, s * .26, s * .3, 0, 0, Math.PI * 2); ctx.moveTo(x - s * .16, y - s * .15); ctx.bezierCurveTo(x - s * .32, y - s * .75, x - s * .05, y - s * .88, x, y - s * .2); ctx.moveTo(x + s * .08, y - s * .2); ctx.bezierCurveTo(x + s * .06, y - s * .82, x + s * .35, y - s * .72, x + s * .18, y - s * .12); }
  else if (id === "dragon" || id === "serpent") { ctx.moveTo(x - s * .62, y + s * .22); ctx.bezierCurveTo(x - s * .3, y - s * .55, x + s * .12, y + s * .55, x + s * .52, y - s * .15); ctx.bezierCurveTo(x + s * .7, y - s * .4, x + s * .38, y - s * .52, x + s * .28, y - s * .32); if (id === "dragon") { ctx.moveTo(x + s * .36, y - s * .32); ctx.lineTo(x + s * .6, y - s * .66); } }
  else if (id === "horse") { ctx.moveTo(x - s * .5, y + s * .34); ctx.bezierCurveTo(x - s * .4, y, x - s * .14, y - s * .52, x + s * .4, y - s * .5); ctx.lineTo(x + s * .55, y - s * .62); ctx.lineTo(x + s * .5, y - s * .36); ctx.quadraticCurveTo(x + s * .65, y - s * .12, x + s * .35, y); ctx.lineTo(x + s * .48, y + s * .48); ctx.moveTo(x, y); ctx.lineTo(x - s * .04, y + s * .5); }
  else { ctx.moveTo(x - s * .5, y + s * .2); ctx.bezierCurveTo(x - s * .38, y - s * .35, x + s * .2, y - s * .38, x + s * .48, y + s * .08); ctx.quadraticCurveTo(x + s * .15, y + s * .42, x - s * .5, y + s * .2); ctx.moveTo(x - s * .18, y - s * .24); ctx.lineTo(x - s * .3, y - s * .52); ctx.lineTo(x, y - s * .3); ctx.lineTo(x + s * .25, y - s * .52); }
}

function paintGuardian(ctx: CanvasRenderingContext2D, size: number, genesis: CosmicGenesis, exclusions: { x: number; y: number; radius: number }[]) {
  const layer = document.createElement("canvas"); layer.width = size; layer.height = size;
  const art = layer.getContext("2d"); if (!art) return;
  const x = size * .25, y = size * .78, scale = size * .24;
  guardianPath(art, genesis.animal, x, y, scale); art.clip();
  for (let i = 0; i < 520; i++) {
    const salt = genesis.seed + i * 61;
    const px = x + (unit(salt) - .5) * scale * 1.55, py = y + (unit(salt + 3) - .5) * scale * 1.55;
    const alpha = .035 + unit(salt + 7) * .1;
    art.fillStyle = i % 7 ? `rgba(219,188,104,${alpha})` : `rgba(255,240,190,${alpha * 1.3})`;
    art.beginPath(); art.arc(px, py, size * (.00035 + unit(salt + 9) * .0008), 0, Math.PI * 2); art.fill();
  }
  art.globalCompositeOperation = "destination-out";
  exclusions.forEach((planet) => { art.beginPath(); art.arc(planet.x, planet.y, planet.radius * 1.3, 0, Math.PI * 2); art.fill(); });
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .68; ctx.drawImage(layer, 0, 0); ctx.restore();
}

function paintPlanet(ctx: CanvasRenderingContext2D, image: HTMLImageElement | undefined, point: Point, radius: number, id: CosmicPlanetId, size: number) {
  if (!image) return;
  const auraColor: Record<CosmicPlanetId, string> = { mercury: "#c7b48d", venus: "#e6b65f", earth: "#65dff2", mars: "#c45a34", jupiter: "#d7b185", saturn: "#d8bf83", uranus: "#8edfe5", neptune: "#3e75e8" };
  const aura = auraColor[id];
  glow(ctx, point.x, point.y, radius * (id === "earth" ? 1.62 : 1.36), aura, id === "earth" ? .27 : .12);
  const ratio = id === "saturn" ? 2.3 : 1;
  const drawWidth = radius * 2 * ratio, drawHeight = radius * 2;
  ctx.save(); ctx.shadowColor = aura; ctx.shadowBlur = size * (id === "earth" ? .017 : .008);
  ctx.drawImage(image, point.x - drawWidth / 2, point.y - drawHeight / 2, drawWidth, drawHeight); ctx.restore();
  if (id === "earth") {
    ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "#9dfff0"; ctx.globalAlpha = .28; ctx.lineWidth = size * .0014;
    ctx.beginPath(); ctx.arc(point.x, point.y, radius * 1.01, Math.PI * 1.1, Math.PI * 1.82); ctx.stroke(); ctx.restore();
  }
}

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, colors: string[], assets?: ArtAssets | null) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, roles = cosmicColorRoles(colors), placements = cosmicPlacements(genesis, size);
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (assets?.field) ctx.drawImage(assets.field, 0, 0, size, size);
  else { glow(ctx, size * .15, size * .15, size * .42, "#164f8e", .45); glow(ctx, size * .78, size * .78, size * .34, "#713b72", .28); }
  const vignette = ctx.createRadialGradient(size * .52, size * .47, size * .12, size * .5, size * .5, size * .72);
  vignette.addColorStop(0, "#00000000"); vignette.addColorStop(.72, "#00000018"); vignette.addColorStop(1, "#000000b8"); ctx.fillStyle = vignette; ctx.fillRect(0, 0, size, size);
  paintBirthLight(ctx, size, roles.all, genesis.seed);
  paintDustConstellation(ctx, size, genesis.sunSign, -1, genesis.seed);
  paintDustConstellation(ctx, size, genesis.moonSign, 1, genesis.seed + 900);
  paintGuardian(ctx, size, genesis, placements.map((planet) => ({ x: planet.x, y: planet.y, radius: planet.radius * (planet.id === "saturn" ? 1.55 : 1) })));
  const depthOrder: CosmicPlanetId[] = ["mercury", "uranus", "neptune", "venus", "mars", "saturn", "jupiter", "earth"];
  depthOrder.forEach((id) => {
    const planet = placements.find((candidate) => candidate.id === id);
    if (planet) paintPlanet(ctx, assets?.planets[id], planet, planet.radius, id, size);
  });
  const light = ctx.createRadialGradient(-size * .04, -size * .02, 0, -size * .04, -size * .02, size * .5);
  light.addColorStop(0, "#fff8d499"); light.addColorStop(.16, "#ffd69124"); light.addColorStop(1, "#ffd69100");
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.fillStyle = light; ctx.fillRect(0, 0, size * .55, size * .55); ctx.restore();
}

export default function CosmicGenesisCanvas({ genesis, colors, language, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null); const images = useRef<ArtAssets | null>(null);
  const colorKey = colors.join(",");
  const stableColors = useMemo(() => colorKey.split(","), [colorKey]);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const art = images.current ?? await loadArt(); await paintCosmicGenesis(out, genesis, stableColors, art);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [genesis, stableColors]);
  useEffect(() => {
    let active = true;
    if (ref.current) void paintCosmicGenesis(ref.current, genesis, stableColors, null);
    void loadArt().then((art) => { if (!active) return; images.current = art; if (ref.current) void paintCosmicGenesis(ref.current, genesis, stableColors, art); onCapture(capture); });
    return () => { active = false; onCapture(null); };
  }, [genesis, stableColors, capture, onCapture]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "出生瞬間の太陽中心惑星配置を描いた出生宇宙創生図" : "Natal Cosmic Genesis based on heliocentric planetary positions"} data-cosmic-genesis data-renderer="depth-staged-celestial-portrait" data-birth-color-role="nebula-light-only" data-guide-spokes="0" data-planet-count={genesis.planets.length} className="block h-full w-full object-contain" />;
}