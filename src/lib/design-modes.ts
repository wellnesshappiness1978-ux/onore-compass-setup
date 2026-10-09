import type { Language } from "./translations";

export type Plan = "free" | "standard" | "vip" | "b2b" | "b2b-premium";
export type DesignMode = "classic" | "pure-white" | "masculine" | "feminine" | "masculine-luxe" | "feminine-luxe" | "aura-gold-luxe" | "business-night" | "business-day" | "business-platinum" | "business-cosmos" | "business-emperor" | "business-geometry" | "business-dragon" | "business-zero";

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
  ja: { title: "アプリデザイン", note: "ご利用中のプラン以下のテーマを自由に切り替えられます。上位プランは下位のテーマもすべて使えます。", selected: "選択中", requires: "必要なプラン", groups: ["Free · 2種", "スピリチュアル · 有料プラン", "ゴージャススピリチュアル · VIPプラン", "ハイセンスゴージャス · ファミリープラン", "最高峰神聖 · ファミリープレミアム"], names: { classic: "陰陽・漆黒ブラック", "pure-white": "陰陽・純白ホワイト", masculine: "桃色開運・サクラローズ", feminine: "紫気東来・アメジスト", "masculine-luxe": "神聖黄金・フィボナッチ", "feminine-luxe": "翡翠風水・エメラルド", "aura-gold-luxe": "深海月光・ラピスラズリ", "business-night": "帝王紺青・ロイヤルネイビー", "business-day": "盛業黒革・ブラックレザー", "business-platinum": "金運招福・タイガーアイ", "business-cosmos": "極致プラチナ・コズミック", "business-emperor": "黄金皇帝・インペリアルゴールド", "business-geometry": "鳳凰朱赤・クリムゾン", "business-dragon": "龍脈翡翠・プレミアムジェイド", "business-zero": "銀河無垢・アルティメットダイヤモンド" }, planNames: ["スタンダード会員", "VIP会員", "ファミリー会員", "ファミリープレミアム会員"], locked: (plan) => `このテーマは${plan}限定です。プランをアップグレードしますか？`, later: "あとで", upgrade: "プランを見る" },
  en: { title: "App design", note: "Design preview linked to the plan display test. No real membership access is enabled yet.", selected: "Selected", requires: "Requires", groups: ["Free · 2", "Spiritual · Paid plan", "Gorgeous spiritual · VIP plan", "Refined luxury · Family plan", "Sacred summit · Family Premium"], names: { classic: "Obsidian Yin-Yang", "pure-white": "Pure White Yin-Yang", masculine: "Sakura Rose", feminine: "Royal Amethyst", "masculine-luxe": "Sacred Fibonacci Gold", "feminine-luxe": "Feng Shui Emerald", "aura-gold-luxe": "Moonlit Lapis Lazuli", "business-night": "Imperial Navy", "business-day": "Black Leather", "business-platinum": "Tiger’s Eye Gold", "business-cosmos": "Cosmic Platinum", "business-emperor": "Imperial Gold", "business-geometry": "Phoenix Crimson", "business-dragon": "Premium Jade", "business-zero": "Ultimate Diamond" }, planNames: ["Standard Member", "VIP Member", "Family Member", "Family Premium Member"], locked: (plan) => `This theme is exclusive to the ${plan}. Would you like to upgrade?`, later: "Not now", upgrade: "View plans" },
  "zh-CN": { title: "应用外观", note: "外观试用与方案显示测试联动，尚未启用真实会员权限。", selected: "已选择", requires: "所需方案", groups: ["默认", "灵性 · 付费方案", "华丽灵性 · VIP方案", "精致奢华 · 家庭方案", "至高神圣 · 家庭尊享"], names: { classic: "阴阳·漆黑", "pure-white": "阴阳·纯白", masculine: "桃色开运·樱花玫瑰", feminine: "紫气东来·紫水晶", "masculine-luxe": "神圣黄金·斐波那契", "feminine-luxe": "翡翠风水·祖母绿", "aura-gold-luxe": "深海月光·青金石", "business-night": "帝王藏青", "business-day": "盛业黑革", "business-platinum": "招福虎眼石", "business-cosmos": "宇宙白金", "business-emperor": "黄金皇帝", "business-geometry": "凤凰朱红", "business-dragon": "龙脉翡翠", "business-zero": "银河钻石" }, planNames: ["标准会员", "VIP会员", "家庭会员", "家庭尊享会员"], locked: (plan) => `此主题仅限${plan}。要升级方案吗？`, later: "以后再说", upgrade: "查看方案" },
  "zh-TW": { title: "應用外觀", note: "外觀試用與方案顯示測試連動，尚未啟用真正會員權限。", selected: "已選擇", requires: "所需方案", groups: ["預設", "靈性 · 付費方案", "華麗靈性 · VIP方案", "精緻奢華 · 家庭方案", "至高神聖 · 家庭尊享"], names: { classic: "陰陽・漆黑", "pure-white": "陰陽・純白", masculine: "桃色開運・櫻花玫瑰", feminine: "紫氣東來・紫水晶", "masculine-luxe": "神聖黃金・費波那契", "feminine-luxe": "翡翠風水・祖母綠", "aura-gold-luxe": "深海月光・青金石", "business-night": "帝王藏青", "business-day": "盛業黑革", "business-platinum": "招福虎眼石", "business-cosmos": "宇宙白金", "business-emperor": "黃金皇帝", "business-geometry": "鳳凰朱紅", "business-dragon": "龍脈翡翠", "business-zero": "銀河鑽石" }, planNames: ["標準會員", "VIP會員", "家庭會員", "家庭尊享會員"], locked: (plan) => `此主題僅限${plan}。要升級方案嗎？`, later: "稍後", upgrade: "查看方案" },
  ko: { title: "앱 디자인", note: "요금제 표시 테스트와 연동된 디자인 미리보기입니다. 실제 회원 권한은 아직 없습니다.", selected: "선택됨", requires: "필요한 플랜", groups: ["기본", "스피리추얼 · 유료 플랜", "럭셔리 스피리추얼 · VIP 플랜", "세련된 럭셔리 · 패밀리 플랜", "최상위 신성 · 패밀리 프리미엄"], names: { classic: "음양·흑요석", "pure-white": "음양·순백", masculine: "사쿠라 로즈", feminine: "로열 자수정", "masculine-luxe": "신성한 피보나치 골드", "feminine-luxe": "풍수 에메랄드", "aura-gold-luxe": "달빛 라피스라줄리", "business-night": "제왕 네이비", "business-day": "블랙 레더", "business-platinum": "타이거 아이 골드", "business-cosmos": "코스믹 플래티넘", "business-emperor": "임페리얼 골드", "business-geometry": "피닉스 크림슨", "business-dragon": "프리미엄 제이드", "business-zero": "얼티밋 다이아몬드" }, planNames: ["스탠다드 회원", "VIP 회원", "패밀리 회원", "패밀리 프리미엄 회원"], locked: (plan) => `이 테마는 ${plan} 전용입니다. 플랜을 업그레이드할까요?`, later: "나중에", upgrade: "플랜 보기" },
  es: { title: "Diseño de la app", note: "Vista previa vinculada a la prueba de planes. Aún no hay acceso real de membresía.", selected: "Seleccionado", requires: "Requiere", groups: ["Predeterminado", "Espiritual · Plan de pago", "Espiritual lujoso · Plan VIP", "Lujo refinado · Plan Familia", "Cumbre sagrada · Familia Premium"], names: { classic: "Obsidiana Yin-Yang", "pure-white": "Blanco puro Yin-Yang", masculine: "Rosa Sakura", feminine: "Amatista real", "masculine-luxe": "Oro Fibonacci sagrado", "feminine-luxe": "Esmeralda feng shui", "aura-gold-luxe": "Lapislázuli lunar", "business-night": "Azul imperial", "business-day": "Cuero negro", "business-platinum": "Ojo de tigre", "business-cosmos": "Platino cósmico", "business-emperor": "Oro imperial", "business-geometry": "Carmesí fénix", "business-dragon": "Jade prémium", "business-zero": "Diamante supremo" }, planNames: ["Membresía Estándar", "Membresía VIP", "Membresía Familia", "Familia Premium"], locked: (plan) => `Este tema es exclusivo del ${plan}. ¿Quieres mejorar tu plan?`, later: "Ahora no", upgrade: "Ver planes" },
  fr: { title: "Design de l’application", note: "Aperçu lié au test des offres. Aucun accès membre réel n’est encore activé.", selected: "Sélectionné", requires: "Offre requise", groups: ["Par défaut", "Spirituel · Offre payante", "Spirituel somptueux · Offre VIP", "Luxe raffiné · Offre Famille", "Sommet sacré · Famille Premium"], names: { classic: "Obsidienne Yin-Yang", "pure-white": "Blanc pur Yin-Yang", masculine: "Rose Sakura", feminine: "Améthyste royale", "masculine-luxe": "Or Fibonacci sacré", "feminine-luxe": "Émeraude feng shui", "aura-gold-luxe": "Lapis-lazuli lunaire", "business-night": "Bleu impérial", "business-day": "Cuir noir", "business-platinum": "Œil-de-tigre", "business-cosmos": "Platine cosmique", "business-emperor": "Or impérial", "business-geometry": "Cramoisi phénix", "business-dragon": "Jade suprême", "business-zero": "Diamant ultime" }, planNames: ["Membre Standard", "Membre VIP", "Membre Famille", "Famille Premium"], locked: (plan) => `Ce thème est réservé à l’${plan}. Voulez-vous changer d’offre ?`, later: "Plus tard", upgrade: "Voir les offres" },
};