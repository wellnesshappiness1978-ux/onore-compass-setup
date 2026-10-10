import type { Language } from "@/lib/translations";

export type MandalaElement = "木" | "火" | "土" | "金" | "水";
export type GemCut = "octagon" | "hexagon" | "dodecagon" | "star";
export type MandalaTraits = { lifePath: number | null; symmetry: number; element: MandalaElement | null; gemCut: GemCut };

/** Life path number → primary petal symmetry (illustrative mapping defined by this app). */
export const LIFE_PATH_SYMMETRY: Record<number, number> = { 1: 8, 2: 12, 3: 18, 4: 16, 5: 10, 6: 12, 7: 14, 8: 16, 9: 18, 11: 22, 22: 24, 33: 36 };

/** Element → background aura tone (subtle, never applied to the seven birth colors). */
export const ELEMENT_AURA: Record<MandalaElement, string> = { 火: "#E39A2E", 水: "#1F4E8C", 木: "#2F9E78", 土: "#E2B33C", 金: "#E8E4D4" };

export const DEFAULT_TRAITS: MandalaTraits = { lifePath: null, symmetry: 0, element: null, gemCut: "octagon" };

type CoreLike = { numerology?: { lifePath?: number | null }; shichu?: { dominant?: string }; animal?: { group?: string | null } } | null | undefined;

export function mandalaTraitsFromCore(core: CoreLike): MandalaTraits {
  if (!core) return DEFAULT_TRAITS;
  const lifePath = core.numerology?.lifePath ?? null;
  const symmetry = lifePath !== null ? LIFE_PATH_SYMMETRY[lifePath] ?? 0 : 0;
  const dom = core.shichu?.dominant;
  const element = dom && dom in ELEMENT_AURA ? (dom as MandalaElement) : null;
  const group = core.animal?.group ?? "";
  const master = lifePath === 11 || lifePath === 22 || lifePath === 33;
  const gemCut: GemCut = master ? "star" : group.startsWith("MOON") ? "hexagon" : group.startsWith("SUN") ? "dodecagon" : "octagon";
  return { lifePath, symmetry, element, gemCut };
}

/** Petal counts for the six layers, built on the life-path symmetry and denser outward. */
export function symmetryPetals(symmetry: number): number[] | null {
  if (!symmetry) return null;
  const s = symmetry;
  return [s, s, s * 2, s * 2, s * 3, s * 4].map(n => Math.min(n, 96));
}

type Labels = { numerology: string; element: string; cut: string; elements: Record<MandalaElement, string>; cuts: Record<GemCut, string> };
export const mandalaTraitLabels: Record<Language, Labels> = {
  ja: { numerology: "数秘", element: "主元素", cut: "カット", elements: { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" }, cuts: { octagon: "八角形", hexagon: "六角形", dodecagon: "十二角形", star: "放射スター" } },
  en: { numerology: "Life path", element: "Element", cut: "Cut", elements: { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" }, cuts: { octagon: "Octagon", hexagon: "Hexagon", dodecagon: "Dodecagon", star: "Radiant star" } },
  "zh-CN": { numerology: "生命灵数", element: "主元素", cut: "切工", elements: { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" }, cuts: { octagon: "八角形", hexagon: "六角形", dodecagon: "十二角形", star: "放射星形" } },
  "zh-TW": { numerology: "生命靈數", element: "主元素", cut: "切工", elements: { 木: "木", 火: "火", 土: "土", 金: "金", 水: "水" }, cuts: { octagon: "八角形", hexagon: "六角形", dodecagon: "十二角形", star: "放射星形" } },
  ko: { numerology: "라이프 패스", element: "주원소", cut: "컷", elements: { 木: "목", 火: "화", 土: "토", 金: "금", 水: "수" }, cuts: { octagon: "팔각형", hexagon: "육각형", dodecagon: "십이각형", star: "방사 스타" } },
  es: { numerology: "Camino de vida", element: "Elemento", cut: "Talla", elements: { 木: "Madera", 火: "Fuego", 土: "Tierra", 金: "Metal", 水: "Agua" }, cuts: { octagon: "Octagonal", hexagon: "Hexagonal", dodecagon: "Dodecagonal", star: "Estrella radiante" } },
  fr: { numerology: "Chemin de vie", element: "Élément", cut: "Taille", elements: { 木: "Bois", 火: "Feu", 土: "Terre", 金: "Métal", 水: "Eau" }, cuts: { octagon: "Octogonale", hexagon: "Hexagonale", dodecagon: "Dodécagonale", star: "Étoile rayonnante" } },
};
