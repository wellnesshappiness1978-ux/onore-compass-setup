import { describe, expect, it } from "vitest";
import { companionCopy } from "./companion-copy";
import { colorExperienceCopy } from "./color-experience-copy";
import type { Language } from "./translations";

describe("Localized companion prose", () => {
  it("covers all seven languages and all deterministic reading branches", () => {
    expect(Object.keys(companionCopy)).toHaveLength(7);
    for (const [language, copy] of Object.entries(companionCopy)) {
      expect(Object.keys(copy.day)).toHaveLength(5);
      expect(Object.keys(copy.relation)).toHaveLength(5);
      expect(new Set(Object.values(copy.day)).size).toBe(5);
      expect(copy.colorDaily).toHaveLength(3);
      expect(copy.colorScenes).toHaveLength(3);
      expect(copy.advance).toHaveLength(2);
      expect(copy.protect).toHaveLength(2);
      expect(copy.rhythm("TEST")).toContain("TEST");
      for (const text of [...Object.values(copy.day), ...Object.values(copy.relation), ...copy.colorDaily, ...copy.colorScenes, ...copy.advance, ...copy.protect]) {
        expect(text.length, language).toBeGreaterThan(20);
      }
      expect(colorExperienceCopy[language as Language].daily).toEqual(copy.colorDaily);
      expect(colorExperienceCopy[language as Language].sceneTips).toEqual(copy.colorScenes);
    }
  });

  it("separates reference numbers from measured health and color effects", () => {
    expect(companionCopy.ja.rhythm("身体")).toContain("振り返り用のカーブ");
    expect(companionCopy.ja.rhythm("身体")).toContain("実際の症状");
    expect(companionCopy.ja.colorScenes.join(" ")).toContain("医療の相談");
    expect(companionCopy.ja.day.fire).toContain("参考テーマ");
    expect(companionCopy.ja.advance[1]).toContain("15分");
  });
});