import { describe, expect, it } from "vitest";
import { birthColorKeyword, mandalaImageUrl, mandalaPrompt, mandalaSeed, type MandalaColor } from "./mandala-image";

const colors: MandalaColor[] = [
  { name: "アンバーゴールド", code: "#A17A21" },
  { name: "サンライズコーラル", code: "#C34232" },
  { name: "シャンパンローズ", code: "#B95E77" },
  { name: "翡翠グリーン", code: "#238A62" },
  { name: "ターコイズ", code: "#158D9C" },
  { name: "瑠璃ブルー", code: "#2756A3" },
  { name: "アメジスト", code: "#75459B" },
];

describe("AI mandala image", () => {
  it("maps Japanese color names to English jewel keywords with the exact color", () => {
    const overall = colors[0];
    const lapis = colors[5];
    expect(overall && birthColorKeyword(overall)).toBe("shining imperial amber gold");
    expect(lapis && birthColorKeyword(lapis)).toContain("deep sapphire lapis blue");
  });

  it("builds a deterministic prompt and seed without personal data", () => {
    expect(mandalaSeed(colors)).toBe(mandalaSeed(colors));
    expect(mandalaSeed(colors)).toBeLessThanOrEqual(2147483647);
    const prompt = mandalaPrompt(colors);
    expect(prompt).toContain("masterpiece front-facing circular sacred geometry mandala");
    expect(prompt).toContain("extremely intricate delicate fine lines");
    expect(prompt).toContain("layered concentric rings, radial lotus petals, interlaced lattice");
    expect(prompt).toContain("utilizing all 7 personal birth colors");
    expect(prompt).toContain("opaque vivid bold non-transparent rich colors");
    expect(prompt).toContain("shimmering golden sparkles");
    expect(prompt).toContain("pitch-black cosmic deep space background");
    expect(prompt).toContain("vibrant glowing gemstone core in the overall birth color shining imperial amber gold #A17A21");
    for (const color of colors) {
      expect(prompt).toContain(color.code);
      expect(prompt).toContain(birthColorKeyword(color));
    }
    expect(prompt).not.toMatch(/user|birthdate|birthday|name|東京都/i);
  });

  it("encodes the prompt and changes only the seed for regeneration", () => {
    const first = mandalaImageUrl(colors);
    const regenerated = mandalaImageUrl(colors, 1);
    expect(first).toContain("width=1024&height=1024&nologo=true&seed=");
    expect(first).not.toContain(" ");
    expect(decodeURIComponent(first)).toContain("masterpiece front-facing circular sacred geometry mandala");
    expect(regenerated.split("&seed=")[0]).toBe(first.split("&seed=")[0]);
    expect(regenerated).not.toBe(first);
  });
});