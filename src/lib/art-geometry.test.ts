import { describe, expect, it } from "vitest";
import { colorsForIntention, crystalRosettePoints, facetTone, flowerOfLifeCenters, goldLeafTransform, layeredSpiralPoint, logarithmicSpiralPoint, MANDALA_STYLES, pairedWavePoint, paletteColors, radialRayTransform, regularPolygonPoints, sparkleTransform, vividHexColor } from "./art-geometry";
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

  it("creates repeatable layered spiral arms and gold-leaf placement", () => {
    expect(layeredSpiralPoint(12, 40, 2, 6, 5)).toEqual(layeredSpiralPoint(12, 40, 2, 6, 5));
    expect(layeredSpiralPoint(12, 40, 2, 6, 5)).not.toEqual(layeredSpiralPoint(12, 40, 3, 6, 5));
    expect(goldLeafTransform(812, 9, 5)).toEqual(goldLeafTransform(812, 9, 5));
    expect(Math.hypot(goldLeafTransform(812, 9, 5).x, goldLeafTransform(812, 9, 5).y)).toBeLessThanOrEqual(5);
  });

  it("builds closed polygon and crystalline-rosette paths", () => {
    const hexagon = regularPolygonPoints(6, 4, .2);
    const rosette = crystalRosettePoints(8, 4, 2.2, .1);
    expect(hexagon).toHaveLength(7);
    expect(rosette).toHaveLength(17);
    expect(hexagon.at(-1)?.[0]).toBeCloseTo(hexagon[0]?.[0] ?? 0);
    expect(hexagon.at(-1)?.[1]).toBeCloseTo(hexagon[0]?.[1] ?? 0);
    expect(rosette.at(-1)?.[0]).toBeCloseTo(rosette[0]?.[0] ?? 0);
    expect(rosette.at(-1)?.[1]).toBeCloseTo(rosette[0]?.[1] ?? 0);
  });

  it("keeps divine-ray and sparkle placement deterministic and in bounds", () => {
    expect(radialRayTransform(812, 4, 32, 5)).toEqual(radialRayTransform(812, 4, 32, 5));
    expect(radialRayTransform(812, 4, 32, 5).length).toBeLessThanOrEqual(5);
    const sparkle = sparkleTransform(812, 20, 5.5);
    expect(sparkle).toEqual(sparkleTransform(812, 20, 5.5));
    expect(Math.hypot(sparkle.x, sparkle.y)).toBeLessThanOrEqual(5.5);
  });

  it("strengthens pale birth colors into stable vivid display colors", () => {
    expect(vividHexColor("#D8BFC8")).toBe(vividHexColor("#D8BFC8"));
    expect(vividHexColor("#D8BFC8")).toMatch(/^#[0-9A-F]{6}$/);
    expect(vividHexColor("#D8BFC8")).not.toBe("#D8BFC8");
    expect(vividHexColor("not-a-color")).toBe("not-a-color");
  });

  it("defines a genuinely distinct rendering language for every intention", () => {
    expect(new Set(Object.values(MANDALA_STYLES).map(style => style.pattern)).size).toBe(5);
    expect(new Set(Object.values(MANDALA_STYLES).map(style => style.gem)).size).toBe(5);
    expect(MANDALA_STYLES.wealth.sides).toBe(8);
    expect(MANDALA_STYLES.work.sides).toBe(6);
  });

  it("creates deterministic life circles, paired waves, and facet lighting", () => {
    expect(flowerOfLifeCenters(2, .8)).toHaveLength(19);
    expect(flowerOfLifeCenters(2, .8)).toEqual(flowerOfLifeCenters(2, .8));
    expect(pairedWavePoint(8, 40, 4, .3)).toEqual(pairedWavePoint(8, 40, 4, .3));
    expect(facetTone(3, 12)).toBeGreaterThanOrEqual(.58);
    expect(facetTone(3, 12)).toBeLessThanOrEqual(1);
  });
});