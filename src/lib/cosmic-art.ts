import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 0.0015;

export type CosmicScreenPoint = { x: number; y: number; depth: number };
export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; ringOuterRadius: number; orbitRadius: number; displayAngle: number; depth: number; orbitPath: CosmicScreenPoint[] };
export type CosmicSunPlacement = { x: number; y: number; radius: number; displayAngle: number };
export type CosmicBirthplaceLight = { x: number; y: number; plumeAngle: number; safetyRadius: number };
export type CosmicEarthPortrait = { x: number; y: number; radius: number };
export type CosmicComposition = { centerX: number; centerY: number; rotation: number; scale: number; targetAngle: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const VIEW_TILT = 32;
const DISTANCE_CURVE = 1.8;
const SCREEN_ROTATION = 0;
const degrees = (value: number) => ((value % 360) + 360) % 360;

function compressedDistance(distanceAu: number) {
  return Math.log1p(distanceAu * DISTANCE_CURVE) / Math.log1p(30.4 * DISTANCE_CURVE);
}

function projectedUnit(vector: { x: number; y: number; z: number }, rotation: number) {
  const rotationRadians = rotation * Math.PI / 180;
  const tilt = VIEW_TILT * Math.PI / 180;
  const distance = Math.hypot(vector.x, vector.y, vector.z) || 1;
  const radial = compressedDistance(distance);
  const normalizedX = vector.x / distance, normalizedY = vector.y / distance, normalizedZ = vector.z / distance;
  const rotatedX = normalizedX * Math.cos(rotationRadians) - normalizedY * Math.sin(rotationRadians);
  const rotatedY = normalizedX * Math.sin(rotationRadians) + normalizedY * Math.cos(rotationRadians);
  const projectedY = rotatedY * Math.cos(tilt) - normalizedZ * Math.sin(tilt);
  const depth = rotatedY * Math.sin(tilt) + normalizedZ * Math.cos(tilt);
  return { x: rotatedX * radial, y: projectedY * radial, depth };
}

/** Keeps the Sun at the absolute artwork center and fits every sampled real orbit with one shared scale. */
export function cosmicComposition(genesis: CosmicGenesis, size: number): CosmicComposition {
  const rotation = SCREEN_ROTATION;
  const centerX = size * .5, centerY = size * .5;
  const bounds = { left: size * .055, right: size * .945, top: size * .055, bottom: size * .945 };
  const points = genesis.planets.flatMap((planet) => [
    { x: planet.eclipticX, y: planet.eclipticY, z: planet.eclipticZ },
    ...planet.orbit,
  ]).map((point) => projectedUnit(point, rotation));
  const positiveX = Math.max(.001, ...points.map((point) => point.x));
  const negativeX = Math.max(.001, ...points.map((point) => -point.x));
  const positiveY = Math.max(.001, ...points.map((point) => point.y));
  const negativeY = Math.max(.001, ...points.map((point) => -point.y));
  const scale = Math.min(
    (bounds.right - centerX) / positiveX,
    (centerX - bounds.left) / negativeX,
    (bounds.bottom - centerY) / positiveY,
    (centerY - bounds.top) / negativeY,
  );
  const earth = genesis.planets.find((planet) => planet.id === "earth");
  const projectedEarth = earth ? projectedUnit({ x: earth.eclipticX, y: earth.eclipticY, z: earth.eclipticZ }, rotation) : { x: 1, y: 0 };
  const targetAngle = Math.atan2(projectedEarth.y, projectedEarth.x) * 180 / Math.PI;
  return { centerX, centerY, rotation, scale, targetAngle };
}

export function projectCosmicVector(vector: { x: number; y: number; z: number }, size: number, composition?: CosmicComposition): CosmicScreenPoint {
  const frame = composition ?? { centerX: size * .5, centerY: size * .5, rotation: SCREEN_ROTATION, scale: size * .42, targetAngle: 0 };
  const point = projectedUnit(vector, frame.rotation);
  return { x: frame.centerX + point.x * frame.scale, y: frame.centerY + point.y * frame.scale, depth: point.depth };
}

/** Preserves birth-instant heliocentric angles in a readable, distance-compressed solar-system overview. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  const composition = cosmicComposition(genesis, size);
  return genesis.planets.map((planet) => {
    const displayAngle = degrees(planet.longitude + composition.rotation);
    const point = projectCosmicVector({ x: planet.eclipticX, y: planet.eclipticY, z: planet.eclipticZ }, size, composition);
    const radius = planet.meanRadiusKm * COSMIC_PLANET_SCALE * size / 1024;
    const ringOuterRadius = (planet.ringOuterRadiusKm ?? planet.meanRadiusKm) * COSMIC_PLANET_SCALE * size / 1024;
    return {
      ...planet,
      radius,
      ringOuterRadius,
      orbitRadius: compressedDistance(planet.distanceAu) * composition.scale,
      x: point.x,
      y: point.y,
      displayAngle,
      depth: point.depth,
      orbitPath: planet.orbit.map((sample) => projectCosmicVector(sample, size, composition)),
    };
  });
}

/** The overview Sun is the fixed origin of the heliocentric layer. */
export function cosmicSunPlacement(_genesis: CosmicGenesis, size: number): CosmicSunPlacement {
  const composition = cosmicComposition(_genesis, size);
  return {
    x: composition.centerX,
    y: composition.centerY,
    radius: size * .063,
    displayAngle: 0,
  };
}

/** Enlarges the same orbital Earth into a birthplace-facing foreground portrait. */
export function cosmicEarthPortrait(size: number): CosmicEarthPortrait {
  return { x: size * .79, y: size * .79, radius: size * .145 };
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