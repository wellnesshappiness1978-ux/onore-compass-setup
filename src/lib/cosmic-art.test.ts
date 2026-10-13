import { describe, expect, it } from "vitest";
import { cosmicGenesis } from "./cosmic-astronomy";
import { COSMIC_BODY_RADII_KM, COSMIC_GUARDIANS, COSMIC_ORBIT_AU, COSMIC_PLANET_DISPLAY_MULTIPLIER, cosmicAstrolabeFrame, cosmicBirthplaceLight, cosmicColorRoles, cosmicCompassIdentity, cosmicComposition, cosmicDisplayRadius, cosmicEarthPortrait, cosmicMoonPlacement, cosmicPlacements, cosmicSizeComparison, cosmicSunPlacement } from "./cosmic-art";

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
    expect(earth).toBeDefined();
    expect(earth?.id).toBe("earth");
    expect(earth?.displayAngle).toBeCloseTo(((earth?.longitude ?? 0) + cosmicComposition(genesis, 1024).rotation + 360) % 360, 8);
    expect(cosmicEarthPortrait(1024)).toEqual({ x: 885.76, y: 138.24, radius: 59.392 });
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
    expect(jupiter.radius).toBeGreaterThan(earth.radius);
    expect(earth.radius).toBeGreaterThan(mercury.radius);
    placements.forEach((planet) => {
      expect(planet.orbitPath).toHaveLength(128);
      planet.orbitPath.forEach((point) => {
        expect(Math.hypot(point.x - 512, point.y - 481.28)).toBeCloseTo(planet.orbitRadius, 5);
      });
      expect(Math.hypot(planet.x - 512, planet.y - 481.28)).toBeCloseTo(planet.orbitRadius, 5);
    });
    const sun = cosmicSunPlacement(genesis, 1024);
    expect(sun.x).toBeCloseTo(512, 8);
    expect(sun.y).toBeCloseTo(481.28, 8);
    expect(((Math.atan2((earth.y - sun.y), (earth.x - sun.x)) * 180 / Math.PI) + 360) % 360).toBeCloseTo(composition.targetAngle, 5);
  });

  it("keeps every circular orbit in physical orbital order regardless of instantaneous distance", () => {
    const expected = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"] as const;
    const births: Array<[string, string]> = [["1965-06-08", "04:10"], ["1990-04-15", "08:30"], ["2026-10-12", "13:10"]];
    expect(expected.map((id) => COSMIC_ORBIT_AU[id])).toEqual([...expected.map((id) => COSMIC_ORBIT_AU[id])].sort((a, b) => a - b));
    for (const [date, time] of births) {
      const genesis = cosmicGenesis(date, time, false);
      if (!genesis) continue;
      const placements = cosmicPlacements(genesis, 1024);
      const radii = expected.map((id) => placements.find((planet) => planet.id === id)?.orbitRadius ?? 0);
      for (let index = 1; index < radii.length; index++) expect(radii[index]).toBeGreaterThan(radii[index - 1] ?? 0);
      const earthRadius = radii[2] ?? 0;
      expected.slice(4).forEach((id) => expect(placements.find((planet) => planet.id === id)?.orbitRadius ?? 0).toBeGreaterThan(earthRadius));
    }
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
      expect(frame.centerY).toBe(481.28);
      expect((((Math.atan2((earth?.y ?? sun.y) - sun.y, (earth?.x ?? sun.x) - sun.x) * 180 / Math.PI) + 360) % 360)).toBeCloseTo(frame.targetAngle, 3);
      placements.flatMap((planet) => planet.orbitPath).forEach((point) => {
        expect(point.x).toBeGreaterThanOrEqual(1024 * .055 - .01);
        expect(point.x).toBeLessThanOrEqual(1024 * .945 + .01);
        expect(point.y).toBeGreaterThanOrEqual(1024 * .025 - .01);
        expect(point.y).toBeLessThanOrEqual(1024 * .915 + .01);
      });
    }
  });

  it("keeps the Sun and eight planets on one exact linear physical-radius comparison scale", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const comparison = cosmicSizeComparison(genesis, 1024);
    expect(comparison).toHaveLength(9);
    const sun = comparison.find((body) => body.id === "sun");
    const earth = comparison.find((body) => body.id === "earth");
    const jupiter = comparison.find((body) => body.id === "jupiter");
    const mercury = comparison.find((body) => body.id === "mercury");
    expect(sun?.physicalRadiusKm).toBe(COSMIC_BODY_RADII_KM.sun);
    expect((sun?.radius ?? 0) / (earth?.radius ?? 1)).toBeCloseTo(COSMIC_BODY_RADII_KM.sun / COSMIC_BODY_RADII_KM.earth, 8);
    expect((jupiter?.radius ?? 0) / (earth?.radius ?? 1)).toBeCloseTo(COSMIC_BODY_RADII_KM.jupiter / COSMIC_BODY_RADII_KM.earth, 8);
    expect(jupiter?.radius ?? 0).toBeGreaterThan(earth?.radius ?? 0);
    expect(earth?.radius ?? 0).toBeGreaterThan(mercury?.radius ?? 0);
  });

  it("uses one monotonic visibility scale without reversing physical body order", () => {
    const ordered = [COSMIC_BODY_RADII_KM.sun, COSMIC_BODY_RADII_KM.jupiter, COSMIC_BODY_RADII_KM.saturn, COSMIC_BODY_RADII_KM.uranus, COSMIC_BODY_RADII_KM.neptune, COSMIC_BODY_RADII_KM.earth, COSMIC_BODY_RADII_KM.venus, COSMIC_BODY_RADII_KM.mars, COSMIC_BODY_RADII_KM.mercury];
    const display = ordered.map((radius) => cosmicDisplayRadius(radius, 1024));
    for (let index = 1; index < display.length; index++) expect(display[index - 1]).toBeGreaterThan(display[index] ?? 0);
  });

  it("retains all seven exact birth colors as strong artwork roles", () => {
    const colors = ["#110001", "#220002", "#330003", "#440004", "#550005", "#660006", "#770007"];
    expect(cosmicColorRoles(colors).all).toEqual(colors);
    expect(cosmicColorRoles(colors).prominence).toEqual([colors[0], colors[5], colors[4], colors[3], colors[2], colors[1], colors[6]]);
    expect(new Set(cosmicColorRoles(colors).all).size).toBe(7);
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

  it("keeps enlarged inner bodies clear of the Sun and neighbouring orbit bands", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const placements = cosmicPlacements(genesis, 1024);
    const sun = cosmicSunPlacement(genesis, 1024);
    const inner = ["mercury", "venus", "earth", "mars"].map((id) => placements.find((planet) => planet.id === id));
    expect(inner.every(Boolean)).toBe(true);
    const first = inner[0];
    if (!first) return;
    expect(first.orbitRadius - first.radius).toBeGreaterThan(sun.radius);
    for (let index = 1; index < inner.length; index++) {
      const current = inner[index], previous = inner[index - 1];
      if (!current || !previous) return;
      expect(current.orbitRadius - previous.orbitRadius).toBeGreaterThan(current.radius + previous.radius);
    }
  });

  it("enlarges only the eight orbital planets by exactly 1.3 from the current treatment", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    expect(COSMIC_PLANET_DISPLAY_MULTIPLIER).toBeCloseTo(1.11 * 1.5 * 1.3, 10);
    cosmicPlacements(genesis, 1024).forEach((planet) => {
      expect(planet.radius).toBeCloseTo(cosmicDisplayRadius(planet.meanRadiusKm, 1024) * 1.11 * 1.5 * 1.3, 8);
    });
    expect(cosmicSunPlacement(genesis, 1024).radius).toBeCloseTo(cosmicDisplayRadius(COSMIC_BODY_RADII_KM.sun, 1024), 8);
  });

  it("places the birth Moon beside Earth at its exact geocentric direction", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const earth = cosmicPlacements(genesis, 1024).find((planet) => planet.id === "earth");
    const moon = cosmicMoonPlacement(genesis, 1024, earth);
    expect(earth).toBeDefined();
    expect(moon).not.toBeNull();
    if (!earth || !moon) return;
    expect(Math.hypot(moon.x - earth.x, moon.y - earth.y)).toBeCloseTo(moon.distance, 8);
    expect(moon.displayAngle).toBeCloseTo(genesis.moon.longitude, 8);
    expect(moon.phaseFraction).toBeCloseTo(genesis.moon.phaseFraction, 8);
    expect(moon.radius / earth.radius).toBeCloseTo(1737.4 / 6371 * 2.1, 12);
    const doubled = cosmicMoonPlacement(genesis, 2048);
    expect(doubled?.radius).toBeCloseTo(moon.radius * 2, 10);
    expect(moon.lightAngle).toBe(genesis.moon.lightAngle);
    expect(moon.poleAngle).toBe(genesis.moon.poleAngle);
    expect(moon.distance).toBeGreaterThan(earth.radius + moon.radius);
  });

  it("keeps the engraved astrolabe outside every orbit and inside the square artwork", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const frame = cosmicAstrolabeFrame(1024);
    const outerOrbit = Math.max(...cosmicPlacements(genesis, 1024).map((planet) => planet.orbitRadius));
    expect(frame.innerRadius).toBeGreaterThan(outerOrbit);
    expect(frame.outerRadius).toBeLessThanOrEqual(Math.min(frame.x, frame.y, 1024 - frame.x, 1024 - frame.y));
    expect(frame.tickCount).toBe(72);
    expect(frame.outerRadius - frame.innerRadius).toBeGreaterThanOrEqual(1024 * .04);
  });

  it("provides one stable guardian identity for every East Asian zodiac year", () => {
    expect(COSMIC_GUARDIANS).toHaveLength(12);
    expect(new Set(COSMIC_GUARDIANS).size).toBe(12);
    expect(COSMIC_GUARDIANS).toEqual(["rat", "ox", "tiger", "rabbit", "dragon", "serpent", "horse", "goat", "monkey", "rooster", "dog", "boar"]);
  });

  it("derives the zodiac guardian ring solely from registered birth astronomy", () => {
    const genesis = cosmicGenesis("1990-04-15", "08:30", false);
    if (!genesis) return;
    const identity = cosmicCompassIdentity(genesis);
    expect(identity.sunSign).toBe(genesis.sunSign);
    expect(identity.moonSign).toBe(genesis.moonSign);
    expect(identity.guardian).toBe(genesis.animal);
    expect(identity.awakenedSectors).toContain(genesis.sunSign);
    expect(identity.awakenedSectors).toContain(genesis.moonSign);
    expect(identity.awakenedSectors.every((sector) => sector >= 0 && sector < 12)).toBe(true);
  });
});