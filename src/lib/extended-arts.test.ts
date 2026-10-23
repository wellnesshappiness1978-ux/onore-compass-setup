import { describe, expect, it } from "vitest";
import { computeExtendedArts, extendedArtsPrompt } from "./extended-arts";

describe("extended arts (deterministic reference models)", () => {
  it("anchors the Mayan Tzolkin to 2012-12-21 = 音4・黄色い太陽", () => {
    const arts = computeExtendedArts("2012-12-21", "", true);
    expect(arts).not.toBeNull();
    expect(arts!.maya.tone).toBe(4);
    expect(arts!.maya.sign).toBe("黄色い太陽");
    expect(arts!.maya.kin).toBeGreaterThanOrEqual(1);
    expect(arts!.maya.kin).toBeLessThanOrEqual(260);
  });
  it("computes all five extended arts for any valid birth date", () => {
    const arts = computeExtendedArts("1990-04-15", "08:30", false);
    expect(arts).not.toBeNull();
    expect(arts!.indian.siderealSun).toBeTruthy();
    expect(arts!.indian.nakshatra).toBeTruthy();
    expect(arts!.ziwei.mingPalace).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
    expect(arts!.ziwei.shenPalace).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
    expect(arts!.ziwei.hourAssumed).toBe(false);
    expect(arts!.sanmei.early).toBeTruthy();
    expect(arts!.sanmei.middle).toBeTruthy();
    expect(arts!.sanmei.late).toBeTruthy();
    expect(arts!.lunarMansion.index).toBeGreaterThanOrEqual(0);
    expect(arts!.lunarMansion.index).toBeLessThan(27);
  });
  it("is deterministic and marks the noon reference when birth time is unknown", () => {
    const a = computeExtendedArts("1985-11-02", "", true);
    const b = computeExtendedArts("1985-11-02", "", true);
    expect(a).toEqual(b);
    expect(a!.ziwei.hourAssumed).toBe(true);
  });
  it("returns null for an invalid date and a prompt line for that case", () => {
    expect(computeExtendedArts("not-a-date", "", true)).toBeNull();
    expect(extendedArtsPrompt(null)).toContain("算出不可");
  });
  it("builds a prompt containing every extended art value", () => {
    const arts = computeExtendedArts("1978-06-20", "06:00", false)!;
    const prompt = extendedArtsPrompt(arts);
    for (const label of ["インド占星術", "紫微斗数", "算命学", "宿曜占星術", "マヤ暦"]) expect(prompt).toContain(label);
    expect(prompt).toContain(arts.lunarMansion.name);
    expect(prompt).toContain(arts.maya.sign);
  });
});
