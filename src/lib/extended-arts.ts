// Extended divination arts computed deterministically from birth data.
// Pure: same input -> same output. Traditional reference models, never verified facts.
import * as A from "astronomy-engine";

const mod = (n: number, m: number) => ((n % m) + m) % m;

const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

// Indian astrology (sidereal / Lahiri-style ayanamsa approximation)
const SIDEREAL_SIGNS = [
  "メーシャ（牡羊）", "ヴリシャバ（牡牛）", "ミトゥナ（双子）", "カルカ（蟹）",
  "シンハ（獅子）", "カニャー（乙女）", "トゥラー（天秤）", "ヴリシュチカ（蠍）",
  "ダヌス（射手）", "マカラ（山羊）", "クンバ（水瓶）", "ミーナ（魚）",
] as const;
const NAKSHATRAS = [
  "アシュウィニー", "バラニー", "クリッティカー", "ローヒニー", "ムリガシラー", "アールドラー",
  "プナルヴァス", "プシュヤ", "アーシュレーシャ", "マガー", "プールヴァ・パールグニー",
  "ウッタラ・パールグニー", "ハスタ", "チトラー", "スヴァーティ", "ヴィシャーカー", "アヌラーダ",
  "ジェーシュター", "ムーラ", "プールヴァーシャーダ", "ウッタラーシャーダ", "シュラヴァナ",
  "ダニシュター", "シャタビシャ", "プールヴァ・バードラパダ", "ウッタラ・バードラパダ", "レーヴァティ",
] as const;

// Sanmeigaku: ten master stars mapped from the Four Pillars' tsuhen relation to the day master.
const SANMEI_STARS: Record<string, string> = {
  比肩: "貫索星", 劫財: "石門星", 食神: "鳳閣星", 傷官: "調舒星", 偏財: "禄存星",
  正財: "司禄星", 偏官: "車騎星", 正官: "牽牛星", 偏印: "龍高星", 印綬: "玉堂星",
};
const TSUHEN_TABLE = [["比肩", "劫財"], ["食神", "傷官"], ["偏財", "正財"], ["偏官", "正官"], ["偏印", "印綬"]] as const;
const tsuhenOf = (dayStem: number, otherStem: number) =>
  TSUHEN_TABLE[mod(Math.floor(otherStem / 2) - Math.floor(dayStem / 2), 5)]![dayStem % 2 === otherStem % 2 ? 0 : 1]!;

// Lunar mansions (宿曜 27宿, starting from 昴宿)
const MANSIONS = [
  "昴宿", "畢宿", "觜宿", "参宿", "井宿", "鬼宿", "柳宿", "星宿", "張宿",
  "翼宿", "軫宿", "角宿", "亢宿", "氐宿", "房宿", "心宿", "尾宿", "箕宿",
  "斗宿", "女宿", "虚宿", "危宿", "室宿", "壁宿", "奎宿", "婁宿", "胃宿",
] as const;

// Mayan Tzolkin: anchored to 2012-12-21 (JDN 2456283) = 音4・黄色い太陽 (sign index 19).
const MAYA_SIGNS = [
  "赤い龍", "白い風", "青い夜", "黄色い種", "赤い蛇", "白い世界の橋渡し", "青い手",
  "黄色い星", "赤い月", "白い犬", "青い猿", "黄色い人", "赤い空歩く者", "白い魔法使い",
  "青い鷲", "黄色い戦士", "赤い地球", "白い鏡", "青い嵐", "黄色い太陽",
] as const;
const MAYA_ANCHOR_JDN = 2456283;
const MAYA_ANCHOR_TONE = 4;
const MAYA_ANCHOR_SIGN = 19;

export type ExtendedArts = {
  indian: { siderealSun: string; nakshatra: string; ayanamsa: number };
  ziwei: { mingPalace: string; shenPalace: string; hourAssumed: boolean };
  sanmei: { early: string; middle: string; late: string };
  lunarMansion: { name: string; index: number };
  maya: { tone: number; sign: string; kin: number };
};

