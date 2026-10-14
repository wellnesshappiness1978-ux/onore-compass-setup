import { describe, expect, it } from "vitest";
import { approachKeys, approachStatuses, essenceKeys, traitReadingCopy, traitReadingPrompt } from "./trait-reading";

describe("distinct personal reading contract", () => {
  it("has six unique angles and fifteen methods in all seven languages", () => {
    expect(essenceKeys).toHaveLength(6);
    expect(approachKeys).toHaveLength(15);
    expect(Object.keys(traitReadingCopy)).toHaveLength(7);
    for (const copy of Object.values(traitReadingCopy)) {
      expect(new Set(copy.headings).size).toBe(6);
      expect(new Set(copy.methods).size).toBe(15);
      expect(copy.final.length).toBeGreaterThan(10);
      expect(Object.values(copy.statuses).every(Boolean)).toBe(true);
    }
    expect(traitReadingCopy.ja.final).toBe("総合まとめ：あなたの『絶対自分軸』");
  });
  it("never claims unimplemented charts or contextual personality calculations", () => {
    const statuses = approachStatuses({ core: true, earth: true, nineStars: true, color: true, blood: true, siblings: true, region: true });
    for (const key of ["indian", "ziwei", "sanmei", "lunarMansion", "maya"] as const) expect(statuses[key]).toBe("unavailable");
    for (const key of ["blood", "siblings", "region"] as const) expect(statuses[key]).toBe("context");
    const missing = approachStatuses({ core: false, earth: false, nineStars: false, color: false, blood: false, siblings: false, region: false });
    expect(Object.values(missing).every(s => s === "unavailable")).toBe(true);
  });
  it("keeps plain speech, non-repetition, source boundaries and actionable closure", () => {
    for (const text of ["No headings or method names", "different central observation", "everyday analogies", "Missing context MUST be empty", "Do not claim fifteen methods", "optional small tomorrow step", "not evidence of upbringing"]) expect(traitReadingPrompt).toContain(text);
  });
});