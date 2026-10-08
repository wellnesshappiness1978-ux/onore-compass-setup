import { describe, expect, it } from "vitest";
import { colorsForIntention, crystalRosettePoints, goldLeafTransform, layeredSpiralPoint, logarithmicSpiralPoint, paletteColors, radialRayTransform, regularPolygonPoints, sparkleTransform, vividHexColor } from "./art-geometry";
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
});
import { brilliantCutProfile, brushBandEdges, starfieldPoints } from "./art-geometry";
describe("masterpiece helpers", () => {
  it("builds a gem profile from apex to table", () => {
    const p = brilliantCutProfile(2);
    expect(p[0]).toEqual([0, -1.72]);
    expect(p.at(-1)?.[0]).toBe(0);
  });
  it("keeps stars outside the mandala and is deterministic", () => {
    const a = starfieldPoints(7, 50, 5.5, 9);
    expect(a).toEqual(starfieldPoints(7, 50, 5.5, 9));
    a.forEach(s => { const r = Math.hypot(s.x, s.y); expect(r).toBeGreaterThanOrEqual(5.5 - 1e-9); expect(r).toBeLessThanOrEqual(9 + 1e-9); expect(s.brightness).toBeLessThanOrEqual(.7); });
  });
  it("produces positive-width brush edges", () => {
    const e = brushBandEdges([[0, 0], [1, 0], [2, 0]], .2, 3);
    expect(e).toHaveLength(3);
    expect(e[1]!.left[1]).toBeGreaterThan(0);
    expect(e[1]!.right[1]).toBeLessThan(0);
  });
});
