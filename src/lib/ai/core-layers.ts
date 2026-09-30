// Five core divination layers + deterministic cross analysis. Pure: same input -> same output.
// Astronomy uses Tokyo coordinates because the profile has no geocoded birthplace.
import * as A from "astronomy-engine";
import { reduceNumerology } from "@/lib/birth-colors";
import { getFiveElements } from "./five-elements";

export type CoreInput = { nameKanji: string; nameRomaji: string; birthDate: string; birthTime: string; birthTimeUnknown: boolean; bloodType: string };

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const EL = ["木", "火", "土", "金", "水"] as const;
const BRANCH_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const SIGNS = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
const SIGN_EL = ["火", "地", "風", "水"];
const STAGES = ["長生", "沐浴", "冠帯", "建禄", "帝旺", "衰", "病", "死", "墓", "絶", "胎", "養"];
const CHOSEI = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];
const TSUHEN = [["比肩", "劫財"], ["食神", "傷官"], ["偏財", "正財"], ["偏官", "正官"], ["偏印", "印綬"]];
const TOKYO = { lat: 35.68, lon: 139.69 };
const PLANETS: [string, A.Body][] = [["水星", A.Body.Mercury], ["金星", A.Body.Venus], ["火星", A.Body.Mars], ["木星", A.Body.Jupiter], ["土星", A.Body.Saturn], ["天王星", A.Body.Uranus], ["海王星", A.Body.Neptune], ["冥王星", A.Body.Pluto]];
const ANIMAL_GROUP: Record<string, string> = { 狼: "EARTH・目標指向型", 猿: "EARTH・目標指向型", 虎: "EARTH・目標指向型", コアラ: "EARTH・目標指向型", こじか: "MOON・状況対応型", 黒ひょう: "MOON・状況対応型", たぬき: "MOON・状況対応型", ひつじ: "MOON・状況対応型", チータ: "SUN・状況対応型", ライオン: "SUN・状況対応型", ゾウ: "SUN・状況対応型", ペガサス: "SUN・状況対応型" };

const mod = (n: number, m: number) => ((n % m) + m) % m;
const sign = (lon: number) => SIGNS[Math.floor(mod(lon, 360) / 30)]!;
const tsuhen = (day: number, other: number) => TSUHEN[mod(Math.floor(other / 2) - Math.floor(day / 2), 5)]![day % 2 === other % 2 ? 0 : 1]!;
const stage = (day: number, branch: number) => STAGES[mod(day % 2 === 0 ? branch - CHOSEI[day]! : CHOSEI[day]! - branch, 12)]!;
const letter = (c: string) => ((c.charCodeAt(0) - 65) % 9) + 1;

