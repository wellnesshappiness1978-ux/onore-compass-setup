import { describe, expect, it } from "vitest";
import { languages } from "./translations";
import { localizePrefecture, profileUiCopy } from "./profile-ui-copy";

const japaneseOnly = /[ぁ-んァ-ヶ]/;

describe("profile UI localization", () => {
  it("has complete locale-specific profile copy", () => {
    for (const { code } of languages) {
      const copy = profileUiCopy[code];
      expect(copy.placeholders.nameKanji).toBeTruthy();
      expect(copy.placeholders.nameKana).toBeTruthy();
      expect(copy.placeholders.nameRomaji).toBeTruthy();
      expect(copy.placeholders.city).toBeTruthy();
      expect(copy.selectGender).toBeTruthy();
      expect(copy.kanaError).toBeTruthy();
      expect(copy.requiredFieldsError).toBeTruthy();
      expect(copy.intro.cta).toBeTruthy();
      expect(copy.intro.body.length).toBeGreaterThan(180);
      expect(copy.settings.morningPush).toBeTruthy();
      expect(copy.team.recruit.title).toBeTruthy();
    }
  });

  it("does not leak Japanese examples into Latin-script locales", () => {
    for (const code of ["en", "es", "fr"] as const) {
      const { nameKanji, nameKana, city } = profileUiCopy[code].placeholders;
      expect(nameKanji).not.toMatch(japaneseOnly);
      expect(nameKana).not.toMatch(japaneseOnly);
      expect(city).not.toMatch(japaneseOnly);
    }
  });

  it("localizes prefecture labels without changing stored Japanese IDs", () => {
    expect(localizePrefecture("ja", 12, "東京都", "Tokyo")).toBe("東京都");
    expect(localizePrefecture("en", 12, "東京都", "Tokyo")).toBe("Tokyo");
    expect(localizePrefecture("zh-CN", 12, "東京都", "Tokyo")).toBe("东京都");
    expect(localizePrefecture("zh-TW", 12, "東京都", "Tokyo")).toBe("東京都");
    expect(localizePrefecture("ko", 12, "東京都", "Tokyo")).toBe("도쿄도");
  });
});