export function computeExtendedArts(birthDate: string, birthTime = "", birthTimeUnknown = true): ExtendedArts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const hasTime = !birthTimeUnknown && /^\d{1,2}:\d{2}/.test(birthTime);
  const [hh, mm] = hasTime ? (birthTime.split(":").map(Number) as [number, number]) : [12, 0];
  const when = new Date(Date.UTC(y, mo - 1, d, hh - 9, mm)); // JST
  if (Number.isNaN(when.getTime())) return null;
  const time = A.MakeTime(when);

  // Shared solar longitude / pillars math (mirrors core-layers conventions)
  const sunLon = A.SunPosition(time).elon;
  const moonLon = A.EclipticGeoMoon(time).lon;
  const pillarYear = y - (mo <= 2 && sunLon < 315 && sunLon > 270 ? 1 : 0);
  const yearIdx = mod(pillarYear - 4, 60);
  const monthOrd = Math.floor(mod(sunLon - 315, 360) / 30); // 0 = 寅月
  const monthBranch = mod(monthOrd + 2, 12);
  const monthStem = mod((yearIdx % 5) * 2 + 2 + monthOrd, 10);
  const dayIdx = mod(Math.floor((Date.UTC(y, mo - 1, d) - Date.UTC(1900, 0, 1)) / 86400000) + 10, 60);
  const dayStem = dayIdx % 10;
  const hourBranch = hasTime ? mod(Math.floor((hh + 1) / 2), 12) : 6; // noon 午 reference when unknown
  const hourStem = mod((dayStem % 5) * 2 + hourBranch, 10);

  // Indian: sidereal Sun sign + Moon's nakshatra
  const ayanamsa = 23.85 + (y - 2000) * 0.01397;
  const siderealSun = SIDEREAL_SIGNS[Math.floor(mod(sunLon - ayanamsa, 360) / 30)]!;
  const nakshatra = NAKSHATRAS[Math.floor(mod(moonLon - ayanamsa, 360) / (360 / 27))]!;

  // Zi Wei Dou Shu (simplified reference): 命宮・身宮 from solar month branch and birth hour branch
  const mingPalace = BRANCHES[mod(monthBranch - hourBranch, 12)]!;
  const shenPalace = BRANCHES[mod(monthBranch + hourBranch, 12)]!;

  // Sanmeigaku: life-stage master stars from year / month / hour stems against the day master
  const sanmei = {
    early: SANMEI_STARS[tsuhenOf(dayStem, yearIdx % 10)]!,
    middle: SANMEI_STARS[tsuhenOf(dayStem, monthStem)]!,
    late: SANMEI_STARS[tsuhenOf(dayStem, hourStem)]!,
  };

  // Lunar mansion from the sidereal Moon
  const mansionIndex = Math.floor(mod(moonLon - ayanamsa, 360) / (360 / 27));

  // Mayan Tzolkin kin from the Julian Day Number
  const jdn = Math.floor(Date.UTC(y, mo - 1, d) / 86400000) + 2440588;
  const delta = jdn - MAYA_ANCHOR_JDN;
  const tone = mod(MAYA_ANCHOR_TONE - 1 + delta, 13) + 1;
  const signIndex = mod(MAYA_ANCHOR_SIGN + delta, 20);
  const kin = mod(delta - (MAYA_ANCHOR_TONE - 1) * 20 - MAYA_ANCHOR_SIGN, 260) + 1;

  return {
    indian: { siderealSun, nakshatra, ayanamsa: Math.round(ayanamsa * 100) / 100 },
    ziwei: { mingPalace, shenPalace, hourAssumed: !hasTime },
    sanmei,
    lunarMansion: { name: MANSIONS[mansionIndex]!, index: mansionIndex },
    maya: { tone, sign: MAYA_SIGNS[signIndex]!, kin },
  };
}

export function extendedArtsPrompt(arts: ExtendedArts | null): string {
  if (!arts) return "[拡張占術] 生年月日が無効のため算出不可";
  return [
    `[インド占星術] サイデリアル太陽${arts.indian.siderealSun} / 月のナクシャトラ（27宿）${arts.indian.nakshatra}（アヤナムサ約${arts.indian.ayanamsa}°の伝統的参考値）`,
    `[紫微斗数] 命宮${arts.ziwei.mingPalace} / 身宮${arts.ziwei.shenPalace}${arts.ziwei.hourAssumed ? "（出生時刻不明のため正午を参照）" : ""}（簡易参考モデル）`,
    `[算命学] 十大主星 初年期${arts.sanmei.early} / 中年期${arts.sanmei.middle} / 晩年期${arts.sanmei.late}（日干との通変関係から算出）`,
    `[宿曜占星術] 生まれ宿 ${arts.lunarMansion.name}（27宿の第${arts.lunarMansion.index + 1}宿）`,
    `[マヤ暦] ツォルキン KIN${arts.maya.kin} / 音${arts.maya.tone} / 太陽の紋章「${arts.maya.sign}」`,
    `これらは伝統的な参考モデルの値。象徴的な解釈として自然な言葉に翻訳してよいが、科学的・決定論的な事実や成果の保証としては扱わない`,
  ].join("\n");
}
