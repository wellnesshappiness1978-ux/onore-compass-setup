import { describe, expect, it } from "vitest";
import { distinctTraitChapters, supportiveWritingVoice } from "./writing-voice";

describe("AI writing voice", () => {
  it("requires a warm, plain and non-commanding voice", () => {
    expect(supportiveWritingVoice).toContain("warm companion");
    expect(supportiveWritingVoice).toContain("everyday words");
    expect(supportiveWritingVoice).toContain("rather than commands");
  });

  it("keeps trait chapters non-overlapping", () => {
    expect(distinctTraitChapters).toContain("visible strengths");
    expect(distinctTraitChapters).toContain("relationship style");
    expect(distinctTraitChapters).toContain("Do not reuse");
  });

  it("requires respectful, accessible, perceptive and actionable guidance", () => {
    for (const rule of ["desu/masu", "ninth-grade", "everyday analogy", "at least two available reference values", "today or tomorrow", "when and what", "Portrait-only fields"]) {
      expect(supportiveWritingVoice).toContain(rule);
    }
  });

  it("limits humor and preserves interpretation and health boundaries", () => {
    for (const rule of ["never AT them", "Omit humor for grief", "not verified psychology or mind-reading", "Missing inputs stay missing", "biorhythm never establishes health"]) {
      expect(supportiveWritingVoice).toContain(rule);
    }
  });
});