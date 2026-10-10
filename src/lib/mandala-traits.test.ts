import { describe, expect, it } from "vitest";
import { mandalaTraitsFromCore, symmetryPetals, DEFAULT_TRAITS } from "./mandala-traits";
import { buildMandalaColorPlate } from "@/components/MandalaCanvas";
const codes = ["#2E8B57","#E94B6A","#F2C230","#3A6FD8","#9B59B6","#E67E22","#1ABC9C"];
describe("mandala traits", () => {
  it("maps life path, element and essence", () => {
    const t = mandalaTraitsFromCore({ numerology: { lifePath: 7 }, shichu: { dominant: "水" }, animal: { group: "MOON・状況対応型" } });
    expect(t).toEqual({ lifePath: 7, symmetry: 14, element: "水", gemCut: "hexagon" });
    expect(mandalaTraitsFromCore({ numerology: { lifePath: 22 }, animal: { group: "SUN" } }).gemCut).toBe("star");
    expect(symmetryPetals(14)?.[0]).toBe(14);
  });
  it("renders cuts, aura and unchanged colors offline", () => {
    for (const [cut, sides] of [["hexagon",6],["octagon",8],["dodecagon",12],["star",16]] as const) {
      const svg = buildMandalaColorPlate(codes, 0, false, { lifePath: 4, symmetry: 16, element: "火", gemCut: cut });
      expect(svg).toContain(`data-gem-sides="${sides}"`);
      expect(svg.match(/data-gem-facet="crown"/g)?.length).toBe(sides);
      expect(svg).toContain('data-element-aura="火"');
      for (const c of codes) expect(svg).toContain(c);
      expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
    }
    expect(buildMandalaColorPlate(codes, 0, false)).toBe(buildMandalaColorPlate(codes, 0, false, DEFAULT_TRAITS));
  });
});
