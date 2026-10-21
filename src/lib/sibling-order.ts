import type { Language } from "./translations";

/** Stable stored values (Japanese, language-independent IDs). Legacy first/middle/last/only remain valid. */
export const SIBLING_VALUES = ["長男", "長女", "次男", "次女", "三男", "三女", "末っ子", "一人っ子"] as const;
const LEGACY = ["first", "middle", "last", "only"] as const;

/** Structured sibling-composition parts, stored as one Japanese string: count・order・上に…・下に… */
export const SIBLING_COUNTS = ["ひとりっ子", "2人", "3人", "4人以上"] as const;
export const SIBLING_ORDERS = ["長子", "中間子", "末っ子", "一人っ子"] as const;
/** 兄/姉 are older siblings, 弟/妹 are younger. */
export const SIBLING_SIDES = ["兄", "姉", "弟", "妹"] as const;

export type SiblingComposition = { count: string; order: string; up: string[]; down: string[] };

export function buildSiblingComposition(c: SiblingComposition): string {
  const parts: string[] = [];
  if (c.count) parts.push(c.count);
  const order = c.count === "ひとりっ子" ? "一人っ子" : c.order;
  if (order) parts.push(order);
  if (c.up.length) parts.push(`上に${c.up.join("と")}`);
  if (c.down.length) parts.push(`下に${c.down.join("と")}`);
  return parts.join("・");
}

export function parseSiblingComposition(v: string): SiblingComposition | null {
  if (!v.includes("・")) return null;
  const c: SiblingComposition = { count: "", order: "", up: [], down: [] };
  for (const p of v.split("・")) {
    if ((SIBLING_COUNTS as readonly string[]).includes(p)) c.count = p;
    else if ((SIBLING_ORDERS as readonly string[]).includes(p)) c.order = p;
    else if (p.startsWith("上に")) c.up = p.slice(2).split("と").filter((s) => (SIBLING_SIDES as readonly string[]).includes(s));
    else if (p.startsWith("下に")) c.down = p.slice(2).split("と").filter((s) => (SIBLING_SIDES as readonly string[]).includes(s));
    else return null;
  }
  return c.count || c.order ? c : null;
}

type SiblingLabels = {
  title: string; options: string[]; other: string; otherHint: string;
  relationTitle: string; relationOtherHint: string; legacy: string[];
  detail: string; simple: string; count: string; counts: string[]; order: string; orders: string[];
  up: string; down: string; sides: string[];
};

