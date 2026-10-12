import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 0.0015;

export type CosmicScreenPoint = { x: number; y: number; depth: number };
export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; ringOuterRadius: number; orbitRadius: number; displayAngle: number; depth: number; orbitPath: CosmicScreenPoint[] };
export type CosmicSunPlacement = { x: number; y: number; radius: number; displayAngle: number };
export type CosmicBirthplaceLight = { x: number; y: number; plumeAngle: number; safetyRadius: number };
export type CosmicEarthPortrait = { x: number; y: number; radius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const ART_ROTATION = -18;
const VIEW_TILT = 32;
const MAX_ORBIT_RADIUS = .335;
const DISTANCE_CURVE = 1.8;
const degrees = (value: number) => ((value % 360) + 360) % 360;

function compressedDistance(distanceAu: number) {
  return Math.log1p(distanceAu * DISTANCE_CURVE) / Math.log1p(30.4 * DISTANCE_CURVE);
}

export function projectCosmicVector(vector: { x: number; y: number; z: number }, size: number): CosmicScreenPoint {
  const centerX = size * .43, centerY = size * .37;
  const rotation = ART_ROTATION * Math.PI / 180;
  const tilt = VIEW_TILT * Math.PI / 180;
  const distance = Math.hypot(vector.x, vector.y, vector.z) || 1;
  const radial = compressedDistance(distance) * size * MAX_ORBIT_RADIUS;
  const normalizedX = vector.x / distance, normalizedY = vector.y / distance, normalizedZ = vector.z / distance;
  const rotatedX = normalizedX * Math.cos(rotation) - normalizedY * Math.sin(rotation);
  const rotatedY = normalizedX * Math.sin(rotation) + normalizedY * Math.cos(rotation);
  const projectedY = rotatedY * Math.cos(tilt) - normalizedZ * Math.sin(tilt);
  const depth = rotatedY * Math.sin(tilt) + normalizedZ * Math.cos(tilt);
  return { x: centerX + rotatedX * radial, y: centerY + projectedY * radial, depth };
}

/** Preserves birth-instant heliocentric angles in a readable, distance-compressed solar-system overview. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  return genesis.planets.map((planet) => {
    const displayAngle = degrees(planet.longitude + ART_ROTATION);
    const point = projectCosmicVector({ x: planet.eclipticX, y: planet.eclipticY, z: planet.eclipticZ }, size);
    const radius = planet.meanRadiusKm * COSMIC_PLANET_SCALE * size / 1024;
    const ringOuterRadius = (planet.ringOuterRadiusKm ?? planet.meanRadiusKm) * COSMIC_PLANET_SCALE * size / 1024;
    return {
      ...planet,
      radius,
      ringOuterRadius,
      orbitRadius: compressedDistance(planet.distanceAu) * size * MAX_ORBIT_RADIUS,
      x: point.x,
      y: point.y,
      displayAngle,
      depth: point.depth,
      orbitPath: planet.orbit.map((sample) => projectCosmicVector(sample, size)),
    };
  });
}

/** The overview Sun is the fixed origin of the heliocentric layer. */
export function cosmicSunPlacement(_genesis: CosmicGenesis, size: number): CosmicSunPlacement {
  return {
    x: size * .43,
    y: size * .37,
    radius: size * .063,
    displayAngle: 0,
  };
}

/** Enlarges the same orbital Earth into a birthplace-facing foreground portrait. */
export function cosmicEarthPortrait(size: number): CosmicEarthPortrait {
  return { x: size * .67, y: size * .72, radius: size * .235 };
}

export function cosmicColorRoles(colors: string[]) {
  const fallback = "#F4D03F";
  const seven = Array.from({ length: 7 }, (_, index) => colors[index] ?? colors[index % Math.max(colors.length, 1)] ?? fallback);
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