import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 2;

export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; orbitRadius: number; displayAngle: number; depth: number };
export type CosmicSunPlacement = { x: number; y: number; radius: number; displayAngle: number };
export type CosmicBirthplaceLight = { x: number; y: number; plumeAngle: number; safetyRadius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const ORBIT_DEPTH: Record<CosmicPlanet["id"], readonly [number, number]> = {
  mercury: [.31, .72],
  venus: [.35, .78],
  earth: [0, 3.9],
  mars: [.39, .72],
  jupiter: [.43, .9],
  saturn: [.46, .88],
  uranus: [.48, .7],
  neptune: [.5, .66],
};

const ART_ROTATION = -32;
const degrees = (value: number) => ((value % 360) + 360) % 360;

/** Preserves every birth-instant heliocentric longitude while treating Earth as the portrait subject. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  return genesis.planets.map((planet) => {
    const orbit = ORBIT_DEPTH[planet.id];
    const displayAngle = degrees(planet.longitude + ART_ROTATION);
    const angle = displayAngle * Math.PI / 180;
    const radius = planet.id === "earth"
      ? size * .255
      : planet.displayRadius * COSMIC_PLANET_SCALE * orbit[1] * size / 1024;
    if (planet.id === "earth") return {
      ...planet,
      radius,
      orbitRadius: 0,
      x: size * .52,
      y: size * .615,
      displayAngle,
      depth: 1,
    };
    const rawX = size * (.5 + Math.cos(angle) * orbit[0]);
    const rawY = size * (.47 + Math.sin(angle) * orbit[0] * .68);
    const edgeExtent = radius * (planet.id === "saturn" ? 1.8 : 1.15);
    return {
      ...planet,
      radius,
      orbitRadius: orbit[0] * size,
      x: Math.min(size - edgeExtent, Math.max(edgeExtent, rawX)),
      y: Math.min(size - edgeExtent, Math.max(edgeExtent, rawY)),
      displayAngle,
      depth: .25 + (Math.sin(angle) + 1) * .24,
    };
  });
}

/** The Sun appears from the direction opposite Earth's heliocentric vector. */
export function cosmicSunPlacement(genesis: CosmicGenesis, size: number): CosmicSunPlacement {
  const earthLongitude = genesis.planets.find((planet) => planet.id === "earth")?.longitude ?? 0;
  const displayAngle = degrees(earthLongitude + 180 + ART_ROTATION);
  const angle = displayAngle * Math.PI / 180;
  return {
    x: size * (.5 + Math.cos(angle) * .37),
    y: size * (.45 + Math.sin(angle) * .255),
    radius: size * .105,
    displayAngle,
  };
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