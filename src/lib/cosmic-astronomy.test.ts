import { describe, expect, it } from "vitest";
import * as A from "astronomy-engine";
import { cosmicGenesis } from "./cosmic-astronomy";

describe("cosmic genesis astronomy", () => {
  it("calculates eight heliocentric planets at the entered JST instant", () => {
    const result = cosmicGenesis("1990-04-15", "08:30", false);
    expect(result?.instant).toBe("1990-04-14T23:30:00.000Z");
    expect(result?.planets).toHaveLength(8);
    for (const planet of result?.planets ?? []) {
      expect(planet.longitude).toBeCloseTo(A.EclipticLongitude(
        ({ mercury: A.Body.Mercury, venus: A.Body.Venus, earth: A.Body.Earth, mars: A.Body.Mars, jupiter: A.Body.Jupiter, saturn: A.Body.Saturn, uranus: A.Body.Uranus, neptune: A.Body.Neptune })[planet.id],
        new Date("1990-04-14T23:30:00.000Z"),
      ), 8);
      expect(planet.longitude).toBeGreaterThanOrEqual(0);
      expect(planet.longitude).toBeLessThan(360);
    }
  });

  it("preserves the requested visual size hierarchy", () => {
    const result = cosmicGenesis("2001-01-01", "", true);
    const ordered = ["jupiter", "saturn", "uranus", "neptune", "earth", "venus", "mars", "mercury"];
    const radii = ordered.map((id) => result?.planets.find((planet) => planet.id === id)?.displayRadius ?? 0);
    for (let index = 0; index < radii.length - 1; index++) expect(radii[index] ?? 0).toBeGreaterThan(radii[index + 1] ?? 0);
    expect(result?.approximate).toBe(true);
  });

  it("is deterministic and rejects invalid dates", () => {
    expect(cosmicGenesis("2020-02-29", "12:15", false)).toEqual(cosmicGenesis("2020-02-29", "12:15", false));
    expect(cosmicGenesis("2020-02-30", "12:15", false)).toBeNull();
  });
});