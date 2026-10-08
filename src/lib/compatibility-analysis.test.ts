import { describe, expect, it } from "vitest";
import { analyzeCompatibility, type PartnerInput } from "./compatibility-analysis";
import { compatibilityReadingJa } from "./compatibility-reading-ja";

const owner = { name: "山田花子", nameRomaji: "HANAKO YAMADA", birthDate: "1990-04-12", birthTime: "09:30", birthTimeUnknown: false, birthPlace: "東京都", birthCity: "", bloodType: "A", siblingOrder: "first", gender: "female" };
const partner: PartnerInput = { name: "佐藤太郎", nameKana: "", birthDate: "1988-11-03", birthTime: "", birthPlace: "", birthCity: "", bloodType: "", siblingOrder: "", gender: "undisclosed" };

describe("three-section compatibility reading", () => {
  it("uses exact headings and the requested Japanese lengths for every branch", () => {
    const result = analyzeCompatibility(owner, partner, "ja");
    expect(result?.titles).toEqual(["各占術での相性ポイント", "総合診断", "お二人の注意点とアドバイス"]);
    for (const same of [true, false]) for (const emotion of [true, false, null]) for (const behavior of [true, false, null]) {
      const readings = compatibilityReadingJa({ rhythm: "違いが刺激にも摩擦にもなりやすい", sameOutlook: same, sameEnergy: same, sameMotivation: same, sameEmotion: emotion, namesAvailable: same, sameBehavior: behavior });
      const ranges = [[450, 550], [730, 880], [270, 340]];
      readings.forEach((text, i) => {
        const range = ranges[i];
        if (!range) return;
        const count = [...text.replace(/\s/g, "")].length;
        expect(count).toBeGreaterThanOrEqual(range[0]);
        expect(count).toBeLessThanOrEqual(range[1]);
        expect(text).not.toMatch(/通変星|太陽星座|命式|ASC/);
      });
    }
  });
  it("keeps all seven locales complete and rejects invalid birth dates", () => {
    for (const language of ["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"] as const) {
      const result = analyzeCompatibility(owner, partner, language);
      expect(result?.sentences).toHaveLength(3);
      expect(result?.sentences.every(Boolean)).toBe(true);
    }
    expect(analyzeCompatibility(owner, { ...partner, birthDate: "bad" }, "ja")).toBeNull();
  });
  it("responds to different calculated inputs rather than returning one fixed reading", () => {
    expect(analyzeCompatibility(owner, partner, "ja")?.sentences).not.toEqual(analyzeCompatibility(owner, { ...partner, birthDate: owner.birthDate, birthTime: owner.birthTime, birthPlace: owner.birthPlace }, "ja")?.sentences);
  });
});