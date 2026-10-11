import type { CosmicGenesis, CosmicPlanet } from "./cosmic-astronomy";

export const COSMIC_PLANET_SCALE = 2;

export type CosmicPlacement = CosmicPlanet & { x: number; y: number; radius: number; orbitRadius: number };

export const COSMIC_GUARDIANS = ["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"] as const;

const ORBIT_RATIOS = [.105, .155, .215, .28, .35, .415, .475, .535] as const;

/** Keeps astronomical angles intact while mapping real distances to an artwork-safe orbital field. */
export function cosmicPlacements(genesis: CosmicGenesis, size: number): CosmicPlacement[] {
  const centerX = size * .47;
  const centerY = size * .53;
  const margin = size * .025;
  const placements = genesis.planets.map((planet, index) => {
    const radius = planet.displayRadius * COSMIC_PLANET_SCALE * size / 1024;
    const extent = radius * (planet.id === "saturn" ? 1.9 : 1.15);
    const maximumOrbit = size * .5 - margin - extent;
    const orbitRadius = Math.min(size * (ORBIT_RATIOS[index] ?? .5), maximumOrbit);
    const angle = (planet.longitude - 112) * Math.PI / 180;
    const rawX = centerX + Math.cos(angle) * orbitRadius;
    const rawY = centerY + Math.sin(angle) * orbitRadius * .72 + Math.cos(angle) * orbitRadius * .16;
    const x = Math.min(size - margin - extent, Math.max(margin + extent, rawX));
    const y = Math.min(size - margin - extent, Math.max(margin + extent, rawY));
    return { ...planet, radius, orbitRadius, x, y };
  });
  const clamp = (planet: CosmicPlacement) => {
    const extent = planet.radius * (planet.id === "saturn" ? 1.9 : 1.15);
    planet.x = Math.min(size - margin - extent, Math.max(margin + extent, planet.x));
    planet.y = Math.min(size - margin - extent, Math.max(margin + extent, planet.y));
  };
  for (let pass = 0; pass < 24; pass++) {
    for (let a = 0; a < placements.length; a++) {
      const first = placements[a]; if (!first) continue;
      for (let b = a + 1; b < placements.length; b++) {
        const second = placements[b]; if (!second) continue;
        const dx = second.x - first.x, dy = second.y - first.y;
        const distance = Math.hypot(dx, dy) || 1;
        const firstExtent = first.radius * (first.id === "saturn" ? 1.72 : 1.08);
        const secondExtent = second.radius * (second.id === "saturn" ? 1.72 : 1.08);
        const minimum = firstExtent + secondExtent + size * .012;
        if (distance >= minimum) continue;
        const push = (minimum - distance) * .52;
        const nx = dx / distance, ny = dy / distance;
        first.x -= nx * push; first.y -= ny * push;
        second.x += nx * push; second.y += ny * push;
        clamp(first); clamp(second);
      }
    }
  }
  return placements;
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