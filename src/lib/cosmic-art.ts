import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 2;

export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; orbitRadius: number; displayAngle: number; depth: number };
export type CosmicSunPlacement = { x: number; y: number; radius: number; displayAngle: number };
export type CosmicBirthplaceLight = { x: number; y: number; plumeAngle: number; safetyRadius: number };
export type CosmicEarthPortrait = { x: number; y: number; radius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const ORBIT_RADIUS: Record<CosmicPlanet["id"], number> = {
  mercury: .105,
  venus: .135,
  earth: .17,
  mars: .205,
  jupiter: .245,
  saturn: .285,
  uranus: .325,
  neptune: .36,
};

const ART_ROTATION = -18;
const degrees = (value: number) => ((value % 360) + 360) % 360;

/** Preserves birth-instant heliocentric angles in a readable, distance-compressed solar-system overview. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  return genesis.planets.map((planet) => {
    const orbit = ORBIT_RADIUS[planet.id];
    const displayAngle = degrees(planet.longitude + ART_ROTATION);
    const angle = displayAngle * Math.PI / 180;
    const radius = Math.max(size * .007, planet.displayRadius * COSMIC_PLANET_SCALE * size / 1900);
    const centerX = size * .43, centerY = size * .37;
    return {
      ...planet,
      radius,
      orbitRadius: orbit * size,
      x: centerX + Math.cos(angle) * orbit * size,
      y: centerY + Math.sin(angle) * orbit * size * .72,
      displayAngle,
      depth: .3 + (Math.sin(angle) + 1) * .2,
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