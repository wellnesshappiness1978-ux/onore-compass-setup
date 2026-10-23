import { describe, expect, it } from "vitest";
import { elevatedGroupColor, groupBirthPalette } from "./group-palette";
import { sunSignIndex, cornerSlots, paletteSeed } from "./mandala-constellations";

describe("group fortune-raising colors", () => {
  it("amplifies a shared hue instead of averaging to grey", () => {
    const c = elevatedGroupColor(["#D04040", "#D05040"]);
    expect(parseInt(c.slice(1, 3), 16)).toBeGreaterThan(parseInt(c.slice(5, 7), 16) + 80);
  });
  it("fills the missing hue gap when members diverge (red + cyan → not grey)", () => {
    const c = elevatedGroupColor(["#FF0000", "#00FFFF"]);
    const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
    expect(Math.max(r!, g!, b!) - Math.min(r!, g!, b!)).toBeGreaterThan(100);
  });
  it("is deterministic and returns seven roles", () => {
    const m = [{ birthDate: "1990-04-12" }, { birthDate: "1985-11-03" }];
    expect(groupBirthPalette(m)).toEqual(groupBirthPalette(m));
    expect(groupBirthPalette(m)?.love.code).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe("mandala constellations", () => {
  it("computes sun signs", () => {
    expect(sunSignIndex("1990-04-12")).toBe(0); // Aries
    expect(sunSignIndex("1985-11-03")).toBe(7); // Scorpio
    expect(sunSignIndex("bad")).toBeNull();
  });
  it("caps corners at four people", () => {
    expect(cornerSlots(6)).toHaveLength(4);
    expect(cornerSlots(1)).toEqual([[0, 0]]);
  });
  it("gives different palettes different light seeds", () => {
    expect(paletteSeed(["#111111"])).not.toBe(paletteSeed(["#111112"]));
  });
});
