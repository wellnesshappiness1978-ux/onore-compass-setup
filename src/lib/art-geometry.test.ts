import { describe, expect, it } from "vitest";
import { colorsForIntention, logarithmicSpiralPoint, paletteColors } from "./art-geometry";
import { birthColorSpectrum } from "./birth-color-spectrum";

describe("birth-color mandala geometry", () => {
  it("creates a repeatable overall plus six-color palette", () => {
    const profile = { birthDate: "1990-05-18", birthTime: "08:30", birthTimeUnknown: false, birthPlace: "Tokyo" };
    const first = birthColorSpectrum(profile);
    const second = birthColorSpectrum(profile);
    expect(first).toEqual(second);
    expect(first && paletteColors(first)).toHaveLength(7);
  });

  it("keeps all seven colors while changing the intention emphasis", () => {
    const colors = ["a", "b", "c", "d", "e", "f", "g"];
    expect(colorsForIntention(colors, "overall")).toEqual(colors);
    expect(colorsForIntention(colors, "work")).toHaveLength(7);
    expect(new Set(colorsForIntention(colors, "love"))).toEqual(new Set(colors));
  });

  it("expands the logarithmic spiral from the center", () => {
    const points = Array.from({ length: 32 }, (_, index) => logarithmicSpiralPoint(index, 32, 5));
    const radii = points.map(([x, y]) => Math.hypot(x, y));
    expect(radii[0]).toBeCloseTo(0);
    expect(radii.at(-1)).toBeCloseTo(5);
    expect(radii.every((radius, index) => index === 0 || radius >= (radii[index - 1] ?? 0))).toBe(true);
  });
});