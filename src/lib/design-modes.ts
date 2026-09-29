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
  ja: { title: "アプリデザイン", note: "プラン表示テストに連動するデザインの試用です。実際の会員権限はまだありません。", selected: "選択中", requires: "必要なプラン", groups: ["通常", "有料会員から", "VIP会員から", "ビジネス会員から"], names: { classic: "ノーマル", masculine: "スピリチュアル・メンズ", feminine: "スピリチュアル・レディース", "masculine-luxe": "ゴージャス・メンズ", "feminine-luxe": "ゴージャス・レディース", "business-night": "ビジネス・ナイト", "business-day": "ビジネス・デイ" } },
  en: { title: "App design", note: "Design preview linked to the plan display test. No real membership access is enabled yet.", selected: "Selected", requires: "Requires", groups: ["Classic", "Paid member", "VIP member", "Business member"], names: { classic: "Classic", masculine: "Spiritual / masculine", feminine: "Spiritual / feminine", "masculine-luxe": "Grand / masculine", "feminine-luxe": "Grand / feminine", "business-night": "Business / night", "business-day": "Business / day" } },
  "zh-CN": { title: "应用外观", note: "外观试用与方案显示测试联动，尚未启用真实会员权限。", selected: "已选择", requires: "所需方案", groups: ["经典", "付费会员", "VIP会员", "企业会员"], names: { classic: "经典", masculine: "灵性·男士", feminine: "灵性·女士", "masculine-luxe": "华丽·男士", "feminine-luxe": "华丽·女士", "business-night": "商务·夜色", "business-day": "商务·日光" } },
  "zh-TW": { title: "應用外觀", note: "外觀試用與方案顯示測試連動，尚未啟用真正會員權限。", selected: "已選擇", requires: "所需方案", groups: ["經典", "付費會員", "VIP會員", "企業會員"], names: { classic: "經典", masculine: "靈性・男士", feminine: "靈性・女士", "masculine-luxe": "華麗・男士", "feminine-luxe": "華麗・女士", "business-night": "商務・夜色", "business-day": "商務・日光" } },
  ko: { title: "앱 디자인", note: "요금제 표시 테스트와 연동된 디자인 미리보기입니다. 실제 회원 권한은 아직 없습니다.", selected: "선택됨", requires: "필요한 플랜", groups: ["기본", "유료 회원", "VIP 회원", "비즈니스 회원"], names: { classic: "기본", masculine: "스피리추얼·남성", feminine: "스피리추얼·여성", "masculine-luxe": "고저스·남성", "feminine-luxe": "고저스·여성", "business-night": "비즈니스·나이트", "business-day": "비즈니스·데이" } },
  es: { title: "Diseño de la app", note: "Vista previa vinculada a la prueba de planes. Aún no hay acceso real de membresía.", selected: "Seleccionado", requires: "Requiere", groups: ["Clásico", "Miembro de pago", "Miembro VIP", "Empresa"], names: { classic: "Clásico", masculine: "Espiritual / masculino", feminine: "Espiritual / femenino", "masculine-luxe": "Lujo / masculino", "feminine-luxe": "Lujo / femenino", "business-night": "Negocios / noche", "business-day": "Negocios / día" } },
  fr: { title: "Design de l’application", note: "Aperçu lié au test des offres. Aucun accès membre réel n’est encore activé.", selected: "Sélectionné", requires: "Offre requise", groups: ["Classique", "Membre payant", "Membre VIP", "Entreprise"], names: { classic: "Classique", masculine: "Spirituel / masculin", feminine: "Spirituel / féminin", "masculine-luxe": "Prestige / masculin", "feminine-luxe": "Prestige / féminin", "business-night": "Entreprise / nuit", "business-day": "Entreprise / jour" } },
};