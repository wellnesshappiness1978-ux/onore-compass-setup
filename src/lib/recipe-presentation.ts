import type { Language } from "./translations";
import type { Element } from "./today-fortune-elements";

/** Splits a cooking step into plain and key-point segments (heat, time, temperature, doneness, timing). */
const KEY = /(強火|中強火|中火|中弱火|弱火|とろ火|余熱|\d+(?:\s*[〜~\-–]\s*\d+)?\s*(?:分|秒|時間|℃|°C|min(?:utes?)?|sec(?:onds?)?|hours?|minutos?|segundos?|heures?|분|초|分钟|分鐘|秒钟)|沸騰|煮立|火を止め|火から下ろ|中心まで|十分に加熱|しっかり加熱|色が変わ|透き通|コツ|ポイント|最後に|仕上げに|high heat|medium(?:-low|-high)? heat|low heat|until (?:cooked|tender|golden|fragrant)[^,.]*|bring to a boil|cooked through|大火|中火|小火|煮沸|센 불|중불|약불|끓|fuego (?:alto|medio|bajo)|feu (?:vif|moyen|doux))/gi;

export type StepSegment = { text: string; key: boolean };
export function highlightStep(text: string): StepSegment[] {
  const out: StepSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(KEY)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: text.slice(last, i), key: false });
    out.push({ text: m[0], key: true });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), key: false });
  return out;
}

export const recipeLabels: Record<Language, { why: string; luck: string }> = {
  ja: { why: "選抜理由と開運の根拠", luck: "運気アップポイント" },
  en: { why: "Why this dish was chosen for you", luck: "Fortune-boosting point" },
  "zh-CN": { why: "选择理由与开运依据", luck: "开运要点" },
  "zh-TW": { why: "選擇理由與開運依據", luck: "開運要點" },
  ko: { why: "선정 이유와 개운 근거", luck: "운기 상승 포인트" },
  es: { why: "Por qué se eligió este plato", luck: "Punto para elevar la suerte" },
  fr: { why: "Pourquoi ce plat a été choisi", luck: "Point porte-bonheur" },
};

const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];
/** Birth-year five element from the heavenly stem. */
export const birthYearElement = (birthDate: string): Element | null => {
  const y = Number(birthDate.slice(0, 4));
  return y ? ELEMENTS[Math.floor((((y - 4) % 10) + 10) % 10 / 2)]! : null;
};
type Relation = "same" | "feeds" | "fedBy" | "other";
const relation = (from: Element, to: Element): Relation => {
  const a = ELEMENTS.indexOf(from), b = ELEMENTS.indexOf(to);
  return a === b ? "same" : (a + 1) % 5 === b ? "feeds" : (b + 1) % 5 === a ? "fedBy" : "other";
};

type Copy = { el: Record<Element, string>; color: Record<Element, string>; season: Record<string, string>; rel: Record<Relation, string>; rhythm: Record<"boost" | "restore", string>;
  build: (p: { day: string; dish: string; color: string; birth?: string; rel?: string; season?: string; rhythm?: string }) => string };
