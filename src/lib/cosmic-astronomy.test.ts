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
    const radius = Object.fromEntries((result?.planets ?? []).map((planet) => [planet.id, planet.displayRadius]));
    expect(radius.jupiter).toBeGreaterThan(radius.saturn);
    expect(radius.saturn).toBeGreaterThan(radius.uranus);
    expect(radius.uranus).toBeGreaterThan(radius.neptune);
    expect(radius.neptune).toBeGreaterThan(radius.earth);
    expect(radius.earth).toBeGreaterThan(radius.venus);
    expect(radius.venus).toBeGreaterThan(radius.mars);
    expect(radius.mars).toBeGreaterThan(radius.mercury);
    expect(result?.approximate).toBe(true);
  });

  it("is deterministic and rejects invalid dates", () => {
    expect(cosmicGenesis("2020-02-29", "12:15", false)).toEqual(cosmicGenesis("2020-02-29", "12:15", false));
    expect(cosmicGenesis("2020-02-30", "12:15", false)).toBeNull();
  });
});