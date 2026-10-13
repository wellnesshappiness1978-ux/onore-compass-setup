import { COSMIC_MOON_MEAN_RADIUS_KM, COSMIC_SUN_MEAN_RADIUS_KM, type CosmicGenesis, type CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 0.0009;
/** The prior 1.11 × 1.5 visibility treatment enlarged by the requested exact 1.3×. */
export const COSMIC_PLANET_DISPLAY_MULTIPLIER = 1.11 * 1.5 * 1.3;
/** Preserve the real Earth/Moon radius ratio; only their separation is compressed. */
export const COSMIC_MOON_DISPLAY_MULTIPLIER = 1;
export const COSMIC_BODY_RADII_KM = {
  sun: COSMIC_SUN_MEAN_RADIUS_KM,
  mercury: 2439.7,
  venus: 6051.8,
  earth: 6371,
  mars: 3389.5,
  jupiter: 69911,
  saturn: 58232,
  uranus: 25362,
  neptune: 24622,
} as const;

/** Representative semi-major axes keep conceptual orbit bands in their real, stable order. */
export const COSMIC_ORBIT_AU: Record<CosmicPlanet["id"], number> = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.069,
};

export type CosmicScreenPoint = { x: number; y: number; depth: number };
export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; ringOuterRadius: number; orbitRadius: number; displayAngle: number; depth: number; orbitPath: CosmicScreenPoint[] };
export type CosmicSunPlacement = { x: number; y: number; radius: number; physicalRadiusKm: number; displayAngle: number };
export type CosmicBirthplaceLight = { x: number; y: number; plumeAngle: number; safetyRadius: number };
export type CosmicEarthPortrait = { x: number; y: number; radius: number };
export type CosmicComposition = { centerX: number; centerY: number; rotation: number; scale: number; targetAngle: number };
export type CosmicSizeComparison = { id: "sun" | CosmicPlanet["id"]; x: number; y: number; radius: number; physicalRadiusKm: number };
export type CosmicAstrolabeFrame = { x: number; y: number; innerRadius: number; outerRadius: number; tickCount: number };
export type CosmicMoonPlacement = { x: number; y: number; radius: number; distance: number; displayAngle: number; phaseFraction: number; phaseAngle: number; lightAngle: number; poleAngle: number; librationLongitude: number; librationLatitude: number };
export type CosmicCompassIdentity = { sunSign: number; moonSign: number; guardian: number; awakenedSectors: readonly number[] };
export type CosmicShellPoint = CosmicScreenPoint & { progress: number; angle: number; radius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const DISTANCE_CURVE = 2.4;
const SCREEN_ROTATION = 0;
const degrees = (value: number) => ((value % 360) + 360) % 360;

function compressedDistance(distanceAu: number) {
  return Math.log1p(distanceAu * DISTANCE_CURVE) / Math.log1p(30.4 * DISTANCE_CURVE);
}

/**
 * A single monotonic conceptual-orbit curve with a little more room around Earth.
 * The knots preserve representative AU order while keeping enlarged inner bodies readable.
 */
function conceptualOrbitDistance(distanceAu: number) {
  const knots = [
    { au: 0, ratio: 0 },
    { au: COSMIC_ORBIT_AU.mercury, ratio: .18 },
    { au: COSMIC_ORBIT_AU.venus, ratio: .27 },
    { au: COSMIC_ORBIT_AU.earth, ratio: .376 },
    { au: COSMIC_ORBIT_AU.mars, ratio: .47 },
    { au: COSMIC_ORBIT_AU.jupiter, ratio: compressedDistance(COSMIC_ORBIT_AU.jupiter) },
    { au: COSMIC_ORBIT_AU.saturn, ratio: compressedDistance(COSMIC_ORBIT_AU.saturn) },
    { au: COSMIC_ORBIT_AU.uranus, ratio: compressedDistance(COSMIC_ORBIT_AU.uranus) },
    { au: COSMIC_ORBIT_AU.neptune, ratio: compressedDistance(COSMIC_ORBIT_AU.neptune) },
  ];
  const upperIndex = knots.findIndex((knot) => distanceAu <= knot.au);
  if (upperIndex <= 0) return knots[0]?.ratio ?? 0;
  if (upperIndex < 0) return knots.at(-1)?.ratio ?? 1;
  const lower = knots[upperIndex - 1], upper = knots[upperIndex];
  if (!lower || !upper) return compressedDistance(distanceAu);
  const progress = (distanceAu - lower.au) / (upper.au - lower.au);
  return lower.ratio + (upper.ratio - lower.ratio) * progress;
}

/** One monotonic visibility scale for the central diagram; physical ratios remain exact in the comparison strip. */
export function cosmicDisplayRadius(meanRadiusKm: number, size: number) {
  return size * .058 * Math.pow(meanRadiusKm / COSMIC_SUN_MEAN_RADIUS_KM, .38);
}

/** Keeps the Sun at the center and maps Neptune's representative orbit to one shared diagram radius. */
export function cosmicComposition(genesis: CosmicGenesis, size: number): CosmicComposition {
  const rotation = SCREEN_ROTATION;
  const centerX = size * .5, centerY = size * .47;
  const scale = size * .423;
  const earth = genesis.planets.find((planet) => planet.id === "earth");
  const targetAngle = degrees((earth?.longitude ?? 0) + rotation);
  return { centerX, centerY, rotation, scale, targetAngle };
}

export function projectCosmicVector(vector: { x: number; y: number; z: number }, size: number, composition?: CosmicComposition): CosmicScreenPoint {
  const frame = composition ?? { centerX: size * .5, centerY: size * .5, rotation: SCREEN_ROTATION, scale: size * .42, targetAngle: 0 };
  const distance = Math.hypot(vector.x, vector.y, vector.z) || 1;
  const angle = Math.atan2(vector.y, vector.x) + frame.rotation * Math.PI / 180;
  const radius = compressedDistance(distance) * frame.scale;
  return { x: frame.centerX + Math.cos(angle) * radius, y: frame.centerY + Math.sin(angle) * radius, depth: Math.sin(angle) };
}

/** Places each planet at its birth longitude on a fixed, correctly ordered conceptual orbit band. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  const composition = cosmicComposition(genesis, size);
  return genesis.planets.map((planet) => {
    const displayAngle = degrees(planet.longitude + composition.rotation);
    const angle = displayAngle * Math.PI / 180;
    const orbitRadius = conceptualOrbitDistance(COSMIC_ORBIT_AU[planet.id]) * composition.scale;
    const point = {
      x: composition.centerX + Math.cos(angle) * orbitRadius,
      y: composition.centerY + Math.sin(angle) * orbitRadius,
      depth: Math.sin(angle),
    };
    const radius = cosmicDisplayRadius(planet.meanRadiusKm, size) * COSMIC_PLANET_DISPLAY_MULTIPLIER;
    const ringOuterRadius = planet.id === "saturn" ? radius * ((planet.ringOuterRadiusKm ?? planet.meanRadiusKm) / planet.meanRadiusKm) : radius;
    return {
      ...planet,
      radius,
      ringOuterRadius,
      orbitRadius,
      x: point.x,
      y: point.y,
      displayAngle,
      depth: point.depth,
      orbitPath: Array.from({ length: 128 }, (_, index) => {
        const orbitAngle = index / 128 * Math.PI * 2;
        return {
          x: composition.centerX + Math.cos(orbitAngle) * orbitRadius,
          y: composition.centerY + Math.sin(orbitAngle) * orbitRadius,
          depth: Math.sin(orbitAngle),
        };
      }),
    };
  });
}

/** The overview Sun is the fixed origin of the heliocentric layer. */
export function cosmicSunPlacement(_genesis: CosmicGenesis, size: number): CosmicSunPlacement {
  const composition = cosmicComposition(_genesis, size);
  return {
    x: composition.centerX,
    y: composition.centerY,
    radius: cosmicDisplayRadius(COSMIC_SUN_MEAN_RADIUS_KM, size),
    physicalRadiusKm: COSMIC_SUN_MEAN_RADIUS_KM,
    displayAngle: 0,
  };
}

/** Enlarges the same orbital Earth into a birthplace-facing foreground portrait. */
export function cosmicEarthPortrait(size: number): CosmicEarthPortrait {
  return { x: size * .865, y: size * .135, radius: size * .058 };
}

/** Places the birth Moon beside orbital Earth using its exact geocentric ecliptic direction and phase. */
export function cosmicMoonPlacement(genesis: CosmicGenesis, size: number, earth?: CosmicPlacement): CosmicMoonPlacement | null {
  const orbitalEarth = earth ?? cosmicPlacements(genesis, size).find((planet) => planet.id === "earth");
  if (!orbitalEarth) return null;
  const displayAngle = degrees(genesis.moon.longitude + cosmicComposition(genesis, size).rotation);
  const angle = displayAngle * Math.PI / 180;
  // Mean lunar separation is 60.3 Earth radii: compress it to a readable satellite grouping.
  // Retain the actual birth-distance variation without moving Earth's heliocentric position.
  const birthDistanceRatio = genesis.moon.distanceAu / (384400 / 149597870.7);
  const distance = orbitalEarth.radius * 2.15 * birthDistanceRatio;
  return {
    x: orbitalEarth.x + Math.cos(angle) * distance,
    y: orbitalEarth.y + Math.sin(angle) * distance,
    radius: orbitalEarth.radius * COSMIC_MOON_MEAN_RADIUS_KM / orbitalEarth.meanRadiusKm * COSMIC_MOON_DISPLAY_MULTIPLIER,
    distance,
    displayAngle,
    phaseFraction: genesis.moon.phaseFraction,
    phaseAngle: genesis.moon.phaseAngle,
    lightAngle: genesis.moon.lightAngle,
    poleAngle: genesis.moon.poleAngle,
    librationLongitude: genesis.moon.librationLongitude,
    librationLatitude: genesis.moon.librationLatitude,
  };
}

/** A fixed outer instrument ring that frames, but never changes, the astronomical diagram. */
export function cosmicAstrolabeFrame(size: number): CosmicAstrolabeFrame {
  return { x: size * .5, y: size * .47, innerRadius: size * .426, outerRadius: size * .469, tickCount: 72 };
}

/** Stable symbolic identity for the zodiac and guardian ring; astronomy remains the source of every sector. */
export function cosmicCompassIdentity(genesis: CosmicGenesis): CosmicCompassIdentity {
  const sunSign = ((genesis.sunSign % 12) + 12) % 12;
  const moonSign = ((genesis.moonSign % 12) + 12) % 12;
  const guardian = ((genesis.animal % 12) + 12) % 12;
  return { sunSign, moonSign, guardian, awakenedSectors: sunSign === moonSign ? [sunSign] : [sunSign, moonSign] };
}

/** A deterministic logarithmic shell growth line beneath the astronomical layers. */
export function cosmicShellSpiral(size: number, rotationDegrees = 0): CosmicShellPoint[] {
  const centerX = size * .5, centerY = size * .47;
  const startRadius = size * .052, endRadius = size * .405;
  const turns = 2.42, rotation = rotationDegrees * Math.PI / 180;
  return Array.from({ length: 241 }, (_, index) => {
    const progress = index / 240;
    const radius = startRadius * Math.pow(endRadius / startRadius, progress);
    const angle = rotation + progress * Math.PI * 2 * turns;
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      depth: Math.sin(angle),
      progress,
      angle,
      radius,
    };
  });
}