const copy: Record<Language, Copy> = {
  ja: { el: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" }, color: { wood: "緑", fire: "赤", earth: "黄・橙", metal: "白", water: "黒・紺" },
    season: { spring: "春", summer: "夏", autumn: "秋", winter: "冬" }, rel: { same: "同じ気で軸を強めます", feeds: "あなたの気が料理の気を育て、力を外へ発揮させます", fedBy: "料理の気があなたの気を育て、内側を満たします", other: "異なる気で偏りを整えます" },
    rhythm: { boost: "今日のバイオリズムは上向きなので、活力を後押しする一品です", restore: "今日のバイオリズムは休息期なので、心身を温めて整える一品です" },
    build: p => [`今日は五行の「${p.day}」の日です。この料理は${p.dish}の気を持ち、${p.color}の食材が今日の調和色です。`, p.birth && `あなたの生まれ年の五行は「${p.birth}」で、${p.rel}。`, p.season && `${p.season}の旬の食材で地球暦の季節と同調します。`, p.rhythm && `${p.rhythm}。`].filter(Boolean).join("") },
  en: { el: { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" }, color: { wood: "green", fire: "red", earth: "yellow-orange", metal: "white", water: "dark navy" },
    season: { spring: "spring", summer: "summer", autumn: "autumn", winter: "winter" }, rel: { same: "the same energy strengthens your core", feeds: "your energy feeds the dish's energy and helps you express it", fedBy: "the dish's energy nourishes yours from within", other: "a different energy balances your tendencies" },
    rhythm: { boost: "Your biorhythm is rising today, so this dish supports momentum", restore: "Your biorhythm is in a resting phase, so this dish warms and restores" },
    build: p => [`Today is a ${p.day} day. This dish carries ${p.dish} energy, and its ${p.color} ingredients are today's harmonizing color.`, p.birth && ` Your birth-year element is ${p.birth}: ${p.rel}.`, p.season && ` Its ${p.season} ingredients align with the Earth Calendar season.`, p.rhythm && ` ${p.rhythm}.`].filter(Boolean).join("") },
  "zh-CN": { el: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" }, color: { wood: "绿色", fire: "红色", earth: "黄橙色", metal: "白色", water: "黑紫色" },
    season: { spring: "春", summer: "夏", autumn: "秋", winter: "冬" }, rel: { same: "同气相助，稳固核心", feeds: "你的气滋养料理之气，助你向外发挥", fedBy: "料理之气滋养你的气，充实内在", other: "不同之气调和偏向" },
    rhythm: { boost: "今天生物节律上升，这道菜助推活力", restore: "今天处于休养期，这道菜温暖调养身心" },
    build: p => [`今天是五行「${p.day}」之日。这道菜带有${p.dish}之气，${p.color}食材是今天的调和色。`, p.birth && `你的出生年五行为「${p.birth}」，${p.rel}。`, p.season && `${p.season}季时令食材与地球历季节同步。`, p.rhythm && `${p.rhythm}。`].filter(Boolean).join("") },
  "zh-TW": { el: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" }, color: { wood: "綠色", fire: "紅色", earth: "黃橙色", metal: "白色", water: "黑紺色" },
    season: { spring: "春", summer: "夏", autumn: "秋", winter: "冬" }, rel: { same: "同氣相助，穩固核心", feeds: "你的氣滋養料理之氣，助你向外發揮", fedBy: "料理之氣滋養你的氣，充實內在", other: "不同之氣調和偏向" },
    rhythm: { boost: "今天生物節律上升，這道菜助推活力", restore: "今天處於休養期，這道菜溫暖調養身心" },
    build: p => [`今天是五行「${p.day}」之日。這道菜帶有${p.dish}之氣，${p.color}食材是今天的調和色。`, p.birth && `你的出生年五行為「${p.birth}」，${p.rel}。`, p.season && `${p.season}季時令食材與地球曆季節同步。`, p.rhythm && `${p.rhythm}。`].filter(Boolean).join("") },
  ko: { el: { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" }, color: { wood: "초록", fire: "빨강", earth: "노랑·주황", metal: "흰색", water: "검정·남색" },
    season: { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" }, rel: { same: "같은 기운이 중심을 강하게 합니다", feeds: "당신의 기운이 요리의 기운을 키워 힘을 밖으로 발휘하게 합니다", fedBy: "요리의 기운이 당신의 기운을 키워 내면을 채웁니다", other: "다른 기운이 치우침을 조정합니다" },
    rhythm: { boost: "오늘 바이오리듬이 상승세라 활력을 밀어주는 요리입니다", restore: "오늘 바이오리듬이 휴식기라 몸과 마음을 데우고 정돈하는 요리입니다" },
    build: p => [`오늘은 오행 '${p.day}'의 날입니다. 이 요리는 ${p.dish}의 기운을 지니며 ${p.color} 식재료가 오늘의 조화색입니다.`, p.birth && ` 당신의 출생 연도 오행은 '${p.birth}'이며, ${p.rel}.`, p.season && ` ${p.season} 제철 식재료로 지구력의 계절과 맞춥니다.`, p.rhythm && ` ${p.rhythm}.`].filter(Boolean).join("") },
  es: { el: { wood: "Madera", fire: "Fuego", earth: "Tierra", metal: "Metal", water: "Agua" }, color: { wood: "verde", fire: "rojo", earth: "amarillo-naranja", metal: "blanco", water: "azul oscuro" },
    season: { spring: "primavera", summer: "verano", autumn: "otoño", winter: "invierno" }, rel: { same: "la misma energía refuerza tu eje", feeds: "tu energía alimenta la del plato y te ayuda a expresarte", fedBy: "la energía del plato nutre la tuya desde dentro", other: "una energía distinta equilibra tus tendencias" },
    rhythm: { boost: "Tu biorritmo sube hoy, así que este plato impulsa tu energía", restore: "Tu biorritmo está en fase de descanso, así que este plato reconforta" },
    build: p => [`Hoy es un día de ${p.day}. Este plato lleva energía de ${p.dish} y sus ingredientes de color ${p.color} son el color armonizador de hoy.`, p.birth && ` Tu elemento de nacimiento es ${p.birth}: ${p.rel}.`, p.season && ` Sus ingredientes de ${p.season} siguen la estación del Calendario Terrestre.`, p.rhythm && ` ${p.rhythm}.`].filter(Boolean).join("") },
  fr: { el: { wood: "Bois", fire: "Feu", earth: "Terre", metal: "Métal", water: "Eau" }, color: { wood: "vert", fire: "rouge", earth: "jaune-orangé", metal: "blanc", water: "bleu nuit" },
    season: { spring: "printemps", summer: "été", autumn: "automne", winter: "hiver" }, rel: { same: "la même énergie renforce votre axe", feeds: "votre énergie nourrit celle du plat et vous aide à vous exprimer", fedBy: "l'énergie du plat nourrit la vôtre de l'intérieur", other: "une énergie différente équilibre vos tendances" },
    rhythm: { boost: "Votre biorythme monte aujourd'hui : ce plat soutient votre élan", restore: "Votre biorythme est en phase de repos : ce plat réchauffe et restaure" },
    build: p => [`Aujourd'hui est un jour ${p.day}. Ce plat porte l'énergie ${p.dish} et ses ingrédients ${p.color} sont la couleur d'harmonie du jour.`, p.birth && ` Votre élément de naissance est ${p.birth} : ${p.rel}.`, p.season && ` Ses ingrédients de ${p.season} suivent la saison du Calendrier terrestre.`, p.rhythm && ` ${p.rhythm}.`].filter(Boolean).join("") },
};

/** Deterministic selection rationale from day element, dish element/season/rhythm and the subject's birth-year element. */
export function recipeReason(o: { language: Language; dayElement: Element; dishElement: Element; season?: string | undefined; rhythm?: "boost" | "restore" | undefined; birthDate?: string | undefined }): string {
  const c = copy[o.language];
  const birth = o.birthDate ? birthYearElement(o.birthDate) : null;
  return c.build({ day: c.el[o.dayElement], dish: c.el[o.dishElement], color: c.color[o.dishElement],
    ...(birth ? { birth: c.el[birth], rel: c.rel[relation(birth, o.dishElement)] } : {}),
    ...(o.season && c.season[o.season] ? { season: c.season[o.season] } : {}),
    ...(o.rhythm ? { rhythm: c.rhythm[o.rhythm] } : {}) });
}
