// A reproducible 1440-slot visual palette, not a measured wavelength or a validated birth-color method.
import * as A from "astronomy-engine";
type ParentBirth = { birthDate: string; birthPlace?: string; birthCity?: string };
type Birth = { birthDate: string; birthTime: string; birthTimeUnknown: boolean; birthPlace: string; father?: ParentBirth | null; mother?: ParentBirth | null };
const names = ["サンライズコーラル", "シャンパンローズ", "アンバーゴールド", "翡翠グリーン", "ターコイズ", "瑠璃ブルー", "アメジスト", "モーヴピンク"];
const translatedNames = {
  en: ["Sunrise Coral", "Champagne Rose", "Amber Gold", "Jade Green", "Turquoise", "Lapis Blue", "Amethyst", "Mauve Pink"],
  "zh-CN": ["晨曦珊瑚", "香槟玫瑰", "琥珀金", "翡翠绿", "绿松石", "琉璃蓝", "紫水晶", "藕荷粉"],
  "zh-TW": ["晨曦珊瑚", "香檳玫瑰", "琥珀金", "翡翠綠", "綠松石", "琉璃藍", "紫水晶", "藕荷粉"],
  ko: ["선라이즈 코랄", "샴페인 로즈", "앰버 골드", "제이드 그린", "터쿼이즈", "라피스 블루", "아메시스트", "모브 핑크"],
  es: ["Coral amanecer", "Rosa champán", "Oro ámbar", "Verde jade", "Turquesa", "Azul lapislázuli", "Amatista", "Rosa malva"],
  fr: ["Corail levant", "Rose champagne", "Or ambré", "Vert jade", "Turquoise", "Bleu lapis", "Améthyste", "Rose mauve"],
} as const;
export const localizeBirthColorName = (name: string | undefined, language: keyof typeof translatedNames | "ja") => {
  if (!name) return "—";
  return language === "ja" ? name : translatedNames[language][Math.max(0, names.indexOf(name))] ?? name;
};
const hex = (h: number, s: number, l: number) => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};
const used = new Set<string>();
const palette = Array.from({ length: 1440 }, (_, slot) => {
  const hue = slot / 4;
  let code = hex(hue, 0.57, 0.47 + (slot % 4) * 0.035);
  while (used.has(code)) {
    const blue = (parseInt(code.slice(5), 16) + 1) % 256;
    code = `${code.slice(0, 5)}${blue.toString(16).padStart(2, "0")}`.toUpperCase();
  }
  used.add(code);
  return { slot: slot + 1, name: names[Math.floor(hue / 45) % names.length], code };
});

export function birthColorSpectrum(p: Birth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) return null;
  const date = new Date(`${p.birthDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== p.birthDate) return null;
  const hasTime = !p.birthTimeUnknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.birthTime);
  const minute = hasTime ? Number(p.birthTime.slice(0, 2)) * 60 + Number(p.birthTime.slice(3, 5)) : 720;
  // The Sun's calculated longitude is one input to an illustrative palette, not a physical color measurement.
  const instant = new Date(`${p.birthDate}T03:00:00Z`); // noon JST reference longitude
  const sunSlot = Math.floor(A.SunPosition(instant).elon * 4);
  const seed = [...`${p.birthDate}|${p.birthPlace || "東京都"}`].reduce((v, ch) => (v * 31 + ch.charCodeAt(0)) % 1440, 0);
  const own = (seed + minute + sunSlot) % 1440;
  // Optional parents' birth data refines the palette: the person's own slot stays
  // dominant while each known parent contributes a quarter of the blend. This is an
  // illustrative family-resonance input to the same 1440-slot palette, never a
  // measured vibration or an inherited-traits claim.
  const parentSlot = (parent: ParentBirth | null | undefined) => {
    if (!parent || !/^\d{4}-\d{2}-\d{2}$/.test(parent.birthDate)) return null;
    const date = new Date(`${parent.birthDate}T03:00:00Z`);
    if (Number.isNaN(date.getTime())) return null;
    const pSeed = [...`${parent.birthDate}|${parent.birthPlace || ""}|${parent.birthCity || ""}`].reduce((v, ch) => (v * 31 + ch.charCodeAt(0)) % 1440, 0);
    return (pSeed + Math.floor(A.SunPosition(date).elon * 4)) % 1440;
  };
  const fatherSlot = parentSlot(p.father);
  const motherSlot = parentSlot(p.mother);
  const known = [fatherSlot, motherSlot].filter((s): s is number => s !== null);
  const base = known.length === 0 ? own : Math.round((own * 2 + known.reduce((a, s) => a + s, 0)) / (2 + known.length)) % 1440;
  const color = (index: number) => palette[(index + 1440) % 1440] ?? { slot: 1, name: "参考色", code: hex(0, 0.57, 0.51) };
  return { main: color(base), sub: color(base + 215), money: color(base + 360), work: color(base + 1013), love: color(base + 600), health: color(base + 840), mind: color(base + 487), provisional: !hasTime, placeDefault: !p.birthPlace, parentInfluence: known.length === 2 ? "both" as const : fatherSlot !== null ? "father" as const : motherSlot !== null ? "mother" as const : null };
}
/** Palette family name for any hex (same 45° hue bands as the 1440-slot palette). */
export function birthColorNameForHex(code: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(code);
  if (!m) return "—";
  const [r, g, b] = [0, 2, 4].map(i => parseInt(m[1]!.slice(i, i + 2), 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const hue = (h * 60 + 360) % 360;
  return names[Math.floor(hue / 45) % names.length]!;
}
