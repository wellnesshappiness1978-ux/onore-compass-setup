import { describe, expect, it } from "vitest";
import { cosmicGenesis } from "./cosmic-astronomy";
import { COSMIC_GUARDIANS, COSMIC_PLANET_SCALE, cosmicBirthplaceLight, cosmicColorRoles, cosmicPlacements } from "./cosmic-art";

describe("Cosmic Genesis artwork layout", () => {
  it("builds a Sun-centered portrait with Earth anchored in the foreground", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    expect(genesis).not.toBeNull();
    if (!genesis) return;
    const placements = cosmicPlacements(genesis, 1024);
    placements.forEach((planet) => {
      const extent = planet.radius * (planet.id === "saturn" ? 1.55 : 1);
      expect(planet.x + extent).toBeGreaterThan(0);
      expect(planet.y + extent).toBeGreaterThan(0);
      expect(planet.x - extent).toBeLessThan(1024);
      expect(planet.y - extent).toBeLessThan(1024);
    });
    const earth = placements.find((planet) => planet.id === "earth");
    expect(earth?.radius).toBeGreaterThan(50);
    expect(earth?.x).toBeCloseTo(512, 5);
    expect(earth?.y).toBeGreaterThan(680);
    expect(new Set(placements.map((planet) => `${Math.round(planet.x)},${Math.round(planet.y)}`)).size).toBe(8);
  });

  it("retains all seven exact birth colors as strong artwork roles", () => {
    const colors = ["#110001", "#220002", "#330003", "#440004", "#550005", "#660006", "#770007"];
    expect(cosmicColorRoles(colors).all).toEqual(colors);
    expect(cosmicColorRoles(colors).prominence).toEqual([colors[0], colors[5], colors[4], colors[3], colors[2], colors[1], colors[6]]);
  });

  it("anchors the birthplace light to Earth's visible center and sends it into space", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const earth = cosmicPlacements(genesis, 1024).find((planet) => planet.id === "earth");
    if (!earth) return;
    const light = cosmicBirthplaceLight(earth);
    expect(light.x).toBe(earth.x);
    expect(light.y).toBe(earth.y);
    expect(light.beamEndY).toBeLessThan(earth.y - earth.radius);
    expect(light.safetyRadius).toBeGreaterThan(earth.radius * 3);
  });

  it("provides one stable guardian identity for every East Asian zodiac year", () => {
    expect(COSMIC_GUARDIANS).toHaveLength(12);
    expect(new Set(COSMIC_GUARDIANS).size).toBe(12);
    expect(COSMIC_GUARDIANS).toEqual(["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"]);
  });
});