import type { Language } from "./translations";

export type SettingsTranslation = {
  title: string; guest: string; planFree: string; planVip: string; planB2b: string;
  planTest: string; planTestNote: string;
  membership: string; free: string; vip: string; benefits: [string, string, string];
  freeValues: [string, string, string]; vipValues: [string, string, string];
  upgrade: string; upgradeNote: string;
  b2bTitle: string; personal: string; b2b: string; b2bSample: string;
  team: string; roles: [string, string, string, string];
  matrix: string; roleMap: string; roleAreas: [string, string, string, string];
  calendar: string; push: "攻め" | string; hold: string; calm: string;
  account: string; editBirth: string; language: string;
  notifications: string; notifyTiming: string; notifyBio: string; notifyNote: string;
  terms: string; privacy: string; help: string; soon: string;
};

const ja: SettingsTranslation = {
  title: "マイページ・設定", guest: "ゲストユーザー", planFree: "無料プラン", planVip: "VIP Member", planB2b: "B2B Enterprise Mode",
  planTest: "プラン表示テスト", planTestNote: "表示確認用です。実際の会員機能は解放されません。",
  membership: "会員プラン", free: "無料", vip: "VIP", benefits: ["AI相談", "曼陀羅の高解像度保存", "生誕九星配置アート"],
  freeValues: ["1日2回", "—", "ロック"], vipValues: ["無制限", "対応", "全解放"],
  upgrade: "月額VIPプランに登録する (初回7日間無料)", upgradeNote: "VIPプランの登録受付は準備中です。",
  b2bTitle: "BtoB 組織相性モード", personal: "個人モード", b2b: "B2B 組織コンサルティングモード", b2bSample: "サンプルチームによるイメージ表示です。実際の解析ではありません。",
  team: "チームメンバー", roles: ["経営者", "マネージャー", "メンバー", "メンバー"],
  matrix: "チーム相性マトリクス", roleMap: "最適役割分担マップ (15占術×動物占い)", roleAreas: ["ビジョン策定", "推進・実行", "調整・対人", "分析・品質"],
  calendar: "チーム決断タイミング", push: "攻め", hold: "保留", calm: "守り",
  account: "アカウント・アプリ設定", editBirth: "生年月日・プロフィールを編集", language: "表示言語",
  notifications: "プッシュ通知", notifyTiming: "今日の決断タイミング通知", notifyBio: "バイオリズムアラート", notifyNote: "通知の配信は準備中です。設定は画面を開いている間のみ保持されます。",
  terms: "利用規約", privacy: "プライバシーポリシー", help: "ヘルプ・サポート", soon: "このページは準備中です。",
};

const en: SettingsTranslation = {
  title: "My Page & Settings", guest: "Guest User", planFree: "Free Plan", planVip: "VIP Member", planB2b: "B2B Enterprise Mode",
  planTest: "Plan display test", planTestNote: "For preview only. No membership features are unlocked.",
  membership: "Membership", free: "Free", vip: "VIP", benefits: ["AI consultation", "High-res Mandala downloads", "Natal Nine Stars Chart"],
  freeValues: ["2 / day", "—", "Locked"], vipValues: ["Unlimited", "Included", "Unlocked"],
  upgrade: "Start Monthly VIP (7-day free trial)", upgradeNote: "VIP sign-up is not open yet.",
  b2bTitle: "B2B Team Compatibility Mode", personal: "Personal", b2b: "B2B Organization Consulting", b2bSample: "Illustrative sample team, not an actual analysis.",
  team: "Team Members", roles: ["Executive", "Manager", "Member", "Member"],
  matrix: "Team Compatibility Matrix", roleMap: "Optimal Role Map (15 Arts × Animal Horoscope)", roleAreas: ["Vision", "Drive & Execution", "Coordination", "Analysis & Quality"],
  calendar: "Team Decision Timing", push: "Push", hold: "Hold", calm: "Guard",
  account: "Account & App Settings", editBirth: "Edit birth data & profile", language: "Language",
  notifications: "Push Notifications", notifyTiming: "Daily decision timing", notifyBio: "Biorhythm alerts", notifyNote: "Notifications are not delivered yet. Settings last only while this screen is open.",
  terms: "Terms of Service", privacy: "Privacy Policy", help: "Help & Support", soon: "This page is coming soon.",
};

