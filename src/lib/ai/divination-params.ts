// Deterministic pre-calculated parameters injected into the AI consultation prompt.
// Only values that can be derived exactly from the profile are computed here.
import { getBirthColorPair, reduceNumerology } from "@/lib/birth-colors";

type Input = {
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  nameKana: string;
  nameRomaji: string;
  nameKanji: string;
};

const reduce = reduceNumerology;
const digitSum = (s: string) => s.replace(/\D/g, "").split("").reduce((a, d) => a + Number(d), 0);
const letterValue = (c: string) => ((c.charCodeAt(0) - 65) % 9) + 1;

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEM_ELEMENT = ["木(陽)", "木(陰)", "火(陽)", "火(陰)", "土(陽)", "土(陰)", "金(陽)", "金(陰)", "水(陽)", "水(陰)"];
const TERMS = ["春分", "清明", "穀雨", "立夏", "小満", "芒種", "夏至", "小暑", "大暑", "立秋", "処暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "啓蟄"];
const SIGNS = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
function sunLongitude(date: Date): number {
  const n = date.getTime() / 86400000 - 10957.5; // days from J2000
  const L = 280.46 + 0.9856474 * n;
  const g = ((357.528 + 0.9856003 * n) * Math.PI) / 180;
  return (((L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) % 360) + 360) % 360;
}

const KANA_ELEMENT: [RegExp, string][] = [
  [/^[かきくけこがぎぐげごカキクケコガギグゲゴ]/, "木（牙音）"],
  [/^[たちつてとだぢづでどなにぬねのらりるれろタチツテトダヂヅデドナニヌネノラリルレロ]/, "火（舌音）"],
  [/^[あいうえおやゆよわをアイウエオヤユヨワヲ]/, "土（喉音）"],
  [/^[さしすせそざじずぜぞサシスセソザジズゼゾ]/, "金（歯音）"],
  [/^[はひふへほばびぶべぼぱぴぷぺぽまみむめもハヒフヘホバビブベボパピプペポマミムメモ]/, "水（唇音）"],
];

export function computeDivinationParams(p: Input, now = new Date()): string {
  const lines: string[] = [];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p.birthDate);
  if (m) {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const birth = new Date(Date.UTC(y, mo - 1, d, 3)); // ~noon JST
    const lifePath = reduce(reduce(digitSum(m[1] ?? "")) + reduce(mo) + reduce(d));
    const personalYear = reduce(digitSum(`${mo}${d}${now.getUTCFullYear()}`));
    const personalMonth = reduce(personalYear + now.getUTCMonth() + 1);
    const dayIdx = (((Math.floor((Date.UTC(y, mo - 1, d) - Date.UTC(1900, 0, 1)) / 86400000) + 10) % 60) + 60) % 60;
    const yearIdx = (((y - 4) % 60) + 60) % 60;
    const natalSun = sunLongitude(birth);
    const nowSun = sunLongitude(now);
    const phase = (((nowSun - natalSun) % 360) + 360) % 360;
    lines.push(
      `[数秘術] ライフパス数 ${lifePath} / バースデー数 ${reduce(d)} / 個人年数(${now.getUTCFullYear()}) ${personalYear} / 個人月数 ${personalMonth}`,
      `[バースカラー] ${getBirthColorPair(p.birthDate)?.main.label ?? "—"}（ライフパス数対応）`,
      `[四柱推命・動物占い基礎] 日柱 ${STEMS[dayIdx % 10]}${BRANCHES[dayIdx % 12]}（六十干支 ${dayIdx + 1}番）/ 日干の五行 ${STEM_ELEMENT[dayIdx % 10]} / 年柱 ${STEMS[yearIdx % 10]}${BRANCHES[yearIdx % 12]}（立春前生まれは前年干支の可能性あり）。60分類アニマル名は日柱番号に基づく独自解釈として扱う`,
      `[西洋占星術] 太陽星座 ${SIGNS[Math.floor(natalSun / 30) % 12]}（太陽黄経 ${natalSun.toFixed(1)}°）/ 出生の二十四節気 ${TERMS[Math.floor(natalSun / 15)]}${p.birthTimeUnknown || !p.birthTime ? " / 出生時刻不明のためアセンダント・月星座は算出不可" : ""}`,
      `[地球暦] 現在の太陽黄経 ${nowSun.toFixed(1)}°・二十四節気 ${TERMS[Math.floor(nowSun / 15)]} / 本人の太陽回帰からの位相 ${phase.toFixed(0)}°（${phase < 90 ? "始動期" : phase < 180 ? "成長期" : phase < 270 ? "収穫期" : "内省・準備期"}）`,
    );
  }
  const moonAge = ((((now.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % 29.530588) + 29.530588) % 29.530588;
  lines.push(`[月相] 月齢 ${moonAge.toFixed(1)}（${moonAge < 3.7 || moonAge > 25.8 ? "新月期: 種まき" : moonAge < 11 ? "上弦へ: 拡大" : moonAge < 18.5 ? "満月期: 成果・発表" : "下弦へ: 手放し・整理"}）`);

  const romaji = p.nameRomaji.toUpperCase().replace(/[^A-Z]/g, "");
  if (romaji) {
    const vowels = romaji.replace(/[^AEIOUY]/g, "");
    const cons = romaji.replace(/[AEIOUY]/g, "");
    const sum = (s: string) => reduce([...s].reduce((a, c) => a + letterValue(c), 0));
    lines.push(`[数秘・姓名] ディスティニー数 ${sum(romaji)} / ソウル数 ${sum(vowels)} / パーソナリティ数 ${sum(cons)}（ローマ字「${romaji}」ピタゴラス式）`);
  }
  const kana = p.nameKana.replace(/[\s　]/g, "");
  if (kana) {
    const el = KANA_ELEMENT.find(([re]) => re.test(kana))?.[1] ?? "判定不可";
    lines.push(`[音霊] よみ「${kana}」${[...kana].length}音 / 頭音の五行 ${el}`);
  }
  lines.push(
    p.nameKanji
      ? `[姓名判断] 漢字「${p.nameKanji}」: 公式画数表を保持していないため五格の数値はプレビュー扱い（断定しない）`
      : "[姓名判断] 漢字未入力のため五格は算出不可",
  );
  return lines.join("\n");
}
