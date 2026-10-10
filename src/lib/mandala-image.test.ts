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

  it("uses the fixed Agolmen's Compass prompt without personal data", () => {
    expect(mandalaSeed(colors)).toBe(mandalaSeed(colors));
    expect(mandalaSeed(colors)).toBeLessThanOrEqual(2147483647);
    const prompt = mandalaPrompt(colors);
    expect(prompt).toContain("embodying 'Agolmen's Compass'");
    expect(prompt).toContain("central glowing golden starburst compass with intricate filigree");
    expect(prompt).toContain("all 7 vivid personal birth colors (sapphire blue, ruby red, emerald green, golden yellow, royal violet, vibrant orange, diamond white)");
    expect(prompt).toContain("rich non-transparent impasto oil painting texture");
    expect(prompt).toContain("glowing crystal luminescence, shimmering golden sparkles");
    expect(prompt).toContain("pitch-black deep cosmic space background");
    expect(prompt).toContain("8k resolution, highly detailed, flawless radial symmetry");
    expect(prompt).not.toMatch(/user|birthdate|birthday|name|東京都/i);
  });

  it("encodes the prompt and changes only the seed for regeneration", () => {
    const first = mandalaImageUrl(colors);
    const regenerated = mandalaImageUrl(colors, 1);
    expect(first).toContain("width=1024&height=1024&nologo=true&model=flux&seed=");
    expect(first).not.toContain(" ");
    expect(decodeURIComponent(first)).toContain("masterpiece, extremely intricate sacred geometry mandala");
    expect(regenerated.split("&seed=")[0]).toBe(first.split("&seed=")[0]);
    expect(regenerated).not.toBe(first);
  });
});