const zhCN: SettingsTranslation = {
  title: "我的页面·设置", guest: "访客用户", planFree: "免费方案", planVip: "VIP 会员", planB2b: "B2B 企业模式",
  planTest: "方案显示测试", planTestNote: "仅供预览，不会解锁会员功能。",
  membership: "会员方案", free: "免费", vip: "VIP", benefits: ["AI 咨询", "曼陀罗高清下载", "出生九星配置图"],
  freeValues: ["每日2次", "—", "锁定"], vipValues: ["无限", "支持", "全部解锁"],
  upgrade: "开通月度VIP（首7天免费）", upgradeNote: "VIP 注册尚未开放。",
  b2bTitle: "B2B 组织相性模式", personal: "个人模式", b2b: "B2B 组织咨询模式", b2bSample: "示例团队的示意展示，并非实际分析。",
  team: "团队成员", roles: ["经营者", "经理", "成员", "成员"],
  matrix: "团队相性矩阵", roleMap: "最佳角色分配图（15占术×动物占卜）", roleAreas: ["愿景制定", "推进执行", "协调沟通", "分析品质"],
  calendar: "团队决策时机", push: "进攻", hold: "观望", calm: "防守",
  account: "账户·应用设置", editBirth: "编辑出生资料", language: "显示语言",
  notifications: "推送通知", notifyTiming: "今日决策时机通知", notifyBio: "生物节律提醒", notifyNote: "通知尚未发送，设置仅在此页面打开期间保留。",
  terms: "服务条款", privacy: "隐私政策", help: "帮助与支持", soon: "此页面准备中。",
};

const zhTW: SettingsTranslation = {
  ...zhCN,
  title: "我的頁面·設定", guest: "訪客使用者", planFree: "免費方案", planVip: "VIP 會員", planB2b: "B2B 企業模式",
  planTest: "方案顯示測試", planTestNote: "僅供預覽，不會解鎖會員功能。",
  membership: "會員方案", free: "免費", benefits: ["AI 諮詢", "曼陀羅高解析下載", "出生九星配置圖"],
  freeValues: ["每日2次", "—", "鎖定"], vipValues: ["無限", "支援", "全部解鎖"],
  upgrade: "開通月費VIP（首7天免費）", upgradeNote: "VIP 註冊尚未開放。",
  b2bTitle: "B2B 組織相性模式", personal: "個人模式", b2b: "B2B 組織顧問模式", b2bSample: "範例團隊的示意展示，並非實際分析。",
  team: "團隊成員", roles: ["經營者", "經理", "成員", "成員"],
  matrix: "團隊相性矩陣", roleMap: "最佳角色分配圖（15占術×動物占卜）", roleAreas: ["願景制定", "推進執行", "協調溝通", "分析品質"],
  calendar: "團隊決策時機", push: "進攻", hold: "觀望", calm: "防守",
  account: "帳戶·應用設定", editBirth: "編輯出生資料", language: "顯示語言",
  notifications: "推播通知", notifyTiming: "今日決策時機通知", notifyBio: "生物節律提醒", notifyNote: "通知尚未發送，設定僅在此頁面開啟期間保留。",
  terms: "服務條款", privacy: "隱私權政策", help: "說明與支援", soon: "此頁面準備中。",
};

const ko: SettingsTranslation = {
  title: "마이페이지·설정", guest: "게스트 사용자", planFree: "무료 플랜", planVip: "VIP 멤버", planB2b: "B2B 엔터프라이즈 모드",
  planTest: "플랜 표시 테스트", planTestNote: "미리보기 전용이며 회원 기능은 해제되지 않습니다.",
  membership: "멤버십", free: "무료", vip: "VIP", benefits: ["AI 상담", "만다라 고해상도 저장", "출생 구성 배치 아트"],
  freeValues: ["하루 2회", "—", "잠금"], vipValues: ["무제한", "지원", "전체 해제"],
  upgrade: "월간 VIP 가입 (첫 7일 무료)", upgradeNote: "VIP 가입은 아직 준비 중입니다.",
  b2bTitle: "B2B 조직 궁합 모드", personal: "개인 모드", b2b: "B2B 조직 컨설팅 모드", b2bSample: "샘플 팀의 예시 화면이며 실제 분석이 아닙니다.",
  team: "팀 멤버", roles: ["경영자", "매니저", "멤버", "멤버"],
  matrix: "팀 궁합 매트릭스", roleMap: "최적 역할 분담 맵 (15점술×동물점)", roleAreas: ["비전 수립", "추진·실행", "조율·대인", "분석·품질"],
  calendar: "팀 결정 타이밍", push: "공격", hold: "보류", calm: "수비",
  account: "계정·앱 설정", editBirth: "출생 정보·프로필 편집", language: "표시 언어",
  notifications: "푸시 알림", notifyTiming: "오늘의 결정 타이밍 알림", notifyBio: "바이오리듬 알림", notifyNote: "알림은 아직 발송되지 않으며 설정은 이 화면을 연 동안만 유지됩니다.",
  terms: "이용약관", privacy: "개인정보처리방침", help: "도움말·지원", soon: "이 페이지는 준비 중입니다.",
};

