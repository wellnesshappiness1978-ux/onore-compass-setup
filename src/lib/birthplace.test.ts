import { describe, expect, it } from "vitest";
import { resolveBirthplace } from "./birthplace";

describe("birthplace reference coordinates", () => {
  it("uses a municipality when available, including ケ/ヶ spelling", () => {
    const place = resolveBirthplace("神奈川県", "横浜市保土ヶ谷区 和田町");
    expect(place?.precision).toBe("municipality");
    expect(place?.lat).toBeGreaterThan(35);
    expect(place?.lon).toBeGreaterThan(139);
  });
  it("falls back to prefecture when city is absent, never Tokyo", () => {
    expect(resolveBirthplace("神奈川県")?.precision).toBe("prefecture");
    expect(resolveBirthplace("北海道")?.lon).not.toEqual(resolveBirthplace("東京都")?.lon);
  });
  it("does not assign unknown places a guessed coordinate", () => {
    expect(resolveBirthplace("unknown")).toBeNull();
  });
});