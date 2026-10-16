import type { Language } from "./translations";
import type { ShareCardData } from "./share-card-renderer";
import { birthColorSpectrum, localizeBirthColorName } from "./birth-color-spectrum";
import type { Plan } from "./design-modes";

export const consultationHeadings: Record<Language, [string, string, string, string]> = {
  ja: [
    "① 冒頭一言サマリー",
    "② 深層解析",
    "③ 今日〜明日の具体アクション",
    "④ ラッキーフレーズ・開運行動",
  ],
  en: [
    "① In a nutshell",
    "② Deeper insight",
    "③ Actions for today and tomorrow",
    "④ Lucky phrase and mindful action",
  ],
  "zh-CN": ["① 一句话总结", "② 深层解析", "③ 今天至明天的具体行动", "④ 幸运短句与开运动作"],
  "zh-TW": ["① 一句話總結", "② 深層解析", "③ 今天至明天的具體行動", "④ 幸運短句與開運行動"],
  ko: ["① 한마디 요약", "② 깊이 있는 분석", "③ 오늘과 내일의 구체적 행동", "④ 행운 문구와 실천"],
  es: [
    "① Resumen en una frase",
    "② Análisis profundo",
    "③ Acciones para hoy y mañana",
    "④ Frase inspiradora y acción",
  ],
  fr: [
    "① En quelques mots",
    "② Analyse approfondie",
    "③ Actions pour aujourd’hui et demain",
    "④ Phrase porte-bonheur et action",
  ],
};

/** Only share the opening summary. Remove identifying profile strings before rendering. */
export function consultationSummary(text: string, privateValues: string[] = []) {
  let summary =
    text
      .split(/^###\s+/m)
      .find((section) => section.trim().startsWith("①"))
      ?.replace(/^[^\n]*\n/, "") ??
    text.split(/^###\s+/m)[0] ??
    text;
  summary = summary
    .replace(/[*_`#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
  for (const value of privateValues
    .filter((value) => value.trim().length > 0)
    .sort((a, b) => b.length - a.length))
    summary = summary.split(value).join("…");
  return Array.from(summary).slice(0, 320).join("");
}

export function consultationCard(
  text: string,
  profile: Parameters<typeof birthColorSpectrum>[0] & {
    nameKanji?: string;
    nameKana?: string;
    nameRomaji?: string;
    birthCity?: string;
  },
  language: Language,
  plan: Plan,
): ShareCardData {
  const colors = birthColorSpectrum(profile);
  const palette = colors
    ? (plan === "free"
        ? [colors.main]
        : [colors.main, colors.sub, colors.money, colors.love, colors.health, colors.mind]
      ).map((color) => ({ label: localizeBirthColorName(color.name, language), code: color.code }))
    : [];
  return {
    kind: "consultation",
    kicker: "AGOLMEN AI",
    title: consultationHeadings[language][0].replace(/^①\s*/, ""),
    score: 0,
    names: [],
    lines: [
      consultationSummary(text, [
        profile.nameKanji ?? "",
        profile.nameKana ?? "",
        profile.nameRomaji ?? "",
        profile.birthDate,
        profile.birthTime,
        profile.birthPlace,
        profile.birthCity ?? "",
      ]),
    ],
    palette,
  };
}
