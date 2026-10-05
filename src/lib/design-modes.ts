import type { Language } from "./translations";

export type Plan = "free" | "standard" | "vip" | "b2b" | "b2b-premium";
export type DesignMode = "classic" | "pure-white" | "masculine" | "feminine" | "masculine-luxe" | "feminine-luxe" | "business-night" | "business-day"
  | "aura-gold-luxe" | "deepsea-luxe" | "shion-luxe" | "business-platinum" | "business-jade" | "business-diamond" | "business-orion" | "business-cosmos" | "business-emperor" | "business-geometry" | "business-dragon" | "business-zero" | "deepsea-luxe" | "shion-luxe" | "business-jade" | "business-diamond" | "business-orion";

export const designModes: { id: DesignMode; tier: Plan; icon: string }[] = [
  { id: "classic", tier: "free", icon: "✦" },
  { id: "pure-white", tier: "free", icon: "◯" },
  { id: "masculine", tier: "standard", icon: "◈" },
  { id: "feminine", tier: "standard", icon: "✧" },
  { id: "masculine-luxe", tier: "vip", icon: "✥" },
  { id: "feminine-luxe", tier: "vip", icon: "❈" },
  { id: "aura-gold-luxe", tier: "vip", icon: "☀" },
  { id: "business-night", tier: "b2b", icon: "▣" },
  { id: "business-day", tier: "b2b", icon: "▤" },
  { id: "business-platinum", tier: "b2b", icon: "◆" },
  { id: "business-cosmos", tier: "b2b-premium", icon: "✺" },
  { id: "business-emperor", tier: "b2b-premium", icon: "♛" },
  { id: "business-geometry", tier: "b2b-premium", icon: "✡" },
  { id: "business-dragon", tier: "b2b-premium", icon: "龍" },
  { id: "business-zero", tier: "b2b-premium", icon: "◎" },
];

const rank: Record<Plan, number> = { free: 0, standard: 1, vip: 2, b2b: 3, "b2b-premium": 4 };
export const canPreviewDesign = (plan: Plan, mode: DesignMode) =>
  rank[plan] >= rank[designModes.find((item) => item.id === mode)?.tier ?? "b2b-premium"];

type Copy = {
  title: string;
  note: string;
  selected: string;
  requires: string;
  groups: [string, string, string, string, string];
  names: Record<DesignMode, string>;
  locked: (plan: string) => string;
  planNames: [string, string, string, string];
  later: string;
  upgrade: string;
};

