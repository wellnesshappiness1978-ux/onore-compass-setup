import { describe, expect, it } from "vitest";
import { cosmicGenesis } from "./cosmic-astronomy";
import { COSMIC_GUARDIANS, cosmicBirthplaceLight, cosmicColorRoles, cosmicComposition, cosmicEarthPortrait, cosmicPlacements, cosmicSunPlacement } from "./cosmic-art";

describe("Cosmic Genesis artwork layout", () => {
  it("builds a readable conceptual Solar System while preserving birth longitudes", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    expect(genesis).not.toBeNull();
    if (!genesis) return;
    const placements = cosmicPlacements(genesis, 1024);
    placements.forEach((planet) => {
      const extent = planet.radius * (planet.id === "saturn" ? 1.8 : 1);
      expect(planet.x + extent).toBeGreaterThan(0);
      expect(planet.y + extent).toBeGreaterThan(0);
      expect(planet.x - extent).toBeLessThan(1024);
      expect(planet.y - extent).toBeLessThan(1024);
    });
    const earth = placements.find((planet) => planet.id === "earth");
    expect(earth?.orbitRadius).toBeGreaterThan(0);
    expect(cosmicEarthPortrait(1024)).toEqual({ x: 855.04, y: 855.04, radius: 100.352 });
    expect(new Set(placements.map((planet) => `${Math.round(planet.x)},${Math.round(planet.y)}`)).size).toBe(8);
    const mercury = placements.find((planet) => planet.id === "mercury");
    const venus = placements.find((planet) => planet.id === "venus");
    const composition = cosmicComposition(genesis, 1024);
    expect(mercury?.displayAngle).toBeCloseTo(((mercury?.longitude ?? 0) + composition.rotation + 360) % 360, 8);
    expect(venus?.displayAngle).toBeCloseTo(((venus?.longitude ?? 0) + composition.rotation + 360) % 360, 8);
    expect((venus?.orbitRadius ?? 0) < (earth?.orbitRadius ?? 0)).toBe(true);
    const jupiter = placements.find((planet) => planet.id === "jupiter");
    expect(jupiter).toBeDefined();
    expect(mercury).toBeDefined();
    if (!jupiter || !earth || !mercury) return;
    expect(jupiter.radius / earth.radius).toBeCloseTo(69911 / 6371, 8);
    expect(earth.radius / mercury.radius).toBeCloseTo(6371 / 2439.7, 8);
    placements.forEach((planet) => {
      expect(planet.orbitPath).toHaveLength(128);
      planet.orbitPath.forEach((point) => {
        expect(Math.hypot(point.x - 512, point.y - 512)).toBeCloseTo(planet.orbitRadius, 5);
      });
      expect(Math.hypot(planet.x - 512, planet.y - 512)).toBeCloseTo(planet.orbitRadius, 5);
    });
    const sun = cosmicSunPlacement(genesis, 1024);
    expect(sun.x).toBeCloseTo(512, 8);
    expect(sun.y).toBeCloseTo(512, 8);
    expect(((Math.atan2((earth.y - sun.y), (earth.x - sun.x)) * 180 / Math.PI) + 360) % 360).toBeCloseTo(composition.targetAngle, 5);
  });

  it("keeps one shared Sun-centered conceptual scale across dates", () => {
    const births: Array<[string, string]> = [["1965-06-08", "04:10"], ["2001-01-01", "12:00"], ["2026-10-12", "13:10"]];
    for (const [date, time] of births) {
      const genesis = cosmicGenesis(date, time, false);
      if (!genesis) continue;
      const placements = cosmicPlacements(genesis, 1024);
      const earth = placements.find((planet) => planet.id === "earth");
      const sun = cosmicSunPlacement(genesis, 1024);
      const frame = cosmicComposition(genesis, 1024);
      expect(frame.scale).toBeGreaterThan(0);
      expect(frame.centerX).toBe(512);
      expect(frame.centerY).toBe(512);
      expect((((Math.atan2((earth?.y ?? sun.y) - sun.y, (earth?.x ?? sun.x) - sun.x) * 180 / Math.PI) + 360) % 360)).toBeCloseTo(frame.targetAngle, 3);
      placements.flatMap((planet) => planet.orbitPath).forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(1024 * .09 - .01);
        expect(point.x).toBeLessThanOrEqual(1024 * .91 + .01);
        expect(point.y).toBeGreaterThanOrEqual(1024 * .09 - .01);
        expect(point.y).toBeLessThanOrEqual(1024 * .91 + .01);
      });
    }
  });

  it("retains all seven exact birth colors as strong artwork roles", () => {
    const colors = ["#110001", "#220002", "#330003", "#440004", "#550005", "#660006", "#770007"];
    expect(cosmicColorRoles(colors).all).toEqual(colors);
    expect(cosmicColorRoles(colors).prominence).toEqual([colors[0], colors[5], colors[4], colors[3], colors[2], colors[1], colors[6]]);
  });

  it("anchors the birthplace radiance to a visible point on Earth", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const earth = { ...cosmicEarthPortrait(1024), id: "earth" as const };
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