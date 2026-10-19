import type { Language } from "./translations";

/** Stable stored values (Japanese, language-independent IDs). Legacy first/middle/last/only remain valid. */
export const SIBLING_VALUES = ["長男", "長女", "次男", "次女", "三男", "三女", "末っ子", "一人っ子"] as const;
const LEGACY = ["first", "middle", "last", "only"] as const;

export const siblingLabels: Record<Language, { title: string; options: string[]; other: string; otherHint: string; relationTitle: string; relationOtherHint: string; legacy: string[] }> = {
  ja: { title: "きょうだい順", options: ["長男", "長女", "次男", "次女", "三男", "三女", "末っ子", "一人っ子"], other: "その他", otherHint: "きょうだい順を入力", relationTitle: "関係性", relationOtherHint: "具体的な関係性を入力", legacy: ["長子", "中間子", "末っ子", "一人っ子"] },
  en: { title: "Sibling order", options: ["Eldest son", "Eldest daughter", "Second son", "Second daughter", "Third son", "Third daughter", "Youngest", "Only child"], other: "Other", otherHint: "Enter sibling order", relationTitle: "Relationship", relationOtherHint: "Describe the relationship", legacy: ["Eldest", "Middle child", "Youngest", "Only child"] },
  "zh-CN": { title: "兄弟姐妹排行", options: ["长子", "长女", "次子", "次女", "三子", "三女", "老幺", "独生子女"], other: "其他", otherHint: "输入排行", relationTitle: "关系", relationOtherHint: "输入具体关系", legacy: ["老大", "中间", "最小", "独生子女"] },
  "zh-TW": { title: "手足排行", options: ["長子", "長女", "次子", "次女", "三子", "三女", "老么", "獨生子女"], other: "其他", otherHint: "輸入排行", relationTitle: "關係", relationOtherHint: "輸入具體關係", legacy: ["老大", "中間", "最小", "獨生子女"] },
  ko: { title: "형제자매 순서", options: ["장남", "장녀", "차남", "차녀", "삼남", "삼녀", "막내", "외동"], other: "기타", otherHint: "형제 순서 입력", relationTitle: "관계", relationOtherHint: "구체적인 관계 입력", legacy: ["첫째", "가운데", "막내", "외동"] },
  es: { title: "Orden entre hermanos", options: ["Hijo mayor", "Hija mayor", "Segundo hijo", "Segunda hija", "Tercer hijo", "Tercera hija", "Menor", "Hijo único"], other: "Otro", otherHint: "Escribe el orden", relationTitle: "Relación", relationOtherHint: "Describe la relación", legacy: ["Mayor", "Intermedio", "Menor", "Hijo único"] },
  fr: { title: "Rang dans la fratrie", options: ["Fils aîné", "Fille aînée", "Deuxième fils", "Deuxième fille", "Troisième fils", "Troisième fille", "Benjamin(e)", "Enfant unique"], other: "Autre", otherHint: "Saisir le rang", relationTitle: "Relation", relationOtherHint: "Préciser la relation", legacy: ["Aîné(e)", "Cadet(te)", "Benjamin(e)", "Enfant unique"] },
};

/** Coarse category used by older calculations. */
export function siblingCategory(v: string): "" | "first" | "middle" | "last" | "only" {
  if ((LEGACY as readonly string[]).includes(v)) return v as "first";
  return ({ 長男: "first", 長女: "first", 次男: "middle", 次女: "middle", 三男: "middle", 三女: "middle", 末っ子: "last", 一人っ子: "only" } as const)[v as "長男"] ?? "";
}

export function siblingDisplay(v: string, language: Language): string {
  const l = siblingLabels[language];
  const i = (SIBLING_VALUES as readonly string[]).indexOf(v);
  if (i >= 0) return l.options[i]!;
  const j = (LEGACY as readonly string[]).indexOf(v);
  return j >= 0 ? l.legacy[j]! : v;
}
