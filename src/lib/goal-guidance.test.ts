import { describe, expect, it } from "vitest";
import { goalDirective, goalThemes, groupSizeDirective } from "./goal-guidance";
import { groupBirthPalette } from "./group-palette";
import { birthColorNameForHex } from "./birth-color-spectrum";

describe("goal guidance", () => {
  it("maps Japanese preset 仕事 to business/career", () => { expect(goalThemes("仕事")).toEqual(["work"]); expect(goalDirective("仕事")).toContain("business and career"); });
  it("maps 恋愛 to partnership", () => expect(goalDirective("恋愛")).toContain("partnership"));
  it("maps お金 to financial fortune", () => expect(goalDirective("お金 / 貯金したい")).toContain("financial fortune"));
  it("keeps free text faithfully", () => { const d = goalDirective("家族 / 秋までに転職"); expect(d).toContain("family harmony"); expect(d).toContain("秋までに転職"); });
  it("empty goal gives no directive", () => expect(goalDirective("  ")).toBe(""));
  it("two-person group bans team wording", () => expect(groupSizeDirective(2)).toContain("Do NOT call it a team"));
  it("three-person group is group-wide", () => expect(groupSizeDirective(3)).toContain("3 people"));
});

describe("group palette", () => {
  it("has seven named colors", () => {
    const p = groupBirthPalette([{ birthDate: "1990-01-01" }, { birthDate: "1985-06-15" }])!;
    for (const r of ["main", "sub", "money", "work", "love", "health", "mind"] as const) { expect(p[r].code).toMatch(/^#[0-9A-F]{6}$/); expect(p[r].name).not.toBe("—"); }
  });
  it("names pure red as Sunrise Coral band", () => expect(birthColorNameForHex("#FF0000")).toBe("サンライズコーラル"));
});
