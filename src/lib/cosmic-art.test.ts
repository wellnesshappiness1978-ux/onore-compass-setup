import { describe, expect, it } from "vitest";
import { cosmicGenesis } from "./cosmic-astronomy";
import { COSMIC_GUARDIANS, cosmicBirthplaceLight, cosmicColorRoles, cosmicPlacements, cosmicSunPlacement } from "./cosmic-art";

describe("Cosmic Genesis artwork layout", () => {
  it("builds an Earth-dominant portrait while preserving absolute heliocentric angles", () => {
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
    expect(earth?.radius).toBeGreaterThan(250);
    expect(earth?.x).toBeCloseTo(532.48, 2);
    expect(earth?.y).toBeCloseTo(629.76, 2);
    expect(new Set(placements.map((planet) => `${Math.round(planet.x)},${Math.round(planet.y)}`)).size).toBe(8);
    const mercury = placements.find((planet) => planet.id === "mercury");
    const venus = placements.find((planet) => planet.id === "venus");
    expect(mercury?.displayAngle).toBeCloseTo(((mercury?.longitude ?? 0) - 32 + 360) % 360, 8);
    expect(venus?.displayAngle).toBeCloseTo(((venus?.longitude ?? 0) - 32 + 360) % 360, 8);
    const sun = cosmicSunPlacement(genesis, 1024);
    expect(sun.x).not.toBeCloseTo(512, 2);
    expect(sun.y).not.toBeCloseTo(512, 2);
  });

  it("retains all seven exact birth colors as strong artwork roles", () => {
    const colors = ["#110001", "#220002", "#330003", "#440004", "#550005", "#660006", "#770007"];
    expect(cosmicColorRoles(colors).all).toEqual(colors);
    expect(cosmicColorRoles(colors).prominence).toEqual([colors[0], colors[5], colors[4], colors[3], colors[2], colors[1], colors[6]]);
  });

  it("anchors the birthplace radiance to a visible point on Earth", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const earth = cosmicPlacements(genesis, 1024).find((planet) => planet.id === "earth");
    if (!earth) return;
    const point = { x: earth.x + earth.radius * .2, y: earth.y - earth.radius * .15 };
    const light = cosmicBirthplaceLight(earth, point);
    expect(light.x).toBe(point.x);
    expect(light.y).toBe(point.y);
    expect(light.plumeAngle).toBeCloseTo(Math.atan2(point.y - earth.y, point.x - earth.x), 8);
    expect(light.safetyRadius).toBeGreaterThan(earth.radius);
  });

  it("provides one stable guardian identity for every East Asian zodiac year", () => {
    expect(COSMIC_GUARDIANS).toHaveLength(12);
    expect(new Set(COSMIC_GUARDIANS).size).toBe(12);
    expect(COSMIC_GUARDIANS).toEqual(["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"]);
  });
});