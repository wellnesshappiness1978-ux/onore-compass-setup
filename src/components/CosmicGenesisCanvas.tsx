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
import { COSMIC_GUARDIANS, cosmicBirthplaceLight, cosmicColorRoles, cosmicEarthPortrait, cosmicPlacements, cosmicSunPlacement } from "@/lib/cosmic-art";
import type { CosmicGenesis, CosmicPlanetId, EarthView } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import type { Capture } from "./MandalaCanvas";

type Props = { genesis: CosmicGenesis; earthView: EarthView; colors: string[]; language: Language; birthPlace: string; onCapture: (capture: Capture | null) => void };
type Point = { x: number; y: number };
type ArtAssets = { field: HTMLImageElement | null; sun: HTMLImageElement | null; earthMap: HTMLImageElement | null; planets: Partial<Record<CosmicPlanetId, HTMLImageElement>> };
type ProjectedEarth = { image: HTMLCanvasElement; birthplace: Point };

const PLANET_SOURCES: Partial<Record<CosmicPlanetId, string>> = { mercury, venus, mars, jupiter, saturn, uranus, neptune };
const GOLD = "#eedb9a";
const PLATINUM = "#e8f2ef";
const VOID = "#01030a";
const PLANET_LABELS: Record<Language, string[]> = {
  ja: ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
  en: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
  "zh-CN": ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
  "zh-TW": ["水星", "金星", "地球", "火星", "木星", "土星", "天王星", "海王星"],
  ko: ["수성", "금성", "지구", "화성", "목성", "토성", "천왕성", "해왕성"],
  es: ["Mercurio", "Venus", "Tierra", "Marte", "Júpiter", "Saturno", "Urano", "Neptuno"],
  fr: ["Mercure", "Vénus", "Terre", "Mars", "Jupiter", "Saturne", "Uranus", "Neptune"],
};

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

function irregularGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number, seed: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  for (let layer = 5; layer >= 0; layer--) {
    const r = radius * (.34 + layer * .14);
    const gradient = ctx.createRadialGradient(x + (unit(seed + layer) - .5) * r * .12, y + (unit(seed + layer + 8) - .5) * r * .12, 0, x, y, r);
    gradient.addColorStop(0, `${color}9c`);
    gradient.addColorStop(.28, `${color}45`);
    gradient.addColorStop(.72, `${color}12`);
    gradient.addColorStop(1, `${color}00`);
    ctx.globalAlpha = alpha * (.28 + (5 - layer) * .08);
    ctx.fillStyle = gradient;
    ctx.save(); ctx.translate(x, y); ctx.rotate(unit(seed + layer * 17) * Math.PI); ctx.scale(1.05 + unit(seed + layer * 31) * .65, .7 + unit(seed + layer * 41) * .36);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

function paintDeepSpace(ctx: CanvasRenderingContext2D, size: number, image: HTMLImageElement | null, seed: number) {
  ctx.fillStyle = VOID; ctx.fillRect(0, 0, size, size);
  if (image) { ctx.save(); ctx.globalAlpha = .82; ctx.drawImage(image, 0, 0, size, size); ctx.restore(); }
  const depth = ctx.createRadialGradient(size * .48, size * .45, size * .06, size * .5, size * .48, size * .76);
  depth.addColorStop(0, "rgba(2,18,38,.08)"); depth.addColorStop(.55, "rgba(1,6,18,.12)"); depth.addColorStop(1, "rgba(0,1,7,.82)");
  ctx.fillStyle = depth; ctx.fillRect(0, 0, size, size);
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (let star = 0; star < 420; star++) {
    const salt = seed + star * 43, x = unit(salt) * size, y = unit(salt + 5) * size;
    const radius = size * (.00018 + unit(salt + 11) ** 3 * .00125);
    ctx.fillStyle = star % 13 ? "rgba(221,235,242,.7)" : "rgba(246,218,151,.8)";
    ctx.globalAlpha = .12 + unit(salt + 9) * .56;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function paintNebulae(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number) {
  const roles = [
    { color: colors[0] ?? GOLD, weight: 1, anchor: [.28, .58] },
    { color: colors[5] ?? GOLD, weight: .82, anchor: [.74, .31] },
    { color: colors[4] ?? GOLD, weight: .68, anchor: [.68, .76] },
    { color: colors[3] ?? GOLD, weight: .54, anchor: [.22, .2] },
    { color: colors[2] ?? GOLD, weight: .43, anchor: [.86, .58] },
    { color: colors[1] ?? GOLD, weight: .3, anchor: [.12, .8] },
    { color: colors[6] ?? GOLD, weight: .24, anchor: [.52, .1] },
  ] as const;
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  roles.forEach((role, index) => {
    const [ax, ay] = role.anchor;
    for (let cloud = 0; cloud < 18; cloud++) {
      const salt = seed + index * 977 + cloud * 71;
      const angle = cloud / 18 * Math.PI * 2 + unit(salt) * .35;
      const spread = size * (.035 + Math.sqrt(unit(salt + 4)) * .23);
      const x = size * ax + Math.cos(angle) * spread * 1.65;
      const y = size * ay + Math.sin(angle) * spread;
      irregularGlow(ctx, x, y, size * (.05 + unit(salt + 7) * .105), role.color, role.weight * .38, salt);
    }
    for (let filament = 0; filament < 7; filament++) {
      const salt = seed + index * 733 + filament * 67;
      const offset = (filament - 3) * size * .012;
      ctx.beginPath();
      ctx.moveTo(size * (ax - .34), size * ay + offset);
      ctx.bezierCurveTo(size * (ax - .14), size * (ay - .22 - unit(salt) * .08), size * (ax + .16), size * (ay + .2 + unit(salt + 5) * .08), size * (ax + .38), size * (ay - .04));
      ctx.strokeStyle = role.color; ctx.globalAlpha = role.weight * (.055 + unit(salt + 8) * .045);
      ctx.lineWidth = size * (.00045 + filament * .00018); ctx.shadowColor = role.color; ctx.shadowBlur = size * .018; ctx.stroke();
    }
    for (let mote = 0; mote < 46; mote++) {
      const salt = seed + index * 919 + mote * 37;
      const x = size * ax + (unit(salt) - .5) * size * .55;
      const y = size * ay + (unit(salt + 3) - .5) * size * .34;
      ctx.fillStyle = role.color; ctx.globalAlpha = role.weight * (.12 + unit(salt + 8) * .38);
      ctx.beginPath(); ctx.arc(x, y, size * (.00025 + unit(salt + 13) ** 2 * .0015), 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
}

function constellationPoints(size: number, sign: number, side: -1 | 1) {
  const cx = size * (side < 0 ? .22 : .8), cy = size * (side < 0 ? .24 : .68);
  return Array.from({ length: 12 }, (_, index) => {
    const angle = index * (.54 + sign * .002) + (side < 0 ? .25 : 2.4);
    const radius = size * (.075 + ((index * 23 + sign * 17) % 41) / 390);
    return { x: cx + Math.cos(angle) * radius * 1.5, y: cy + Math.sin(angle) * radius };
  });
}

function paintConstellation(ctx: CanvasRenderingContext2D, size: number, sign: number, side: -1 | 1, seed: number, alpha: number) {
  const points = constellationPoints(size, sign, side);
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  for (let pass = 0; pass < 3; pass++) {
    ctx.strokeStyle = pass === 1 ? PLATINUM : GOLD;
    ctx.globalAlpha = alpha * (.035 + pass * .025); ctx.lineWidth = size * (.0005 + pass * .00045);
    ctx.setLineDash([size * (.006 + pass * .004), size * (.004 + pass * .002)]);
    ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke();
  }
  ctx.setLineDash([]);
  points.forEach((point, index) => {
    irregularGlow(ctx, point.x, point.y, size * (.008 + unit(seed + index) * .008), index % 3 ? GOLD : PLATINUM, alpha * .38, seed + index * 19);
    ctx.fillStyle = index % 3 ? GOLD : PLATINUM; ctx.globalAlpha = alpha * (.28 + unit(seed + index * 3) * .38);
    ctx.beginPath(); ctx.arc(point.x, point.y, size * (.0007 + unit(seed + index) * .0012), 0, Math.PI * 2); ctx.fill();
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

function paintGuardian(ctx: CanvasRenderingContext2D, size: number, genesis: CosmicGenesis) {
  const layer = document.createElement("canvas"); layer.width = size; layer.height = size;
  const art = layer.getContext("2d"); if (!art) return;
  const x = size * .77, y = size * .21, scale = size * .26;
  guardianPath(art, genesis.animal, x, y, scale); art.clip();
  for (let stroke = 0; stroke < 920; stroke++) {
    const salt = genesis.seed + stroke * 61;
    const px = x + (unit(salt) - .5) * scale * 1.55, py = y + (unit(salt + 3) - .5) * scale * 1.55;
    art.strokeStyle = stroke % 9 ? `rgba(219,188,104,${.018 + unit(salt + 7) * .07})` : `rgba(238,242,226,${.025 + unit(salt + 8) * .08})`;
    art.lineWidth = size * (.00025 + unit(salt + 9) * .00065);
    art.beginPath(); art.moveTo(px, py); art.lineTo(px + (unit(salt + 11) - .5) * scale * .08, py + (unit(salt + 13) - .5) * scale * .08); art.stroke();
  }
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .58; ctx.drawImage(layer, 0, 0); ctx.restore();
}

function paintSun(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, point: Point, radius: number, size: number, seed: number) {
  irregularGlow(ctx, point.x, point.y, radius * 2.6, "#ffc95e", .7, seed);
  irregularGlow(ctx, point.x, point.y, radius * 1.55, "#fff0b4", .75, seed + 51);
  if (image) { ctx.save(); ctx.shadowColor = "#ffd372"; ctx.shadowBlur = size * .04; ctx.drawImage(image, point.x - radius, point.y - radius, radius * 2, radius * 2); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  for (let ray = 0; ray < 34; ray++) {
    const angle = ray * Math.PI * 2 / 34 + unit(seed + ray) * .08;
    const inner = radius * (1.03 + unit(seed + ray * 11) * .16), outer = radius * (1.35 + unit(seed + ray * 31) * .85);
    ctx.strokeStyle = ray % 4 ? "#ffd372" : "#fff3c7"; ctx.globalAlpha = .04 + unit(seed + ray * 43) * .09;
    ctx.lineWidth = size * (.00035 + unit(seed + ray * 17) * .0011);
    ctx.beginPath(); ctx.moveTo(point.x + Math.cos(angle) * inner, point.y + Math.sin(angle) * inner); ctx.quadraticCurveTo(point.x + Math.cos(angle + .08) * outer * .78, point.y + Math.sin(angle + .08) * outer * .78, point.x + Math.cos(angle) * outer, point.y + Math.sin(angle) * outer); ctx.stroke();
  }
  ctx.restore();
}

function paintOrbitalField(ctx: CanvasRenderingContext2D, size: number, solar: Point, placements: ReturnType<typeof cosmicPlacements>) {
  ctx.save();
  placements.forEach((planet) => {
    const path = planet.orbitPath;
    if (path.length < 2) return;
    path.forEach((point, index) => {
      const next = path[(index + 1) % path.length];
      if (!next) return;
      ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(next.x, next.y);
      ctx.strokeStyle = planet.id === "earth" ? "rgba(238,219,154,.42)" : "rgba(226,235,236,.16)";
      ctx.lineWidth = size * (planet.id === "earth" ? .00105 : .00052);
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = planet.id === "earth" ? size * .006 : size * .0015;
      ctx.stroke();
    });
    if (planet.id === "earth") {
      ctx.globalAlpha = .35;
      for (let index = 0; index < path.length; index += 5) {
        const point = path[index];
        if (!point) continue;
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(point.x, point.y, size * .00055, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  });
  ctx.restore();
}

function paintEarthCorrespondence(ctx: CanvasRenderingContext2D, orbitalEarth: Point, portrait: Point, orbitalRadius: number, portraitRadius: number, color: string, size: number) {
  const startAngle = Math.atan2(portrait.y - orbitalEarth.y, portrait.x - orbitalEarth.x);
  const start = { x: orbitalEarth.x + Math.cos(startAngle) * orbitalRadius * 1.2, y: orbitalEarth.y + Math.sin(startAngle) * orbitalRadius * 1.2 };
  const endAngle = Math.atan2(orbitalEarth.y - portrait.y, orbitalEarth.x - portrait.x);
  const end = { x: portrait.x + Math.cos(endAngle) * portraitRadius * 1.13, y: portrait.y + Math.sin(endAngle) * portraitRadius * 1.13 };
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  for (let pass = 0; pass < 4; pass++) {
    const bend = (pass - 1.5) * size * .014;
    ctx.beginPath(); ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(start.x + size * .08, start.y + bend, end.x - size * .1, end.y - bend, end.x, end.y);
    ctx.strokeStyle = pass === 2 ? GOLD : color;
    ctx.globalAlpha = pass === 2 ? .2 : .065;
    ctx.lineWidth = size * (.0005 + (pass === 2 ? .001 : .00035));
    ctx.shadowColor = color; ctx.shadowBlur = size * .016; ctx.stroke();
  }
  for (let mote = 0; mote < 34; mote++) {
    const progress = mote / 33;
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress + Math.sin(progress * Math.PI) * size * .014;
    ctx.fillStyle = mote % 5 ? color : GOLD; ctx.globalAlpha = .08 + Math.sin(progress * Math.PI) * .24;
    ctx.beginPath(); ctx.arc(x, y, size * (.0003 + (mote % 4) * .00012), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function paintAstronomyLabels(ctx: CanvasRenderingContext2D, size: number, genesis: CosmicGenesis, placements: ReturnType<typeof cosmicPlacements>, language: Language, birthPlace: string, earthPortrait: ReturnType<typeof cosmicEarthPortrait>) {
  const instant = genesis.instant.replace("T", " ").slice(0, 16) + " UTC";
  ctx.save(); ctx.font = `${Math.max(11, size * .011)}px ui-sans-serif, sans-serif`; ctx.textBaseline = "middle"; ctx.letterSpacing = "0px";
  const labels = placements.map((planet, index) => ({ planet, index })).sort((a, b) => a.planet.y - b.planet.y);
  labels.forEach(({ planet, index }, labelIndex) => {
    const label = `${PLANET_LABELS[language][index] ?? planet.name}  ${planet.longitude.toFixed(1)}° · ${planet.distanceAu.toFixed(2)} AU`;
    const leftLane = labelIndex < 4;
    const laneIndex = leftLane ? labelIndex : labelIndex - 4;
    const labelY = size * (.12 + laneIndex * .038);
    const labelX = size * (leftLane ? .055 : .73);
    const direction = labelX > planet.x ? 1 : -1;
    const edge = planet.x + direction * ((planet.id === "saturn" ? planet.ringOuterRadius : planet.radius) * 1.1 + size * .004);
    ctx.textAlign = "left";
    ctx.strokeStyle = planet.id === "earth" ? "rgba(238,219,154,.42)" : "rgba(226,235,236,.2)";
    ctx.lineWidth = Math.max(1, size * .00055); ctx.beginPath(); ctx.moveTo(edge, planet.y); ctx.lineTo(labelX - size * .01, labelY); ctx.stroke();
    ctx.fillStyle = planet.id === "earth" ? "rgba(244,224,157,.92)" : "rgba(226,235,236,.68)";
    ctx.fillText(label, labelX, labelY);
  });
  ctx.textAlign = "left"; ctx.fillStyle = "rgba(244,224,157,.82)"; ctx.font = `${Math.max(12, size * .013)}px ui-sans-serif, sans-serif`;
  ctx.fillText(instant, size * .055, size * .925);
  ctx.fillStyle = "rgba(226,235,236,.62)"; ctx.font = `${Math.max(10, size * .0105)}px ui-sans-serif, sans-serif`;
  ctx.fillText(`${birthPlace || "—"}  ·  ${genesis.approximate ? "JST 12:00 reference" : "birth-time sky"}`, size * .055, size * .952);
  ctx.textAlign = "right";
  ctx.fillText("CONCEPT DIAGRAM · ANGLE: BIRTH-INSTANT LONGITUDE · ORBIT SPACING: LOG SCALE · PLANET RADIUS: PHYSICAL RATIO · SUN / EARTH DETAIL: SEPARATE SCALE", size * .945, size * .952);
  ctx.textAlign = "center"; ctx.fillStyle = "rgba(244,224,157,.76)"; ctx.font = `${Math.max(9, size * .0095)}px ui-sans-serif, sans-serif`;
  ctx.fillText(language === "ja" ? "出生地球・拡大細部図" : "BIRTH EARTH · ENLARGED DETAIL", earthPortrait.x, earthPortrait.y + earthPortrait.radius * 1.22);
  ctx.restore();
}

function projectEarth(image: HTMLImageElement, radius: number, view: EarthView): ProjectedEarth {
  const diameter = Math.max(2, Math.ceil(radius * 2));
  const map = document.createElement("canvas"); map.width = image.width; map.height = image.height;
  const mapContext = map.getContext("2d", { willReadFrequently: true });
  const globe = document.createElement("canvas"); globe.width = diameter; globe.height = diameter;
  const globeContext = globe.getContext("2d");
  const visibleOffsetX = Math.sin(view.siderealRotation * Math.PI / 180) * .2;
  const visibleOffsetY = Math.max(-.18, Math.min(.18, -view.latitude / 260));
  const birthplace = { x: diameter * (.5 + visibleOffsetX), y: diameter * (.5 + visibleOffsetY) };
  if (!mapContext || !globeContext) return { image: globe, birthplace };
  mapContext.drawImage(image, 0, 0);
  const source = mapContext.getImageData(0, 0, image.width, image.height).data;
  const output = globeContext.createImageData(diameter, diameter), target = output.data;
  const centerLatitude = (view.latitude - visibleOffsetY * 78) * Math.PI / 180;
  const centerLongitude = (view.longitude - visibleOffsetX * 72) * Math.PI / 180;
  const sinLatitude = Math.sin(centerLatitude), cosLatitude = Math.cos(centerLatitude);
  for (let y = 0; y < diameter; y++) for (let x = 0; x < diameter; x++) {
    const nx = (x + .5 - diameter / 2) / (diameter / 2), ny = -(y + .5 - diameter / 2) / (diameter / 2);
    const square = nx * nx + ny * ny; if (square > 1) continue;
    const nz = Math.sqrt(1 - square);
    const sampleLatitude = Math.asin(ny * cosLatitude + nz * sinLatitude);
    const sampleLongitude = centerLongitude + Math.atan2(nx, nz * cosLatitude - ny * sinLatitude);
    const sourceX = Math.min(image.width - 1, Math.max(0, Math.floor((((sampleLongitude / Math.PI + 1) % 2 + 2) % 2) * image.width / 2)));
    const sourceY = Math.min(image.height - 1, Math.max(0, Math.floor((.5 - sampleLatitude / Math.PI) * image.height)));
    const from = (sourceY * image.width + sourceX) * 4, to = (y * diameter + x) * 4;
    target[to] = source[from] ?? 0; target[to + 1] = source[from + 1] ?? 0; target[to + 2] = source[from + 2] ?? 0; target[to + 3] = 255;
  }
  globeContext.putImageData(output, 0, 0);
  return { image: globe, birthplace };
}

function paintBirthplaceRadiance(ctx: CanvasRenderingContext2D, earth: Point, point: Point, radius: number, overallColor: string, seed: number) {
  const light = cosmicBirthplaceLight({ ...earth, radius }, point);
  ctx.save(); ctx.globalCompositeOperation = "screen";
  irregularGlow(ctx, point.x, point.y, radius * .34, overallColor, .92, seed);
  irregularGlow(ctx, point.x, point.y, radius * .16, PLATINUM, .66, seed + 19);
  for (let plume = 0; plume < 7; plume++) {
    const salt = seed + plume * 53;
    const angle = light.plumeAngle + (unit(salt) - .5) * .54;
    const length = radius * (.72 + unit(salt + 5) * .9);
    const bend = (unit(salt + 7) - .5) * .52;
    const controlX = point.x + Math.cos(angle + bend) * length * .52;
    const controlY = point.y + Math.sin(angle + bend) * length * .52;
    const endX = point.x + Math.cos(angle) * length, endY = point.y + Math.sin(angle) * length;
    const width = radius * (.018 + unit(salt + 13) * .04);
    const plumeGradient = ctx.createLinearGradient(point.x, point.y, endX, endY);
    plumeGradient.addColorStop(0, `${overallColor}72`); plumeGradient.addColorStop(.38, `${overallColor}30`); plumeGradient.addColorStop(1, `${overallColor}00`);
    ctx.fillStyle = plumeGradient; ctx.globalAlpha = .12 + unit(salt + 11) * .12; ctx.shadowColor = overallColor; ctx.shadowBlur = radius * .09;
    ctx.beginPath(); ctx.moveTo(point.x - width, point.y);
    ctx.quadraticCurveTo(controlX - width * 2, controlY, endX, endY);
    ctx.quadraticCurveTo(controlX + width * 2, controlY, point.x + width, point.y); ctx.closePath(); ctx.fill();
  }
  for (let mote = 0; mote < 84; mote++) {
    const salt = seed + mote * 47, progress = unit(salt) ** .72;
    const angle = light.plumeAngle + (unit(salt + 3) - .5) * .86;
    const distance = radius * progress * (1.45 + unit(salt + 8) * .45);
    const x = point.x + Math.cos(angle) * distance, y = point.y + Math.sin(angle) * distance;
    ctx.fillStyle = mote % 6 ? overallColor : GOLD; ctx.globalAlpha = .12 + unit(salt + 11) * .48;
    ctx.beginPath(); ctx.arc(x, y, radius * (.002 + unit(salt + 9) ** 2 * .012), 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = PLATINUM; ctx.globalAlpha = .82; ctx.beginPath(); ctx.arc(point.x, point.y, radius * .014, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function paintEarth(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, earth: Point, radius: number, view: EarthView, sunPoint: Point, seed: number, overallColor: string) {
  ctx.save(); ctx.strokeStyle = "rgba(238,219,154,.34)"; ctx.lineWidth = Math.max(1, radius * .009); ctx.setLineDash([radius * .04, radius * .025]);
  ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * 1.09, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  irregularGlow(ctx, earth.x, earth.y, radius * 1.55, "#2c8ec7", .5, seed + 71);
  irregularGlow(ctx, earth.x, earth.y, radius * 1.25, "#54e1d1", .34, seed + 93);
  let birthplace = { x: earth.x, y: earth.y - radius * .12 };
  ctx.save(); ctx.beginPath(); ctx.arc(earth.x, earth.y, radius, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#062b58"; ctx.fillRect(earth.x - radius, earth.y - radius, radius * 2, radius * 2);
  if (image) {
    const projected = projectEarth(image, radius, view);
    ctx.drawImage(projected.image, earth.x - radius, earth.y - radius, radius * 2, radius * 2);
    birthplace = { x: earth.x - radius + projected.birthplace.x, y: earth.y - radius + projected.birthplace.y };
  }
  const hourAngle = view.solarHourAngle * Math.PI / 180;
  const lightX = birthplace.x - Math.sin(hourAngle) * radius * .68;
  const lightY = birthplace.y - Math.abs(Math.sin(hourAngle * .5)) * radius * .08;
  const shade = ctx.createRadialGradient(lightX, lightY, radius * .12, earth.x, earth.y, radius * 1.18);
  shade.addColorStop(0, "rgba(128,235,224,.08)"); shade.addColorStop(.48, "rgba(5,45,76,.06)"); shade.addColorStop(.76, "rgba(1,14,39,.3)"); shade.addColorStop(1, "rgba(0,2,12,.82)");
  ctx.fillStyle = shade; ctx.fillRect(earth.x - radius, earth.y - radius, radius * 2, radius * 2);
  ctx.globalCompositeOperation = "screen";
  for (let stroke = 0; stroke < 180; stroke++) {
    const salt = seed + stroke * 83, angle = unit(salt) * Math.PI * 2, distance = Math.sqrt(unit(salt + 3)) * radius * .88;
    const x = earth.x + Math.cos(angle) * distance, y = earth.y + Math.sin(angle) * distance;
    const color = stroke % 7 ? "rgba(74,199,209,.15)" : "rgba(238,221,159,.2)";
    ctx.strokeStyle = color; ctx.globalAlpha = .22 + unit(salt + 7) * .42; ctx.lineWidth = radius * (.001 + unit(salt + 11) * .004);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle + 1.2) * radius * (.02 + unit(salt + 13) * .06), y + Math.sin(angle + 1.2) * radius * (.02 + unit(salt + 13) * .06)); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(92,234,211,.22)"; ctx.lineWidth = radius * .009; ctx.shadowColor = "rgba(92,234,211,.42)"; ctx.shadowBlur = radius * .09;
  ctx.beginPath(); ctx.ellipse(earth.x, earth.y - radius * .48, radius * .64, radius * .16, -.12, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = "screen";
  const atmosphere = ctx.createRadialGradient(earth.x, earth.y, radius * .72, earth.x, earth.y, radius * 1.17);
  atmosphere.addColorStop(0, "rgba(56,174,205,0)"); atmosphere.addColorStop(.58, "rgba(56,174,205,.03)"); atmosphere.addColorStop(.8, "rgba(84,225,209,.18)"); atmosphere.addColorStop(.91, "rgba(84,225,209,.07)"); atmosphere.addColorStop(1, "rgba(84,225,209,0)");
  ctx.fillStyle = atmosphere; ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * 1.17, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  paintBirthplaceRadiance(ctx, earth, birthplace, radius, overallColor, seed + 5100);
}

function paintPlanet(ctx: CanvasRenderingContext2D, image: HTMLImageElement | undefined, point: Point, radius: number, ringOuterRadius: number, id: CosmicPlanetId, size: number, seed: number, depth: number) {
  if (!image) return;
  const auraColor: Record<CosmicPlanetId, string> = { mercury: "#c7b48d", venus: "#e6b65f", earth: "#65dff2", mars: "#c45a34", jupiter: "#d7b185", saturn: "#d8bf83", uranus: "#8edfe5", neptune: "#3e75e8" };
  irregularGlow(ctx, point.x, point.y, radius * 1.7, auraColor[id], .2 + depth * .12, seed);
  ctx.save(); ctx.globalAlpha = .72 + depth * .28; ctx.shadowColor = auraColor[id]; ctx.shadowBlur = size * (.006 + depth * .006);
  if (id === "saturn") ctx.drawImage(image, point.x - ringOuterRadius, point.y - ringOuterRadius, ringOuterRadius * 2, ringOuterRadius * 2);
  else ctx.drawImage(image, point.x - radius, point.y - radius, radius * 2, radius * 2);
  ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = auraColor[id]; ctx.globalAlpha = .12; ctx.lineWidth = Math.max(1, size * .0007);
  if (id !== "saturn") { ctx.beginPath(); ctx.arc(point.x, point.y, radius * .96, -.8, 2.2); ctx.stroke(); }
  ctx.restore();
}

function paintForegroundDust(ctx: CanvasRenderingContext2D, size: number, seed: number) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (let dust = 0; dust < 72; dust++) {
    const salt = seed + dust * 101, x = unit(salt) * size, y = unit(salt + 4) * size;
    const radius = size * (.0005 + unit(salt + 8) ** 2 * .0024);
    ctx.fillStyle = dust % 5 ? PLATINUM : GOLD; ctx.globalAlpha = .08 + unit(salt + 12) * .28;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = radius * 8;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, earthView: EarthView, colors: string[], language: Language, birthPlace: string, assets?: ArtAssets | null) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, roles = cosmicColorRoles(colors), placements = cosmicPlacements(genesis, size), solar = cosmicSunPlacement(genesis, size);
  paintDeepSpace(ctx, size, assets?.field ?? null, genesis.seed);
  paintNebulae(ctx, size, roles.all, genesis.seed + 1200);
  paintConstellation(ctx, size, genesis.sunSign, -1, genesis.seed, .95);
  paintConstellation(ctx, size, genesis.moonSign, 1, genesis.seed + 900, .52);
  paintGuardian(ctx, size, genesis);
  const orbitalEarth = placements.find((planet) => planet.id === "earth");
  const earth = cosmicEarthPortrait(size);
  paintOrbitalField(ctx, size, solar, placements);
  const surrounding = placements.slice().sort((a, b) => a.depth - b.depth);
  surrounding.filter((planet) => planet.depth < 0).forEach((planet) => paintPlanet(ctx, assets?.planets[planet.id], planet, planet.radius, planet.ringOuterRadius, planet.id, size, genesis.seed + planet.orbitIndex * 73, (planet.depth + 1) / 2));
  paintSun(ctx, assets?.sun ?? null, solar, solar.radius, size, genesis.seed + 8200);
  surrounding.filter((planet) => planet.depth >= 0).forEach((planet) => paintPlanet(ctx, assets?.planets[planet.id], planet, planet.radius, planet.ringOuterRadius, planet.id, size, genesis.seed + planet.orbitIndex * 73, (planet.depth + 1) / 2));
  if (orbitalEarth) paintEarthCorrespondence(ctx, orbitalEarth, earth, orbitalEarth.radius, earth.radius, roles.overall, size);
  paintEarth(ctx, assets?.earthMap ?? null, earth, earth.radius, earthView, solar, genesis.seed, roles.overall);
  paintForegroundDust(ctx, size, genesis.seed + 9700);
  paintAstronomyLabels(ctx, size, genesis, placements, language, birthPlace, earth);
}

export default function CosmicGenesisCanvas({ genesis, earthView, colors, language, birthPlace, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null); const images = useRef<ArtAssets | null>(null);
  const onCaptureRef = useRef(onCapture);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);
  const genesisKey = JSON.stringify(genesis); const stableGenesis = useMemo(() => genesis, [genesisKey]);
  const earthKey = JSON.stringify(earthView); const stableEarthView = useMemo(() => earthView, [earthKey]);
  const colorKey = colors.join(","); const stableColors = useMemo(() => colorKey.split(","), [colorKey]);
  const capture = useCallback(async () => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const art = images.current ?? await loadArt(); await paintCosmicGenesis(out, stableGenesis, stableEarthView, stableColors, language, birthPlace, art);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [stableGenesis, stableEarthView, stableColors, language, birthPlace]);
  useEffect(() => {
    let active = true;
    if (ref.current) void paintCosmicGenesis(ref.current, stableGenesis, stableEarthView, stableColors, language, birthPlace, null);
    void loadArt().then((art) => { if (!active) return; images.current = art; if (ref.current) void paintCosmicGenesis(ref.current, stableGenesis, stableEarthView, stableColors, language, birthPlace, art); onCaptureRef.current(capture); });
    return () => { active = false; onCaptureRef.current(null); };
  }, [stableGenesis, stableEarthView, stableColors, capture, language, birthPlace]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "太陽を中心に登録ユーザーの出生時の惑星配置を示す太陽系概念図と、出生地点が輝く地球拡大細部図" : "Sun-centered conceptual Solar System showing the registered user's birth-instant planet positions and an enlarged birthplace-visible Earth detail"} data-cosmic-genesis data-renderer="birth-instant-solar-system-concept" data-birth-color-role="ranked-nebula-and-atmospheric-birthplace-light" data-guide-spokes="0" data-planet-count={genesis.planets.length} className="block h-full w-full object-contain" />;
}
