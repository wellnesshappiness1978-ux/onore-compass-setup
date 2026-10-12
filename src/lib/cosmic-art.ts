import { COSMIC_SUN_MEAN_RADIUS_KM, type CosmicGenesis, type CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 0.0009;
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

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const DISTANCE_CURVE = 1.8;
const SCREEN_ROTATION = 0;
const degrees = (value: number) => ((value % 360) + 360) % 360;

function compressedDistance(distanceAu: number) {
  return Math.log1p(distanceAu * DISTANCE_CURVE) / Math.log1p(30.4 * DISTANCE_CURVE);
}

/** One monotonic visibility scale for the central diagram; physical ratios remain exact in the comparison strip. */
export function cosmicDisplayRadius(meanRadiusKm: number, size: number) {
  return size * .05 * Math.pow(meanRadiusKm / COSMIC_SUN_MEAN_RADIUS_KM, .38);
}

/** Keeps the Sun at the center and maps Neptune's representative orbit to one shared diagram radius. */
export function cosmicComposition(genesis: CosmicGenesis, size: number): CosmicComposition {
  const rotation = SCREEN_ROTATION;
  const centerX = size * .5, centerY = size * .47;
  const scale = size * .438;
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
    const orbitRadius = compressedDistance(COSMIC_ORBIT_AU[planet.id]) * composition.scale;
    const point = {
      x: composition.centerX + Math.cos(angle) * orbitRadius,
      y: composition.centerY + Math.sin(angle) * orbitRadius,
      depth: Math.sin(angle),
    };
    const radius = cosmicDisplayRadius(planet.meanRadiusKm, size);
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
  return { x: size * .87, y: size * .13, radius: size * .06 };
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