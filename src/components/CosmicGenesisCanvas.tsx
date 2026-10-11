import { useCallback, useEffect, useMemo, useRef } from "react";
import cosmicField from "@/assets/cosmic-master-field.jpg";
import sun from "@/assets/cosmic-sun.png";
import earthMap from "@/assets/cosmic-earth-map.jpg";
import mercury from "@/assets/cosmic-mercury.png";
import venus from "@/assets/cosmic-venus.png";
import mars from "@/assets/cosmic-mars.png";
import jupiter from "@/assets/cosmic-jupiter.png";
import saturn from "@/assets/cosmic-saturn.png";
import uranus from "@/assets/cosmic-uranus.png";
import neptune from "@/assets/cosmic-neptune.png";
import { COSMIC_GUARDIANS, cosmicColorRoles, cosmicPlacements } from "@/lib/cosmic-art";
import type { CosmicGenesis, CosmicPlanetId, EarthView } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import type { Capture } from "./MandalaCanvas";

type Props = { genesis: CosmicGenesis; earthView: EarthView; colors: string[]; language: Language; onCapture: (capture: Capture | null) => void };
type Point = { x: number; y: number };
type ArtAssets = { field: HTMLImageElement | null; sun: HTMLImageElement | null; earthMap: HTMLImageElement | null; planets: Partial<Record<CosmicPlanetId, HTMLImageElement>> };

const PLANET_SOURCES: Partial<Record<CosmicPlanetId, string>> = { mercury, venus, mars, jupiter, saturn, uranus, neptune };
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
  const [field, solar, world] = await Promise.all([loadImage(cosmicField), loadImage(sun), loadImage(earthMap)]);
  return { field, sun: solar, earthMap: world, planets };
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(.2, `${color}b8`);
  gradient.addColorStop(.58, `${color}28`);
  gradient.addColorStop(1, `${color}00`);
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = alpha; ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
}

