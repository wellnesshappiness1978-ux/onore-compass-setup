import * as A from "astronomy-engine";

export const ROKUYO = ["大安", "赤口", "先勝", "友引", "先負", "仏滅"] as const;

const validDate = (date: Date) => !Number.isNaN(date.getTime());

export function rokuyo(date: Date) {
  if (!validDate(date)) return null;
  const parts = new Intl.DateTimeFormat("en-u-ca-chinese", { month: "numeric", day: "numeric", timeZone: "Asia/Tokyo" }).formatToParts(date);
  const month = Number(parts.find((part) => part.type === "month")?.value.match(/\d+/)?.[0]);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  if (!month || !day) return null;
  return { name: ROKUYO[(month + day) % 6], lunarMonth: month, lunarDay: day };
}

const wrapNine = (value: number) => ((value - 1 + 900) % 9) + 1;
const digitRoot = (value: number): number => value < 10 ? value : digitRoot(String(value).split("").reduce((sum, digit) => sum + Number(digit), 0));
export const NINE_STAR_NAMES = ["", "一白水星", "二黒土星", "三碧木星", "四緑木星", "五黄土星", "六白金星", "七赤金星", "八白土星", "九紫火星"] as const;

const solarTermStart = (year: number, longitude: number, month: number) => {
  const start = Date.UTC(year, month - 1, 1, 12);
  return A.SearchSunLongitude(longitude, (start - Date.UTC(2000, 0, 1, 12)) / 86_400_000, 12)?.date ?? null;
};

const monthlyBoundaries = (year: number) => [
  [2, 315], [3, 330], [4, 0], [5, 30], [6, 60], [7, 90],
  [8, 120], [9, 150], [10, 180], [11, 210], [12, 240], [1, 270],
] as const;

export type NineStarProfile = {
  solarYear: number;
  solarMonth: number;
  honmei: number;
  getsumei: number;
  keisha: number;
  honmeiName: string;
  getsumeiName: string;
  keishaName: string;
  nearBoundary: boolean;
  palaces: { direction: string; palace: number; star: number; starName: string }[];
};

const palaceLayout = [
  ["巽", 4], ["離", 9], ["坤", 2], ["震", 3], ["中宮", 5],
  ["兌", 7], ["艮", 8], ["坎", 1], ["乾", 6],
] as const;

export function nineStarProfile(dateText: string, timeText = "", timeUnknown = true, gender = "undisclosed"): NineStarProfile | null {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!matched) return null;
  const year = Number(matched[1]), month = Number(matched[2]), day = Number(matched[3]);
  const hasTime = !timeUnknown && /^([01]\d|2[0-3]):[0-5]\d$/.test(timeText);
  const hour = hasTime ? Number(timeText.slice(0, 2)) : 12;
  const minute = hasTime ? Number(timeText.slice(3, 5)) : 0;
  const instant = new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
  if (!validDate(instant) || new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) !== dateText) return null;

  const risshun = solarTermStart(year, 315, 2);
  if (!risshun) return null;
  const solarYear = instant < risshun ? year - 1 : year;
  const honmei = wrapNine(11 - digitRoot(solarYear));

  const starts = [
    ...monthlyBoundaries(year - 1).map(([m, lon]) => ({ month: m, date: solarTermStart(m === 1 ? year : year - 1, lon, m) })),
    ...monthlyBoundaries(year).map(([m, lon]) => ({ month: m, date: solarTermStart(m === 1 ? year + 1 : year, lon, m) })),
    ...monthlyBoundaries(year + 1).map(([m, lon]) => ({ month: m, date: solarTermStart(m === 1 ? year + 2 : year + 1, lon, m) })),
  ].filter((entry): entry is { month: number; date: Date } => Boolean(entry.date)).sort((a, b) => a.date.getTime() - b.date.getTime());
  let boundary = starts[0];
  for (const candidate of starts) if (candidate.date <= instant) boundary = candidate;
  if (!boundary) return null;
  const solarMonth = boundary.month === 1 ? 12 : boundary.month - 1;
  const februaryCenter = [1, 4, 7].includes(honmei) ? 8 : [2, 5, 8].includes(honmei) ? 2 : 5;
  const getsumei = wrapNine(februaryCenter - (solarMonth - 1));
  const palaces = palaceLayout.map(([direction, palace]) => {
    const star = wrapNine(getsumei + palace - 5);
    return { direction, palace, star, starName: NINE_STAR_NAMES[star] };
  });
  const located = palaces.find((palace) => palace.star === honmei);
  const mirror: Record<number, number> = { 1: 9, 2: 6, 3: 4, 4: 3, 6: 2, 7: 8, 8: 7, 9: 1 };
  const centerFive = gender === "female" ? 6 : 7;
  const keisha = located?.palace === 5 ? (honmei === 5 ? centerFive : mirror[honmei] ?? 5) : located?.palace ?? 5;
  const nearest = starts.reduce((best, item) => Math.abs(item.date.getTime() - instant.getTime()) < Math.abs(best.date.getTime() - instant.getTime()) ? item : best, starts[0]);
  return {
    solarYear, solarMonth, honmei, getsumei, keisha,
    honmeiName: NINE_STAR_NAMES[honmei], getsumeiName: NINE_STAR_NAMES[getsumei], keishaName: NINE_STAR_NAMES[keisha],
    nearBoundary: Boolean(nearest && Math.abs(nearest.date.getTime() - instant.getTime()) < 86_400_000), palaces,
  };
}