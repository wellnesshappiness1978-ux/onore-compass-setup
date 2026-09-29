// An illustrative numerology-to-color mapping, not a verified natal nine-stars chart.
const colors = {
  1: { label: "レッド（開拓・リーダーシップ）", token: "var(--birth-color-1)" },
  2: { label: "オレンジ（協調・共感）", token: "var(--birth-color-2)" },
  3: { label: "イエロー（表現・創造）", token: "var(--birth-color-3)" },
  4: { label: "グリーン（安定・構築）", token: "var(--birth-color-4)" },
  5: { label: "ターコイズ（自由・変化）", token: "var(--birth-color-5)" },
  6: { label: "ピンク（愛・調和）", token: "var(--birth-color-6)" },
  7: { label: "バイオレット（探究・叡智）", token: "var(--birth-color-7)" },
  8: { label: "ゴールド（成果・豊かさ）", token: "var(--birth-color-8)" },
  9: { label: "ホワイト（包容・完成）", token: "var(--birth-color-9)" },
  11: { label: "シルバー（直感・啓示）", token: "var(--birth-color-11)" },
  22: { label: "ロイヤルブルー（大志・実現）", token: "var(--birth-color-22)" },
  33: { label: "パール（無償の愛・奉仕）", token: "var(--birth-color-33)" },
} as const;

export function reduceNumerology(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return n;
}

export function getBirthColor(number: number) {
  return colors[number as keyof typeof colors];
}

export function getBirthColorPair(birthDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const yearSum = [...String(year)].reduce((sum, digit) => sum + Number(digit), 0);
  const main = getBirthColor(reduceNumerology(reduceNumerology(yearSum) + reduceNumerology(month) + reduceNumerology(day)));
  const sub = getBirthColor(reduceNumerology(day));
  return main && sub ? { main, sub } : null;
}