import { describe, expect, it } from "vitest";
import { consultationContext } from "./consultation-context";

const profile = {
  nameKanji: "",
  nameKana: "",
  nameRomaji: "",
  birthDate: "1990-05-10",
  birthTime: "",
  birthTimeUnknown: true,
  birthPlace: "",
  birthCity: "",
  bloodType: "",
  siblingOrder: "",
  gender: "undisclosed" as const,
};
describe("consultation context boundaries", () => {
  it("keeps detailed birth region, municipality and sibling counts", () => {
    const data = consultationContext({ ...profile, birthPlace: "神奈川県", birthCity: "横浜市", siblingOrder: "10人・中間子・上に兄2人・下に妹3人" }, "2026-10-22");
    expect(data.profileContext.birthPlace).toBe("神奈川県");
    expect(data.profileContext.birthCity).toBe("横浜市");
    expect(data.profileContext.siblingComposition?.up).toEqual(["兄", "兄"]);
    expect(data.profileContext.siblingComposition?.down).toEqual(["妹", "妹", "妹"]);
  });
  it("injects ten celestial bodies, all sixteen computed arts and the selected day", () => {
    const data = consultationContext(profile, "2026-10-16");
    expect(data.sky?.bodies).toHaveLength(10);
    expect(data.sky?.approximate).toBe(true);
    expect(data.today.day).toBe("2026-10-16");
    expect(data.today.directions).toHaveLength(8);
    expect(data.boundaries).toContain("All seventeen perspective methods");
    expect(data.boundaries).toContain("illustrative");
    for (const label of ["インド占星術", "紫微斗数", "算命学", "宿曜占星術", "マヤ暦"]) expect(data.extended).toContain(label);
  });
  it("changes daily signals with the requested day", () => {
    expect(consultationContext(profile, "2026-10-16").today.rhythm).not.toEqual(
      consultationContext(profile, "2026-10-17").today.rhythm,
    );
  });
});
