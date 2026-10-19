import type { Language } from "./translations";

/** Home "next step" section: four paid-plan privilege cards. Preview copy only — billing is not connected. */
export type HomePlanId = "standard" | "vip" | "b2b" | "b2b-premium";

export type HomePlanCard = {
  id: HomePlanId;
  badge: string;
  name: string;
  catch: string;
  features: string[];
  cta: string;
};

export type HomePlanCardsCopy = {
  sectionTitle: string;
  sectionSub: string;
  dialogNote: string;
  close: string;
  nextStepNote: string;
  cards: HomePlanCard[];
};

export const homePlanCardsCopy: Record<Language, HomePlanCardsCopy> = {
  ja: {
    sectionTitle: "あなたの可能性を、もう一歩先へ",
    sectionSub: "上位プランへアップグレードすることで、下位プランのすべての特権サービスを完全に引き継ぎ、さらに高度で特別な限定機能・更なる分析サービスが解放されます。",
    dialogNote: "登録・決済の受付は準備中です。この表示はプラン内容の参考プレビューで、現在の会員資格は変更されません。",
    close: "閉じる",
    nextStepNote: "プランの表示は参考プレビューであり、実際の登録・課金とは連動していません。",
    cards: [
      { id: "standard", badge: "おすすめ", name: "有料会員（スタンダード）", catch: "自分と大切な人の関係性を深める基本プラン", features: ["アゴルメン相性診断 1日3回", "ファミリー登録上限 3名", "アゴルメン相談室 1日3回", "相性診断＆詳細トリセツ無制限", "全6ジャンルパーソナルカラー解放", "365日個人向けアドバイス"], cta: "有料プラン案内をみる" },
      { id: "vip", badge: "人気No.1", name: "VIP会員", catch: "潜在能力を覚醒させる個人最高峰のスピリチュアル体験", features: ["ソルフェジオ周波数ヒーリング音源「星音のBGM」（全Hz・バックグラウンド再生・脳波活用ガイド付き）", "アゴルメン相性診断 1日10回", "ファミリー登録上限 10名", "アゴルメン相談室 1日10回", "高画質「バースカラー曼陀羅アート」「出生宇宙創生図」解放＆壁紙保存・SNS共有", "8方位吉方位ナビ", "勝負日カレンダー同期", "完全広告非表示"], cta: "VIPプラン案内をみる" },
      { id: "b2b", badge: "大切な人と", name: "ファミリー会員", catch: "家族・友人・仕事仲間の個性を活かし、つながりを深める", features: ["ソルフェジオ周波数ヒーリング音源「星音のBGM」（全Hz・バックグラウンド再生・脳波活用ガイド付き）", "アゴルメン相性診断 1日30回", "ファミリー登録上限 30名", "アゴルメン相談室 1日30回", "チーム・組織コンサル全7機能（同時診断、AI人員選抜、タレント名簿、アラートカレンダー、組織バランス、1on1トリセツ等）", "365日ファミリーロードマップ"], cta: "ファミリープラン案内をみる" },
      { id: "b2b-premium", badge: "最上位プラン", name: "ファミリープレミアム会員", catch: "100名までの大切なつながりを見渡せる羅針盤", features: ["ソルフェジオ周波数ヒーリング音源「星音のBGM」（全Hz・バックグラウンド再生・脳波活用ガイド付き）", "アゴルメン相性診断 無制限", "ファミリー登録上限 100名", "アゴルメン相談室 無制限使い放題", "100名大型組織コンサルフル対応", "優先AI処理（Priority AI）"], cta: "ファミリープレミアム案内をみる" },
    ],
  },
  en: {
    sectionTitle: "Take your next step",
    sectionSub: "Each higher plan carries over every benefit of the plans below it and adds more advanced, exclusive features and deeper analysis.",
    dialogNote: "Registration and billing are not open yet. This is a reference preview of each plan; your current membership does not change here.",
    close: "Close",
    nextStepNote: "Plan details are a reference preview and are not linked to real sign-up or billing.",
    cards: [
      { id: "standard", badge: "Recommended", name: "Standard", catch: "The essential plan to deepen bonds with yourself and others", features: ["Quick compatibility: 3/day", "Up to 3 registered family members", "AI consultation: 3 questions a day", "Unlimited compatibility checks & detailed manual", "All 6 personal-color genres", "365 days of personal guidance"], cta: "See the Standard plan" },
      { id: "vip", badge: "Most popular", name: "VIP", catch: "The highest personal experience for awakening your potential", features: ["Solfeggio healing sound \"Celestial BGM\" (all Hz, background playback, brainwave guide)", "Quick compatibility: 10/day", "Up to 10 registered family members", "AI consultation: 10 questions a day", "Full HD resonance mandala art, wallpaper saving & SNS sharing", "8-direction lucky-direction navigator", "Big-day calendar sync", "Completely ad-free"], cta: "See the VIP plan" },
      { id: "b2b", badge: "For loved ones", name: "Family", catch: "Bring out the strengths of family, friends and colleagues", features: ["Solfeggio healing sound \"Celestial BGM\" (all Hz, background playback, brainwave guide)", "Quick compatibility: 30/day", "Up to 30 registered family members", "AI consultation: 30 questions a day", "All 7 team & organization consulting tools (simultaneous diagnosis, AI selection, talent catalog, alert calendar, team balance, 1-on-1 manual and more)", "365-day business roadmap"], cta: "See the Family plan" },
      { id: "b2b-premium", badge: "Flagship", name: "Family Premium", catch: "A compass for up to 100 important connections", features: ["Solfeggio healing sound \"Celestial BGM\" (all Hz, background playback, brainwave guide)", "Quick compatibility: unlimited", "Up to 100 registered family members", "Unlimited AI consultation", "Full consulting for organizations up to 100 people", "Priority AI processing"], cta: "See Family Premium" },
    ],
  },
  "zh-CN": {
    sectionTitle: "继续探索你的可能性",
    sectionSub: "升级到更高方案后，将完整保留下级方案的全部特权，并解锁更高级的专属功能与更深入的分析服务。",
    dialogNote: "注册与支付功能正在准备中。此显示仅为方案内容的参考预览，不会改变你当前的会员资格。",
    close: "关闭",
    nextStepNote: "方案显示为参考预览，尚未与真实注册或支付联动。",
    cards: [
      { id: "standard", badge: "推荐", name: "标准会员", catch: "加深自己与重要之人关系的基础方案", features: ["快速契合诊断 每天3次", "最多登记3位家人", "AI咨询 每天3次", "契合诊断与详细指南 无限制", "全部6大类别个人色彩", "365天个人建议"], cta: "查看标准方案" },
      { id: "vip", badge: "人气No.1", name: "VIP会员", catch: "唤醒潜在能力的个人最高级灵性体验", features: ["索尔费吉奥频率疗愈音源「星音BGM」（全频率・后台播放・脑波活用指南）", "快速契合诊断 每天10次", "最多登记10位家人", "AI咨询 每天10次", "高清「波动共鸣 曼陀罗艺术」全解锁·壁纸保存·SNS分享", "8方位吉方位导航", "重要日历同步", "完全无广告"], cta: "查看VIP方案" },
      { id: "b2b", badge: "珍视关系", name: "家庭会员", catch: "发挥家人、朋友与同事的个性，深化彼此连结", features: ["索尔费吉奥频率疗愈音源「星音BGM」（全频率・后台播放・脑波活用指南）", "快速契合诊断 每天30次", "最多登记30位家人", "AI咨询 每天30次", "团队·组织咨询全部7项功能（同时诊断、AI人才选拔、人才名册、提醒日历、组织平衡、1对1指南等）", "365天企业路线图"], cta: "查看家庭方案" },
      { id: "b2b-premium", badge: "旗舰方案", name: "家庭尊享会员", catch: "可守护100位重要之人的关系罗盘", features: ["索尔费吉奥频率疗愈音源「星音BGM」（全频率・后台播放・脑波活用指南）", "快速契合诊断 无限制", "最多登记100人", "AI咨询 无限制", "100人大型组织咨询完整支持", "优先AI处理（Priority AI）"], cta: "查看家庭尊享方案" },
    ],
  },
  "zh-TW": {
    sectionTitle: "繼續探索你的可能性",
    sectionSub: "升級到更高方案後，將完整保留下級方案的全部特權，並解鎖更進階的專屬功能與更深入的分析服務。",
    dialogNote: "註冊與付款功能正在準備中。此顯示僅為方案內容的參考預覽，不會變更你目前的會員資格。",
    close: "關閉",
    nextStepNote: "方案顯示為參考預覽，尚未與實際註冊或付款連動。",
    cards: [
      { id: "standard", badge: "推薦", name: "標準會員", catch: "加深自己與重要之人關係的基礎方案", features: ["快速契合診斷 每天3次", "最多登錄3位家人", "AI諮詢 每天3次", "契合度診斷與詳細指南 無限制", "全部6大類別個人色彩", "365天個人建議"], cta: "查看標準方案" },
      { id: "vip", badge: "人氣No.1", name: "VIP會員", catch: "喚醒潛能的個人最高階靈性體驗", features: ["索爾費吉奧頻率療癒音源「星音BGM」（全頻率・背景播放・腦波活用指南）", "快速契合診斷 每天10次", "最多登錄10位家人", "AI諮詢 每天10次", "高畫質「波動共鳴 曼陀羅藝術」全解鎖·桌布保存·SNS分享", "8方位吉方位導航", "重要日同步", "完全無廣告"], cta: "查看VIP方案" },
      { id: "b2b", badge: "珍視關係", name: "家庭會員", catch: "發揮家人、朋友與同事的個性，深化彼此連結", features: ["索爾費吉奧頻率療癒音源「星音BGM」（全頻率・背景播放・腦波活用指南）", "快速契合診斷 每天30次", "最多登錄30位家人", "AI諮詢 每天30次", "團隊·組織顧問全部7項功能（同時診斷、AI人才選拔、人才名冊、提醒行事曆、組織平衡、1對1指南等）", "365天家庭路線圖"], cta: "查看家庭方案" },
      { id: "b2b-premium", badge: "旗艦方案", name: "家庭尊享會員", catch: "可守護100位重要之人的關係羅盤", features: ["索爾費吉奧頻率療癒音源「星音BGM」（全頻率・背景播放・腦波活用指南）", "快速契合診斷 無限制", "最多登錄100人", "AI諮詢 無限制", "100人大型組織顧問完整支援", "優先AI處理（Priority AI）"], cta: "查看家庭尊享方案" },
    ],
  },
  ko: {
    sectionTitle: "가능성을 더 탐색해 보세요",
    sectionSub: "상위 플랜으로 업그레이드하면 하위 플랜의 모든 혜택을 그대로 이어받고, 더 고급스러운 전용 기능과 심층 분석이 열립니다.",
    dialogNote: "가입과 결제는 아직 준비 중입니다. 이 표시는 플랜 내용의 참고 미리보기이며 현재 회원 자격은 바뀌지 않습니다.",
    close: "닫기",
    nextStepNote: "플랜 표시는 참고 미리보기이며 실제 가입·결제와 연동되지 않습니다.",
    cards: [
      { id: "standard", badge: "추천", name: "스탠다드 회원", catch: "나와 소중한 사람의 관계를 깊게 하는 기본 플랜", features: ["빠른 궁합 진단 하루 3회", "패밀리 최대 3명 등록", "AI 상담 하루 3회", "궁합 진단 & 상세 가이드 무제한", "전체 6장르 퍼스널 컬러", "365일 개인 맞춤 조언"], cta: "스탠다드 플랜 보기" },
      { id: "vip", badge: "인기 No.1", name: "VIP 회원", catch: "잠재 능력을 깨우는 개인 최고의 스피리추얼 경험", features: ["솔페지오 주파수 힐링 음원 「별빛 BGM」(전 주파수・백그라운드 재생・뇌파 활용 가이드)", "빠른 궁합 진단 하루 10회", "패밀리 최대 10명 등록", "AI 상담 하루 10회", "고화질 「공명 만다라 아트」 완전 해제·배경화면 저장·SNS 공유", "8방위 길방위 내비게이션", "중요한 날 캘린더 연동", "완전 광고 없음"], cta: "VIP 플랜 보기" },
      { id: "b2b", badge: "소중한 관계", name: "패밀리 회원", catch: "가족·친구·동료의 개성을 살려 관계를 깊게", features: ["솔페지오 주파수 힐링 음원 「별빛 BGM」(전 주파수・백그라운드 재생・뇌파 활용 가이드)", "빠른 궁합 진단 하루 30회", "최대 30명 등록", "AI 상담 하루 30회", "팀·조직 컨설팅 전체 7가지 기능 (동시 진단·AI 인선·인물 명부·알림 캘린더·조직 밸런스·1on1 가이드 등)", "365일 기업 로드맵"], cta: "패밀리 플랜 보기" },
      { id: "b2b-premium", badge: "최상위 플랜", name: "패밀리 프리미엄 회원", catch: "최대 100명의 소중한 관계를 위한 나침반", features: ["솔페지오 주파수 힐링 음원 「별빛 BGM」(전 주파수・백그라운드 재생・뇌파 활용 가이드)", "빠른 궁합 진단 무제한", "최대 100명 등록", "AI 상담 무제한", "100명 규모 조직 컨설팅 완전 지원", "우선 AI 처리 (Priority AI)"], cta: "패밀리 프리미엄 보기" },
    ],
  },
  es: {
    sectionTitle: "Explora el siguiente paso",
    sectionSub: "Cada plan superior conserva todas las ventajas de los planes inferiores y suma funciones exclusivas y análisis más profundos.",
    dialogNote: "El registro y el pago aún no están disponibles. Esta vista es una referencia de cada plan; tu membresía actual no cambia aquí.",
    close: "Cerrar",
    nextStepNote: "Los planes se muestran como referencia y no están vinculados a un registro o pago real.",
    cards: [
      { id: "standard", badge: "Recomendado", name: "Estándar", catch: "El plan esencial para profundizar tus vínculos contigo y con los demás", features: ["Compatibilidad rápida: 3/día", "Hasta 3 familiares registrados", "Consulta de IA: 3 veces al día", "Compatibilidad y manual detallado sin límites", "Los 6 géneros de colores personales", "365 días de consejos personales"], cta: "Ver el plan Estándar" },
      { id: "vip", badge: "N.º1 en popularidad", name: "VIP", catch: "La máxima experiencia espiritual para despertar tu potencial", features: ["Sonido sanador Solfeggio «BGM celeste» (todas las Hz, segundo plano y guía de ondas cerebrales)", "Compatibilidad rápida: 10/día", "Hasta 10 familiares registrados", "Consulta de IA: 10 veces al día", "Arte mandala de resonancia en HD, fondos y compartir en redes", "Navegador de direcciones auspiciosas de 8 rumbos", "Sincronización de días clave", "Completamente sin anuncios"], cta: "Ver el plan VIP" },
      { id: "b2b", badge: "Para tus seres queridos", name: "Familia", catch: "Potencia a familiares, amistades y colegas", features: ["Sonido sanador Solfeggio «BGM celeste» (todas las Hz, segundo plano y guía de ondas cerebrales)", "Compatibilidad rápida: 30/día", "Hasta 30 personas registradas", "Consulta de IA: 30 veces al día", "Las 7 herramientas de consultoría de equipo y organización (diagnóstico simultáneo, selección con IA, catálogo de talentos, calendario de alertas, equilibrio organizativo, manual 1a1 y más)", "Hoja de ruta empresarial de 365 días"], cta: "Ver el plan Familia" },
      { id: "b2b-premium", badge: "Plan insignia", name: "Familia Premium", catch: "Una brújula para hasta 100 vínculos importantes", features: ["Sonido sanador Solfeggio «BGM celeste» (todas las Hz, segundo plano y guía de ondas cerebrales)", "Compatibilidad rápida: sin límite", "Hasta 100 personas registradas", "Consulta de IA ilimitada", "Consultoría completa para organizaciones de hasta 100 personas", "Procesamiento de IA prioritario"], cta: "Ver Familia Premium" },
    ],
  },
  fr: {
    sectionTitle: "Explorez la suite",
    sectionSub: "Chaque offre supérieure conserve tous les avantages des offres inférieures et ajoute des fonctions exclusives et des analyses plus poussées.",
    dialogNote: "L'inscription et le paiement ne sont pas encore ouverts. Cet affichage est une référence des plans ; votre abonnement actuel ne change pas ici.",
    close: "Fermer",
    nextStepNote: "Les plans sont présentés à titre indicatif et ne sont pas liés à une inscription ou un paiement réel.",
    cards: [
      { id: "standard", badge: "Recommandé", name: "Standard", catch: "Le plan essentiel pour approfondir vos liens avec vous-même et les autres", features: ["Affinités rapides : 3/jour", "Jusqu'à 3 proches inscrits", "Consultation IA : 3 fois par jour", "Affinités et manuel détaillé illimités", "Les 6 genres de couleurs personnelles", "365 jours de conseils personnels"], cta: "Voir le plan Standard" },
      { id: "vip", badge: "Nº1 de la popularité", name: "VIP", catch: "L'expérience spirituelle personnelle la plus haute pour éveiller votre potentiel", features: ["Son de guérison Solfeggio « BGM céleste » (toutes fréquences, arrière-plan, guide des ondes cérébrales)", "Affinités rapides : 10/jour", "Jusqu'à 10 proches inscrits", "Consultation IA : 10 fois par jour", "Art mandala de résonance en HD, fonds d'écran et partage sur les réseaux", "Navigateur des directions favorables en 8 points", "Synchronisation des jours décisifs", "Entièrement sans publicité"], cta: "Voir le plan VIP" },
      { id: "b2b", badge: "Pour vos proches", name: "Famille", catch: "Révéler les forces de vos proches, amis et collègues", features: ["Son de guérison Solfeggio « BGM céleste » (toutes fréquences, arrière-plan, guide des ondes cérébrales)", "Affinités rapides : 30/jour", "Jusqu'à 30 personnes inscrites", "Consultation IA : 30 fois par jour", "Les 7 outils de conseil d'équipe et d'organisation (diagnostic simultané, sélection IA, catalogue de talents, calendrier d'alertes, équilibre organisationnel, guide 1à1, etc.)", "Feuille de route d'entreprise sur 365 jours"], cta: "Voir le plan Famille" },
      { id: "b2b-premium", badge: "Plan phare", name: "Famille Premium", catch: "Une boussole pour 100 liens importants", features: ["Son de guérison Solfeggio « BGM céleste » (toutes fréquences, arrière-plan, guide des ondes cérébrales)", "Affinités rapides : illimité", "Jusqu'à 100 personnes inscrites", "Consultation IA illimitée", "Conseil complet pour les organisations jusqu'à 100 personnes", "Traitement IA prioritaire"], cta: "Voir Famille Premium" },
    ],
  },
};
