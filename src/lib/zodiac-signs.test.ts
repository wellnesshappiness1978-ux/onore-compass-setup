import { describe, expect, it } from "vitest";
import { allBranches, allSigns, branchInfo, signInfo, yearBranchIndex } from "./zodiac-signs";

describe("zodiac signs", () => {
  it("returns localized info for every Japanese sign name", () => {
    const ja = allSigns("ja");
    expect(ja).toHaveLength(12);
    expect(ja[0]).toMatchObject({ name: "牡羊座", element: "火", quality: "活動宮" });
    expect(signInfo("魚座", "en")).toMatchObject({ name: "Pisces", element: "Water", quality: "Mutable" });
    expect(signInfo("獅子座", "ko")?.name).toBe("사자자리");
    expect(signInfo("不明座", "ja")).toBeNull();
  });

  it("covers all seven languages with nonempty traits", () => {
    for (const lang of ["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"] as const) {
      for (const s of allSigns(lang)) expect(s.traits.length).toBeGreaterThan(0);
      for (const b of allBranches(lang)) expect(b.traits.length).toBeGreaterThan(0);
    }
  });
});

describe("twelve branches", () => {
  it("maps branch index to animal, element and yin/yang", () => {
    expect(branchInfo(0, "ja")).toMatchObject({ name: "子", animal: "鼠", element: "水", yinYang: "陽" });
    expect(branchInfo(5, "ja")).toMatchObject({ name: "巳", animal: "蛇", element: "火", yinYang: "陰" });
    expect(branchInfo(11, "en")).toMatchObject({ animal: "Boar", element: "Water", yinYang: "Yin" });
  });

  it("computes the birth-year branch with the 立春 boundary", () => {
    // 2024 is 辰年 (index 4); before Feb 4 it still counts as 卯年 (index 3).
    expect(yearBranchIndex("2024-06-15")).toBe(4);
    expect(yearBranchIndex("2024-02-03")).toBe(3);
    expect(yearBranchIndex("2024-02-04")).toBe(4);
    expect(yearBranchIndex("invalid")).toBeNull();
  });
});
