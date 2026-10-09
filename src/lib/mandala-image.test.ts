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
    expect(birthColorKeyword(colors[0]!)).toBe("shining imperial amber gold");
    expect(birthColorKeyword(colors[5]!)).toContain("deep sapphire lapis blue");
  });

  it("builds a deterministic prompt and seed without personal data", () => {
    expect(mandalaSeed(colors)).toBe(mandalaSeed(colors));
    
    
  });

  it("encodes the prompt and changes only the seed for regeneration", () => {
    const first = mandalaImageUrl(colors);
    const regenerated = mandalaImageUrl(colors, 1);
    expect(first).toContain("width=1024&height=1024&nologo=true&seed=");
    expect(first).not.toContain(" ");
    expect(regenerated.split("&seed=")[0]).toBe(first.split("&seed=")[0]);
    expect(regenerated).not.toBe(first);
  });
});