import { describe, expect, it } from "vitest";
import { cosmicGenesis } from "./cosmic-astronomy";
import { COSMIC_GUARDIANS, COSMIC_PLANET_SCALE, cosmicColorRoles, cosmicPlacements } from "./cosmic-art";

describe("Cosmic Genesis artwork layout", () => {
  it("doubles every planet and keeps planets, including Saturn's ring, inside the canvas", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    expect(genesis).not.toBeNull();
    if (!genesis) return;
    const placements = cosmicPlacements(genesis, 1024);
    placements.forEach((planet) => {
      expect(planet.radius).toBe(planet.displayRadius * COSMIC_PLANET_SCALE);
      const extent = planet.radius * (planet.id === "saturn" ? 1.9 : 1.15);
      expect(planet.x - extent).toBeGreaterThanOrEqual(0);
      expect(planet.y - extent).toBeGreaterThanOrEqual(0);
      expect(planet.x + extent).toBeLessThanOrEqual(1024);
      expect(planet.y + extent).toBeLessThanOrEqual(1024);
    });
  });

  it("retains all seven exact birth colors as strong artwork roles", () => {
    const colors = ["#110001", "#220002", "#330003", "#440004", "#550005", "#660006", "#770007"];
    expect(cosmicColorRoles(colors).all).toEqual(colors);
  });

  it("provides one stable guardian identity for every East Asian zodiac year", () => {
    expect(COSMIC_GUARDIANS).toHaveLength(12);
    expect(new Set(COSMIC_GUARDIANS).size).toBe(12);
    expect(COSMIC_GUARDIANS).toEqual(["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"]);
  });
});