/** Sun and planets on one linear physical-radius scale, independent from the visibility-scaled orbit diagram. */
export function cosmicSizeComparison(genesis: CosmicGenesis, size: number): CosmicSizeComparison[] {
  const ids: CosmicSizeComparison["id"][] = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
  const maxRadius = size * .041;
  return ids.map((id, index) => {
    const planet = id === "sun" ? undefined : genesis.planets.find((candidate) => candidate.id === id);
    const physicalRadiusKm = id === "sun" ? COSMIC_SUN_MEAN_RADIUS_KM : planet?.meanRadiusKm ?? COSMIC_BODY_RADII_KM[id];
    return {
      id,
      x: size * (.065 + index * .1085),
      y: size * .912,
      radius: maxRadius * physicalRadiusKm / COSMIC_SUN_MEAN_RADIUS_KM,
      physicalRadiusKm,
    };
  });
}

export function cosmicColorRoles(colors: string[]) {
  const fallback = "#F4D03F";
  const seven: [string, string, string, string, string, string, string] = [0, 1, 2, 3, 4, 5, 6].map((index) => colors[index] ?? colors[index % Math.max(colors.length, 1)] ?? fallback) as [string, string, string, string, string, string, string];
  return {
    overall: seven[0] ?? fallback,
    secondary: seven[1] ?? fallback,
    wealth: seven[2] ?? fallback,
    work: seven[3] ?? fallback,
    love: seven[4] ?? fallback,
    health: seven[5] ?? fallback,
    inner: seven[6] ?? fallback,
    prominence: [seven[0], seven[5], seven[4], seven[3], seven[2], seven[1], seven[6]],
    all: seven,
  };
}

/** Keeps the birthplace radiance on Earth while pointing its atmospheric plume away from the globe. */
export function cosmicBirthplaceLight(earth: Pick<CosmicPlacement, "x" | "y" | "radius">, point = { x: earth.x, y: earth.y - earth.radius * .12 }): CosmicBirthplaceLight {
  return {
    x: point.x,
    y: point.y,
    plumeAngle: Math.atan2(point.y - earth.y, point.x - earth.x),
    safetyRadius: earth.radius * 1.45,
  };
}