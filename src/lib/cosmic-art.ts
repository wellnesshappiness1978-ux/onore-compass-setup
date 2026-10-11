import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 2;

export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; orbitRadius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const ORBIT_DEPTH: Record<CosmicPlanet["id"], readonly [number, number, number]> = {
  mercury: [.16, .105, .8],
  venus: [.22, .145, .9],
  earth: [.27, .225, 3.25],
  mars: [.31, .205, .9],
  jupiter: [.37, .245, 1.18],
  saturn: [.405, .27, 1.08],
  uranus: [.44, .29, .83],
  neptune: [.465, .31, .78],
};

/** Rotates the real heliocentric longitudes so Earth is the foreground anchor beneath the central Sun. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  const earthLongitude = genesis.planets.find((planet) => planet.id === "earth")?.longitude ?? 0;
  return genesis.planets.map((planet) => {
    const orbit = ORBIT_DEPTH[planet.id];
    const angle = (planet.longitude - earthLongitude + 90) * Math.PI / 180;
    const radius = planet.displayRadius * COSMIC_PLANET_SCALE * orbit[2] * size / 1024;
    const rawX = size * (.5 + Math.cos(angle) * orbit[0]);
    const edgeExtent = radius * (planet.id === "saturn" ? 1.8 : 1.15);
    return {
      ...planet,
      radius,
      orbitRadius: orbit[0] * size,
      x: Math.min(size - edgeExtent, Math.max(edgeExtent, rawX)),
      y: size * (.475 + Math.sin(angle) * orbit[1]),
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