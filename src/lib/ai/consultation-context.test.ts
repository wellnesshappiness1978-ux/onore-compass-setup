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
  it("injects ten celestial bodies and the selected day without inventing unavailable charts", () => {
    const data = consultationContext(profile, "2026-10-16");
    expect(data.sky?.bodies).toHaveLength(10);
    expect(data.sky?.approximate).toBe(true);
    expect(data.today.day).toBe("2026-10-16");
    expect(data.today.directions).toHaveLength(8);
    expect(data.boundaries).toContain("NOT fifteen computed charts");
    expect(data.boundaries).toContain("unavailable");
    expect(data.boundaries).toContain("illustrative");
  });
  it("changes daily signals with the requested day", () => {
    expect(consultationContext(profile, "2026-10-16").today.rhythm).not.toEqual(
      consultationContext(profile, "2026-10-17").today.rhythm,
    );
  });
});