function paintNebulae(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number) {
  const roles = [
    { color: colors[0] ?? GOLD, alpha: .46, y: .56, bend: -.2, clouds: 15 },
    { color: colors[5] ?? GOLD, alpha: .37, y: .7, bend: .16, clouds: 13 },
    { color: colors[4] ?? GOLD, alpha: .3, y: .31, bend: -.13, clouds: 11 },
    { color: colors[3] ?? GOLD, alpha: .24, y: .2, bend: .2, clouds: 9 },
    { color: colors[2] ?? GOLD, alpha: .19, y: .82, bend: -.11, clouds: 8 },
  ];
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  roles.forEach((role, index) => {
    const offset = (unit(seed + index * 91) - .5) * size * .09;
    for (let cloud = 0; cloud < role.clouds; cloud++) {
      const salt = seed + index * 977 + cloud * 71;
      const progress = (cloud + .35 + unit(salt) * .3) / role.clouds;
      const x = progress * size;
      const wave = Math.sin(progress * Math.PI * 2 + role.bend * 7) * size * .1;
      const y = size * role.y + offset + wave + (unit(salt + 3) - .5) * size * .08;
      const radius = size * (.07 + unit(salt + 7) * .08) * (1 - index * .045);
      const haze = ctx.createRadialGradient(x, y, 0, x, y, radius);
      haze.addColorStop(0, `${role.color}34`); haze.addColorStop(.28, `${role.color}22`); haze.addColorStop(.7, `${role.color}0c`); haze.addColorStop(1, `${role.color}00`);
      ctx.save(); ctx.translate(x, y); ctx.rotate(-.42 + role.bend); ctx.scale(1.75, .5);
      ctx.globalAlpha = role.alpha; ctx.fillStyle = haze; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (let filament = 0; filament < 3; filament++) {
      ctx.beginPath();
      const fineOffset = (filament - 1) * size * .01;
      ctx.moveTo(-size * .08, size * role.y + offset + fineOffset);
      ctx.bezierCurveTo(size * .22, size * (role.y + role.bend), size * .7, size * (role.y - role.bend), size * 1.08, size * (role.y + .02));
      ctx.strokeStyle = role.color;
      ctx.globalAlpha = role.alpha * (.16 - filament * .025);
      ctx.lineWidth = size * (.0012 + filament * .0008);
      ctx.shadowColor = role.color; ctx.shadowBlur = size * (.014 + filament * .008); ctx.stroke();
    }
    for (let particle = 0; particle < 42 - index * 5; particle++) {
      const salt = seed + index * 991 + particle * 37;
      const x = unit(salt) * size;
      const y = size * role.y + Math.sin((x / size) * Math.PI * 2 + role.bend * 8) * size * .12 + (unit(salt + 3) - .5) * size * .16;
      const r = size * (.0005 + unit(salt + 9) * .0017);
      ctx.globalAlpha = role.alpha * (.3 + unit(salt + 6) * .7); ctx.fillStyle = role.color;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  });
  [colors[1], colors[6]].forEach((color, index) => {
    if (!color) return;
    glow(ctx, size * (index ? .82 : .16), size * (index ? .18 : .84), size * .2, color, .12);
  });
  ctx.restore();
}

function paintMysticVeils(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (let veil = 0; veil < 9; veil++) {
    const salt = seed + veil * 137;
    const x = size * (.08 + unit(salt) * .84), y = size * (.08 + unit(salt + 3) * .84);
    const radius = size * (.13 + unit(salt + 7) * .17), color = colors[veil % Math.max(colors.length, 1)] ?? GOLD;
    const mist = ctx.createRadialGradient(x, y, 0, x, y, radius);
    mist.addColorStop(0, `${color}20`); mist.addColorStop(.34, `${color}0d`); mist.addColorStop(.75, `${color}05`); mist.addColorStop(1, `${color}00`);
    ctx.save(); ctx.translate(x, y); ctx.rotate(unit(salt + 11) * Math.PI); ctx.scale(1.8, .52);
    ctx.globalAlpha = .24 + unit(salt + 13) * .18; ctx.fillStyle = mist; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  for (let mote = 0; mote < 180; mote++) {
    const salt = seed + mote * 53;
    const x = unit(salt) * size, y = unit(salt + 5) * size, radius = size * (.00018 + unit(salt + 9) * .00072);
    ctx.fillStyle = mote % 5 ? GOLD : (colors[mote % Math.max(colors.length, 1)] ?? GOLD);
    ctx.globalAlpha = .08 + unit(salt + 12) * .22; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = radius * 8;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function constellationPoints(size: number, sign: number, side: -1 | 1) {
  const cx = size * (side < 0 ? .23 : .79), cy = size * (side < 0 ? .22 : .77);
  return Array.from({ length: 11 }, (_, index) => {
    const angle = index * (.57 + sign * .002) + (side < 0 ? .25 : 2.5);
    const radius = size * (.07 + ((index * 23 + sign * 17) % 41) / 450);
    return { x: cx + Math.cos(angle) * radius * 1.55, y: cy + Math.sin(angle) * radius };
  });
}

function paintConstellation(ctx: CanvasRenderingContext2D, size: number, sign: number, side: -1 | 1, seed: number, alpha: number) {
  const points = constellationPoints(size, sign, side);
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  ctx.strokeStyle = GOLD; ctx.globalAlpha = alpha * .22; ctx.lineWidth = size * .00065;
  ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke();
  points.forEach((point, index) => {
    const radius = size * (.001 + unit(seed + sign * 71 + index) * .0016);
    glow(ctx, point.x, point.y, radius * 11, GOLD, alpha * .4);
    ctx.fillStyle = GOLD; ctx.globalAlpha = alpha * (.35 + unit(seed + index) * .45);
    ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fill();
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
  const x = size * .78, y = size * .2, scale = size * .25;
  guardianPath(art, genesis.animal, x, y, scale); art.clip();
  for (let i = 0; i < 760; i++) {
    const salt = genesis.seed + i * 61;
    const px = x + (unit(salt) - .5) * scale * 1.55, py = y + (unit(salt + 3) - .5) * scale * 1.55;
    const alpha = .018 + unit(salt + 7) * .065;
    art.fillStyle = i % 8 ? `rgba(219,188,104,${alpha})` : `rgba(255,240,190,${alpha * 1.35})`;
    art.beginPath(); art.arc(px, py, size * (.0003 + unit(salt + 9) * .0007), 0, Math.PI * 2); art.fill();
  }
  art.globalCompositeOperation = "destination-out";
  exclusions.forEach((planet) => { art.beginPath(); art.arc(planet.x, planet.y, planet.radius * 1.35, 0, Math.PI * 2); art.fill(); });
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .62; ctx.drawImage(layer, 0, 0); ctx.restore();
}

function paintOrbits(ctx: CanvasRenderingContext2D, size: number, placements: ReturnType<typeof cosmicPlacements>) {
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = GOLD; ctx.lineCap = "round";
  placements.forEach((planet, index) => {
    ctx.globalAlpha = .018 + index * .002; ctx.lineWidth = size * .00055;
    ctx.beginPath(); ctx.ellipse(size * .5, size * .475, planet.orbitRadius, planet.orbitRadius * .66, 0, Math.PI * .08, Math.PI * 1.7); ctx.stroke();
  });
  ctx.restore();
}

function paintSun(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, size: number) {
  const x = size * .5, y = size * .475, radius = size * .12;
  glow(ctx, x, y, radius * 2.4, "#ffc95e", .44);
  glow(ctx, x, y, radius * 1.55, "#fff2bd", .65);
  if (image) {
    ctx.save(); ctx.shadowColor = "#ffd372"; ctx.shadowBlur = size * .055;
    ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2); ctx.restore();
  }
}

function projectEarth(image: HTMLImageElement, radius: number, view: EarthView) {
  const diameter = Math.max(2, Math.ceil(radius * 2));
  const map = document.createElement("canvas"); map.width = image.width; map.height = image.height;
  const mapContext = map.getContext("2d", { willReadFrequently: true });
  const globe = document.createElement("canvas"); globe.width = diameter; globe.height = diameter;
  const globeContext = globe.getContext("2d");
  if (!mapContext || !globeContext) return globe;
  mapContext.drawImage(image, 0, 0);
  const source = mapContext.getImageData(0, 0, image.width, image.height).data;
  const output = globeContext.createImageData(diameter, diameter), target = output.data;
  const latitude = view.latitude * Math.PI / 180, longitude = view.longitude * Math.PI / 180;
  const sinLatitude = Math.sin(latitude), cosLatitude = Math.cos(latitude);
  for (let y = 0; y < diameter; y++) for (let x = 0; x < diameter; x++) {
    const nx = (x + .5 - diameter / 2) / (diameter / 2), ny = -(y + .5 - diameter / 2) / (diameter / 2);
    const square = nx * nx + ny * ny; if (square > 1) continue;
    const nz = Math.sqrt(1 - square);
    const sampleLatitude = Math.asin(ny * cosLatitude + nz * sinLatitude);
    const sampleLongitude = longitude + Math.atan2(nx, nz * cosLatitude - ny * sinLatitude);
    const sourceX = Math.min(image.width - 1, Math.max(0, Math.floor((((sampleLongitude / Math.PI + 1) % 2 + 2) % 2) * image.width / 2)));
    const sourceY = Math.min(image.height - 1, Math.max(0, Math.floor((.5 - sampleLatitude / Math.PI) * image.height)));
    const from = (sourceY * image.width + sourceX) * 4, to = (y * diameter + x) * 4;
    target[to] = source[from] ?? 0; target[to + 1] = source[from + 1] ?? 0; target[to + 2] = source[from + 2] ?? 0; target[to + 3] = 255;
  }
  globeContext.putImageData(output, 0, 0); return globe;
}

function paintEarth(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, point: Point, radius: number, view: EarthView, size: number, seed: number) {
  glow(ctx, point.x, point.y, radius * 2.05, "#2c8ec7", .27);
  glow(ctx, point.x, point.y, radius * 1.52, "#54e1d1", .24);
  ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#062b58"; ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
  if (image) ctx.drawImage(projectEarth(image, radius, view), point.x - radius, point.y - radius, radius * 2, radius * 2);
  const lightOffset = Math.sin(view.solarHourAngle * Math.PI / 180) * radius * .5;
  const shade = ctx.createRadialGradient(point.x + lightOffset, point.y - radius * .12, radius * .18, point.x, point.y, radius * 1.12);
  shade.addColorStop(0, "rgba(18,80,105,.03)"); shade.addColorStop(.56, "rgba(1,15,38,.12)"); shade.addColorStop(1, "rgba(0,2,12,.7)");
  ctx.fillStyle = shade; ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
  ctx.globalCompositeOperation = "screen";
  for (let light = 0; light < 42; light++) {
    const salt = seed + light * 83, angle = unit(salt) * Math.PI * 2, distance = Math.sqrt(unit(salt + 3)) * radius * .72;
    const x = point.x + Math.cos(angle) * distance, y = point.y + Math.sin(angle) * distance;
    ctx.fillStyle = light % 4 ? "rgba(128,218,225,.22)" : "rgba(255,224,151,.26)";
    ctx.beginPath(); ctx.arc(x, y, radius * (.002 + unit(salt + 7) * .006), 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(92,234,211,.2)"; ctx.lineWidth = radius * .012; ctx.shadowColor = "rgba(92,234,211,.38)"; ctx.shadowBlur = radius * .1;
  ctx.beginPath(); ctx.ellipse(point.x, point.y - radius * .48, radius * .62, radius * .16, -.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = "screen";
  const atmosphere = ctx.createRadialGradient(point.x, point.y, radius * .72, point.x, point.y, radius * 1.24);
  atmosphere.addColorStop(0, "rgba(56,174,205,0)"); atmosphere.addColorStop(.58, "rgba(56,174,205,.04)");
  atmosphere.addColorStop(.79, "rgba(84,225,209,.17)"); atmosphere.addColorStop(.9, "rgba(84,225,209,.07)"); atmosphere.addColorStop(1, "rgba(84,225,209,0)");
  ctx.fillStyle = atmosphere; ctx.beginPath(); ctx.arc(point.x, point.y, radius * 1.24, 0, Math.PI * 2); ctx.fill();
  glow(ctx, point.x, point.y, radius * .11, "#fff0b3", .48); ctx.restore();
}

function paintPlanet(ctx: CanvasRenderingContext2D, image: HTMLImageElement | undefined, point: Point, radius: number, id: CosmicPlanetId, size: number) {
  if (!image) return;
  const auraColor: Record<CosmicPlanetId, string> = { mercury: "#c7b48d", venus: "#e6b65f", earth: "#65dff2", mars: "#c45a34", jupiter: "#d7b185", saturn: "#d8bf83", uranus: "#8edfe5", neptune: "#3e75e8" };
  const aura = auraColor[id]; glow(ctx, point.x, point.y, radius * 1.52, aura, .18);
  ctx.save(); ctx.shadowColor = aura; ctx.shadowBlur = size * .009;
  if (id === "saturn") ctx.drawImage(image, point.x - radius * 1.8, point.y - radius * 1.8, radius * 3.6, radius * 3.6);
  else ctx.drawImage(image, point.x - radius, point.y - radius, radius * 2, radius * 2);
  ctx.restore();
}

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, earthView: EarthView, colors: string[], assets?: ArtAssets | null) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, roles = cosmicColorRoles(colors), placements = cosmicPlacements(genesis, size);
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (assets?.field) ctx.drawImage(assets.field, 0, 0, size, size);
  else { glow(ctx, size * .15, size * .15, size * .42, "#164f8e", .35); glow(ctx, size * .8, size * .78, size * .34, "#713b72", .2); }
  const vignette = ctx.createRadialGradient(size * .5, size * .48, size * .12, size * .5, size * .5, size * .72);
  vignette.addColorStop(0, "#00000000"); vignette.addColorStop(.72, "#00000012"); vignette.addColorStop(1, "#000000c8"); ctx.fillStyle = vignette; ctx.fillRect(0, 0, size, size);
  paintNebulae(ctx, size, roles.all, genesis.seed);
  paintMysticVeils(ctx, size, roles.prominence, genesis.seed + 2400);
  paintConstellation(ctx, size, genesis.sunSign, -1, genesis.seed, .8);
  paintConstellation(ctx, size, genesis.moonSign, 1, genesis.seed + 900, .32);
  paintGuardian(ctx, size, genesis, placements.map((planet) => ({ x: planet.x, y: planet.y, radius: planet.radius * (planet.id === "saturn" ? 2 : 1.15) })));
  paintOrbits(ctx, size, placements);
  const earth = placements.find((planet) => planet.id === "earth");
  const rearOrder: CosmicPlanetId[] = ["neptune", "uranus", "saturn", "jupiter", "mars", "venus", "mercury"];
  rearOrder.forEach((id) => { const planet = placements.find((candidate) => candidate.id === id); if (planet) paintPlanet(ctx, assets?.planets[id], planet, planet.radius, id, size); });
  paintSun(ctx, assets?.sun ?? null, size);
  if (earth) paintEarth(ctx, assets?.earthMap ?? null, earth, earth.radius, earthView, size, genesis.seed);
}

export default function CosmicGenesisCanvas({ genesis, earthView, colors, language, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null); const images = useRef<ArtAssets | null>(null);
  const onCaptureRef = useRef(onCapture);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);
  const genesisKey = JSON.stringify(genesis);
  const stableGenesis = useMemo(() => genesis, [genesisKey]);
  const earthKey = JSON.stringify(earthView);
  const stableEarthView = useMemo(() => earthView, [earthKey]);
  const colorKey = colors.join(",");
  const stableColors = useMemo(() => colorKey.split(","), [colorKey]);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const art = images.current ?? await loadArt(); await paintCosmicGenesis(out, stableGenesis, stableEarthView, stableColors, art);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [stableGenesis, stableEarthView, stableColors]);
  useEffect(() => {
    let active = true;
    if (ref.current) void paintCosmicGenesis(ref.current, stableGenesis, stableEarthView, stableColors, null);
    void loadArt().then((art) => { if (!active) return; images.current = art; if (ref.current) void paintCosmicGenesis(ref.current, stableGenesis, stableEarthView, stableColors, art); onCaptureRef.current(capture); });
    return () => { active = false; onCaptureRef.current(null); };
  }, [stableGenesis, stableEarthView, stableColors, capture]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "中央の太陽と出生瞬間の8惑星、出生地を向く地球を描いた出生宇宙創生図" : "Natal Cosmic Genesis with a central Sun, eight birth-position planets, and birthplace-facing Earth"} data-cosmic-genesis data-renderer="sun-centered-birthplace-earth" data-birth-color-role="ranked-nebula-light-only" data-guide-spokes="0" data-planet-count={genesis.planets.length} className="block h-full w-full object-contain" />;
}