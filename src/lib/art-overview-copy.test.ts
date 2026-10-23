import { describe, it, expect } from "vitest";
import { artOverviewCopy, artPrinciplesPrompt, detailLinkLabel } from "./art-overview-copy";
import { approachKeys } from "./trait-reading";
import type { Language } from "./translations";

const languages: Language[] = ["ja", "en", "zh-CN", "zh-TW", "ko", "es", "fr"];

describe("sixteen art overviews", () => {
  it("covers every approach key in every language with a substantial text", () => {
    for (const lang of languages) {
      for (const key of approachKeys) {
        const text = artOverviewCopy[lang][key];
        expect(text, `${lang}/${key}`).toBeTruthy();
        expect(text.length, `${lang}/${key} too short`).toBeGreaterThan(80);
      }
    }
  });
  it("keeps non-Japanese overviews free of hiragana", () => {
    for (const lang of languages.filter(l => l !== "ja")) {
      for (const key of approachKeys) {
        expect(artOverviewCopy[lang][key], `${lang}/${key}`).not.toMatch(/[ぁ-ん]/);
      }
    }
  });
  it("describes all sixteen lens principles for AI prompts", () => {
    for (const key of approachKeys) expect(artPrinciplesPrompt).toContain(`${key}:`);
    expect(artPrinciplesPrompt).toContain("MULTI-LAYER RESONANCE");
  });
});

describe("detail link label names the current subject", () => {
  it("addresses the owner as あなた", () => {
    expect(detailLinkLabel("ja", null, false)).toBe("あなたの詳しい解説を読む");
    expect(detailLinkLabel("en", null, false)).toBe("Read your detailed reading");
  });
  it("adds さん for a family member", () => {
    expect(detailLinkLabel("ja", "あさみ", false)).toBe("あさみさんの詳しい解説を読む");
    expect(detailLinkLabel("ko", "あさみ", false)).toBe("あさみ 님의 자세한 해설 읽기");
  });
  it("uses the group name without an honorific", () => {
    expect(detailLinkLabel("ja", "開発チーム", true)).toBe("開発チームの詳しい解説を読む");
    expect(detailLinkLabel("fr", "Équipe", true)).toBe("Lire l'explication détaillée de Équipe");
  });
});
