import { describe, expect, it } from "vitest";
import { consultationCard, consultationHeadings, consultationSummary } from "./consultation-card";
import { consultationTranslations } from "./consultation-translations";

const profile = {
  nameKanji: "山田 花子",
  nameKana: "ヤマダ ハナコ",
  nameRomaji: "Hanako Yamada",
  birthDate: "1990-05-10",
  birthTime: "10:30",
  birthTimeUnknown: false,
  birthPlace: "東京都",
  birthCity: "港区",
  bloodType: "A",
  siblingOrder: "first",
};
describe("consultation cards", () => {
  it("shares only the first section and removes profile identifiers", () => {
    const text =
      "### ① 冒頭一言サマリー\n山田 花子さん、東京都で1990-05-10に生まれたあなたへ。今日は一つ選びましょう。\n### ② 深層解析\nPRIVATE ANALYSIS";
    const card = consultationCard(text, profile, "ja", "vip");
    expect(card.lines[0]).not.toContain("PRIVATE ANALYSIS");
    for (const privateValue of [profile.nameKanji, profile.birthDate, profile.birthPlace])
      expect(card.lines[0]).not.toContain(privateValue);
    expect(card.names).toEqual([]);
  });
  it("keeps Free main-only and paid color roles", () => {
    expect(consultationCard("Summary", profile, "ja", "free").palette).toHaveLength(1);
    expect(consultationCard("Summary", profile, "ja", "vip").palette).toHaveLength(6);
  });
  it("bounds unicode summary without breaking surrogate pairs", () => {
    expect(Array.from(consultationSummary("🌍".repeat(500)))).toHaveLength(320);
  });
  it("has four localized headings and requested questions in all seven languages", () => {
    expect(Object.keys(consultationHeadings)).toHaveLength(7);
    Object.values(consultationHeadings).forEach((headings) => expect(headings).toHaveLength(4));
    Object.values(consultationTranslations).forEach((copy) => {
      expect(copy.quickTopics).toHaveLength(4);
      expect(copy.badge(2)).toContain("2");
      expect(copy.bookmark.length).toBeGreaterThan(0);
    });
  });
});
