// A reproducible 1440-slot visual palette, not a measured wavelength or a validated birth-color method.
import * as A from "astronomy-engine";
type Birth = { birthDate: string; birthTime: string; birthTimeUnknown: boolean; birthPlace: string };
const names = ["サンライズコーラル", "シャンパンローズ", "アンバーゴールド", "翡翠グリーン", "ターコイズ", "瑠璃ブルー", "アメジスト", "モーヴピンク"];
const hex = (h: number, s: number, l: number) => {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};
const palette = Array.from({ length: 1440 }, (_, slot) => {
  const hue = slot / 4;
  // Encode the within-quadrant shade directly into the blue channel to guarantee 1440 distinct HEX values.
  const base = hex(hue, 0.57, 0.51);
  const code = `${base.slice(0, 5)}${Math.floor(slot / 4).toString(16).padStart(3, "0").slice(-2)}`.toUpperCase();
  return { slot: slot + 1, name: names[Math.floor(hue / 45) % names.length], code };
});

export function birthColorSpectrum(p: Birth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate)) return null;
  const date = new Date(`${p.birthDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== p.birthDate) return null;
  const hasTime = !p.birthTimeUnknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.birthTime);
  const minute = hasTime ? Number(p.birthTime.slice(0, 2)) * 60 + Number(p.birthTime.slice(3, 5)) : 720;
  // The Sun's calculated longitude is one input to an illustrative palette, not a physical color measurement.
  const instant = new Date(`${p.birthDate}T00:00:00Z`);
  instant.setUTCMinutes(minute - 540);
  const sunSlot = Math.floor(A.SunPosition(instant).elon * 4);
  const seed = [...`${p.birthDate}|${p.birthPlace || "東京都"}`].reduce((v, ch) => (v * 31 + ch.charCodeAt(0)) % 1440, 0);
  const base = (seed + minute + sunSlot) % 1440;
  const color = (index: number) => palette[(index + 1440) % 1440];
  return { main: color(base), sub: color(base + 215), mind: color(base + 487), provisional: !hasTime, placeDefault: !p.birthPlace };
}