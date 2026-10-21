import type { Language } from "./translations";
import { reminderCopy } from "./reminder-copy";

/** The four paid tiers shown as selectable cards on My Page. Preview copy only — billing is not connected. */
export type PaidPlanId = "standard" | "vip" | "b2b" | "b2b-premium";

export type PlanCard = {
  id: PaidPlanId;
  badge?: string;
  tagline: string;
  features: string[];
};

export type PlanCardsCopy = {
  sectionTitle: string;
  sectionSub: string;
  unlockCta: string;
  cards: PlanCard[];
};

const JA_FEATURES = {
  standard: [
    "アゴルメン相性診断 1日3回",
    "ファミリーを最大3人登録",
    "アゴルメン相談室 1日3回まで",
    "相性診断＆統合詳細トリセツ 無制限",
    "全6ジャンルバースカラー解放",
    "毎日の個人アドバイス",
  ],
  vip: [
    "アゴルメン相性診断 1日10回",
    "ファミリーを最大10人登録",
    "アゴルメン相談室 1日10回まで",
    "高画質曼陀羅アート完全解放・壁紙保存・共有",
    "8方位 吉方位ナビ",
    "カレンダー同期（Google / Apple）",
    "広告非表示",
  ],
  b2b: [
    "アゴルメン相性診断 1日30回",
    "ファミリーを最大30人登録",
    "アゴルメン相談室 1日30回まで",
    "チーム・組織コンサル全7機能（チーム診断・AI人員選抜・タレント名簿・アラートカレンダー・1on1トリセツ等）",
    "365日ファミリーロードマップ",
  ],
  premium: [
    "アゴルメン相性診断 無制限",
    "ファミリーを最大100人登録",
    "アゴルメン相談室 無制限",
    "100名大型組織コンサルフル対応",
    "優先AI処理（Priority AI）",
  ],
};

