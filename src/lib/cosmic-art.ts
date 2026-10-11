import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 2;

export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; orbitRadius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const PORTRAIT_ANCHORS: Record<CosmicPlanet["id"], readonly [number, number, number]> = {
  mercury: [.24, .34, .72],
  venus: [.34, .69, .88],
  earth: [.55, .57, 3.72],
  mars: [.78, .76, .78],
  jupiter: [.76, .29, 1.38],
  saturn: [.2, .78, 1.3],
  uranus: [.88, .53, .94],
  neptune: [.1, .49, .98],
};

/** Maps astronomical longitude into a stable, depth-staged portrait rather than a solar-system diagram. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  return genesis.planets.map((planet) => {
    const anchor = PORTRAIT_ANCHORS[planet.id];
    const angle = planet.longitude * Math.PI / 180;
    const parallax = size * (planet.id === "earth" ? .014 : .024);
    const radius = planet.displayRadius * COSMIC_PLANET_SCALE * anchor[2] * size / 1024;
    return {
      ...planet,
      radius,
      orbitRadius: Math.hypot((anchor[0] - .5) * size, (anchor[1] - .5) * size),
      x: (anchor[0] * size) + Math.cos(angle) * parallax,
      y: (anchor[1] * size) + Math.sin(angle) * parallax,
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
    all: seven,
  };
}