export const designCopy: Record<Language, Copy> = {
  ja: { title: "アプリデザイン", note: "ご利用中のプラン以下のテーマを自由に切り替えられます。上位プランは下位のテーマもすべて使えます。", selected: "選択中", requires: "必要なプラン", groups: ["Free · 2種", "スピリチュアル · 有料プラン", "ゴージャススピリチュアル · VIPプラン", "ハイセンスゴージャス · ビジネスプラン", "最高峰神聖 · ビジネスプレミアム"], names: { classic: "ミッドナイトゴールド", "pure-white": "純白・星影", masculine: "コズミックブラック", feminine: "ロイヤルアメジスト", "masculine-luxe": "ディープインディコ", "feminine-luxe": "シャンパンローズ", "business-night": "サンライズコーラル", "business-day": "エメラルドレイ", "aura-gold-luxe": "黄金オーラ", "deepsea-luxe": "深海ミッドナイト", "shion-luxe": "紫苑クリスタル", "business-platinum": "プラチナメタル", "business-jade": "翡翠ゴールド", "business-diamond": "漆黒ダイヤモンド", "business-orion": "オリオン紺碧", "business-cosmos": "宇宙ホロスコープ", "business-emperor": "帝王ゴールド", "business-geometry": "神聖幾何学発光", "business-dragon": "龍神エメラルド", "business-zero": "ゼロポイントフィールド" }, planNames: ["有料プラン", "VIPプラン", "ビジネスプラン", "ビジネスプレミアムプラン"], locked: (plan) => `このテーマは${plan}限定です。プランをアップグレードしますか？`, later: "あとで", upgrade: "プランを見る" },
  en: { title: "App design", note: "Design preview linked to the plan display test. No real membership access is enabled yet.", selected: "Selected", requires: "Requires", groups: ["Free · 2", "Spiritual · Paid plan", "Gorgeous spiritual · VIP plan", "Refined luxury · Business plan", "Sacred summit · Business Premium"], names: { classic: "Midnight Gold", "pure-white": "Pure White · Starshade", masculine: "Cosmic Black", feminine: "Royal Amethyst", "masculine-luxe": "Deep Indigo", "feminine-luxe": "Champagne Rose", "business-night": "Sunrise Coral", "business-day": "Emerald Ray", "aura-gold-luxe": "Golden Aura", "deepsea-luxe": "Deep-sea Midnight", "shion-luxe": "Aster Crystal", "business-platinum": "Platinum Metal", "business-jade": "Jade Gold", "business-diamond": "Jet Diamond", "business-orion": "Orion Azure", "business-cosmos": "Cosmic Horoscope", "business-emperor": "Imperial Gold", "business-geometry": "Sacred Geometry Glow", "business-dragon": "Dragon Emerald", "business-zero": "Zero Point Field" }, planNames: ["Paid plan", "VIP plan", "Business plan", "Business Premium plan"], locked: (plan) => `This theme is exclusive to the ${plan}. Would you like to upgrade?`, later: "Not now", upgrade: "View plans" },
  "zh-CN": { title: "应用外观", note: "外观试用与方案显示测试联动，尚未启用真实会员权限。", selected: "已选择", requires: "所需方案", groups: ["默认", "灵性 · 付费方案", "华丽灵性 · VIP方案", "精致奢华 · 企业方案", "至高神圣 · 企业尊享"], names: { classic: "午夜金", "pure-white": "纯白·星影", masculine: "宇宙黑", feminine: "皇家紫晶", "masculine-luxe": "深靛蓝", "feminine-luxe": "香槟玫瑰", "business-night": "日出珊瑚", "business-day": "翡翠之光", "aura-gold-luxe": "黄金光环", "deepsea-luxe": "深海午夜", "shion-luxe": "紫菀水晶", "business-platinum": "铂金金属", "business-jade": "翡翠金", "business-diamond": "漆黑钻石", "business-orion": "猎户蔚蓝", "business-cosmos": "宇宙星盘", "business-emperor": "帝王金", "business-geometry": "神圣几何光", "business-dragon": "龙神翡翠", "business-zero": "零点场" }, planNames: ["付费方案", "VIP方案", "企业方案", "企业尊享方案"], locked: (plan) => `此主题仅限${plan}。要升级方案吗？`, later: "以后再说", upgrade: "查看方案" },
  "zh-TW": { title: "應用外觀", note: "外觀試用與方案顯示測試連動，尚未啟用真正會員權限。", selected: "已選擇", requires: "所需方案", groups: ["預設", "靈性 · 付費方案", "華麗靈性 · VIP方案", "精緻奢華 · 企業方案", "至高神聖 · 企業尊享"], names: { classic: "午夜金", "pure-white": "純白・星影", masculine: "宇宙黑", feminine: "皇家紫晶", "masculine-luxe": "深靛藍", "feminine-luxe": "香檳玫瑰", "business-night": "日出珊瑚", "business-day": "翡翠之光", "aura-gold-luxe": "黃金光環", "deepsea-luxe": "深海午夜", "shion-luxe": "紫菀水晶", "business-platinum": "鉑金金屬", "business-jade": "翡翠金", "business-diamond": "漆黑鑽石", "business-orion": "獵戶蔚藍", "business-cosmos": "宇宙星盤", "business-emperor": "帝王金", "business-geometry": "神聖幾何光", "business-dragon": "龍神翡翠", "business-zero": "零點場" }, planNames: ["付費方案", "VIP方案", "企業方案", "企業尊享方案"], locked: (plan) => `此主題僅限${plan}。要升級方案嗎？`, later: "稍後", upgrade: "查看方案" },
  ko: { title: "앱 디자인", note: "요금제 표시 테스트와 연동된 디자인 미리보기입니다. 실제 회원 권한은 아직 없습니다.", selected: "선택됨", requires: "필요한 플랜", groups: ["기본", "스피리추얼 · 유료 플랜", "럭셔리 스피리추얼 · VIP 플랜", "세련된 럭셔리 · 비즈니스 플랜", "최상위 신성 · 비즈니스 프리미엄"], names: { classic: "미드나이트 골드", "pure-white": "퓨어 화이트 · 별빛", masculine: "코스믹 블랙", feminine: "로열 아메시스트", "masculine-luxe": "딥 인디고", "feminine-luxe": "샴페인 로즈", "business-night": "선라이즈 코랄", "business-day": "에메랄드 레이", "aura-gold-luxe": "황금 오라", "deepsea-luxe": "심해 미드나이트", "shion-luxe": "자원 크리스털", "business-platinum": "플래티넘 메탈", "business-jade": "비취 골드", "business-diamond": "칠흑 다이아몬드", "business-orion": "오리온 벽청", "business-cosmos": "우주 호로스코프", "business-emperor": "제왕 골드", "business-geometry": "신성 기하학 빛", "business-dragon": "용신 에메랄드", "business-zero": "제로 포인트 필드" }, planNames: ["유료 플랜", "VIP 플랜", "비즈니스 플랜", "비즈니스 프리미엄 플랜"], locked: (plan) => `이 테마는 ${plan} 전용입니다. 플랜을 업그레이드할까요?`, later: "나중에", upgrade: "플랜 보기" },
  es: { title: "Diseño de la app", note: "Vista previa vinculada a la prueba de planes. Aún no hay acceso real de membresía.", selected: "Seleccionado", requires: "Requiere", groups: ["Predeterminado", "Espiritual · Plan de pago", "Espiritual lujoso · Plan VIP", "Lujo refinado · Plan Empresa", "Cumbre sagrada · Empresa Premium"], names: { classic: "Oro medianoche", "pure-white": "Blanco puro · astral", masculine: "Negro cósmico", feminine: "Amatista real", "masculine-luxe": "Índigo profundo", "feminine-luxe": "Rosa champán", "business-night": "Coral del amanecer", "business-day": "Rayo esmeralda", "aura-gold-luxe": "Aura dorada", "deepsea-luxe": "Medianoche abisal", "shion-luxe": "Cristal áster", "business-platinum": "Metal platino", "business-jade": "Oro jade", "business-diamond": "Diamante azabache", "business-orion": "Azul Orión", "business-cosmos": "Horóscopo cósmico", "business-emperor": "Oro imperial", "business-geometry": "Geometría sagrada", "business-dragon": "Esmeralda del dragón", "business-zero": "Campo punto cero" }, planNames: ["Plan de pago", "Plan VIP", "Plan Empresa", "Plan Empresa Premium"], locked: (plan) => `Este tema es exclusivo del ${plan}. ¿Quieres mejorar tu plan?`, later: "Ahora no", upgrade: "Ver planes" },
  fr: { title: "Design de l’application", note: "Aperçu lié au test des offres. Aucun accès membre réel n’est encore activé.", selected: "Sélectionné", requires: "Offre requise", groups: ["Par défaut", "Spirituel · Offre payante", "Spirituel somptueux · Offre VIP", "Luxe raffiné · Offre Entreprise", "Sommet sacré · Entreprise Premium"], names: { classic: "Or de minuit", "pure-white": "Blanc pur · astral", masculine: "Noir cosmique", feminine: "Améthyste royale", "masculine-luxe": "Indigo profond", "feminine-luxe": "Rose champagne", "business-night": "Corail du lever du soleil", "business-day": "Rayon émeraude", "aura-gold-luxe": "Aura dorée", "deepsea-luxe": "Minuit abyssal", "shion-luxe": "Cristal d’aster", "business-platinum": "Métal platine", "business-jade": "Or de jade", "business-diamond": "Diamant de jais", "business-orion": "Azur d’Orion", "business-cosmos": "Horoscope cosmique", "business-emperor": "Or impérial", "business-geometry": "Géométrie sacrée", "business-dragon": "Émeraude du dragon", "business-zero": "Champ du point zéro" }, planNames: ["offre payante", "offre VIP", "offre Entreprise", "offre Entreprise Premium"], locked: (plan) => `Ce thème est réservé à l’${plan}. Voulez-vous changer d’offre ?`, later: "Plus tard", upgrade: "Voir les offres" },
};