export const siblingLabels: Record<Language, SiblingLabels> = {
  ja: { title: "きょうだい構成", options: ["長男", "長女", "次男", "次女", "三男", "三女", "末っ子", "一人っ子"], other: "その他", otherHint: "きょうだい順を入力", relationTitle: "関係性", relationOtherHint: "例：ビジネスパートナー、幼馴染など", legacy: ["長子", "中間子", "末っ子", "一人っ子"], detail: "詳しく選ぶ", simple: "かんたん選択", count: "きょうだいの人数", counts: ["ひとりっ子", "2人", "3人", "4人以上"], order: "生まれ順", orders: ["長子", "中間子", "末っ子", "一人っ子"], up: "上のきょうだい", down: "下のきょうだい", sides: ["兄", "姉", "弟", "妹"] },
  en: { title: "Sibling order", options: ["Eldest son", "Eldest daughter", "Second son", "Second daughter", "Third son", "Third daughter", "Youngest", "Only child"], other: "Other", otherHint: "Enter sibling order", relationTitle: "Relationship", relationOtherHint: "e.g. business partner, childhood friend", legacy: ["Eldest", "Middle child", "Youngest", "Only child"], detail: "Detailed selection", simple: "Simple selection", count: "Number of children", counts: ["Only child", "Two", "Three", "Four or more"], order: "Birth order", orders: ["Eldest", "Middle child", "Youngest", "Only child"], up: "Older", down: "Younger", sides: ["Brother", "Sister", "Brother", "Sister"] },
  "zh-CN": { title: "兄弟姐妹排行", options: ["长子", "长女", "次子", "次女", "三子", "三女", "老幺", "独生子女"], other: "其他", otherHint: "输入排行", relationTitle: "关系", relationOtherHint: "例：事业伙伴、青梅竹马等", legacy: ["老大", "中间", "最小", "独生子女"], detail: "详细选择", simple: "简单选择", count: "子女数量", counts: ["独生子女", "两个", "三个", "四个以上"], order: "出生排行", orders: ["长子/长女", "中间", "最小", "独生子女"], up: "年长的兄姐", down: "年幼的弟妹", sides: ["哥哥", "姐姐", "弟弟", "妹妹"] },
  "zh-TW": { title: "手足排行", options: ["長子", "長女", "次子", "次女", "三子", "三女", "老么", "獨生子女"], other: "其他", otherHint: "輸入排行", relationTitle: "關係", relationOtherHint: "例：事業夥伴、青梅竹馬等", legacy: ["老大", "中間", "最小", "獨生子女"], detail: "詳細選擇", simple: "簡易選擇", count: "子女數量", counts: ["獨生子女", "兩個", "三個", "四個以上"], order: "出生排行", orders: ["長子/長女", "中間", "最小", "獨生子女"], up: "年長的兄姊", down: "年幼的弟妹", sides: ["哥哥", "姊姊", "弟弟", "妹妹"] },
  ko: { title: "형제자매 순서", options: ["장남", "장녀", "차남", "차녀", "삼남", "삼녀", "막내", "외동"], other: "기타", otherHint: "형제 순서 입력", relationTitle: "관계", relationOtherHint: "예: 비즈니스 파트너, 소꿉친구 등", legacy: ["첫째", "가운데", "막내", "외동"], detail: "자세히 선택", simple: "간단히 선택", count: "형제자매 수", counts: ["외동", "2명", "3명", "4명 이상"], order: "출생 순서", orders: ["장남/장녀", "중간", "막내", "외동"], up: "위 형제자매", down: "아래 형제자매", sides: ["형/오빠", "누나/언니", "남동생", "여동생"] },
  es: { title: "Orden entre hermanos", options: ["Hijo mayor", "Hija mayor", "Segundo hijo", "Segunda hija", "Tercer hijo", "Tercera hija", "Menor", "Hijo único"], other: "Otro", otherHint: "Escribe el orden", relationTitle: "Relación", relationOtherHint: "ej.: socio de negocios, amistad de infancia", legacy: ["Mayor", "Intermedio", "Menor", "Hijo único"], detail: "Selección detallada", simple: "Selección simple", count: "Número de hijos", counts: ["Hijo único", "Dos", "Tres", "Cuatro o más"], order: "Orden de nacimiento", orders: ["Mayor", "Intermedio", "Menor", "Hijo único"], up: "Mayores", down: "Menores", sides: ["Hermano", "Hermana", "Hermano", "Hermana"] },
  fr: { title: "Rang dans la fratrie", options: ["Fils aîné", "Fille aînée", "Deuxième fils", "Deuxième fille", "Troisième fils", "Troisième fille", "Benjamin(e)", "Enfant unique"], other: "Autre", otherHint: "Saisir le rang", relationTitle: "Relation", relationOtherHint: "ex. : partenaire d'affaires, ami(e) d'enfance", legacy: ["Aîné(e)", "Cadet(te)", "Benjamin(e)", "Enfant unique"], detail: "Sélection détaillée", simple: "Sélection simple", count: "Nombre d'enfants", counts: ["Enfant unique", "Deux", "Trois", "Quatre ou plus"], order: "Rang de naissance", orders: ["Aîné(e)", "Cadet(te)", "Benjamin(e)", "Enfant unique"], up: "Aînés", down: "Cadets", sides: ["Frère", "Sœur", "Frère", "Sœur"] },
};

/** Coarse category used by older calculations. */
export function siblingCategory(v: string): "" | "first" | "middle" | "last" | "only" {
  const comp = parseSiblingComposition(v);
  if (comp) return ({ 長子: "first", 中間子: "middle", 末っ子: "last", 一人っ子: "only" } as const)[comp.order as "長子"] ?? "";
  if ((LEGACY as readonly string[]).includes(v)) return v as "first";
  return ({ 長男: "first", 長女: "first", 次男: "middle", 次女: "middle", 三男: "middle", 三女: "middle", 末っ子: "last", 一人っ子: "only" } as const)[v as "長男"] ?? "";
}

export function siblingDisplay(v: string, language: Language): string {
  const comp = parseSiblingComposition(v);
  if (comp) {
    if (language === "ja") return buildSiblingComposition(comp);
    const l = siblingLabels[language];
    const parts: string[] = [];
    const ci = (SIBLING_COUNTS as readonly string[]).indexOf(comp.count);
    if (ci >= 0) parts.push(l.counts[ci]!);
    const oi = (SIBLING_ORDERS as readonly string[]).indexOf(comp.order);
    if (oi >= 0) parts.push(l.orders[oi]!);
    const side = (s: string) => l.sides[(SIBLING_SIDES as readonly string[]).indexOf(s)] ?? s;
    if (comp.up.length) parts.push(`${l.up}: ${comp.up.map(side).join(", ")}`);
    if (comp.down.length) parts.push(`${l.down}: ${comp.down.map(side).join(", ")}`);
    return parts.join(" · ");
  }
  const l = siblingLabels[language];
  const i = (SIBLING_VALUES as readonly string[]).indexOf(v);
  if (i >= 0) return l.options[i]!;
  const j = (LEGACY as readonly string[]).indexOf(v);
  return j >= 0 ? l.legacy[j]! : v;
}