export function computeCoreLayers(p: CoreInput, now = new Date()) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p.birthDate);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const hasTime = !p.birthTimeUnknown && /^\d{1,2}:\d{2}/.test(p.birthTime);
  const [hh, mm] = hasTime ? p.birthTime.split(":").map(Number) as [number, number] : [12, 0];
  const when = new Date(Date.UTC(y, mo - 1, d, hh - 9, mm)); // JST
  const time = A.MakeTime(when);

  // Western astrology
  const sunLon = A.SunPosition(time).elon;
  const moonLon = A.EclipticGeoMoon(time).lon;
  const planets = PLANETS.map(([n, b]) => ({ name: n, sign: sign(A.Ecliptic(A.GeoVector(b, time, true)).elon) }));
  let ascendant: string | null = null;
  if (hasTime) {
    const ramc = (mod(A.SiderealTime(time) + TOKYO.lon / 15, 24) * 15 * Math.PI) / 180;
    const e = (23.4367 * Math.PI) / 180, f = (TOKYO.lat * Math.PI) / 180;
    const asc = (Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(e) + Math.tan(f) * Math.sin(e))) * 180) / Math.PI;
    ascendant = sign(asc);
  }
  const moonSignNoon = sign(A.EclipticGeoMoon(A.MakeTime(new Date(Date.UTC(y, mo - 1, d, 3)))).lon);
  const western = { sun: sign(sunLon), moon: sign(moonLon), moonUncertain: !hasTime && sign(moonLon) !== sign(A.EclipticGeoMoon(A.MakeTime(new Date(Date.UTC(y, mo - 1, d, 14, 59)))).lon), planets, ascendant, sunElement: SIGN_EL[Math.floor(sunLon / 30) % 4]!, moonElement: SIGN_EL[Math.floor(mod(moonLon, 360) / 30) % 4]! };
  void moonSignNoon;

  // Four pillars (year by 立春 = 315°, month by 節入り every 30°)
  const pillarYear = y - (mo <= 2 && (sunLon < 315 && sunLon > 270) ? 1 : 0);
  const yearIdx = mod(pillarYear - 4, 60);
  const monthOrd = Math.floor(mod(sunLon - 315, 360) / 30); // 0 = 寅月
  const monthBranch = mod(monthOrd + 2, 12);
  const monthStem = mod((yearIdx % 5) * 2 + 2 + monthOrd, 10);
  const dayIdx = mod(Math.floor((Date.UTC(y, mo - 1, d) - Date.UTC(1900, 0, 1)) / 86400000) + 10, 60);
  const dayStem = dayIdx % 10, dayBranch = dayIdx % 12;
  const hourBranch = hasTime ? mod(Math.floor((hh + 1) / 2), 12) : null;
  const hourStem = hourBranch === null ? null : mod((dayStem % 5) * 2 + hourBranch, 10);
  const pillars = [
    { label: "年柱", stem: yearIdx % 10, branch: yearIdx % 12 },
    { label: "月柱", stem: monthStem, branch: monthBranch },
    { label: "日柱", stem: dayStem, branch: dayBranch },
    ...(hourBranch !== null && hourStem !== null ? [{ label: "時柱", stem: hourStem, branch: hourBranch }] : []),
  ];
  const balance = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 } as Record<(typeof EL)[number], number>;
  for (const pl of pillars) { balance[EL[Math.floor(pl.stem / 2)]!]++; balance[EL[BRANCH_EL[pl.branch]!]!]++; }
  const shichu = {
    pillars: pillars.map(pl => ({ label: pl.label, kanshi: STEMS[pl.stem]! + BRANCHES[pl.branch]!, tsuhen: pl.label === "日柱" ? "日干（本人）" : tsuhen(dayStem, pl.stem), stage: stage(dayStem, pl.branch) })),
    dayMaster: `${STEMS[dayStem]}（${EL[Math.floor(dayStem / 2)]}の${dayStem % 2 ? "陰" : "陽"}）`,
    dayElement: EL[Math.floor(dayStem / 2)]!,
    balance, missing: EL.filter(k => balance[k] === 0), dominant: EL.reduce((a, k) => (balance[k] > balance[a] ? k : a), "木" as (typeof EL)[number]),
    yearBoundary: Math.abs(sunLon - 315) < 1, monthBoundary: mod(sunLon - 315, 30) < 0.5 || mod(sunLon - 315, 30) > 29.5,
  };

  // Numerology (Pythagorean)
  const digitSum = (s: string) => [...s.replace(/\D/g, "")].reduce((a, c) => a + Number(c), 0);
  const lifePath = reduceNumerology(reduceNumerology(digitSum(m[1]!)) + reduceNumerology(mo) + reduceNumerology(d));
  const romaji = p.nameRomaji.toUpperCase().replace(/[^A-Z]/g, "");
  const sumOf = (s: string) => (s ? reduceNumerology([...s].reduce((a, c) => a + letter(c), 0)) : null);
  const personalYear = reduceNumerology(digitSum(`${mo}${d}${now.getUTCFullYear()}`));
  const firstEnd = 36 - (lifePath > 9 ? reduceNumerology(digitSum(String(lifePath))) : lifePath);
  const age = now.getUTCFullYear() - y;
  const turning = [firstEnd, firstEnd + 9, firstEnd + 18].find(a => a >= age) ?? null;
  const numerology = { lifePath, destiny: sumOf(romaji), soul: sumOf(romaji.replace(/[^AEIOUY]/g, "")), personality: sumOf(romaji.replace(/[AEIOUY]/g, "")), personalYear, cyclePhase: `9年周期の${((personalYear - 1) % 9) + 1}年目`, turningAge: turning, turningYear: turning === null ? null : y + turning };

  // Name grid + animal (existing tables)
  const five = getFiveElements(p);
  const animalName = five.animal?.split("（")[0] ?? null;
  const animal = { core: five.animal, group: animalName ? ANIMAL_GROUP[animalName] ?? null : null };
  const personEl = five.name ? EL[Math.floor(mod(five.name.person - 1, 10) / 2)]! : null;

  // Cross analysis (rules defined by this app)
  const yangEastern = (e: string) => (e === "木" || e === "火" ? "外向" : e === "土" ? "中庸" : "内向");
  const yangWestern = (e: string) => (e === "火" || e === "風" ? "外向" : "内向");
  const cross = [
    { pair: "四柱推命の日干 × 太陽星座", a: shichu.dayMaster, b: `${western.sun}（${western.sunElement}）`, verdict: yangEastern(shichu.dayElement) === yangWestern(western.sunElement) ? "同じ向きで重なる" : "向きが対照的（ギャップ）" },
    ...(five.name && numerology.soul ? [{ pair: "姓名の人格 × ソウル数", a: `人格${five.name.person}画（${personEl}・${five.name.person % 2 ? "陽" : "陰"}）`, b: `ソウル数${numerology.soul}（${numerology.soul % 2 ? "陽" : "陰"}）`, verdict: five.name.person % 2 === numerology.soul % 2 ? "外の顔と魂の欲求が一致" : "外の顔と魂の欲求がずれる（ギャップ）" }] : []),
    ...(animal.group ? [{ pair: "動物占い × 月星座", a: `${animalName}（${animal.group}）`, b: `月${western.moon}（${western.moonElement}）`, verdict: (animal.group.startsWith("EARTH") ? "外向" : animal.group.startsWith("SUN") ? "外向" : "内向") === yangWestern(western.moonElement) ? "素の自分と感情が同調" : "素の自分と感情が対照的（ギャップ）" }] : []),
  ];
  const surface = [five.name ? `人格${five.name.person}画` : null, `太陽${western.sun}`, `月柱通変星${shichu.pillars[1]!.tsuhen}`].filter(Boolean) as string[];
  const inner = [numerology.soul ? `ソウル数${numerology.soul}` : null, `月${western.moon}`, `日柱十二運${shichu.pillars[2]!.stage}`].filter(Boolean) as string[];

  return { western, shichu, numerology, name: five.name, animal, cross, surface, inner, hasTime };
}

