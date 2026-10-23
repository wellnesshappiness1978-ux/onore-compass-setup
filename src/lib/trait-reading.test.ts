import { describe, expect, it } from "vitest";
import { approachKeys, approachStatuses, essenceKeys, traitReadingCopy, traitReadingPrompt, visibleApproachKeys } from "./trait-reading";

describe("distinct personal reading contract", () => {
  it("has six unique angles and sixteen methods in all seven languages", () => {
    expect(essenceKeys).toHaveLength(6);
    expect(approachKeys).toHaveLength(16);
    expect(approachKeys).toContain("eastern");
    expect(Object.keys(traitReadingCopy)).toHaveLength(7);
    for (const copy of Object.values(traitReadingCopy)) {
      expect(new Set(copy.headings).size).toBe(6);
      expect(new Set(copy.methods).size).toBe(16);
      expect(copy.final.length).toBeGreaterThan(3);
      expect(Object.values(copy.statuses).every(Boolean)).toBe(true);
    }
    expect(traitReadingCopy.ja.final).toBe("多層総合診断");
    expect(traitReadingCopy.ja.methods[3]).toBe("十二支占術");
  });
  it("computes every divination method from birth data; only optional context inputs can be missing", () => {
    const statuses = approachStatuses({ core: true, earth: true, nineStars: true, color: true, blood: true, siblings: true, region: true });
    for (const key of ["western", "indian", "ziwei", "eastern", "pillars", "sanmei", "lunarMansion", "maya", "animal", "numerology"] as const) expect(statuses[key]).toBe("reference");
    for (const key of ["blood", "siblings", "region"] as const) expect(statuses[key]).toBe("context");
    const missing = approachStatuses({ core: false, earth: false, nineStars: false, color: false, blood: false, siblings: false, region: false });
    expect(Object.values(missing).every(s => s === "unavailable")).toBe(true);
  });
  it("filters unavailable and empty perspectives without renumbering domain IDs", () => {
    const statuses = approachStatuses({ core: true, earth: true, nineStars: true, color: true, blood: true, siblings: false, region: false });
    const passages = Object.fromEntries(approachKeys.map(key => [key, key === "earth" ? " " : "reading"])) as Record<typeof approachKeys[number], string>;
    expect(visibleApproachKeys(statuses, passages)).toEqual(["western", "indian", "ziwei", "eastern", "pillars", "sanmei", "nineStars", "lunarMansion", "animal", "numerology", "maya", "color", "blood"]);
    expect(traitReadingPrompt).toContain("540–660");
    expect(traitReadingPrompt).toContain("catchphrase");
    for (const copy of Object.values(traitReadingCopy)) { expect(copy.catchphrase).toBeTruthy(); expect(copy.symbolic).toBeTruthy(); }
  });
  it("keeps plain speech, non-repetition, source boundaries and actionable closure", () => {
    for (const text of ["No headings or method names", "different central observation", "everyday analogies", "Missing context MUST be empty", "all sixteen fixed keys", "optional small tomorrow step", "not evidence of upbringing"]) expect(traitReadingPrompt).toContain(text);
  });
  it("bans repeated 「〜読みです」 endings and requires varied warm closings", () => {
    expect(traitReadingPrompt).toContain("〜読みです");
    for (const ending of ["と読み解くことができます", "という本質を示しています", "のバイオリズムが表れています", "と解釈されます", "という傾向が強く表れます"]) expect(traitReadingPrompt).toContain(ending);
  });
});
