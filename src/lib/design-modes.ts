import type { Language } from "./translations";

export type Plan = "free" | "standard" | "vip" | "b2b";
export type DesignMode = "classic" | "masculine" | "feminine" | "masculine-luxe" | "feminine-luxe" | "business-night" | "business-day";

export const designModes: { id: DesignMode; tier: Plan; icon: string }[] = [
  { id: "classic", tier: "free", icon: "✦" },
  { id: "masculine", tier: "standard", icon: "◈" },
  { id: "feminine", tier: "standard", icon: "✧" },
  { id: "masculine-luxe", tier: "vip", icon: "✥" },
  { id: "feminine-luxe", tier: "vip", icon: "❈" },
  { id: "business-night", tier: "b2b", icon: "▣" },
  { id: "business-day", tier: "b2b", icon: "▤" },
];

const rank: Record<Plan, number> = { free: 0, standard: 1, vip: 2, b2b: 3 };
export const canPreviewDesign = (plan: Plan, mode: DesignMode) =>
  rank[plan] >= rank[designModes.find((item) => item.id === mode)?.tier ?? "free"];

type Copy = {
  title: string;
  note: string;
  selected: string;
  requires: string;
  groups: [string, string, string, string];
  names: Record<DesignMode, string>;
};

export const designCopy: Record<Language, Copy> = {
  ja: { title: "アプリデザイン", note: "プラン表示テストに連動するデザインの試用です。実際の会員権限はまだありません。", selected: "選択中", requires: "必要なプラン", groups: ["通常", "有料会員から", "VIP会員から", "ビジネス会員から"], names: { classic: "ピュアホワイト", masculine: "コズミックブラック", feminine: "ロイヤルアメジスト", "masculine-luxe": "ディープインディコ", "feminine-luxe": "ソーラーゴールド", "business-night": "マゼンタオーラ", "business-day": "エマラルドレイ" } },
  en: { title: "App design", note: "Design preview linked to the plan display test. No real membership access is enabled yet.", selected: "Selected", requires: "Requires", groups: ["Classic", "Paid member", "VIP member", "Business member"], names: { classic: "Pure White", masculine: "Cosmic Black", feminine: "Royal Amethyst", "masculine-luxe": "Deep Indigo", "feminine-luxe": "Solar Gold", "business-night": "Magenta Aura", "business-day": "Emerald Ray" } },
  "zh-CN": { title: "应用外观", note: "外观试用与方案显示测试联动，尚未启用真实会员权限。", selected: "已选择", requires: "所需方案", groups: ["经典", "付费会员", "VIP会员", "企业会员"], names: { classic: "纯白", masculine: "宇宙黑", feminine: "皇家紫晶", "masculine-luxe": "深靛蓝", "feminine-luxe": "太阳金", "business-night": "洋红光环", "business-day": "翡翠之光" } },
  "zh-TW": { title: "應用外觀", note: "外觀試用與方案顯示測試連動，尚未啟用真正會員權限。", selected: "已選擇", requires: "所需方案", groups: ["經典", "付費會員", "VIP會員", "企業會員"], names: { classic: "純白", masculine: "宇宙黑", feminine: "皇家紫晶", "masculine-luxe": "深靛藍", "feminine-luxe": "太陽金", "business-night": "洋紅光環", "business-day": "翡翠之光" } },
  ko: { title: "앱 디자인", note: "요금제 표시 테스트와 연동된 디자인 미리보기입니다. 실제 회원 권한은 아직 없습니다.", selected: "선택됨", requires: "필요한 플랜", groups: ["기본", "유료 회원", "VIP 회원", "비즈니스 회원"], names: { classic: "퓨어 화이트", masculine: "코스믹 블랙", feminine: "로열 아메시스트", "masculine-luxe": "딥 인디고", "feminine-luxe": "솔라 골드", "business-night": "마젠타 오라", "business-day": "에메랄드 레이" } },
  es: { title: "Diseño de la app", note: "Vista previa vinculada a la prueba de planes. Aún no hay acceso real de membresía.", selected: "Seleccionado", requires: "Requiere", groups: ["Clásico", "Miembro de pago", "Miembro VIP", "Empresa"], names: { classic: "Blanco puro", masculine: "Negro cósmico", feminine: "Amatista real", "masculine-luxe": "Índigo profundo", "feminine-luxe": "Oro solar", "business-night": "Aura magenta", "business-day": "Rayo esmeralda" } },
  fr: { title: "Design de l’application", note: "Aperçu lié au test des offres. Aucun accès membre réel n’est encore activé.", selected: "Sélectionné", requires: "Offre requise", groups: ["Classique", "Membre payant", "Membre VIP", "Entreprise"], names: { classic: "Blanc pur", masculine: "Noir cosmique", feminine: "Améthyste royale", "masculine-luxe": "Indigo profond", "feminine-luxe": "Or solaire", "business-night": "Aura magenta", "business-day": "Rayon émeraude" } },
};