export type CoreLayers = NonNullable<ReturnType<typeof computeCoreLayers>>;

export function coreLayersPrompt(c: CoreLayers | null): string {
  if (!c) return "[5大コア] 生年月日が無効のため算出不可";
  const n = c.name;
  return [
    `[姓名判断] ${n ? `天格${n.sky}(${n.luck.sky}) 人格${n.person}(${n.luck.person}) 地格${n.earth}(${n.luck.earth}) 外格${n.outer}(${n.luck.outer}) 総格${n.total}(${n.luck.total})` : "未算出（空白区切りの漢字氏名が必要）"}`,
    `[数秘術] ライフパス${c.numerology.lifePath} / ディスティニー${c.numerology.destiny ?? "未算出"} / ソウル${c.numerology.soul ?? "未算出"} / パーソナリティ${c.numerology.personality ?? "未算出"} / ${c.numerology.cyclePhase} / 次の転機 ${c.numerology.turningAge ? `${c.numerology.turningAge}歳（${c.numerology.turningYear}年・ピナクル切替）` : "—"}`,
    `[西洋占星術・東京基準] 太陽${c.western.sun} 月${c.western.moon}${c.western.moonUncertain ? "（出生時間不明のため月星座は確定できない）" : ""} ${c.western.planets.map(p => `${p.name}${p.sign}`).join(" ")} / ASC ${c.western.ascendant ?? "未算出（出生時間なし）"}`,
    `[四柱推命] ${c.shichu.pillars.map(p => `${p.label}${p.kanshi}(通変星:${p.tsuhen}/十二運:${p.stage})`).join(" ")}${c.hasTime ? "" : " 時柱:未算出"} / 日干${c.shichu.dayMaster} / 五行 ${Object.entries(c.shichu.balance).map(([k, v]) => `${k}${v}`).join(" ")} 最多${c.shichu.dominant} 欠如${c.shichu.missing.join("・") || "なし"}${c.shichu.yearBoundary || c.shichu.monthBoundary ? " ※節入り境界付近" : ""}`,
    `[動物占い] 本質 ${c.animal.core ?? "未算出"} / ${c.animal.group ?? "—"} / 表面・希望・隠れ: 未算出（公開された算出法がないため）`,
    `[クロス解析] ${c.cross.map(x => `${x.pair}: ${x.a} × ${x.b} → ${x.verdict}`).join(" | ")}`,
    `[表の顔] ${c.surface.join("・")} ／ [本音・潜在] ${c.inner.join("・")}`,
  ].join("\n");
}
