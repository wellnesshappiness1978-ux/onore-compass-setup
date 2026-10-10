import type { birthColorSpectrum } from "./birth-color-spectrum";

export type BirthPalette = NonNullable<ReturnType<typeof birthColorSpectrum>>;
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
export const PHI = (1 + Math.sqrt(5)) / 2;
export type MandalaIntention = "overall" | "wealth" | "work" | "love" | "health";

export function paletteColors(palette: BirthPalette) {
  return [palette.main, palette.sub, palette.money, palette.work, palette.love, palette.health, palette.mind];
}

const intentionOrder: Record<MandalaIntention, number[]> = {
  overall: [0, 1, 2, 3, 4, 5, 6],
  wealth: [0, 2, 1, 3, 5, 4, 6],
  work: [0, 3, 1, 2, 6, 5, 4],
  love: [0, 4, 1, 6, 5, 2, 3],
  health: [0, 5, 1, 6, 4, 3, 2],
};

export function colorsForIntention(colors: string[], intention: MandalaIntention) {
  if (colors.length === 0) return [];
  return intentionOrder[intention].map(index => colors[index % colors.length] ?? colors[0]).filter((color): color is string => Boolean(color));
}

export function vividHexColor(value: string) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  if (!match) return value;
  const rgb = match.slice(1).map(channel => Number.parseInt(channel ?? "00", 16) / 255);
  const [red = 0, green = 0, blue = 0] = rgb;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue /= 6;
    if (hue < 0) hue += 1;
  }
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const vividSaturation = Math.max(.82, saturation);
  const vividLightness = Math.min(.58, Math.max(.42, lightness));
  const chroma = (1 - Math.abs(2 * vividLightness - 1)) * vividSaturation;
  const segment = hue * 6;
  const x = chroma * (1 - Math.abs(segment % 2 - 1));
  const candidates = segment < 1 ? [chroma, x, 0] : segment < 2 ? [x, chroma, 0] : segment < 3 ? [0, chroma, x] : segment < 4 ? [0, x, chroma] : segment < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const offset = vividLightness - chroma / 2;
  return `#${candidates.map(channel => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function logarithmicSpiralPoint(index: number, count: number, radius = 1, turns = 3.25) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const angle = turns * Math.PI * 2 * t;
  const growth = Math.log(PHI) / (Math.PI / 2);
  const normalized = (Math.exp(growth * angle) - 1) / (Math.exp(growth * turns * Math.PI * 2) - 1);
  const r = Math.max(0, normalized) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
}

export function seededUnit(seed: number, index: number) {
  const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function spiralPoint(index: number, count: number, radius = 1) {
  const r = Math.sqrt((index + 0.5) / count) * radius;
  const angle = index * GOLDEN_ANGLE;
  return [Math.cos(angle) * r, Math.sin(angle) * r] as const;
}

export function layeredSpiralPoint(index: number, count: number, arm: number, arms = 6, radius = 1) {
  const t = count <= 1 ? 0 : index / (count - 1);
  const angle = t * Math.PI * 7.5 + arm * Math.PI * 2 / arms;
  const r = (.18 + Math.pow(t, .76) * .82) * radius;
  const ripple = 1 + Math.sin(t * Math.PI * 16 + arm * 1.7) * .018;
  return [Math.cos(angle) * r * ripple, Math.sin(angle) * r * ripple] as const;
}

export function goldLeafTransform(seed: number, index: number, radius = 1) {
  const angle = seededUnit(seed + 11, index) * Math.PI * 2;
  const distance = (.18 + Math.sqrt(seededUnit(seed + 29, index)) * .82) * radius;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotation: seededUnit(seed + 47, index) * Math.PI * 2,
    scale: .55 + seededUnit(seed + 71, index) * 1.15,
  };
}

export function regularPolygonPoints(sides: number, radius: number, phase = 0, z = 0) {
  const safeSides = Math.max(3, Math.floor(sides));
  return Array.from({ length: safeSides + 1 }, (_, index) => {
    const angle = phase + index / safeSides * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number];
  });
}

export function crystalRosettePoints(petals: number, outerRadius: number, innerRadius: number, phase = 0, z = 0) {
  const safePetals = Math.max(3, Math.floor(petals));
  return Array.from({ length: safePetals * 2 + 1 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const angle = phase + index / (safePetals * 2) * Math.PI * 2;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, z] as [number, number, number];
  });
}

export function radialRayTransform(seed: number, index: number, count: number, radius = 1) {
  const safeCount = Math.max(1, count);
  const angle = index / safeCount * Math.PI * 2 + (seededUnit(seed + 211, index) - .5) * .035;
  return {
    angle,
    length: radius * (.76 + seededUnit(seed + 223, index) * .24),
    width: .012 + seededUnit(seed + 227, index) * .026,
  };
}

export function sparkleTransform(seed: number, index: number, radius = 1) {
  const angle = seededUnit(seed + 307, index) * Math.PI * 2;
  const distance = Math.sqrt(seededUnit(seed + 311, index)) * radius;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    rotation: seededUnit(seed + 313, index) * Math.PI * 2,
    scale: .45 + seededUnit(seed + 317, index) * 1.4,
  };
}

export type MandalaMotif = "hexagon" | "octagon" | "circles" | "petals";
const MOTIFS: MandalaMotif[] = ["hexagon", "petals", "octagon", "circles", "hexagon", "petals"];

/** Assign the overall color to the core and six birth colors to rings, inner to outer (colors unmodified). */
export function simpleMandalaRings(colors: string[], radius = 480) {
  const core = colors[0] ?? "#FFD21C";
  const birth = Array.from({ length: 6 }, (_, i) => colors[i + 1] ?? core);
  const coreRadius = radius * .16;
  const step = (radius - coreRadius) / 6;
  return {
    core,
    coreRadius,
    rings: birth.map((color, i) => ({
      color,
      innerColor: i === 0 ? core : birth[i - 1] ?? core,
      inner: coreRadius + i * step,
      outer: coreRadius + (i + 1) * step,
      motif: MOTIFS[i] ?? "hexagon",
      symmetry: [6, 8, 8, 12, 12, 16][i] ?? 12,
      dots: 24 + i * 12,
    })),
  };
}

export type PaintDot = { x: number; y: number; r: number; color: string; band: number };

/** Deterministic hand-painted dot mandala layout using only the overall color and six birth colors. */
export function dotPaintLayout(colors: string[], radius = 480): PaintDot[] {
  const core = colors[0] ?? "#FFD21C";
  const b = Array.from({ length: 6 }, (_, i) => colors[i + 1] ?? core);
  const k = radius / 480;
  const dots: PaintDot[] = [];
  const add = (x: number, y: number, r: number, color: string, band: number) => dots.push({ x: x * k, y: y * k, r: r * k, color, band });
  const polar = (rad: number, a: number) => [Math.cos(a) * rad, Math.sin(a) * rad] as const;
  const ring = (rad: number, size: number, band: number, c1: string, c2 = c1, offset = 0) => {
    const n = Math.max(6, Math.round((Math.PI * 2 * rad) / (size * 2.7)));
    for (let i = 0; i < n; i++) { const [x, y] = polar(rad, (i + offset) / n * Math.PI * 2); add(x, y, size, i % 2 ? c2 : c1, band); }
  };
  // 0: eye core
  add(0, 0, 15, core, 0);
  add(0, 0, 6, b[0]!, 0);
  ring(24, 4.2, 0, b[0]!);
  ring(33, 3.4, 0, core, b[1]!);
  ring(42, 3, 0, b[0]!);
  // 1: slender radial petals
  for (let p = 0; p < 24; p++) {
    const a = p / 24 * Math.PI * 2;
    for (let j = 0; j < 7; j++) { const [x, y] = polar(54 + j * 8.5, a); add(x, y, 4.4 - j * .4, j % 2 ? b[0]! : core, 1); }
  }
  ring(118, 3.2, 1, b[1]!, core, .5);
  // 2: teardrop petals
  for (let p = 0; p < 12; p++) {
    const a = p / 12 * Math.PI * 2;
    for (let s = 0; s <= 22; s++) {
      const t = s / 22 * Math.PI * 2;
      const along = 128 + (1 - Math.cos(t)) / 2 * 76;
      const side = Math.sin(t) * Math.sin(t / 2) * .22;
      const [x, y] = polar(along, a + side);
      add(x, y, 3.2, b[1]!, 2);
    }
    for (let j = 0; j < 6; j++) { const [x, y] = polar(140 + j * 10, a); add(x, y, 5 - j * .55, j % 2 ? b[2]! : core, 2); }
    const [x, y] = polar(205, a + Math.PI / 12); add(x, y, 5, b[2]!, 2);
  }
  // 3: dot rows
  [214, 226, 238, 250].forEach((rad, i) => ring(rad, 3.6 - i * .2, 3, i % 2 ? b[3]! : b[2]!, i % 2 ? b[2]! : b[3]!, i * .5));
  // 4: peacock scales
  for (let p = 0; p < 16; p++) {
    const a = (p + .5) / 16 * Math.PI * 2;
    for (let s = 0; s <= 26; s++) {
      const t = s / 26 * Math.PI;
      const along = 262 + Math.sin(t) * 118;
      const side = (s / 26 - .5) * (Math.PI * 2 / 16) * .92;
      const [x, y] = polar(along, a + side * (1 - Math.sin(t) * .25));
      add(x, y, 3.3, b[4]!, 4);
    }
    const [cx, cy] = polar(328, a);
    add(cx, cy, 9, b[3]!, 4);
    add(cx, cy, 3.5, core, 4);
    for (const [rr, n, size, c] of [[16, 10, 3.2, b[4]!], [26, 16, 2.8, b[3]!]] as const) {
      for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; add(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr, size, c, 4); }
    }
    for (let j = 0; j < 4; j++) { const [x, y] = polar(272 + j * 7, a); add(x, y, 3 - j * .35, b[4]!, 4); }
  }
  // 5: dot rows + wave lace edge
  ring(392, 3.2, 5, b[5]!, b[4]!);
  ring(403, 2.6, 5, b[4]!, b[5]!, .5);
  for (let s = 0; s < 32 * 14; s++) {
    const a = s / (32 * 14) * Math.PI * 2;
    const wave = Math.abs(Math.sin(a * 16));
    const [x1, y1] = polar(414 + wave * 48, a); add(x1, y1, 2.9, b[5]!, 5);
    if (s % 2 === 0) { const [x2, y2] = polar(414 + wave * 30, a); add(x2, y2, 2.3, b[4]!, 5); }
  }
  for (let p = 0; p < 32; p++) { const [x, y] = polar(466, (p + .5) / 32 * Math.PI * 2 - Math.PI / 32 + Math.PI / 32); add(x, y, 4.5, core, 5); }
  ring(474, 2, 5, b[5]!);
  return dots;
}

export type CompassBlade = { points: string; light: boolean };
export type MandalaLayer = {
  color: string;
  innerColor: string;
  inner: number;
  outer: number;
  petals: number;
  phase: number;
  motif: MandalaMotif;
  path: string;
  segments: MandalaSegment[];
  innerPath: string;
  innerSegments: MandalaSegment[];
  facetPath: string;
  facetSegments: MandalaSegment[];
  guillochePath: string;
};
export type MandalaSegment = { path: string; angle: number; index: number };
export type GoldParticle = { x: number; y: number; r: number; delay: number };

const f = (n: number) => n.toFixed(2);

function layerSegments(motif: MandalaMotif, petals: number, inner: number, outer: number, phase: number): MandalaSegment[] {
  const parts: MandalaSegment[] = [];
  const step = Math.PI * 2 / petals;
  for (let i = 0; i < petals; i++) {
    const a = phase + i * step;
    const p = (r: number, da = 0) => `${f(Math.cos(a + da) * r)} ${f(Math.sin(a + da) * r)}`;
    const half = step / 2;
    let path: string;
    if (motif === "petals") path = `M${p(inner, -half * .9)}Q${p(outer * .98, -half * .55)} ${p(outer)}Q${p(outer * .98, half * .55)} ${p(inner, half * .9)}Z`;
    else if (motif === "hexagon" || motif === "octagon") path = `M${p(inner, -half)}L${p((inner + outer) / 2, -half * .5)}L${p(outer)}L${p((inner + outer) / 2, half * .5)}L${p(inner, half)}Z`;
    else { const mid = (inner + outer) / 2; const rr = Math.min((outer - inner) * .46, mid * Math.sin(step / 2) * .9); const cx = Math.cos(a) * mid, cy = Math.sin(a) * mid; path = `M${f(cx + rr)} ${f(cy)}A${f(rr)} ${f(rr)} 0 1 0 ${f(cx - rr)} ${f(cy)}A${f(rr)} ${f(rr)} 0 1 0 ${f(cx + rr)} ${f(cy)}Z`; }
    parts.push({ path, angle: a, index: i });
  }
  return parts;
}

function facetedRingSegments(points: number, inner: number, outer: number, phase: number): MandalaSegment[] {
  const parts: MandalaSegment[] = [];
  const step = Math.PI * 2 / points;
  for (let i = 0; i < points; i++) {
    const a = phase + i * step;
    const next = a + step;
    const mid = a + step / 2;
    const p = (r: number, angle: number) => `${f(Math.cos(angle) * r)} ${f(Math.sin(angle) * r)}`;
    parts.push({ path: `M${p(inner, a)}L${p(outer, mid)}L${p(inner, next)}L${p((inner + outer) * .52, mid)}Z`, angle: mid, index: i });
  }
  return parts;
}

function guillocheRingPath(points: number, radius: number, amplitude: number, phase: number, weave = 3) {
  const samples = Math.max(96, points * 10);
  return Array.from({ length: samples + 1 }, (_, index) => {
    const a = phase + index / samples * Math.PI * 2;
    const r = radius + Math.sin(a * points * weave) * amplitude + Math.cos(a * points) * amplitude * .28;
    return `${index === 0 ? "M" : "L"}${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}`;
  }).join("") + "Z";
}

function colorWorkSeed(colors: string[]) {
  return colors.join("").split("").reduce((seed, character, index) => (seed * 33 + character.charCodeAt(0) + index) % 104729, 5381);
}

/** Fully local compass mandala: golden 16-point compass core, six birth-color petal layers, deterministic gold particles. */
export function compassMandalaLayout(colors: string[], variation = 0, radius = 480, petalPlan: number[] | null = null) {
  const { core, rings } = simpleMandalaRings(colors, radius);
  const workSeed = colorWorkSeed(colors) + variation * 7919;
  const shift = seededUnit(workSeed + 1, 3) * Math.PI;
  const layers: MandalaLayer[] = rings.map((ring, i) => {
    const basePetals = [10, 12, 16, 18, 24, 32][i] ?? 16;
    const petals = petalPlan?.[i] ?? basePetals + (Math.floor(seededUnit(workSeed + 17, i) * 3) * 2);
    const phase = -Math.PI / 2 + shift / petals + (i % 2 ? Math.PI / petals : 0);
    const width = ring.outer - ring.inner;
    const segments = layerSegments(ring.motif, petals, ring.inner * .98, ring.outer, phase);
    const innerSegments = layerSegments("petals", petals, ring.inner + width * .16, ring.outer - width * .18, phase + Math.PI / petals);
    const facetSegments = facetedRingSegments(petals, ring.inner + width * .08, ring.outer - width * .04, phase);
    return {
      color: ring.color,
      innerColor: ring.innerColor,
      inner: ring.inner,
      outer: ring.outer,
      petals,
      phase,
      motif: ring.motif,
      path: segments.map(segment => segment.path).join(""),
      segments,
      innerPath: innerSegments.map(segment => segment.path).join(""),
      innerSegments,
      facetPath: facetSegments.map(segment => segment.path).join(""),
      facetSegments,
      guillochePath: guillocheRingPath(petals, (ring.inner + ring.outer) / 2, width * .23, phase, 2 + i % 3),
    };
  });
  const compassR = radius * .2;
  const blades: CompassBlade[] = [];
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 8;
    const len = i % 4 === 0 ? compassR : i % 2 === 0 ? compassR * .72 : compassR * .5;
    const w = Math.PI / 16;
    const tip = [Math.cos(a) * len, Math.sin(a) * len];
    const side = (s: number) => [Math.cos(a + s * w * 1.6) * len * .34, Math.sin(a + s * w * 1.6) * len * .34];
    const [lx, ly] = side(-1), [rx, ry] = side(1);
    blades.push({ points: `0,0 ${f(lx!)},${f(ly!)} ${f(tip[0]!)},${f(tip[1]!)}`, light: true });
    blades.push({ points: `0,0 ${f(rx!)},${f(ry!)} ${f(tip[0]!)},${f(tip[1]!)}`, light: false });
  }
  const particles: GoldParticle[] = Array.from({ length: 140 }, (_, i) => {
    const a = seededUnit(workSeed + 501, i) * Math.PI * 2;
    const d = (.12 + Math.sqrt(seededUnit(workSeed + 503, i)) * .9) * radius;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: .8 + seededUnit(workSeed + 509, i) * 2.2, delay: seededUnit(workSeed + 521, i) * 4 };
  });
  return { core, compassR, blades, layers, particles, workSeed };
}
