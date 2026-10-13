import { useCallback, useEffect, useMemo, useRef } from "react";
import sun from "@/assets/cosmic-sun.png";
import earthMap from "@/assets/cosmic-earth-map.jpg";
import mercury from "@/assets/cosmic-mercury.png";
import venus from "@/assets/cosmic-venus.png";
import mars from "@/assets/cosmic-mars.png";
import jupiter from "@/assets/cosmic-jupiter.png";
import saturn from "@/assets/cosmic-saturn.png";
import uranus from "@/assets/cosmic-uranus.png";
import neptune from "@/assets/cosmic-neptune.png";
import { COSMIC_GUARDIANS, cosmicAstrolabeFrame, cosmicBirthplaceLight, cosmicColorRoles, cosmicCompassIdentity, cosmicEarthPortrait, cosmicMoonPlacement, cosmicPlacements, cosmicSizeComparison, cosmicSunPlacement, type CosmicMoonPlacement } from "@/lib/cosmic-art";
import type { CosmicGenesis, CosmicPlanetId, EarthView } from "@/lib/cosmic-astronomy";
import type { Language } from "@/lib/translations";
import { goldenShellRadius, paintEngravedRing, paintNautilusPartitions } from "@/lib/art-craft";
import type { Capture } from "./MandalaCanvas";
import { cosmicTextPalette, paintCosmicText } from "@/lib/cosmic-typography";
import { COSMIC_NEBULA_WEIGHTS, deepNebulaPixels, paintLunarHalo, paintLunarSurface, paintWideSolarRays } from "@/lib/cosmic-optics";
import { paintFantasyDepth } from "@/lib/cosmic-fantasy";

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
const SUN_LABELS: Record<Language, string> = { ja: "太陽", en: "Sun", "zh-CN": "太阳", "zh-TW": "太陽", ko: "태양", es: "Sol", fr: "Soleil" };
const MOON_LABELS: Record<Language, string> = { ja: "出生月", en: "Birth Moon", "zh-CN": "出生月亮", "zh-TW": "出生月亮", ko: "출생 달", es: "Luna natal", fr: "Lune natale" };
const SCIENCE_COPY: Record<Language, { placement: string; size: string; earth: string; reference: string }> = {
  ja: { placement: "出生瞬間の太陽中心配置｜角度＝太陽中心黄経｜軌道間隔＝代表距離の対数縮尺｜天体径＝視認用", size: "太陽・8惑星 実半径比｜同一線形縮尺", earth: "出生地球｜別縮尺の拡大細部図", reference: "時刻不明：JST正午の参考配置" },
  en: { placement: "BIRTH-INSTANT HELIOCENTRIC PLACEMENT · ANGLES: LONGITUDE · ORBITS: LOG SCALE · BODIES: VISIBILITY SCALE", size: "SUN + 8 PLANETS · TRUE RADII · ONE LINEAR SCALE", earth: "BIRTH EARTH · ENLARGED DETAIL", reference: "UNKNOWN TIME · JST NOON REFERENCE" },
  "zh-CN": { placement: "出生瞬间日心配置｜角度＝日心经度｜轨道＝对数缩尺｜天体＝可视缩尺", size: "太阳与八大行星｜真实半径｜同一线性缩尺", earth: "出生地球｜独立缩尺细节", reference: "时间未知：JST正午参考" },
  "zh-TW": { placement: "出生瞬間日心配置｜角度＝日心黃經｜軌道＝對數縮尺｜天體＝可視縮尺", size: "太陽與八大行星｜真實半徑｜同一線性縮尺", earth: "出生地球｜獨立縮尺細節", reference: "時間未知：JST正午參考" },
  ko: { placement: "출생 순간 태양 중심 배치｜각도＝황경｜궤도＝로그 축척｜천체＝가시 축척", size: "태양과 8행성｜실제 반지름｜동일 선형 축척", earth: "출생 지구｜별도 축척 상세", reference: "시간 미상: JST 정오 기준" },
  es: { placement: "POSICIÓN HELIOCÉNTRICA NATAL · ÁNGULOS: LONGITUD · ÓRBITAS: ESCALA LOG · CUERPOS: ESCALA VISIBLE", size: "SOL + 8 PLANETAS · RADIOS REALES · UNA ESCALA LINEAL", earth: "TIERRA NATAL · DETALLE AMPLIADO", reference: "HORA DESCONOCIDA · REFERENCIA MEDIODÍA JST" },
  fr: { placement: "POSITION HÉLIOCENTRIQUE NATALE · ANGLES : LONGITUDE · ORBITES : ÉCHELLE LOG · ASTRES : ÉCHELLE VISIBLE", size: "SOLEIL + 8 PLANÈTES · RAYONS RÉELS · MÊME ÉCHELLE LINÉAIRE", earth: "TERRE NATALE · DÉTAIL AGRANDI", reference: "HEURE INCONNUE · MIDI JST DE RÉFÉRENCE" },
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
  const [solar, world] = await Promise.all([loadImage(sun), loadImage(earthMap)]);
  return { field: null, sun: solar, earthMap: world, planets };
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

function paintDeepSpace(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number) {
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cosmic-space-ink').trim(); ctx.fillRect(0, 0, size, size);
  // Transparent gas islands preserve source Hex values; no full-canvas color ramp.
  const layer = document.createElement('canvas'); layer.width = 320; layer.height = 320;
  const art = layer.getContext('2d');
  if (art) {
    const pixels = art.createImageData(320, 320);
    pixels.data.set(deepNebulaPixels(cosmicColorRoles(colors).prominence, seed, 320));
    art.putImageData(pixels, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(layer, 0, 0, size, size); ctx.restore();
  }
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
    { color: colors[0] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[0], anchor: [.28, .58] },
    { color: colors[5] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[1], anchor: [.74, .31] },
    { color: colors[4] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[2], anchor: [.68, .76] },
    { color: colors[3] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[3], anchor: [.22, .2] },
    { color: colors[2] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[4], anchor: [.86, .58] },
    { color: colors[1] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[5], anchor: [.12, .8] },
    { color: colors[6] ?? GOLD, weight: COSMIC_NEBULA_WEIGHTS[6], anchor: [.52, .1] },
  ] as const;
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  roles.forEach((role, index) => {
    const [ax, ay] = role.anchor;
    for (let cloud = 0; cloud < Math.round(5 + role.weight * 5); cloud++) {
      const salt = seed + index * 977 + cloud * 71;
      const angle = cloud / 18 * Math.PI * 2 + unit(salt) * .35;
      const spread = size * (.035 + Math.sqrt(unit(salt + 4)) * .23);
      const x = size * ax + Math.cos(angle) * spread * 1.65;
      const y = size * ay + Math.sin(angle) * spread;
      irregularGlow(ctx, x, y, size * (.035 + unit(salt + 7) * .065), role.color, .22 + role.weight * .23, salt);
    }
    for (let filament = 0; filament < 7; filament++) {
      const salt = seed + index * 733 + filament * 67;
      const offset = (filament - 3) * size * .012;
      ctx.beginPath();
      ctx.moveTo(size * (ax - .34), size * ay + offset);
      ctx.bezierCurveTo(size * (ax - .14), size * (ay - .22 - unit(salt) * .08), size * (ax + .16), size * (ay + .2 + unit(salt + 5) * .08), size * (ax + .38), size * (ay - .04));
      ctx.strokeStyle = role.color; ctx.globalAlpha = role.weight * (.09 + unit(salt + 8) * .08);
      ctx.lineWidth = size * (.00045 + filament * .00018); ctx.shadowColor = role.color; ctx.shadowBlur = size * .005; ctx.stroke();
    }
    for (let mote = 0; mote < 72; mote++) {
      const salt = seed + index * 919 + mote * 37;
      const angle = mote / 72 * Math.PI * 2;
      const remnant = size * (.018 + unit(salt + 3) * .009);
      const x = size * ax + Math.cos(angle) * remnant * 1.618;
      const y = size * ay + Math.sin(angle) * remnant;
      ctx.fillStyle = role.color; ctx.globalAlpha = role.weight * (.1 + unit(salt + 8) * .22);
      ctx.beginPath(); ctx.arc(x, y, size * (.00025 + unit(salt + 13) ** 2 * .0015), 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
}

function paintStarLifeVeils(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number, earthAngle: number) {
  const centerX = size * .5, centerY = size * .47;
  const mainAngle = earthAngle * Math.PI / 180;
  // One almost imperceptible Overall filament replaces the seven rainbow spiral arms.
  // Overall-color main vein ends at the actual orbital Earth, not on a decorative spiral.
  const earthRadius = size * .423 * .376;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let thread = 0; thread < 12; thread++) {
    const offset = (thread - 5.5) * size * .0007;
    ctx.beginPath();
    for (let step = 0; step <= 64; step++) {
      const t = step / 64, along = t * earthRadius;
      const across = Math.sin(t * Math.PI) * (offset + Math.sin(t * 12 + thread * .7) * size * .0017);
      const x = centerX + Math.cos(mainAngle) * along - Math.sin(mainAngle) * across;
      const y = centerY + Math.sin(mainAngle) * along + Math.cos(mainAngle) * across;
      if (step) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = colors[0] ?? GOLD; ctx.globalAlpha = .085; ctx.lineWidth = size * .00045;
    ctx.shadowColor = colors[0] ?? GOLD; ctx.shadowBlur = size * .004; ctx.stroke();
  }
  ctx.restore();
}

function paintCompassInlay(ctx: CanvasRenderingContext2D, size: number) {
  const centerX = size * .5, centerY = size * .47;
  ctx.save(); ctx.translate(centerX, centerY);
  for (let direction = 0; direction < 8; direction++) {
    const angle = direction * Math.PI / 4 - Math.PI / 2;
    const cardinal = direction % 2 === 0;
    const inner = size * .105, outer = size * (cardinal ? .435 : .423);
    const wing = cardinal ? .0082 : .0048;
    ctx.save(); ctx.rotate(angle);
    const gradient = ctx.createLinearGradient(inner, 0, outer, 0);
    gradient.addColorStop(0, "rgba(36,20,11,0)"); gradient.addColorStop(.52, cardinal ? "rgba(112,68,30,.2)" : "rgba(48,61,61,.11)"); gradient.addColorStop(.83, cardinal ? "rgba(238,204,115,.38)" : "rgba(223,235,225,.22)"); gradient.addColorStop(1, "rgba(255,238,178,.66)");
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.moveTo(inner, 0); ctx.lineTo(outer - size * .018, -size * wing); ctx.lineTo(outer, 0); ctx.lineTo(outer - size * .018, size * wing); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = cardinal ? "rgba(255,232,157,.42)" : "rgba(232,242,239,.24)"; ctx.lineWidth = Math.max(.6, size * (cardinal ? .0007 : .00042));
    ctx.shadowColor = cardinal ? GOLD : PLATINUM; ctx.shadowBlur = size * (cardinal ? .005 : .002);
    ctx.beginPath(); ctx.moveTo(inner, 0); ctx.lineTo(outer, 0); ctx.stroke();
    ctx.strokeStyle = "rgba(49,27,14,.75)"; ctx.lineWidth = Math.max(.5, size * .00045);
    ctx.beginPath(); ctx.moveTo(inner + size * .02, -size * wing * .25); ctx.lineTo(outer - size * .023, -size * wing * .55); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

function metalGradient(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, alpha = 1) {
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(0, `rgba(58,31,15,${.94 * alpha})`);
  gradient.addColorStop(.14, `rgba(128,76,31,${.96 * alpha})`);
  gradient.addColorStop(.34, `rgba(242,214,139,${.98 * alpha})`);
  gradient.addColorStop(.48, `rgba(154,94,38,${.98 * alpha})`);
  gradient.addColorStop(.68, `rgba(249,224,150,${.96 * alpha})`);
  gradient.addColorStop(.84, `rgba(102,57,25,${.97 * alpha})`);
  gradient.addColorStop(1, `rgba(38,21,12,${.96 * alpha})`);
  return gradient;
}

function paintAstrolabeFrame(ctx: CanvasRenderingContext2D, size: number, seed: number, colors: string[], genesis: CosmicGenesis) {
  const frame = cosmicAstrolabeFrame(size);
  const identity = cosmicCompassIdentity(genesis);
  ctx.save(); ctx.translate(frame.x, frame.y);
  ctx.fillStyle = metalGradient(ctx, -frame.outerRadius, -frame.outerRadius, frame.outerRadius, frame.outerRadius);
  ctx.beginPath(); ctx.arc(0, 0, frame.outerRadius, 0, Math.PI * 2); ctx.arc(0, 0, frame.innerRadius, 0, Math.PI * 2, true); ctx.fill("evenodd");
  const bandMid = (frame.innerRadius + frame.outerRadius) / 2;
  const bandWidth = frame.outerRadius - frame.innerRadius;
  const relief = ctx.createRadialGradient(0, 0, frame.innerRadius, 0, 0, frame.outerRadius);
  relief.addColorStop(0, "rgba(20,10,6,.92)"); relief.addColorStop(.13, "rgba(255,235,167,.9)"); relief.addColorStop(.31, "rgba(91,48,22,.96)"); relief.addColorStop(.54, "rgba(232,185,91,.92)"); relief.addColorStop(.73, "rgba(70,34,16,.98)"); relief.addColorStop(.9, "rgba(255,225,143,.9)"); relief.addColorStop(1, "rgba(29,14,8,.98)");
  ctx.globalAlpha = .72; ctx.fillStyle = relief; ctx.beginPath(); ctx.arc(0, 0, frame.outerRadius, 0, Math.PI * 2); ctx.arc(0, 0, frame.innerRadius, 0, Math.PI * 2, true); ctx.fill("evenodd"); ctx.globalAlpha = 1;
  ctx.save(); ctx.globalCompositeOperation = "screen";
  [frame.innerRadius + size * .004, frame.outerRadius - size * .004].forEach((radius, index) => {
    ctx.strokeStyle = index ? "rgba(255,224,132,.94)" : "rgba(255,244,204,.78)";
    ctx.shadowColor = index ? GOLD : PLATINUM; ctx.shadowBlur = size * .008;
    ctx.lineWidth = size * (index ? .0031 : .0024); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
  });
  ctx.restore();
  [frame.innerRadius, (frame.innerRadius + frame.outerRadius) / 2, frame.outerRadius].forEach((radius, index) => {
    ctx.strokeStyle = index === 1 ? "rgba(63,34,17,.9)" : "rgba(252,229,159,.8)";
    ctx.lineWidth = Math.max(1, size * (index === 1 ? .0012 : .0018)); ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
  });
  for (let rail = 0; rail < 5; rail++) {
    const radius = frame.innerRadius + bandWidth * (.09 + rail * .205);
    ctx.strokeStyle = rail % 2 ? "rgba(52,27,14,.9)" : "rgba(255,225,145,.62)";
    ctx.lineWidth = Math.max(.8, size * (rail % 2 ? .00145 : .00072));
    ctx.shadowColor = rail % 2 ? "rgba(0,0,0,.8)" : GOLD; ctx.shadowBlur = rail % 2 ? size * .001 : size * .0028;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, frame.outerRadius - size * .001, 0, Math.PI * 2); ctx.arc(0, 0, frame.innerRadius + size * .001, 0, Math.PI * 2, true); ctx.clip("evenodd");
  ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let braid = 0; braid < 144; braid++) {
    const angle = braid / 144 * Math.PI * 2;
    const radius = (frame.innerRadius + frame.outerRadius) / 2;
    const wave = Math.sin(braid * Math.PI / 2) * size * .0035;
    const x = Math.cos(angle) * (radius + wave), y = Math.sin(angle) * (radius + wave);
    ctx.fillStyle = braid % 2 ? GOLD : PLATINUM; ctx.globalAlpha = braid % 6 === 0 ? .48 : .18;
    ctx.beginPath(); ctx.ellipse(x, y, size * .0017, size * .00062, angle + Math.PI / 2, 0, Math.PI * 2); ctx.fill();
  }
  for (let granule = 0; granule < 216; granule++) {
    const angle = granule / 216 * Math.PI * 2;
    const radius = bandMid + Math.sin(granule * 1.7) * bandWidth * .13;
    const bright = granule % 9 === 0;
    ctx.fillStyle = bright ? "rgba(255,241,190,.96)" : "rgba(160,99,38,.82)";
    ctx.globalAlpha = bright ? .86 : .46;
    ctx.shadowColor = bright ? GOLD : "rgba(0,0,0,0)"; ctx.shadowBlur = bright ? size * .003 : 0;
    ctx.beginPath(); ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, size * (bright ? .00115 : .00072), 0, Math.PI * 2); ctx.fill();
  }
  for (let fan = 0; fan < 4; fan++) {
    const anchor = -Math.PI * .75 + fan * Math.PI / 2;
    for (let growth = 0; growth < 9; growth++) {
      const radius = frame.innerRadius + size * (.0028 + growth * .00205);
      const spread = .032 + growth * .009;
      ctx.strokeStyle = growth % 3 === 2 ? PLATINUM : GOLD;
      ctx.globalAlpha = .34 + growth * .055;
      ctx.lineWidth = Math.max(.6, size * (growth % 3 === 2 ? .00072 : .0005));
      ctx.shadowColor = growth % 3 === 2 ? PLATINUM : GOLD; ctx.shadowBlur = size * .0025;
      ctx.beginPath(); ctx.arc(0, 0, radius, anchor - spread, anchor + spread); ctx.stroke();
    }
    for (let ray = -3; ray <= 3; ray++) {
      const angle = anchor + ray * .019;
      ctx.strokeStyle = ray === 0 ? PLATINUM : GOLD; ctx.globalAlpha = ray === 0 ? .82 : .44;
      ctx.lineWidth = Math.max(.5, size * (ray === 0 ? .00075 : .0004));
      ctx.beginPath(); ctx.moveTo(Math.cos(angle) * (frame.innerRadius + size * .001), Math.sin(angle) * (frame.innerRadius + size * .001));
      ctx.lineTo(Math.cos(angle) * (frame.outerRadius - size * .001), Math.sin(angle) * (frame.outerRadius - size * .001)); ctx.stroke();
    }
  }
  ctx.restore();
  for (let tick = 0; tick < frame.tickCount; tick++) {
    const angle = tick / frame.tickCount * Math.PI * 2;
    const cardinal = tick % 18 === 0, intercardinal = tick % 9 === 0;
    const long = tick % 6 === 0, inner = frame.innerRadius + size * (cardinal ? -.006 : intercardinal ? 0 : long ? .003 : .007), outer = frame.outerRadius - size * .003;
    ctx.strokeStyle = cardinal ? "rgba(255,244,204,.98)" : intercardinal ? "rgba(236,242,230,.88)" : long ? "rgba(255,226,145,.9)" : "rgba(67,34,15,.72)";
    ctx.lineWidth = Math.max(1, size * (cardinal ? .0017 : intercardinal ? .00125 : long ? .001 : .00055));
    ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke();
  }
  for (let jewel = 0; jewel < 12; jewel++) {
    const angle = jewel / 12 * Math.PI * 2, radius = (frame.innerRadius + frame.outerRadius) / 2;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    const awakened = identity.awakenedSectors.includes(jewel);
    const jewelColor = colors[(jewel + identity.guardian) % Math.max(colors.length, 1)] ?? GOLD;
    irregularGlow(ctx, x, y, size * (awakened ? .018 : .008), jewelColor, awakened ? .58 : .18, seed + jewel * 29);
    ctx.fillStyle = jewelColor; ctx.globalAlpha = awakened ? .96 : .52; ctx.beginPath(); ctx.arc(x, y, size * (awakened ? .004 : .0025), 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = awakened ? "rgba(255,243,198,.96)" : "rgba(255,233,169,.52)"; ctx.lineWidth = Math.max(1, size * .00055); ctx.beginPath(); ctx.arc(x, y, size * (awakened ? .0058 : .0042), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.save(); ctx.translate(-frame.x, -frame.y);
  paintEngravedRing(ctx, frame.x, frame.y, frame.innerRadius + size * .002, frame.outerRadius - size * .002, size);
  paintNautilusPartitions(ctx, frame.x, frame.y, frame.innerRadius, frame.outerRadius, size, colors);
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, frame.outerRadius - size * .001, 0, Math.PI * 2); ctx.arc(0, 0, frame.innerRadius + size * .001, 0, Math.PI * 2, true); ctx.clip("evenodd");
  for (let shell = 0; shell < 4; shell++) {
    ctx.save(); ctx.globalCompositeOperation = "source-over";
    const anchor = -Math.PI * .75 + shell * Math.PI / 2;
    const centerRadius = (frame.innerRadius + frame.outerRadius) / 2;
    const cx = Math.cos(anchor) * centerRadius, cy = Math.sin(anchor) * centerRadius;
    const shellRadius = size * .034;
    const shellGem = colors[(shell * 2) % Math.max(colors.length, 1)] ?? GOLD;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(anchor + Math.PI / 2); ctx.scale(1, .52);
    for (let halo = 0; halo < 3; halo++) {
      ctx.beginPath();
      for (let step = 0; step <= 132; step++) {
        const progress = step / 132, angle = progress * Math.PI * 4;
        const radius = goldenShellRadius(progress, shellRadius);
        const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
        step ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = halo === 0 ? "rgba(28,13,7,.98)" : halo === 1 ? shellGem : "rgba(255,244,207,.98)";
      ctx.globalAlpha = halo === 0 ? .9 : halo === 1 ? .76 : .96;
      ctx.lineWidth = size * (halo === 0 ? .0078 : halo === 1 ? .0032 : .00082);
      ctx.shadowColor = halo === 1 ? shellGem : GOLD; ctx.shadowBlur = size * (halo === 1 ? .009 : .003); ctx.stroke();
    }
    for (let chamber = 2; chamber <= 13; chamber++) {
      const progress = chamber / 13, angle = progress * Math.PI * 4;
      const radius = goldenShellRadius(progress, shellRadius);
      const innerRadius = radius * (.26 + progress * .22);
      ctx.strokeStyle = chamber % 3 === 0 ? PLATINUM : "rgba(255,222,132,.94)";
      ctx.globalAlpha = .42 + progress * .46; ctx.lineWidth = Math.max(.7, size * .0005);
      ctx.beginPath(); ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius); ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius); ctx.stroke();
    }
    ctx.fillStyle = shellGem; ctx.globalAlpha = .98; ctx.shadowColor = shellGem; ctx.shadowBlur = size * .012;
    ctx.beginPath(); ctx.arc(0, 0, size * .0048, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,245,210,.98)"; ctx.lineWidth = size * .0012; ctx.beginPath(); ctx.arc(0, 0, size * .0064, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    const shellBase = ctx.createRadialGradient(cx - shellRadius * .24, cy - shellRadius * .24, shellRadius * .06, cx, cy, shellRadius);
    shellBase.addColorStop(0, "rgba(255,239,181,.92)"); shellBase.addColorStop(.24, "rgba(173,104,39,.95)"); shellBase.addColorStop(.58, "rgba(70,34,17,.98)"); shellBase.addColorStop(.82, "rgba(232,188,94,.92)"); shellBase.addColorStop(1, "rgba(35,17,10,.18)");
    ctx.fillStyle = shellBase; ctx.globalAlpha = .36; ctx.shadowColor = GOLD; ctx.shadowBlur = size * .01;
    ctx.beginPath(); ctx.arc(cx, cy, shellRadius, 0, Math.PI * 2); ctx.fill();
    for (let chamber = 0; chamber < 12; chamber++) {
      const angle = anchor + Math.PI + chamber / 11 * Math.PI * 4;
      const progress = chamber / 11;
      const radius = goldenShellRadius(progress, shellRadius);
      ctx.strokeStyle = chamber % 3 === 0 ? PLATINUM : "rgba(255,221,132,.92)";
      ctx.globalAlpha = .34 + progress * .5; ctx.lineWidth = Math.max(.65, size * (.00048 + progress * .00038));
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * radius * .18, cy + Math.sin(angle) * radius * .18);
      ctx.quadraticCurveTo(cx + Math.cos(angle + .3) * radius * .65, cy + Math.sin(angle + .3) * radius * .65, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius); ctx.stroke();
    }
    for (let pass = 0; pass < 4; pass++) {
      ctx.beginPath();
      for (let step = 0; step <= 112; step++) {
        const progress = step / 112, angle = anchor + Math.PI + progress * Math.PI * 4;
        const radius = goldenShellRadius(progress, shellRadius);
        const x = cx + Math.cos(angle) * radius, y = cy + Math.sin(angle) * radius;
        step ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = pass === 1 ? shellGem : pass === 2 ? PLATINUM : GOLD;
      ctx.globalAlpha = [ .32, .58, .78, .65 ][pass] ?? .3;
      ctx.lineWidth = size * ([ .008, .0034, .00082, .00042 ][pass] ?? .00048);
      ctx.shadowColor = pass === 1 ? shellGem : GOLD; ctx.shadowBlur = size * ([ .003, .002, 0, 0 ][pass] ?? 0); ctx.stroke();
    }
    for (let rib = 2; rib < 11; rib++) {
      const angle = anchor + Math.PI + rib / 10 * Math.PI * 4;
      const radius = goldenShellRadius(rib / 10, shellRadius);
      ctx.strokeStyle = rib % 3 ? GOLD : PLATINUM; ctx.globalAlpha = .46; ctx.lineWidth = Math.max(.45, size * .00038);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(angle) * radius * .54, cy + Math.sin(angle) * radius * .54); ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius); ctx.stroke();
    }
    for (let bead = 0; bead < 7; bead++) {
      const angle = anchor + Math.PI + (bead + 2) / 9 * Math.PI * 4;
      const radius = goldenShellRadius((bead + 2) / 9, shellRadius);
      ctx.fillStyle = colors[(shell + bead) % Math.max(colors.length, 1)] ?? GOLD;
      ctx.globalAlpha = .82; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = size * .004;
      ctx.beginPath(); ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, size * (.0014 + bead * .00012), 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = shellGem; ctx.globalAlpha = .96; ctx.shadowColor = shellGem; ctx.shadowBlur = size * .009;
    ctx.beginPath(); ctx.arc(cx, cy, size * .0038, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,241,191,.96)"; ctx.globalAlpha = .92; ctx.lineWidth = size * .0014;
    ctx.shadowColor = GOLD; ctx.shadowBlur = size * .006;
    ctx.beginPath(); ctx.arc(cx, cy, shellRadius * 1.04, anchor - .42, anchor + .42); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  for (let direction = 0; direction < 8; direction++) {
    const angle = direction * Math.PI / 4 - Math.PI / 2;
    const cardinal = direction % 2 === 0;
    const radius = bandMid;
    const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
    ctx.fillStyle = cardinal ? "rgba(255,235,170,.96)" : "rgba(126,78,34,.96)";
    ctx.strokeStyle = cardinal ? PLATINUM : "rgba(255,221,135,.82)"; ctx.lineWidth = Math.max(1, size * .00065);
    ctx.shadowColor = cardinal ? GOLD : "rgba(0,0,0,.8)"; ctx.shadowBlur = cardinal ? size * .007 : size * .002;
    ctx.beginPath(); ctx.moveTo(0, -bandWidth * .42); ctx.lineTo(bandWidth * .16, -.02 * size); ctx.lineTo(0, bandWidth * .42); ctx.lineTo(-bandWidth * .16, -.02 * size); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function paintMilkyWay(ctx: CanvasRenderingContext2D, size: number, colors: string[], seed: number) {
  const layer = document.createElement("canvas"); layer.width = size; layer.height = size;
  const art = layer.getContext("2d"); if (!art) return;
  art.save(); art.globalCompositeOperation = "screen"; art.lineCap = "round";
  const trace = (offset: number) => {
    art.beginPath();
    art.moveTo(size * -.12, size * (.28 + offset));
    art.bezierCurveTo(size * .12, size * (-.02 + offset), size * .39, size * (-.015 + offset), size * .58, size * (.17 + offset));
  };
  for (let veil = 0; veil < 38; veil++) {
    const salt = seed + veil * 83;
    trace((unit(salt) - .5) * .13);
    art.strokeStyle = colors[veil % Math.max(colors.length, 1)] ?? GOLD;
    art.globalAlpha = .025 + unit(salt + 4) * .035;
    art.lineWidth = size * (.001 + unit(salt + 7) * .003);
    art.shadowColor = art.strokeStyle; art.shadowBlur = size * .008; art.stroke();
  }
  for (let star = 0; star < 1100; star++) {
    const salt = seed + star * 47, progress = unit(salt);
    const x = size * (-.04 + progress * .67);
    const centerY = size * (.11 - .035 * Math.sin(progress * Math.PI * 1.4));
    const width = size * (.018 + Math.sin(progress * Math.PI) * .055);
    const y = centerY + (unit(salt + 3) - .5) * width * 2;
    const color = star % 19 === 0 ? (colors[star % Math.max(colors.length, 1)] ?? GOLD) : star % 7 ? PLATINUM : GOLD;
    art.fillStyle = color; art.globalAlpha = .05 + unit(salt + 9) ** 2 * .42;
    const radius = size * (.00012 + unit(salt + 13) ** 3 * .00082);
    art.beginPath(); art.arc(x, y, radius, 0, Math.PI * 2); art.fill();
  }
  art.restore();
  ctx.save(); ctx.globalAlpha = .8; ctx.drawImage(layer, 0, 0); ctx.restore();
}

function paintCelestialSilence(ctx: CanvasRenderingContext2D, size: number, points: Array<Point & { radius: number }>) {
  ctx.save();
  points.forEach((point) => {
    const safeRadius = Math.max(point.radius * 1.7, size * .012);
    const quiet = ctx.createRadialGradient(point.x, point.y, point.radius * .72, point.x, point.y, safeRadius);
    quiet.addColorStop(0, "rgba(1,3,10,.62)"); quiet.addColorStop(.42, "rgba(1,3,10,.22)"); quiet.addColorStop(1, "rgba(1,3,10,0)");
    ctx.fillStyle = quiet; ctx.beginPath(); ctx.arc(point.x, point.y, safeRadius, 0, Math.PI * 2); ctx.fill();
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
  const x = size * .68, y = size * .22, scale = size * .18;
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
  irregularGlow(ctx, point.x, point.y, radius * 3.3, "#ffc95e", .78, seed);
  irregularGlow(ctx, point.x, point.y, radius * 1.85, "#fff0b4", .86, seed + 51);
  if (image) { ctx.save(); ctx.shadowColor = "#ffd372"; ctx.shadowBlur = size * .06; ctx.drawImage(image, point.x - radius, point.y - radius, radius * 2, radius * 2); ctx.restore(); }
  ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, radius * .96, 0, Math.PI * 2); ctx.clip(); ctx.globalCompositeOperation = "screen";
  for (let grain = 0; grain < 180; grain++) {
    const salt = seed + grain * 47, angle = unit(salt) * Math.PI * 2, distance = Math.sqrt(unit(salt + 5)) * radius * .9;
    const x = point.x + Math.cos(angle) * distance, y = point.y + Math.sin(angle) * distance;
    ctx.fillStyle = grain % 7 ? "rgba(255,213,108,.32)" : "rgba(255,246,201,.52)"; ctx.globalAlpha = .18 + unit(salt + 9) * .36;
    ctx.beginPath(); ctx.arc(x, y, radius * (.002 + unit(salt + 13) * .009), 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = "rgba(255,239,181,.3)"; ctx.lineWidth = Math.max(1, size * .0007);
  for (let arc = 0; arc < 7; arc++) { ctx.beginPath(); ctx.arc(point.x, point.y, radius * (.38 + arc * .08), arc * .72, arc * .72 + 1.7); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  for (let ray = 0; ray < 46; ray++) {
    const angle = ray * Math.PI * 2 / 46 + unit(seed + ray) * .08;
    const inner = radius * (1.03 + unit(seed + ray * 11) * .16), outer = radius * (1.35 + unit(seed + ray * 31) * .85);
    ctx.strokeStyle = ray % 4 ? "#ffd372" : "#fff3c7"; ctx.globalAlpha = .04 + unit(seed + ray * 43) * .09;
    ctx.lineWidth = size * (.00035 + unit(seed + ray * 17) * .0011);
    ctx.beginPath(); ctx.moveTo(point.x + Math.cos(angle) * inner, point.y + Math.sin(angle) * inner); ctx.quadraticCurveTo(point.x + Math.cos(angle + .08) * outer * .78, point.y + Math.sin(angle + .08) * outer * .78, point.x + Math.cos(angle) * outer, point.y + Math.sin(angle) * outer); ctx.stroke();
  }
  ctx.restore();
}

function paintPlanetIdentity(ctx: CanvasRenderingContext2D, point: Point, radius: number, id: CosmicPlanetId, sunPoint: Point, size: number, seed: number) {
  if (id === "saturn") return;
  const lightAngle = Math.atan2(sunPoint.y - point.y, sunPoint.x - point.x);
  ctx.save(); ctx.beginPath(); ctx.arc(point.x, point.y, radius * .985, 0, Math.PI * 2); ctx.clip();
  ctx.globalCompositeOperation = "screen";
  if (id === "mercury") {
    for (let crater = 0; crater < 13; crater++) {
      const salt = seed + crater * 37, angle = unit(salt) * Math.PI * 2, distance = Math.sqrt(unit(salt + 3)) * radius * .72;
      ctx.strokeStyle = crater % 3 ? "rgba(235,220,184,.18)" : "rgba(32,26,24,.3)"; ctx.lineWidth = Math.max(.5, size * .00028);
      ctx.beginPath(); ctx.ellipse(point.x + Math.cos(angle) * distance, point.y + Math.sin(angle) * distance, radius * (.025 + unit(salt + 7) * .065), radius * (.012 + unit(salt + 9) * .03), angle, 0, Math.PI * 2); ctx.stroke();
    }
  } else if (id === "venus") {
    ctx.strokeStyle = "rgba(255,239,191,.22)"; ctx.lineWidth = radius * .07;
    for (let cloud = 0; cloud < 5; cloud++) { ctx.beginPath(); ctx.arc(point.x - radius * .2, point.y + (cloud - 2) * radius * .22, radius * (.52 + cloud * .05), -.2, 2.9); ctx.stroke(); }
  } else if (id === "mars") {
    ctx.fillStyle = "rgba(82,28,18,.28)"; ctx.beginPath(); ctx.ellipse(point.x - radius * .18, point.y + radius * .16, radius * .34, radius * .16, -.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(245,221,184,.36)"; ctx.beginPath(); ctx.ellipse(point.x, point.y - radius * .8, radius * .34, radius * .12, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === "jupiter") {
    for (let band = -4; band <= 4; band++) { ctx.strokeStyle = band % 2 ? "rgba(255,238,203,.2)" : "rgba(125,66,42,.24)"; ctx.lineWidth = radius * .075; ctx.beginPath(); ctx.ellipse(point.x, point.y + band * radius * .16, radius * .96, radius * .2, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = "rgba(176,67,44,.62)"; ctx.beginPath(); ctx.ellipse(point.x + radius * .36, point.y + radius * .28, radius * .18, radius * .095, -.1, 0, Math.PI * 2); ctx.fill();
  } else if (id === "uranus") {
    ctx.strokeStyle = "rgba(220,255,252,.34)"; ctx.lineWidth = Math.max(1, size * .00042); ctx.beginPath(); ctx.ellipse(point.x, point.y, radius * 1.42, radius * .34, 1.42, 0, Math.PI * 2); ctx.stroke();
  } else if (id === "neptune") {
    ctx.strokeStyle = "rgba(141,199,255,.24)"; ctx.lineWidth = radius * .055;
    for (let band = -2; band <= 2; band++) { ctx.beginPath(); ctx.moveTo(point.x - radius * .75, point.y + band * radius * .23); ctx.quadraticCurveTo(point.x, point.y + band * radius * .23 - radius * .08, point.x + radius * .75, point.y + band * radius * .23); ctx.stroke(); }
    ctx.fillStyle = "rgba(16,39,105,.46)"; ctx.beginPath(); ctx.ellipse(point.x + radius * .24, point.y + radius * .18, radius * .16, radius * .08, 0, 0, Math.PI * 2); ctx.fill();
  }
  const lightX = point.x + Math.cos(lightAngle) * radius * .68, lightY = point.y + Math.sin(lightAngle) * radius * .68;
  const illumination = ctx.createRadialGradient(lightX, lightY, radius * .05, point.x, point.y, radius * 1.25);
  illumination.addColorStop(0, "rgba(255,246,218,.2)"); illumination.addColorStop(.48, "rgba(255,246,218,.035)"); illumination.addColorStop(.72, "rgba(0,2,11,.16)"); illumination.addColorStop(1, "rgba(0,1,8,.72)");
  ctx.globalCompositeOperation = "source-over"; ctx.fillStyle = illumination; ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function paintOrbitalField(ctx: CanvasRenderingContext2D, size: number, solar: Point, placements: ReturnType<typeof cosmicPlacements>) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  placements.forEach((planet, orbitIndex) => {
    const path = planet.orbitPath;
    if (path.length < 2) return;
    const earthOrbit = planet.id === "earth";
    const orbitColor = earthOrbit ? GOLD : orbitIndex % 2 ? PLATINUM : "#d7c58f";
    for (let pass = 0; pass < 4; pass++) {
      ctx.beginPath();
      path.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.strokeStyle = orbitColor;
      ctx.globalAlpha = earthOrbit ? [.055, .13, .3, .72][pass] ?? .2 : [.026, .075, .17, .44][pass] ?? .1;
      ctx.lineWidth = size * ([.0048, .00215, .00095, .00034][pass] ?? .00034);
      ctx.shadowColor = orbitColor;
      ctx.shadowBlur = size * (earthOrbit ? .011 : .006);
      ctx.stroke();
    }
    ctx.globalAlpha = earthOrbit ? .54 : .27;
    const step = earthOrbit ? 4 : 6;
    for (let index = orbitIndex % step; index < path.length; index += step) {
      const point = path[index];
      if (!point) continue;
      ctx.fillStyle = orbitColor;
      ctx.beginPath(); ctx.arc(point.x, point.y, size * (earthOrbit ? .0007 : .00042), 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.restore();
}

function paintOrbitSilence(ctx: CanvasRenderingContext2D, size: number, placements: ReturnType<typeof cosmicPlacements>) {
  ctx.save();
  placements.forEach((planet) => {
    const bodyRadius = planet.id === "saturn" ? planet.ringOuterRadius : planet.radius;
    const quiet = ctx.createRadialGradient(planet.x, planet.y, bodyRadius * .72, planet.x, planet.y, bodyRadius * 1.28);
    quiet.addColorStop(0, "rgba(1,3,10,.9)"); quiet.addColorStop(.62, "rgba(1,3,10,.48)"); quiet.addColorStop(1, "rgba(1,3,10,0)");
    ctx.fillStyle = quiet; ctx.beginPath(); ctx.arc(planet.x, planet.y, bodyRadius * 1.28, 0, Math.PI * 2); ctx.fill();
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

function paintAstronomyLabels(ctx: CanvasRenderingContext2D, size: number, genesis: CosmicGenesis, placements: ReturnType<typeof cosmicPlacements>, language: Language, birthPlace: string, earthPortrait: ReturnType<typeof cosmicEarthPortrait>, hideBirthDetails = false) {
  const instant = genesis.instant.replace("T", " ").slice(0, 16) + " UTC";
  const copy = SCIENCE_COPY[language];
  ctx.save();
  const left = placements.filter((planet) => planet.x < size * .5).sort((a, b) => a.y - b.y);
  const right = placements.filter((planet) => planet.x >= size * .5).sort((a, b) => a.y - b.y);
  [...left.map((planet) => ({ planet, side: -1 as const })), ...right.map((planet) => ({ planet, side: 1 as const }))].forEach(({ planet, side }) => {
    const group = side < 0 ? left : right;
    const lane = group.indexOf(planet);
    const labelY = size * (.26 + (group.length === 1 ? .18 : lane * .49 / (group.length - 1)));
    const labelX = size * (side < 0 ? .026 : .974);
    const index = genesis.planets.findIndex((candidate) => candidate.id === planet.id);
    const title = PLANET_LABELS[language][index] ?? planet.name;
    const radius = planet.id === "saturn" ? planet.ringOuterRadius : planet.radius;
    const edgeX = planet.x + side * (radius + size * .004);
    const lineEnd = labelX - side * size * .15;
    ctx.save(); ctx.strokeStyle = cosmicTextPalette().leader; ctx.lineWidth = .5 * size / 1024;
    ctx.beginPath(); ctx.moveTo(edgeX, planet.y); ctx.lineTo(lineEnd, labelY - size * .022); ctx.stroke();
    ctx.fillStyle = cosmicTextPalette().main; ctx.beginPath(); ctx.arc(edgeX, planet.y, size * .0013, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.textAlign = side < 0 ? "left" : "right";
    paintCosmicText(ctx, size, title, labelX, labelY - size * .022, 'name', size * .22);
    paintCosmicText(ctx, size, `${planet.longitude.toFixed(1)}°  ·  ${planet.distanceAu.toFixed(2)} AU`, labelX, labelY - size * .006, 'data', size * .22);
    paintCosmicText(ctx, size, `${planet.meanRadiusKm.toLocaleString()} km  ·  ${(planet.meanRadiusKm / 6371).toFixed(2)} R⊕`, labelX, labelY + size * .01, 'data', size * .22);
  });
  ctx.textAlign = "left";
  paintCosmicText(ctx, size, copy.placement, size * .027, size * .028, 'name', size * .70);
  const birthCaption = hideBirthDetails ? (genesis.approximate ? copy.reference : "") : `${instant} · ${birthPlace || "—"}${genesis.approximate ? ` · ${copy.reference}` : ""}`;
  paintCosmicText(ctx, size, birthCaption, size * .027, size * .0505, 'data', size * .70);
  ctx.textAlign = "center";
  paintCosmicText(ctx, size, copy.earth, earthPortrait.x, earthPortrait.y + earthPortrait.radius * 1.45, 'data', size * .24);
  ctx.restore();
}

function paintSizeComparison(ctx: CanvasRenderingContext2D, size: number, genesis: CosmicGenesis, assets: ArtAssets | null | undefined, language: Language) {
  const items = cosmicSizeComparison(genesis, size);
  ctx.save();
  ctx.textAlign = "left";
  paintCosmicText(ctx, size, SCIENCE_COPY[language].size, size * .025, size * .865, 'name', size * .80);
  items.forEach((item) => {
    const image = item.id === "sun" ? assets?.sun : item.id === "earth" ? assets?.earthMap : assets?.planets[item.id];
    ctx.save(); ctx.beginPath(); ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2); ctx.clip();
    if (image) ctx.drawImage(image, item.x - item.radius, item.y - item.radius, item.radius * 2, item.radius * 2);
    else { ctx.fillStyle = item.id === "sun" ? GOLD : PLATINUM; ctx.fill(); }
    ctx.restore();
    const planetIndex = item.id === "sun" ? -1 : genesis.planets.findIndex((planet) => planet.id === item.id);
    const name = item.id === "sun" ? SUN_LABELS[language] : PLANET_LABELS[language][planetIndex] ?? item.id;
    ctx.textAlign = "center";
    paintCosmicText(ctx, size, name, item.x, size * .967, 'name', size * .10);
    paintCosmicText(ctx, size, `${Math.round(item.physicalRadiusKm).toLocaleString()} km`, item.x, size * .984, 'data', size * .10);
  });
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
  ctx.save(); ctx.globalCompositeOperation = "screen";
  const cradle = ctx.createRadialGradient(earth.x, earth.y, radius * .78, earth.x, earth.y, radius * 1.34);
  cradle.addColorStop(0, "rgba(238,219,154,0)"); cradle.addColorStop(.72, "rgba(238,219,154,.04)"); cradle.addColorStop(.87, "rgba(238,219,154,.5)"); cradle.addColorStop(1, "rgba(238,219,154,0)");
  ctx.fillStyle = cradle; ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * 1.34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,228,145,.84)"; ctx.lineWidth = Math.max(1, radius * .018); ctx.shadowColor = GOLD; ctx.shadowBlur = radius * .16;
  for (let arc = 0; arc < 4; arc++) { ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * (1.15 + arc * .045), -.9 + arc * .35, .65 + arc * .35); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = "rgba(238,219,154,.34)"; ctx.lineWidth = Math.max(1, radius * .009); ctx.setLineDash([radius * .04, radius * .025]);
  ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * 1.09, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  irregularGlow(ctx, earth.x, earth.y, radius * 1.65, "#2c8ec7", .56, seed + 71);
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
  ctx.save(); ctx.translate(earth.x, earth.y); ctx.rotate(-view.axialTiltDegrees * Math.PI / 180);
  ctx.strokeStyle = "rgba(238,219,154,.56)"; ctx.lineWidth = Math.max(1, radius * .012); ctx.setLineDash([radius * .06, radius * .045]);
  ctx.beginPath(); ctx.moveTo(0, -radius * 1.22); ctx.lineTo(0, radius * 1.22); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  paintBirthplaceRadiance(ctx, earth, birthplace, radius, overallColor, seed + 5100);
}

function paintOrbitalEarth(ctx: CanvasRenderingContext2D, image: HTMLImageElement | null, earth: Point, radius: number, view: EarthView, sunPoint: Point, size: number, seed: number) {
  irregularGlow(ctx, earth.x, earth.y, radius * 2.7, "#65dff2", .55, seed);
  ctx.save(); ctx.beginPath(); ctx.arc(earth.x, earth.y, radius, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#062b58"; ctx.fillRect(earth.x - radius, earth.y - radius, radius * 2, radius * 2);
  if (image) {
    const projected = projectEarth(image, Math.max(radius, 8), view);
    ctx.filter = "saturate(1.2) contrast(1.13)";
    ctx.drawImage(projected.image, earth.x - radius, earth.y - radius, radius * 2, radius * 2);
    ctx.filter = "none";
  }
  const sunAngle = Math.atan2(sunPoint.y - earth.y, sunPoint.x - earth.x);
  const lightX = earth.x + Math.cos(sunAngle) * radius * .6, lightY = earth.y + Math.sin(sunAngle) * radius * .6;
  const shade = ctx.createRadialGradient(lightX, lightY, radius * .08, earth.x, earth.y, radius * 1.16);
  shade.addColorStop(0, "rgba(134,238,225,.04)"); shade.addColorStop(.52, "rgba(3,35,67,.04)"); shade.addColorStop(.78, "rgba(0,8,25,.38)"); shade.addColorStop(1, "rgba(0,1,9,.88)");
  ctx.fillStyle = shade; ctx.fillRect(earth.x - radius, earth.y - radius, radius * 2, radius * 2); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "rgba(101,223,242,.74)"; ctx.lineWidth = Math.max(1, size * .00075);
  ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * 1.01, sunAngle - 1.48, sunAngle + 1.48); ctx.stroke();
  ctx.strokeStyle = PLATINUM; ctx.globalAlpha = .66; ctx.lineWidth = Math.max(1, size * .00042);
  ctx.beginPath(); ctx.arc(earth.x, earth.y, radius * .98, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

function paintBirthMoon(ctx: CanvasRenderingContext2D, moon: CosmicMoonPlacement, earth: Point, size: number, seed: number, language: Language) {
  const radius = moon.radius;
  ctx.save();
  ctx.strokeStyle = "rgba(238,219,154,.28)"; ctx.lineWidth = Math.max(1, size * .00045); ctx.setLineDash([size * .003, size * .003]);
  ctx.beginPath(); ctx.moveTo(earth.x, earth.y); ctx.lineTo(moon.x, moon.y); ctx.stroke(); ctx.setLineDash([]);
  paintLunarHalo(ctx, moon, seed);
  paintLunarSurface(ctx, moon);
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--cosmic-lunar-rim').trim();
  ctx.globalAlpha = .32; ctx.lineWidth = size * .00045;
  ctx.beginPath(); ctx.arc(moon.x, moon.y, radius * .995, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = .5; ctx.lineWidth = size * .00055;
  ctx.beginPath(); ctx.arc(moon.x, moon.y, radius * .995, moon.lightAngle - Math.PI * .45, moon.lightAngle + Math.PI * .45); ctx.stroke();
  ctx.restore();
  ctx.save();
  const side = moon.x >= earth.x ? 1 : -1;
  const labelX = Math.max(size * .025, Math.min(size * .975, moon.x + side * radius * 1.35));
  ctx.textAlign = side > 0 ? "left" : "right";
  paintCosmicText(ctx, size, `${MOON_LABELS[language]} ${Math.round(moon.phaseFraction * 100)}% · ×2.1`, labelX, moon.y - radius * 1.7, 'data', size * .16);
  ctx.restore();
}

function paintPlanet(ctx: CanvasRenderingContext2D, image: HTMLImageElement | undefined, point: Point, radius: number, ringOuterRadius: number, id: CosmicPlanetId, sunPoint: Point, size: number, seed: number, depth: number) {
  if (!image) return;
  const auraColor: Record<CosmicPlanetId, string> = { mercury: "#c7b48d", venus: "#e6b65f", earth: "#65dff2", mars: "#c45a34", jupiter: "#d7b185", saturn: "#d8bf83", uranus: "#8edfe5", neptune: "#3e75e8" };
  irregularGlow(ctx, point.x, point.y, radius * 2.35, auraColor[id], .36 + depth * .14, seed);
  ctx.save(); ctx.globalAlpha = .9 + depth * .1; ctx.shadowColor = auraColor[id]; ctx.shadowBlur = size * (.009 + depth * .009);
  const filters: Record<CosmicPlanetId, string> = {
    mercury: "saturate(1.08) contrast(1.2)", venus: "saturate(1.16) contrast(1.14)", earth: "saturate(1.2) contrast(1.13)", mars: "saturate(1.28) contrast(1.16)",
    jupiter: "saturate(1.22) contrast(1.14)", saturn: "saturate(1.2) contrast(1.15)", uranus: "saturate(1.24) contrast(1.13)", neptune: "saturate(1.3) contrast(1.17)",
  };
  ctx.filter = filters[id];
  if (id === "saturn") {
    ctx.strokeStyle = "rgba(215,191,131,.32)"; ctx.lineWidth = Math.max(1, size * .0018);
    ctx.beginPath(); ctx.ellipse(point.x, point.y, ringOuterRadius * .94, ringOuterRadius * .31, -.16, Math.PI, Math.PI * 2); ctx.stroke();
  }
  if (id === "saturn") ctx.drawImage(image, point.x - ringOuterRadius, point.y - ringOuterRadius, ringOuterRadius * 2, ringOuterRadius * 2);
  else ctx.drawImage(image, point.x - radius, point.y - radius, radius * 2, radius * 2);
  ctx.filter = "none";
  paintPlanetIdentity(ctx, point, radius, id, sunPoint, size, seed);
  if (id === "saturn") {
    ctx.strokeStyle = "rgba(248,226,161,.5)"; ctx.lineWidth = Math.max(1, size * .0011);
    ctx.beginPath(); ctx.ellipse(point.x, point.y, ringOuterRadius * .94, ringOuterRadius * .31, -.16, 0, Math.PI); ctx.stroke();
  }
  ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = auraColor[id]; ctx.globalAlpha = .26; ctx.lineWidth = Math.max(1, size * .00075);
  if (id !== "saturn") { ctx.beginPath(); ctx.arc(point.x, point.y, radius * .98, -.92, 2.34); ctx.stroke(); }
  const sparkleAngle = unit(seed + 309) * Math.PI * 2;
  const sparkleX = point.x + Math.cos(sparkleAngle) * radius * 1.08, sparkleY = point.y + Math.sin(sparkleAngle) * radius * 1.08;
  ctx.strokeStyle = id === "earth" ? GOLD : PLATINUM; ctx.globalAlpha = .58; ctx.lineWidth = Math.max(1, size * .00055);
  ctx.beginPath(); ctx.moveTo(sparkleX - size * .006, sparkleY); ctx.lineTo(sparkleX + size * .006, sparkleY); ctx.moveTo(sparkleX, sparkleY - size * .006); ctx.lineTo(sparkleX, sparkleY + size * .006); ctx.stroke();
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

export async function paintCosmicGenesis(canvas: HTMLCanvasElement, genesis: CosmicGenesis, earthView: EarthView, colors: string[], language: Language, birthPlace: string, assets?: ArtAssets | null, hideBirthDetails = false) {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable");
  const size = canvas.width, roles = cosmicColorRoles(colors), placements = cosmicPlacements(genesis, size), solar = cosmicSunPlacement(genesis, size);
  const orbitalEarth = placements.find((planet) => planet.id === "earth");
  const moon = cosmicMoonPlacement(genesis, size, orbitalEarth);
  // Diffuse gas is resolution-independent; keep expensive optical blending off the full-size surface.
  const background = document.createElement('canvas'); background.width = 512; background.height = 512;
  const gas = background.getContext('2d');
  if (gas) {
    paintDeepSpace(gas, 512, roles.all, genesis.seed);
    paintMilkyWay(gas, 512, roles.all, genesis.seed + 6400);
    paintNebulae(gas, 512, roles.all, genesis.seed + 1200);
    paintFantasyDepth(gas, 512, roles.prominence, genesis.seed + 5300);
    paintStarLifeVeils(gas, 512, roles.prominence, genesis.seed + 4400, orbitalEarth?.displayAngle ?? 0);
    ctx.drawImage(background, 0, 0, size, size);
  }
  paintCompassInlay(ctx, size);
  paintCelestialSilence(ctx, size, [{ ...solar, radius: solar.radius }, ...placements.map((planet) => ({ x: planet.x, y: planet.y, radius: planet.id === "saturn" ? planet.ringOuterRadius : planet.radius })), ...(moon ? [{ x: moon.x, y: moon.y, radius: moon.radius }] : [])]);
  paintConstellation(ctx, size, genesis.sunSign, -1, genesis.seed, .95);
  paintConstellation(ctx, size, genesis.moonSign, 1, genesis.seed + 900, .52);
  paintGuardian(ctx, size, genesis);
  const earth = cosmicEarthPortrait(size);
  paintCelestialSilence(ctx, size, [{ ...earth, radius: earth.radius * 1.3 }]);
  paintOrbitalField(ctx, size, solar, placements);
  paintOrbitSilence(ctx, size, placements);
  paintWideSolarRays(ctx, size, solar, genesis.seed + 8100);
  paintAstrolabeFrame(ctx, size, genesis.seed + 11800, roles.prominence, genesis);
  const surrounding = placements.slice().sort((a, b) => a.depth - b.depth);
  surrounding.filter((planet) => planet.depth < 0).forEach((planet) => planet.id === "earth" ? paintOrbitalEarth(ctx, assets?.earthMap ?? null, planet, planet.radius, earthView, solar, size, genesis.seed + planet.orbitIndex * 73) : paintPlanet(ctx, assets?.planets[planet.id], planet, planet.radius, planet.ringOuterRadius, planet.id, solar, size, genesis.seed + planet.orbitIndex * 73, (planet.depth + 1) / 2));
  paintSun(ctx, assets?.sun ?? null, solar, solar.radius, size, genesis.seed + 8200);
  surrounding.filter((planet) => planet.depth >= 0).forEach((planet) => planet.id === "earth" ? paintOrbitalEarth(ctx, assets?.earthMap ?? null, planet, planet.radius, earthView, solar, size, genesis.seed + planet.orbitIndex * 73) : paintPlanet(ctx, assets?.planets[planet.id], planet, planet.radius, planet.ringOuterRadius, planet.id, solar, size, genesis.seed + planet.orbitIndex * 73, (planet.depth + 1) / 2));
  if (moon && orbitalEarth) paintBirthMoon(ctx, moon, orbitalEarth, size, genesis.seed + 7600, language);
  if (orbitalEarth) paintEarthCorrespondence(ctx, orbitalEarth, earth, orbitalEarth.radius, earth.radius, roles.overall, size);
  paintEarth(ctx, assets?.earthMap ?? null, earth, earth.radius, earthView, solar, genesis.seed, roles.overall);
  paintForegroundDust(ctx, size, genesis.seed + 9700);
  paintAstronomyLabels(ctx, size, genesis, placements, language, birthPlace, earth, hideBirthDetails);
  paintSizeComparison(ctx, size, genesis, assets, language);
}

export default function CosmicGenesisCanvas({ genesis, earthView, colors, language, birthPlace, onCapture }: Props) {
  const ref = useRef<HTMLCanvasElement>(null); const images = useRef<ArtAssets | null>(null);
  const onCaptureRef = useRef(onCapture);
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);
  const genesisKey = JSON.stringify(genesis); const stableGenesis = useMemo(() => genesis, [genesisKey]);
  const earthKey = JSON.stringify(earthView); const stableEarthView = useMemo(() => earthView, [earthKey]);
  const colorKey = colors.join(","); const stableColors = useMemo(() => colorKey.split(","), [colorKey]);
  const capture = useCallback<Capture>(async (options) => {
    const out = document.createElement("canvas"); out.width = 2048; out.height = 2048;
    const art = images.current ?? await loadArt(); await paintCosmicGenesis(out, stableGenesis, stableEarthView, stableColors, language, birthPlace, art, options?.hideBirthDetails ?? false);
    const blob = await new Promise<Blob>((resolve, reject) => out.toBlob(value => value ? resolve(value) : reject(new Error("PNG unavailable")), "image/png"));
    return { blob, width: out.width, height: out.height };
  }, [stableGenesis, stableEarthView, stableColors, language, birthPlace]);
  useEffect(() => {
    let active = true;
    if (ref.current) void paintCosmicGenesis(ref.current, stableGenesis, stableEarthView, stableColors, language, birthPlace, null);
    void loadArt().then((art) => { if (!active) return; images.current = art; if (ref.current) void paintCosmicGenesis(ref.current, stableGenesis, stableEarthView, stableColors, language, birthPlace, art); onCaptureRef.current(capture); });
    return () => { active = false; onCaptureRef.current(null); };
  }, [stableGenesis, stableEarthView, stableColors, capture, language, birthPlace]);
  return <canvas ref={ref} width={1024} height={1024} role="img" aria-label={language === "ja" ? "星命聖環として再構成した出生宇宙創生図。太陽、出生地球、出生月、8惑星、七彩星命雲、豪華な外周彫金の黄金殻模様、星座守護環、9天体実半径比較" : "Sacred stellar compass with the Sun, birth Earth and Moon, eight planets, seven birth-color veils, opulent golden shell relief, zodiac guardian ring, and true-radius comparison"} data-cosmic-genesis data-renderer="agolmen-star-jewelry-guilloche-nacre" data-birth-color-role="seven-exact-deep-nebulae-remnants-and-milky-way" data-guide-spokes="0" data-compass-directions="8" data-shell-relief="opulent-nautilus-outer-metalwork-only" data-celestial-layer="foreground-over-goldwork" data-label-treatment="direct-champagne-gold-fine-shadow" data-orbit-count="8" data-moon-count="1" data-size-comparison-count="9" data-astrolabe-ticks="72" data-zodiac-sectors="12" data-planet-count={genesis.planets.length} className="block h-full w-full object-contain" />;
}
