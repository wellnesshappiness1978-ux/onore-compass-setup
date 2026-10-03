import { describe, expect, it } from "vitest";
import { annualFlyingStars, mingGua, solarYear } from "./feng-shui";
import { natalSky } from "./natal-sky";

describe("traditional feng shui references", () => {
  it("uses the calculated Li Chun boundary instead of a fixed February 4", () => {
    expect(solarYear("2024-02-02")?.year).toBe(2023);
    expect(solarYear("2024-02-06")?.year).toBe(2024);
  });
  it("prompts for gender rather than guessing a formula branch", () => {
    const result = mingGua("1985-08-12", "undisclosed");
    expect(result).toBeNull();
  });
  it("substitutes five into a direction-bearing kua", () => {
    expect(mingGua("1977-09-10", "male")?.branches[0]?.number).toBe(2);
    expect(mingGua("1984-09-10", "female")?.branches[0]?.number).toBe(8);
  });
  it("does not calculate malformed dates or unsupported years", () => {
    expect(mingGua("2001-02-30", "male")).toBeNull();
    expect(mingGua("1895-05-12", "female")).toBeNull();
  });
  it("keeps nine unique annual stars", () => {
    const annual = annualFlyingStars(new Date(2024, 5, 1));
    expect(annual.center).toBe(3);
    expect(new Set(annual.palaces.map(p => p.star)).size).toBe(9);
  });
});

describe("birth-sky inputs", () => {
  it("uses a stated noon approximation only without birth time", () => {
    const noon = natalSky("1995-04-08", "", true);
    expect(noon?.approximate).toBe(true);
    expect(noon?.bodies).toHaveLength(10);
    expect(natalSky("1995-04-08", "10:30", false)?.approximate).toBe(false);
    expect(natalSky("1995-02-30", "10:30", false)).toBeNull();
  });
});
