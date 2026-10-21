import { describe, expect, it } from "vitest";
import { mandalaTraitsFromCore, symmetryPetals } from "./mandala-traits";
describe("mandala traits", () => {
  it("maps life path, element and essence", () => {
    const t = mandalaTraitsFromCore({ numerology: { lifePath: 7 }, shichu: { dominant: "水" }, animal: { group: "MOON・状況対応型" } });
    expect(t).toEqual({ lifePath: 7, symmetry: 14, element: "水", gemCut: "hexagon" });
    expect(mandalaTraitsFromCore({ numerology: { lifePath: 22 }, animal: { group: "SUN" } }).gemCut).toBe("star");
    expect(symmetryPetals(14)?.[0]).toBe(14);
  });
});
