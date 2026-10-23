import { describe, expect, it } from "vitest";
import { birthColorSpectrum } from "./birth-color-spectrum";

const base = { birthDate: "1990-05-15", birthTime: "08:30", birthTimeUnknown: false, birthPlace: "東京都" };
const father = { birthDate: "1960-03-10", birthPlace: "大阪府", birthCity: "大阪市" };
const mother = { birthDate: "1963-11-22", birthPlace: "福岡県", birthCity: "福岡市" };

describe("birthColorSpectrum with parents", () => {
  it("keeps the original palette when no parents are given", () => {
    const r = birthColorSpectrum(base);
    expect(r?.parentInfluence).toBeNull();
    expect(r?.main.code).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("refines all seven colors when both parents are known", () => {
    const plain = birthColorSpectrum(base)!;
    const refined = birthColorSpectrum({ ...base, father, mother })!;
    expect(refined.parentInfluence).toBe("both");
    const roles = ["main", "sub", "money", "work", "love", "health", "mind"] as const;
    // Every role shifts together from the blended base slot.
    expect(refined.main.slot).not.toBe(plain.main.slot);
    for (const role of roles) expect(refined[role].slot - plain[role].slot).toBe(refined.main.slot - plain.main.slot);
  });

  it("blends a single parent and stays deterministic", () => {
    const a = birthColorSpectrum({ ...base, father })!;
    const b = birthColorSpectrum({ ...base, father })!;
    expect(a.parentInfluence).toBe("father");
    expect(a.main.code).toBe(b.main.code);
    expect(a.main.slot).toBe(birthColorSpectrum({ ...base, father: { ...father } })!.main.slot);
  });

  it("ignores invalid parent dates", () => {
    const r = birthColorSpectrum({ ...base, father: { birthDate: "not-a-date" }, mother: null })!;
    expect(r.parentInfluence).toBeNull();
    expect(r.main.slot).toBe(birthColorSpectrum(base)!.main.slot);
  });
});
