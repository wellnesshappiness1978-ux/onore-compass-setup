// Localized glosses for Japanese calendar names. Japanese names stay as stable IDs; glosses render beside them.
import type { Language } from "./translations";
import { LUNAR_MONTHS, SOLAR_TERMS } from "./helio-almanac";

type L = Exclude<Language, "ja">;
const terms: Record<L, string[]> = {
  en: ["Spring equinox", "Clear and bright", "Grain rain", "Start of summer", "Grain buds", "Grain in ear", "Summer solstice", "Minor heat", "Major heat", "Start of autumn", "End of heat", "White dew", "Autumn equinox", "Cold dew", "Frost descent", "Start of winter", "Minor snow", "Major snow", "Winter solstice", "Minor cold", "Major cold", "Start of spring", "Rain water", "Insects awaken"],
  "zh-CN": ["春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰"],
  "zh-TW": ["春分", "清明", "穀雨", "立夏", "小滿", "芒種", "夏至", "小暑", "大暑", "立秋", "處暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "驚蟄"],
  ko: ["춘분", "청명", "곡우", "입하", "소만", "망종", "하지", "소서", "대서", "입추", "처서", "백로", "추분", "한로", "상강", "입동", "소설", "대설", "동지", "소한", "대한", "입춘", "우수", "경칩"],
  es: ["Equinoccio de primavera", "Claridad", "Lluvia de granos", "Inicio del verano", "Granos llenos", "Espigas", "Solsticio de verano", "Calor menor", "Calor mayor", "Inicio del otoño", "Fin del calor", "Rocío blanco", "Equinoccio de otoño", "Rocío frío", "Escarcha", "Inicio del invierno", "Nieve menor", "Nieve mayor", "Solsticio de invierno", "Frío menor", "Frío mayor", "Inicio de la primavera", "Agua de lluvia", "Despertar de insectos"],
  fr: ["Équinoxe de printemps", "Pure clarté", "Pluie des grains", "Début de l'été", "Petite plénitude", "Grain en épi", "Solstice d'été", "Petite chaleur", "Grande chaleur", "Début de l'automne", "Fin des chaleurs", "Rosée blanche", "Équinoxe d'automne", "Rosée froide", "Descente du givre", "Début de l'hiver", "Petite neige", "Grande neige", "Solstice d'hiver", "Petit froid", "Grand froid", "Début du printemps", "Eau de pluie", "Réveil des insectes"],
};
const monthWord: Record<L, (n: number) => string> = {
  en: (n) => `lunar month ${n}`, "zh-CN": (n) => `农历${n}月`, "zh-TW": (n) => `農曆${n}月`, ko: (n) => `음력 ${n}월`, es: (n) => `mes lunar ${n}`, fr: (n) => `mois lunaire ${n}`,
};
const extra: Record<L, Record<string, string>> = {
  en: { 節分: "Eve of spring", 八十八夜: "88th night (tea harvest)", 二百十日: "210th day (typhoon watch)", 彼岸入り: "Start of equinox week", 入梅: "Rainy season begins", 半夏生: "Mid-summer planting end", 土用入り: "Doyō seasonal shift", 新月: "New moon", 上弦: "First quarter", 満月: "Full moon", 下弦: "Last quarter", 近日点: "Perihelion (closest to Sun)", 遠日点: "Aphelion (farthest from Sun)", 上半期: "First half (spring→autumn equinox)", 下半期: "Second half (autumn→spring equinox)", 旧暦: "Old lunisolar calendar", 太陽黄経: "Sun longitude", 地球: "Earth" },
  "zh-CN": { 節分: "立春前日", 八十八夜: "立春后第88天", 二百十日: "立春后第210天", 彼岸入り: "彼岸周开始", 入梅: "入梅", 半夏生: "半夏生", 土用入り: "土用开始", 新月: "新月", 上弦: "上弦", 満月: "满月", 下弦: "下弦", 近日点: "近日点", 遠日点: "远日点", 上半期: "上半期（春分→秋分）", 下半期: "下半期（秋分→春分）", 旧暦: "农历", 太陽黄経: "太阳黄经", 地球: "地球" },
  "zh-TW": { 節分: "立春前日", 八十八夜: "立春後第88天", 二百十日: "立春後第210天", 彼岸入り: "彼岸週開始", 入梅: "入梅", 半夏生: "半夏生", 土用入り: "土用開始", 新月: "新月", 上弦: "上弦", 満月: "滿月", 下弦: "下弦", 近日点: "近日點", 遠日点: "遠日點", 上半期: "上半期（春分→秋分）", 下半期: "下半期（秋分→春分）", 旧暦: "農曆", 太陽黄経: "太陽黃經", 地球: "地球" },
  ko: { 節分: "입춘 전날", 八十八夜: "입춘 후 88일째", 二百十日: "입춘 후 210일째", 彼岸入り: "히간 주간 시작", 入梅: "장마 시작", 半夏生: "한게쇼(반하생)", 土用入り: "토용 시작", 新月: "신월", 上弦: "상현", 満月: "보름달", 下弦: "하현", 近日点: "근일점", 遠日点: "원일점", 上半期: "상반기(춘분→추분)", 下半期: "하반기(추분→춘분)", 旧暦: "음력", 太陽黄経: "태양 황경", 地球: "지구" },
  es: { 節分: "Víspera de primavera", 八十八夜: "Noche 88 (cosecha de té)", 二百十日: "Día 210 (tifones)", 彼岸入り: "Inicio de semana equinoccial", 入梅: "Inicio de lluvias", 半夏生: "Fin de siembra estival", 土用入り: "Inicio de Doyō", 新月: "Luna nueva", 上弦: "Cuarto creciente", 満月: "Luna llena", 下弦: "Cuarto menguante", 近日点: "Perihelio", 遠日点: "Afelio", 上半期: "Primera mitad (equinoccios)", 下半期: "Segunda mitad (equinoccios)", 旧暦: "Calendario lunisolar", 太陽黄経: "Longitud solar", 地球: "Tierra" },
  fr: { 節分: "Veille du printemps", 八十八夜: "88e nuit (récolte du thé)", 二百十日: "210e jour (typhons)", 彼岸入り: "Début de la semaine d'équinoxe", 入梅: "Début des pluies", 半夏生: "Fin des plantations d'été", 土用入り: "Début du Doyō", 新月: "Nouvelle lune", 上弦: "Premier quartier", 満月: "Pleine lune", 下弦: "Dernier quartier", 近日点: "Périhélie", 遠日点: "Aphélie", 上半期: "Première moitié (équinoxes)", 下半期: "Seconde moitié (équinoxes)", 旧暦: "Calendrier luni-solaire", 太陽黄経: "Longitude solaire", 地球: "Terre" },
};

/** Japanese name, plus a localized gloss in parentheses for non-Japanese UIs. */
export function gloss(name: string, language: Language): string {
  if (language === "ja" || !name) return name;
  const l = language as L;
  const ti = (SOLAR_TERMS as readonly string[]).indexOf(name);
  if (ti >= 0) return `${name} (${terms[l][ti]})`;
  const base = name.replace(/^閏/, "");
  const mi = (LUNAR_MONTHS as readonly string[]).indexOf(base);
  if (mi >= 0) return `${name} (${monthWord[l](mi + 1)})`;
  const e = extra[l][name];
  return e && e !== name ? `${name} (${e})` : name;
}
export const word = (key: string, language: Language) => language === "ja" ? key : extra[language as L][key] ?? key;