const es: SettingsTranslation = {
  title: "Mi página y ajustes", guest: "Usuario invitado", planFree: "Plan gratuito", planVip: "Miembro VIP", planB2b: "Modo B2B Empresa",
  planTest: "Prueba de visualización del plan", planTestNote: "Solo vista previa. No desbloquea funciones.",
  membership: "Membresía", free: "Gratis", vip: "VIP", benefits: ["Consulta con IA", "Descargas de Mandala en alta resolución", "Carta natal de las Nueve Estrellas"],
  freeValues: ["2 / día", "—", "Bloqueado"], vipValues: ["Ilimitado", "Incluido", "Desbloqueado"],
  upgrade: "Suscribirse a VIP mensual (7 días gratis)", upgradeNote: "La suscripción VIP aún no está disponible.",
  b2bTitle: "Modo de compatibilidad de equipos B2B", personal: "Personal", b2b: "Consultoría organizacional B2B", b2bSample: "Equipo de ejemplo ilustrativo, no un análisis real.",
  team: "Miembros del equipo", roles: ["Directivo", "Gerente", "Miembro", "Miembro"],
  matrix: "Matriz de compatibilidad", roleMap: "Mapa de roles óptimos (15 artes × horóscopo animal)", roleAreas: ["Visión", "Ejecución", "Coordinación", "Análisis y calidad"],
  calendar: "Momentos de decisión del equipo", push: "Avanzar", hold: "Esperar", calm: "Proteger",
  account: "Cuenta y aplicación", editBirth: "Editar datos de nacimiento", language: "Idioma",
  notifications: "Notificaciones", notifyTiming: "Momento de decisión diario", notifyBio: "Alertas de biorritmo", notifyNote: "Las notificaciones aún no se envían. Los ajustes duran mientras esta pantalla esté abierta.",
  terms: "Términos del servicio", privacy: "Política de privacidad", help: "Ayuda y soporte", soon: "Esta página llegará pronto.",
};

const fr: SettingsTranslation = {
  title: "Ma page et réglages", guest: "Invité", planFree: "Offre gratuite", planVip: "Membre VIP", planB2b: "Mode Entreprise B2B",
  planTest: "Test d'affichage de l'offre", planTestNote: "Aperçu uniquement. Aucune fonctionnalité n'est débloquée.",
  membership: "Abonnement", free: "Gratuit", vip: "VIP", benefits: ["Consultation IA", "Téléchargements Mandala HD", "Carte natale des Neuf Étoiles"],
  freeValues: ["2 / jour", "—", "Verrouillé"], vipValues: ["Illimité", "Inclus", "Débloqué"],
  upgrade: "S'abonner au VIP mensuel (7 jours offerts)", upgradeNote: "L'abonnement VIP n'est pas encore ouvert.",
  b2bTitle: "Mode compatibilité d'équipe B2B", personal: "Personnel", b2b: "Conseil organisationnel B2B", b2bSample: "Équipe fictive à titre d'illustration, pas une analyse réelle.",
  team: "Membres de l'équipe", roles: ["Dirigeant", "Manager", "Membre", "Membre"],
  matrix: "Matrice de compatibilité", roleMap: "Carte des rôles (15 arts × horoscope animal)", roleAreas: ["Vision", "Exécution", "Coordination", "Analyse et qualité"],
  calendar: "Calendrier des décisions", push: "Agir", hold: "Attendre", calm: "Protéger",
  account: "Compte et application", editBirth: "Modifier les données de naissance", language: "Langue",
  notifications: "Notifications", notifyTiming: "Moment de décision du jour", notifyBio: "Alertes biorythme", notifyNote: "Les notifications ne sont pas encore envoyées. Les réglages durent tant que cet écran est ouvert.",
  terms: "Conditions d'utilisation", privacy: "Politique de confidentialité", help: "Aide et support", soon: "Cette page arrive bientôt.",
};

export const settingsTranslations: Record<Language, SettingsTranslation> = {
  ja, en, "zh-CN": zhCN, "zh-TW": zhTW, ko, es, fr,
};
