import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 2;

export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; orbitRadius: number };

const ORBIT_RATIOS = [.105, .155, .215, .28, .35, .415, .475, .535] as const;

/** Keeps astronomical angles intact while mapping real distances to an artwork-safe orbital field. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  const center = size / 2;
  const margin = size * .025;
  return genesis.planets.map((planet, index) => {
    const radius = planet.displayRadius * COSMIC_PLANET_SCALE * size / 1024;
    const maximumOrbit = center - margin - radius * (planet.id === "saturn" ? 1.9 : 1.15);
    const orbitRadius = Math.min(size * (ORBIT_RATIOS[index] ?? .5), maximumOrbit);
    const angle = (planet.longitude - 90) * Math.PI / 180;
    return { ...planet, radius, orbitRadius, x: center + Math.cos(angle) * orbitRadius, y: center + Math.sin(angle) * orbitRadius };
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