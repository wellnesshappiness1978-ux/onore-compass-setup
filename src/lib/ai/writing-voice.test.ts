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
});