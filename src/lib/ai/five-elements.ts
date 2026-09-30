import strokes from "./data/unihan-strokes.json";

// Unihan kTotalStrokes (Unicode UCD); modern character counts, not school-specific old-form counts.
// Name grids need a deliberate surname/given-name boundary; never guess it from an unspaced name.
const counts = strokes as Record<string, number>;
const signs = ["山羊座", "水瓶座", "魚座", "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座"];
const boundaries = [120, 219, 321, 420, 521, 622, 723, 823, 923, 1024, 1123, 1222];
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
// 1–60 correspondence from https://www.tjf.or.jp/hidamari/pdf/34_furoku.pdf
const animals = ["チータ", "たぬき", "猿", "コアラ", "黒ひょう", "虎", "チータ", "たぬき", "猿", "コアラ", "こじか", "ゾウ", "狼", "ひつじ", "猿", "コアラ", "こじか", "ゾウ", "狼", "ひつじ", "ペガサス", "ペガサス", "ひつじ", "狼", "狼", "ひつじ", "ペガサス", "ペガサス", "ひつじ", "狼", "ゾウ", "こじか", "コアラ", "猿", "ひつじ", "狼", "ゾウ", "こじか", "コアラ", "猿", "たぬき", "チータ", "虎", "黒ひょう", "コアラ", "猿", "たぬき", "チータ", "虎", "黒ひょう", "ライオン", "ライオン", "黒ひょう", "虎", "虎", "黒ひょう", "ライオン", "ライオン", "黒ひょう", "虎"];

export function getFiveElements(profile: { nameKanji: string; birthDate: string; bloodType: string }) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.birthDate);
  const year = Number(match?.[1]); const month = Number(match?.[2]); const day = Number(match?.[3]);
  const utc = Date.UTC(year, month - 1, day);
  const valid = Boolean(match && year >= 1900 && year <= 2100 && new Date(utc).toISOString().slice(0, 10) === profile.birthDate);
  const md = month * 100 + day;
  const signIndex = valid ? boundaries.reduce((idx, start, i) => md >= start ? i + 1 : idx, 0) % 12 : -1;
  const zodiac = signIndex >= 0 ? signs[signIndex] : null;
  // Around solar-term boundaries, the exact time/place can change the year pillar.
  const uncertainYear = valid && ((month === 2 && day >= 2 && day <= 5) || (month === 1 && day === 1));
  const branchYear = valid ? year - (md < 204 ? 1 : 0) : 0;
  const eto = valid && !uncertainYear ? branches[((branchYear - 4) % 12 + 12) % 12] + "年" : null;
  // The published year/month table plus day reduces to this 1900-01-01 day-cycle anchor.
  const animalNumber = valid ? (((Math.floor((utc - Date.UTC(1900, 0, 1)) / 86400000) + 10) % 60 + 60) % 60) + 1 : null;
  const animal = animalNumber ? `${animals[animalNumber - 1]}（60分類 ${animalNumber}番）` : null;
  const blood = ["A", "B", "O", "AB"].includes(profile.bloodType) ? `${profile.bloodType}型` : null;
  const parts = profile.nameKanji.trim().split(/[\s　]+/).filter(Boolean);
  const name = parts.length === 2 && parts.every(part => [...part].every(char => Number.isInteger(counts[char])))
    ? (() => {
        const surname = [...(parts[0] ?? "")].map(char => counts[char] ?? 0);
        const given = [...(parts[1] ?? "")].map(char => counts[char] ?? 0);
        const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
        return { sky: sum(surname), person: (surname.at(-1) ?? 0) + (given[0] ?? 0), earth: sum(given), total: sum(surname) + sum(given) };
      })() : null;
  return { name, zodiac, eto, blood, animal, animalNumber, zodiacBoundary: valid && boundaries.some(b => Math.abs(md - b) <= 1), uncertainYear };
}