const baseplanCardsCopy: Record<Language, PlanCardsCopy> = {
  ja: {
    sectionTitle: "あなたの可能性を、もう一歩先へ",
    sectionSub: "上位プランへアップグレードすることで、下位プランのすべての特権サービスを完全に引き継ぎ、さらに高度で特別な限定機能・更なる分析サービスが解放されます。",
    unlockCta: "このプランで可能性を開放する",
    cards: [
      { id: "standard", badge: "手軽にスタート", tagline: "毎日を彩る、あなた専用のコンパス", features: JA_FEATURES.standard },
      { id: "vip", badge: "人気No.1", tagline: "すべての輝きを、余すところなく", features: JA_FEATURES.vip },
      { id: "b2b", badge: "ファミリー向け", tagline: "チームの力を、最大限に引き出す", features: JA_FEATURES.b2b },
      { id: "b2b-premium", badge: "最上位プラン", tagline: "大切なつながりを、もっと広く深く", features: JA_FEATURES.premium },
    ],
  },
  en: {
    sectionTitle: "Take your next step",
    sectionSub: "Each higher plan carries over every benefit of the plans below it and adds more advanced, exclusive features and deeper analysis.",
    unlockCta: "Unlock this plan",
    cards: [
      { id: "standard", badge: "Easy start", tagline: "Your daily compass, in living color", features: [
        "Quick compatibility: 3/day",
        "Register up to 3 family members",
        "AI consultation: 3 questions a day",
        "Unlimited compatibility checks & detailed manual",
        "All 6 birth-color genres",
        "Daily personal guidance",
      ] },
      { id: "vip", badge: "Most popular", tagline: "Every radiance, nothing held back", features: [
        "Quick compatibility: 10/day",
        "Register up to 10 family members",
        "AI consultation: 10 questions a day",
        "Full HD mandala art, wallpaper saving & sharing",
        "8-direction lucky-direction navigator",
        "Calendar sync (Google / Apple)",
        "Ad-free",
      ] },
      { id: "b2b", badge: "For families", tagline: "Bring out the full power of your team", features: [
        "Quick compatibility: 30/day",
        "Register up to 30 family members",
        "AI consultation: 30 questions a day",
        "All 7 team & organization consulting tools (team diagnosis, AI selection, talent catalog, alert calendar, 1-on-1 manual and more)",
        "365-day business roadmap",
      ] },
      { id: "b2b-premium", badge: "Flagship", tagline: "Support every important connection at scale", features: [
        "Quick compatibility: unlimited",
        "Register up to 100 family members",
        "Unlimited AI consultation",
        "Full consulting for organizations up to 100 people",
        "Priority AI processing",
      ] },
    ],
  },
  "zh-CN": {
    sectionTitle: "继续探索你的可能性",
    sectionSub: "升级到更高方案后，将完整保留下级方案的全部特权，并解锁更高级的专属功能与更深入的分析服务。",
    unlockCta: "开通此方案，释放可能性",
    cards: [
      { id: "standard", badge: "轻松入门", tagline: "点亮每一天的专属指南", features: [
        "快速契合诊断 每天3次",
        "最多登记3位家人",
        "AI咨询 每天3次",
        "相性诊断与详细指南 无限制",
        "全部6大类别诞生色",
        "每日个人建议",
      ] },
      { id: "vip", badge: "人气No.1", tagline: "释放全部光彩，毫无保留", features: [
        "快速契合诊断 每天10次",
        "最多登记10位家人",
        "AI咨询 每天10次",
        "高清曼陀罗艺术全解锁·壁纸保存·分享",
        "8方位吉方位导航",
        "日历同步（Google / Apple）",
        "无广告",
      ] },
      { id: "b2b", badge: "家庭推荐", tagline: "最大限度激发团队力量", features: [
        "快速契合诊断 每天30次",
        "最多登记30位家人",
        "AI咨询 每天30次",
        "全部7项团队·组织咨询功能（团队诊断·AI人才选拔·人才名册·提醒日历·1on1指南等）",
        "365天企业路线图",
      ] },
      { id: "b2b-premium", badge: "旗舰方案", tagline: "守护更多重要关系", features: [
        "快速契合诊断 无限制",
        "最多登记100位家人",
        "AI咨询 无限制",
        "100人大型组织咨询完整支持",
        "优先AI处理（Priority AI）",
      ] },
    ],
  },
  "zh-TW": {
    sectionTitle: "繼續探索你的可能性",
    sectionSub: "升級到更高方案後，將完整保留下級方案的全部特權，並解鎖更進階的專屬功能與更深入的分析服務。",
    unlockCta: "開通此方案，釋放可能性",
    cards: [
      { id: "standard", badge: "輕鬆入門", tagline: "點亮每一天的專屬指南", features: [
        "快速契合診斷 每天3次",
        "最多登錄3位家人",
        "AI諮詢 每天3次",
        "契合度診斷與詳細指南 無限制",
        "全部6大類別誕生色",
        "每日個人建議",
      ] },
      { id: "vip", badge: "人氣No.1", tagline: "釋放全部光彩，毫無保留", features: [
        "快速契合診斷 每天10次",
        "最多登錄10位家人",
        "AI諮詢 每天10次",
        "高畫質曼陀羅藝術全解鎖·桌布保存·分享",
        "8方位吉方位導航",
        "行事曆同步（Google / Apple）",
        "無廣告",
      ] },
      { id: "b2b", badge: "家庭推薦", tagline: "最大限度激發團隊力量", features: [
        "快速契合診斷 每天30次",
        "最多登錄30位家人",
        "AI諮詢 每天30次",
        "全部7項團隊·組織顧問功能（團隊診斷·AI人才選拔·人才名冊·提醒行事曆·1on1指南等）",
        "365天家庭路線圖",
      ] },
      { id: "b2b-premium", badge: "旗艦方案", tagline: "守護更多重要關係", features: [
        "快速契合診斷 無限制",
        "最多登錄100位家人",
        "AI諮詢 無限制",
        "100人大型組織顧問完整支援",
        "優先AI處理（Priority AI）",
      ] },
    ],
  },
  ko: {
    sectionTitle: "가능성을 더 탐색해 보세요",
    sectionSub: "상위 플랜으로 업그레이드하면 하위 플랜의 모든 혜택을 그대로 이어받고, 더 고급스러운 전용 기능과 심층 분석이 열립니다.",
    unlockCta: "이 플랜으로 가능성 열기",
    cards: [
      { id: "standard", badge: "가볍게 시작", tagline: "매일을 빛내는 나만의 나침반", features: [
        "빠른 궁합 진단 하루 3회",
        "패밀리 최대 3명 등록",
        "AI 상담 하루 3회",
        "궁합 진단 & 상세 가이드 무제한",
        "전체 6장르 탄생 컬러",
        "매일의 개인 조언",
      ] },
      { id: "vip", badge: "인기 No.1", tagline: "모든 빛남을 온전히", features: [
        "빠른 궁합 진단 하루 10회",
        "패밀리 최대 10명 등록",
        "AI 상담 하루 10회",
        "고화질 만다라 아트 완전 해제·배경화면 저장·공유",
        "8방위 길방위 내비게이션",
        "캘린더 연동 (Google / Apple)",
        "광고 없음",
      ] },
      { id: "b2b", badge: "패밀리 추천", tagline: "팀의 힘을 최대로 끌어올리기", features: [
        "빠른 궁합 진단 하루 30회",
        "패밀리 최대 30명 등록",
        "AI 상담 하루 30회",
        "팀·조직 컨설팅 전체 7가지 기능 (팀 진단·AI 인선·인물 명부·알림 캘린더·1on1 가이드 등)",
        "365일 기업 로드맵",
      ] },
      { id: "b2b-premium", badge: "최상위 플랜", tagline: "소중한 관계를 더 넓고 깊게", features: [
        "빠른 궁합 진단 무제한",
        "패밀리 최대 100명 등록",
        "AI 상담 무제한",
        "100명 규모 조직 컨설팅 완전 지원",
        "우선 AI 처리 (Priority AI)",
      ] },
    ],
  },
  es: {
    sectionTitle: "Explora el siguiente paso",
    sectionSub: "Cada plan superior conserva todas las ventajas de los planes inferiores y suma funciones exclusivas y análisis más profundos.",
    unlockCta: "Desbloquear este plan",
    cards: [
      { id: "standard", badge: "Para empezar", tagline: "Tu brújula diaria, a todo color", features: [
        "Compatibilidad rápida: 3/día",
        "Registra hasta 3 familiares",
        "Consulta de IA: 3 veces al día",
        "Compatibilidad y manual detallado sin límites",
        "Los 6 géneros de colores de nacimiento",
        "Consejo personal diario",
      ] },
      { id: "vip", badge: "N.º1 en popularidad", tagline: "Todo tu brillo, sin reservas", features: [
        "Compatibilidad rápida: 10/día",
        "Registra hasta 10 familiares",
        "Consulta de IA: 10 veces al día",
        "Arte mandala en alta definición, fondos y compartir",
        "Navegador de direcciones auspiciosas de 8 rumbos",
        "Sincronización de calendario (Google / Apple)",
        "Sin anuncios",
      ] },
      { id: "b2b", badge: "Para familias", tagline: "Saca el máximo partido a tu equipo", features: [
        "Compatibilidad rápida: 30/día",
        "Registra hasta 30 familiares",
        "Consulta de IA: 30 veces al día",
        "Las 7 herramientas de consultoría de equipo y organización (diagnóstico de equipo, selección con IA, catálogo de talentos, calendario de alertas, manual 1a1 y más)",
        "Hoja de ruta empresarial de 365 días",
      ] },
      { id: "b2b-premium", badge: "Plan insignia", tagline: "Cuida más vínculos importantes", features: [
        "Compatibilidad rápida: sin límite",
        "Registra hasta 100 familiares",
        "Consulta de IA ilimitada",
        "Consultoría completa para organizaciones de hasta 100 personas",
        "Procesamiento de IA prioritario",
      ] },
    ],
  },
  fr: {
    sectionTitle: "Explorez la suite",
    sectionSub: "Chaque offre supérieure conserve tous les avantages des offres inférieures et ajoute des fonctions exclusives et des analyses plus poussées.",
    unlockCta: "Débloquer ce plan",
    cards: [
      { id: "standard", badge: "Pour commencer", tagline: "Votre boussole quotidienne, en couleurs", features: [
        "Affinités rapides : 3/jour",
        "Inscrivez jusqu’à 3 proches",
        "Consultation IA : 3 fois par jour",
        "Affinités et manuel détaillé illimités",
        "Les 6 genres de couleurs de naissance",
        "Conseil personnel quotidien",
      ] },
      { id: "vip", badge: "Nº1 de la popularité", tagline: "Tout votre éclat, sans retenue", features: [
        "Affinités rapides : 10/jour",
        "Inscrivez jusqu’à 10 proches",
        "Consultation IA : 10 fois par jour",
        "Art mandala en haute définition, fonds d’écran et partage",
        "Navigateur des directions favorables en 8 points",
        "Synchronisation du calendrier (Google / Apple)",
        "Sans publicité",
      ] },
      { id: "b2b", badge: "Pour les familles", tagline: "Révélez toute la puissance de votre équipe", features: [
        "Affinités rapides : 30/jour",
        "Inscrivez jusqu’à 30 proches",
        "Consultation IA : 30 fois par jour",
        "Les 7 outils de conseil d’équipe et d’organisation (diagnostic d’équipe, sélection IA, catalogue de talents, calendrier d’alertes, guide 1à1, etc.)",
        "Feuille de route d’entreprise sur 365 jours",
      ] },
      { id: "b2b-premium", badge: "Plan phare", tagline: "Prenez soin de davantage de liens précieux", features: [
        "Affinités rapides : illimité",
        "Inscrivez jusqu’à 100 proches",
        "Consultation IA illimitée",
        "Conseil complet pour les organisations jusqu’à 100 personnes",
        "Traitement IA prioritaire",
      ] },
    ],
  },
};

export const planCardsCopy: typeof baseplanCardsCopy = Object.fromEntries((Object.keys(baseplanCardsCopy) as Language[]).map(language => [language, { ...baseplanCardsCopy[language], cards: baseplanCardsCopy[language].cards.map(card => ({ ...card, features: [reminderCopy[language].fullBenefit, ...(card.id !== "standard" ? [reminderCopy[language].vipBenefit] : []), ...card.features] })) }])) as typeof baseplanCardsCopy;
