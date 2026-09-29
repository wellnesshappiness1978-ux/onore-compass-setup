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
  locked: (plan: string) => string;
  later: string;
  upgrade: string;
};

export const designCopy: Record<Language, Copy> = {
  ja: { title: "アプリデザイン", note: "プラン表示テストに連動するデザインの試用です。実際の会員権限はまだありません。", selected: "選択中", requires: "必要なプラン", groups: ["デフォルト", "スピリチュアル · 有料プラン", "ゴージャススピリチュアル · VIPプラン", "ハイセンスゴージャス · ビジネスプラン"], names: { classic: "ピュアホワイト", masculine: "コズミックブラック", feminine: "ロイヤルアメジスト", "masculine-luxe": "ディープインディコ", "feminine-luxe": "ソーラーゴールド", "business-night": "マゼンタオーラ", "business-day": "エマラルドレイ" }, locked: (plan) => `このテーマは${plan}限定です。プランをアップグレードしますか？`, later: "あとで", upgrade: "プランを見る" },
  en: { title: "App design", note: "Design preview linked to the plan display test. No real membership access is enabled yet.", selected: "Selected", requires: "Requires", groups: ["Default", "Spiritual · Paid plan", "Gorgeous spiritual · VIP plan", "Refined luxury · Business plan"], names: { classic: "Pure White", masculine: "Cosmic Black", feminine: "Royal Amethyst", "masculine-luxe": "Deep Indigo", "feminine-luxe": "Solar Gold", "business-night": "Magenta Aura", "business-day": "Emerald Ray" }, locked: (plan) => `This theme is exclusive to the ${plan}. Would you like to upgrade?`, later: "Not now", upgrade: "View plans" },
  "zh-CN": { title: "应用外观", note: "外观试用与方案显示测试联动，尚未启用真实会员权限。", selected: "已选择", requires: "所需方案", groups: ["默认", "灵性 · 付费方案", "华丽灵性 · VIP方案", "精致奢华 · 企业方案"], names: { classic: "纯白", masculine: "宇宙黑", feminine: "皇家紫晶", "masculine-luxe": "深靛蓝", "feminine-luxe": "太阳金", "business-night": "洋红光环", "business-day": "翡翠之光" }, locked: (plan) => `此主题仅限${plan}。要升级方案吗？`, later: "以后再说", upgrade: "查看方案" },
  "zh-TW": { title: "應用外觀", note: "外觀試用與方案顯示測試連動，尚未啟用真正會員權限。", selected: "已選擇", requires: "所需方案", groups: ["預設", "靈性 · 付費方案", "華麗靈性 · VIP方案", "精緻奢華 · 企業方案"], names: { classic: "純白", masculine: "宇宙黑", feminine: "皇家紫晶", "masculine-luxe": "深靛藍", "feminine-luxe": "太陽金", "business-night": "洋紅光環", "business-day": "翡翠之光" }, locked: (plan) => `此主題僅限${plan}。要升級方案嗎？`, later: "稍後", upgrade: "查看方案" },
  ko: { title: "앱 디자인", note: "요금제 표시 테스트와 연동된 디자인 미리보기입니다. 실제 회원 권한은 아직 없습니다.", selected: "선택됨", requires: "필요한 플랜", groups: ["기본", "스피리추얼 · 유료 플랜", "럭셔리 스피리추얼 · VIP 플랜", "세련된 럭셔리 · 비즈니스 플랜"], names: { classic: "퓨어 화이트", masculine: "코스믹 블랙", feminine: "로열 아메시스트", "masculine-luxe": "딥 인디고", "feminine-luxe": "솔라 골드", "business-night": "마젠타 오라", "business-day": "에메랄드 레이" }, locked: (plan) => `이 테마는 ${plan} 전용입니다. 플랜을 업그레이드할까요?`, later: "나중에", upgrade: "플랜 보기" },
  es: { title: "Diseño de la app", note: "Vista previa vinculada a la prueba de planes. Aún no hay acceso real de membresía.", selected: "Seleccionado", requires: "Requiere", groups: ["Predeterminado", "Espiritual · Plan de pago", "Espiritual lujoso · Plan VIP", "Lujo refinado · Plan Empresa"], names: { classic: "Blanco puro", masculine: "Negro cósmico", feminine: "Amatista real", "masculine-luxe": "Índigo profundo", "feminine-luxe": "Oro solar", "business-night": "Aura magenta", "business-day": "Rayo esmeralda" }, locked: (plan) => `Este tema es exclusivo del ${plan}. ¿Quieres mejorar tu plan?`, later: "Ahora no", upgrade: "Ver planes" },
  fr: { title: "Design de l’application", note: "Aperçu lié au test des offres. Aucun accès membre réel n’est encore activé.", selected: "Sélectionné", requires: "Offre requise", groups: ["Par défaut", "Spirituel · Offre payante", "Spirituel somptueux · Offre VIP", "Luxe raffiné · Offre Entreprise"], names: { classic: "Blanc pur", masculine: "Noir cosmique", feminine: "Améthyste royale", "masculine-luxe": "Indigo profond", "feminine-luxe": "Or solaire", "business-night": "Aura magenta", "business-day": "Rayon émeraude" }, locked: (plan) => `Ce thème est réservé à l’offre ${plan}. Voulez-vous changer d’offre ?`, later: "Plus tard", upgrade: "Voir les offres" },
};