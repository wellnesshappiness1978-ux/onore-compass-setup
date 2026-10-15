// Earth-calendar almanac: public astronomical / traditional-calendar data computed locally (no network).
import * as A from "astronomy-engine";

const JST = 9 * 3600_000;
const key = (d: Date) => new Date(d.getTime() + JST).toISOString().slice(0, 10);
const addDaysKey = (k: string, n: number) => { const d = new Date(`${k}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const localKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const SOLAR_TERMS = ["春分", "清明", "穀雨", "立夏", "小満", "芒種", "夏至", "小暑", "大暑", "立秋", "処暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "啓蟄"] as const;
export const SOLAR_TERM_KANA: Record<string, string> = { 春分: "しゅんぶん", 清明: "せいめい", 穀雨: "こくう", 立夏: "りっか", 小満: "しょうまん", 芒種: "ぼうしゅ", 夏至: "げし", 小暑: "しょうしょ", 大暑: "たいしょ", 立秋: "りっしゅう", 処暑: "しょしょ", 白露: "はくろ", 秋分: "しゅうぶん", 寒露: "かんろ", 霜降: "そうこう", 立冬: "りっとう", 小雪: "しょうせつ", 大雪: "たいせつ", 冬至: "とうじ", 小寒: "しょうかん", 大寒: "だいかん", 立春: "りっしゅん", 雨水: "うすい", 啓蟄: "けいちつ" };
export const LUNAR_MONTHS = ["睦月", "如月", "弥生", "卯月", "皐月", "水無月", "文月", "葉月", "長月", "神無月", "霜月", "師走"] as const;
const NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
export const lunarDayKanji = (d: number) => d <= 10 ? NUM[d]! : d < 20 ? `十${NUM[d - 10]}` : d === 20 ? "廿" : d < 30 ? `廿${NUM[d - 20]}` : "三十";

const sunAt = (lon: number, from: Date) => A.SearchSunLongitude(lon, from, 40)?.date ?? null;

export type Quarter = "新月" | "上弦" | "満月" | "下弦";
export type AlmanacDay = {
  iso: string; weekday: number;
  lunarMonth: number; lunarLeap: boolean; lunarDay: number; lunarMonthName: string; lunarDayLabel: string;
  quarter: Quarter | null; term: string | null; zassetsu: string[]; apsis: "近日点" | "遠日点" | null;
  sunLon: number; earthLon: number; half: "上半期" | "下半期"; halfDay: number; halfLength: number;
};

const yearCache = new Map<number, { terms: Map<string, string>; zassetsu: Map<string, string[]>; quarters: Map<string, Quarter>; apsis: Map<string, "近日点" | "遠日点">; equinoxes: string[] }>();

function yearData(year: number) {
  const hit = yearCache.get(year); if (hit) return hit;
  const terms = new Map<string, string>(), zassetsu = new Map<string, string[]>(), quarters = new Map<string, Quarter>(), apsis = new Map<string, "近日点" | "遠日点">();
  const push = (k: string, v: string) => zassetsu.set(k, [...(zassetsu.get(k) ?? []), v]);
  const start = new Date(Date.UTC(year, 0, 1) - JST);
  for (let i = 0; i < 24; i++) {
    const lon = (285 + i * 15) % 360; // 小寒 first in a calendar year
    const t = sunAt(lon, new Date(start.getTime() + i * 14.5 * 864e5 - 10 * 864e5));
    if (t) terms.set(key(t), SOLAR_TERMS[lon / 15]!);
  }
  const at = (lon: number, month: number) => { const t = sunAt(lon, new Date(Date.UTC(year, month - 1, 1))); return t ? key(t) : null; };
  const risshun = at(315, 1), shunbun = at(0, 3), shubun = at(180, 9);
  if (risshun) { push(addDaysKey(risshun, -1), "節分"); push(addDaysKey(risshun, 87), "八十八夜"); push(addDaysKey(risshun, 209), "二百十日"); }
  if (shunbun) push(addDaysKey(shunbun, -3), "彼岸入り");
  if (shubun) push(addDaysKey(shubun, -3), "彼岸入り");
  for (const [lon, m, name] of [[80, 6, "入梅"], [100, 6, "半夏生"], [27, 4, "土用入り"], [117, 7, "土用入り"], [207, 10, "土用入り"], [297, 1, "土用入り"]] as const) { const k = at(lon, m); if (k) push(k, name); }
  let q = A.SearchMoonQuarter(new Date(start.getTime() - 8 * 864e5));
  for (let i = 0; i < 56; i++) { quarters.set(key(q.time.date), (["新月", "上弦", "満月", "下弦"] as const)[q.quarter]!); q = A.NextMoonQuarter(q); }
  let ap = A.SearchPlanetApsis(A.Body.Earth, new Date(start.getTime() - 30 * 864e5));
  for (let i = 0; i < 4; i++) { apsis.set(key(ap.time.date), ap.kind === A.ApsisKind.Pericenter ? "近日点" : "遠日点"); ap = A.NextPlanetApsis(A.Body.Earth, ap); }
  const equinoxes = [at(180, 9 - 12) ?? "", shunbun ?? "", shubun ?? "", (() => { const t = sunAt(0, new Date(Date.UTC(year + 1, 2, 1))); return t ? key(t) : ""; })()];
  // previous autumn equinox
  const prev = sunAt(180, new Date(Date.UTC(year - 1, 8, 1))); equinoxes[0] = prev ? key(prev) : "";
  const data = { terms, zassetsu, quarters, apsis, equinoxes };
  yearCache.set(year, data);
  return data;
}

const dayDiff = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);

export function almanacDay(date: Date): AlmanacDay {
  const iso = localKey(date);
  const year = date.getFullYear();
  const y = yearData(year);
  const noon = new Date(Date.parse(`${iso}T12:00:00Z`) - JST);
  const parts = new Intl.DateTimeFormat("en-u-ca-chinese", { month: "numeric", day: "numeric", timeZone: "Asia/Tokyo" }).formatToParts(noon);
  const mRaw = parts.find((p) => p.type === "month")?.value ?? "1";
  const lunarMonth = Number(mRaw.match(/\d+/)?.[0] ?? 1), lunarLeap = /bis/i.test(mRaw);
  const lunarDay = Number(parts.find((p) => p.type === "day")?.value ?? 1);
  const quarter = y.quarters.get(iso) ?? null;
  const sunLon = Math.round(A.SunPosition(noon).elon * 10) / 10;
  const [prevAut, spring, autumn, nextSpring] = y.equinoxes as [string, string, string, string];
  let half: AlmanacDay["half"], from: string, to: string;
  if (iso >= spring && iso < autumn) { half = "上半期"; from = spring; to = autumn; }
  else if (iso >= autumn) { half = "下半期"; from = autumn; to = nextSpring; }
  else { half = "下半期"; from = prevAut; to = spring; }
  return {
    iso, weekday: date.getDay(), lunarMonth, lunarLeap, lunarDay,
    lunarMonthName: `${lunarLeap ? "閏" : ""}${LUNAR_MONTHS[lunarMonth - 1] ?? ""}`,
    lunarDayLabel: lunarDay === 1 ? "新月" : quarter && quarter !== "新月" ? (quarter === "満月" ? "満月" : quarter) : lunarDayKanji(lunarDay),
    quarter, term: y.terms.get(iso) ?? null, zassetsu: y.zassetsu.get(iso) ?? [], apsis: y.apsis.get(iso) ?? null,
    sunLon, earthLon: Math.round(((sunLon + 180) % 360) * 10) / 10,
    half, halfDay: dayDiff(from, iso) + 1, halfLength: dayDiff(from, to),
  };
}

const yearDays = new Map<number, AlmanacDay[]>();
/** Whole-year almanac (cached), index = day of year. */
export function almanacYear(year: number): AlmanacDay[] {
  const hit = yearDays.get(year); if (hit) return hit;
  const n = new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  const list = Array.from({ length: n }, (_, i) => almanacDay(new Date(year, 0, 1 + i)));
  yearDays.set(year, list); return list;
}
