import { describe, expect, it } from "vitest";
import { compatibilityJapaneseLengths } from "./compatibility-analysis";

describe("Japanese compatibility reading lengths", () => {
  it("keeps all four sections within their requested ranges", () => {
    expect(compatibilityJapaneseLengths.basic).toBeGreaterThanOrEqual(450);
    expect(compatibilityJapaneseLengths.basic).toBeLessThanOrEqual(560);
    expect(compatibilityJapaneseLengths.future).toBeGreaterThanOrEqual(250);
    expect(compatibilityJapaneseLengths.future).toBeLessThanOrEqual(350);
    expect(compatibilityJapaneseLengths.synthesis).toBeGreaterThanOrEqual(650);
    expect(compatibilityJapaneseLengths.synthesis).toBeLessThanOrEqual(800);
    expect(compatibilityJapaneseLengths.advice).toBeGreaterThanOrEqual(250);
    expect(compatibilityJapaneseLengths.advice).toBeLessThanOrEqual(350);
  });
});