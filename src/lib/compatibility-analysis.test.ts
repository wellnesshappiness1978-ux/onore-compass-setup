import { describe, expect, it } from "vitest";
import { analyzeCompatibility, type PartnerInput } from "./compatibility-analysis";
import { compatibilityReadingJa } from "./compatibility-reading-ja";
import { readingThemes, relationshipKinds } from "./compatibility-context";

const owner = { name: "山田花子", nameRomaji: "HANAKO YAMADA", birthDate: "1990-04-12", birthTime: "09:30", birthTimeUnknown: false, birthPlace: "東京都", birthCity: "", bloodType: "A", siblingOrder: "first", gender: "female" };
const partner: PartnerInput = { name: "佐藤太郎", nameKana: "", birthDate: "1988-11-03", birthTime: "", birthPlace: "", birthCity: "", bloodType: "", siblingOrder: "", gender: "undisclosed" };

describe("three-section compatibility reading", () => {
  it("uses exact headings and the requested Japanese lengths for every branch", () => {
    const result = analyzeCompatibility(owner, partner, "ja");
    expect(result?.titles).toEqual(["各占術での相性ポイント", "総合診断", "お２人の注意点とアドバイス"]);
    for (const same of [true, false]) for (const emotion of [true, false, null]) for (const behavior of [true, false, null]) {
      const readings = compatibilityReadingJa({ rhythm: "違いが刺激にも摩擦にもなりやすい", sameOutlook: same, sameEnergy: same, sameMotivation: same, sameEmotion: emotion, namesAvailable: same, sameBehavior: behavior });
      const ranges = [[450, 550], [730, 880], [270, 340]] as const;
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
  it("keeps strengths free of cautions and advice across traits, themes and relationships", () => {
    for (const same of [true, false]) for (const sameEmotion of [true, false, null]) for (const sameBehavior of [true, false, null]) for (const theme of readingThemes) for (const relationship of relationshipKinds) for (const outlookA of ["火", "地", "風", "水", ""]) {
      const signals = { rhythm: "", sameOutlook: same, sameEnergy: same, sameMotivation: same, sameEmotion, namesAvailable: same, sameBehavior, outlookA, outlookB: "水" };
      for (const concern of ["", "返信が遅くて不安です", "あ".repeat(80)]) {
        const texts = compatibilityReadingJa(signals, { theme, relationship, concern });
        expect(texts[0]).not.toMatch(/ください|しましょう|確かめ|注意|改善|ただし|摩擦|衝突|不満|必要|すべき/);
        texts.forEach((text, i) => {
          const range = [[450, 550], [730, 880], [270, 340]][i];
          if (!range) return;
          expect([...text.replace(/\s/g, "")].length).toBeGreaterThanOrEqual(range[0] ?? 0);
          expect([...text.replace(/\s/g, "")].length).toBeLessThanOrEqual(range[1] ?? 0);
          expect(text).not.toMatch(/通変星|太陽星座|命式|ASC/);
        });
      }
    }
  });
  it("follows both the selected relationship and the entered concern", () => {
    const distance = analyzeCompatibility(owner, partner, "ja", { theme: "connection", relationship: "romance", concern: "返信が遅くて不安です" });
    const work = analyzeCompatibility(owner, partner, "ja", { theme: "work", relationship: "hierarchy" });
    expect(distance?.sentences[1]).toContain("次に話せる目安");
    expect(distance?.sentences[1]).toContain("返信が遅くて不安です");
    expect(work?.sentences[1]).toContain("上司と部下");
    expect(work?.sentences[1]).toContain("担当と期限");
    expect(work?.sentences[0]).toBe(distance?.sentences[0]);
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