import type { Language } from "./translations";
import { billingPlans } from "./billing-plans";
import { planBenefits } from "./plan-benefits";
import { appearanceUiCopy } from "./appearance-ui-copy";
type HelpCopy = { chat: string; faq: string; newThread: string; history: string; escalate: string; placeholder: string; thinking: string; send: string; stop: string; privacy: string; signin: string; error: string; retry: string; portal: string; portalDetail: string; noContract: string; settings: string; reasoning: string; escalationNotice: string; account: string; plans: string; billing: string; readings: string };
export const helpCopy: Record<Language, HelpCopy> = {
  "ja": {
    "chat": "AIサポートチャット",
    "faq": "よくある質問",
    "newThread": "新しい相談",
    "history": "相談履歴",
    "escalate": "運営者に問い合わせる",
    "placeholder": "質問を入力してください",
    "thinking": "回答を準備中…",
    "send": "送信",
    "stop": "停止",
    "privacy": "保存された会話は、ご本人だけが閲覧できます。パスワードやカード番号は入力しないでください。",
    "signin": "サインインしてAIサポートを利用",
    "error": "履歴を読み込めませんでした。再試行してください。",
    "retry": "再試行",
    "portal": "アカウント管理（Stripeポータル）",
    "portalDetail": "プラン変更・カード変更・解約",
    "noContract": "Stripe契約がない場合は、購入画面からプランを選択してください。",
    "settings": "設定",
    "reasoning": "回答の検討",
    "escalationNotice": "運営者への確認が必要です。",
    "account": "アカウント",
    "plans": "プラン",
    "billing": "決済・解約",
    "readings": "占いについて"
  },
  "en": {
    "chat": "AI support chat",
    "faq": "Frequently asked questions",
    "newThread": "New conversation",
    "history": "Conversations",
    "escalate": "Contact the administrator",
    "placeholder": "Enter your question",
    "thinking": "Preparing an answer…",
    "send": "Send",
    "stop": "Stop",
    "privacy": "Saved conversations are private to you. Do not enter passwords or card numbers.",
    "signin": "Sign in to use AI support",
    "error": "Could not load history. Please retry.",
    "retry": "Retry",
    "portal": "Account management (Stripe portal)",
    "portalDetail": "Change plan, card or cancel",
    "noContract": "If you have no Stripe subscription, choose a plan on the purchase page.",
    "settings": "Settings",
    "reasoning": "Considering your question",
    "escalationNotice": "Administrator review is needed.",
    "account": "Account",
    "plans": "Plans",
    "billing": "Payments & cancellation",
    "readings": "Readings"
  },
  "zh-CN": {
    "chat": "AI客服聊天",
    "faq": "常见问题",
    "newThread": "新咨询",
    "history": "咨询记录",
    "escalate": "联系管理员",
    "placeholder": "请输入问题",
    "thinking": "正在准备回答…",
    "send": "发送",
    "stop": "停止",
    "privacy": "保存的对话仅本人可查看。请勿输入密码或卡号。",
    "signin": "登录后使用AI客服",
    "error": "无法加载记录，请重试。",
    "retry": "重试",
    "portal": "账户管理（Stripe门户）",
    "portalDetail": "更改方案、卡片或取消",
    "noContract": "没有Stripe订阅时，请在购买页面选择方案。",
    "settings": "设置",
    "reasoning": "正在考虑问题",
    "escalationNotice": "需要管理员确认。",
    "account": "账户",
    "plans": "方案",
    "billing": "付款与取消",
    "readings": "占术"
  },
  "zh-TW": {
    "chat": "AI客服聊天",
    "faq": "常見問題",
    "newThread": "新諮詢",
    "history": "諮詢記錄",
    "escalate": "聯絡管理員",
    "placeholder": "請輸入問題",
    "thinking": "正在準備回答…",
    "send": "傳送",
    "stop": "停止",
    "privacy": "儲存的對話僅本人可查看。請勿輸入密碼或卡號。",
    "signin": "登入後使用AI客服",
    "error": "無法載入記錄，請重試。",
    "retry": "重試",
    "portal": "帳戶管理（Stripe入口）",
    "portalDetail": "變更方案、卡片或取消",
    "noContract": "沒有Stripe訂閱時，請在購買頁面選擇方案。",
    "settings": "設定",
    "reasoning": "正在考慮問題",
    "escalationNotice": "需要管理員確認。",
    "account": "帳戶",
    "plans": "方案",
    "billing": "付款與取消",
    "readings": "占術"
  },
  "ko": {
    "chat": "AI 고객 지원 채팅",
    "faq": "자주 묻는 질문",
    "newThread": "새 문의",
    "history": "문의 내역",
    "escalate": "관리자에게 문의",
    "placeholder": "질문을 입력하세요",
    "thinking": "답변 준비 중…",
    "send": "전송",
    "stop": "중지",
    "privacy": "저장된 대화는 본인만 볼 수 있습니다. 비밀번호나 카드 번호를 입력하지 마세요.",
    "signin": "로그인 후 AI 지원 이용",
    "error": "내역을 불러오지 못했습니다. 다시 시도하세요.",
    "retry": "다시 시도",
    "portal": "계정 관리 (Stripe 포털)",
    "portalDetail": "플랜·카드 변경 및 해지",
    "noContract": "Stripe 구독이 없으면 구매 화면에서 플랜을 선택하세요.",
    "settings": "설정",
    "reasoning": "질문 검토 중",
    "escalationNotice": "관리자 확인이 필요합니다.",
    "account": "계정",
    "plans": "플랜",
    "billing": "결제 및 해지",
    "readings": "점술"
  },
  "es": {
    "chat": "Chat de soporte IA",
    "faq": "Preguntas frecuentes",
    "newThread": "Nueva consulta",
    "history": "Consultas",
    "escalate": "Contactar al administrador",
    "placeholder": "Escribe tu pregunta",
    "thinking": "Preparando respuesta…",
    "send": "Enviar",
    "stop": "Detener",
    "privacy": "Solo tú puedes ver las conversaciones guardadas. No introduzcas contraseñas ni números de tarjeta.",
    "signin": "Inicia sesión para usar el soporte IA",
    "error": "No se pudo cargar el historial. Reintenta.",
    "retry": "Reintentar",
    "portal": "Gestión de cuenta (portal Stripe)",
    "portalDetail": "Cambiar plan, tarjeta o cancelar",
    "noContract": "Sin suscripción Stripe, elige un plan en la página de compra.",
    "settings": "Ajustes",
    "reasoning": "Revisando tu pregunta",
    "escalationNotice": "Se necesita revisión del administrador.",
    "account": "Cuenta",
    "plans": "Planes",
    "billing": "Pagos y cancelación",
    "readings": "Lecturas"
  },
  "fr": {
    "chat": "Chat d’assistance IA",
    "faq": "Questions fréquentes",
    "newThread": "Nouvelle demande",
    "history": "Conversations",
    "escalate": "Contacter l’administrateur",
    "placeholder": "Saisissez votre question",
    "thinking": "Préparation de la réponse…",
    "send": "Envoyer",
    "stop": "Arrêter",
    "privacy": "Les conversations enregistrées sont privées. Ne saisissez ni mot de passe ni numéro de carte.",
    "signin": "Connectez-vous pour utiliser l’assistance IA",
    "error": "Impossible de charger l’historique. Réessayez.",
    "retry": "Réessayer",
    "portal": "Gestion du compte (portail Stripe)",
    "portalDetail": "Changer de forfait, carte ou résilier",
    "noContract": "Sans abonnement Stripe, choisissez un forfait sur la page d’achat.",
    "settings": "Réglages",
    "reasoning": "Examen de votre question",
    "escalationNotice": "Une vérification de l’administrateur est nécessaire.",
    "account": "Compte",
    "plans": "Forfaits",
    "billing": "Paiements et résiliation",
    "readings": "Lectures"
  }
};
export const helpQuestions: Record<Language, [string, string][]> = {
  "ja": [
    [
      "ログインとデータ保存は？",
      "アプリの設定にあるログインからサインインしてください。ログイン中のプロフィールは本人専用に保存されます。未ログインの入力はこの端末のみで、ログアウト時は端末の個人データが消去されます。"
    ],
    [
      "プロフィールを変更するには？",
      "設定のアカウント編集から出生情報を修正できます。出生時刻が不明な場合は不明を選び、推測の時刻を入力しないでください。"
    ],
    [
      "各プランで使える機能は？",
      "プランごとの機能と料金は以下の比較をご確認ください。AIサポートは占いのAI相談とは別で、占い相談の回数を消費しません。"
    ],
    [
      "プランの表示が変わらないときは？",
      "購入画面の「契約状況を再確認」を押してください。決済完了・有効期限が確認できた契約だけが反映されます。表示用のプレビューは購入ではありません。"
    ],
    [
      "カード変更・プラン変更・解約は？",
      "設定の「アカウント管理（Stripeポータル）」から行います。解約は支払済み期間の終了時に適用され、それまでは利用できます。変更の適用日と請求額はStripeの確認画面で確かめてください。"
    ],
    [
      "返金・二重請求・未反映は？",
      "デジタルコンテンツの購入後返金は原則不可ですが、法令上の権利は除外されません。二重請求など個別調査が必要な場合は運営者への問い合わせへ進んでください。カード番号は送らないでください。"
    ],
    [
      "占いは未来や健康効果を保証しますか？",
      "いいえ。17占術とAIの診断は自己探求・娯楽の参考です。バイオリズムや色の象徴は医学的診断ではありません。医療・法律・税務・投資の専門家の助言に代わるものではありません。"
    ],
    [
      "診断対象や通知を変更するには？",
      "設定の目的・目標と診断対象で本人・関係者・グループを選びます。個別通知は「今日」、通知の一時停止と文字サイズは設定、言語とBGMは上部から変更できます。"
    ]
  ],
  "en": [
    [
      "How do sign-in and storage work?",
      "Sign in from the app’s Settings. Signed-in profiles are private to their owner. Guest inputs stay on this device; signing out clears local personal copies."
    ],
    [
      "How do I edit my profile?",
      "Edit your birth information in Settings account editing. Select unknown when your birth time is unavailable rather than guessing."
    ],
    [
      "What does each plan include?",
      "See the feature and price comparison below. AI support is separate from reading consultation and does not consume its allowance."
    ],
    [
      "Why has my plan not updated?",
      "Use Refresh subscription on the purchase page. Only verified completed payments within their valid period grant access. Display previews are not purchases."
    ],
    [
      "How do I change my card, plan or cancel?",
      "Open Account management (Stripe portal) in Settings. Cancellation takes effect at the paid period’s end; access continues until then. Check effective dates and charges in Stripe before confirming changes."
    ],
    [
      "What about refunds, duplicate charges or missing access?",
      "Digital purchases are generally non-refundable, without excluding statutory rights. Send individual billing investigations to the administrator. Never send card numbers."
    ],
    [
      "Do readings guarantee the future or health effects?",
      "No. The 17 arts and AI offer entertainment and self-reflection. Biorhythm and color symbolism are not medical diagnosis or professional medical, legal, tax or investment advice."
    ],
    [
      "How do I change subjects and notifications?",
      "Choose self, related people or a group in Settings goals/subject. Per-reading reminders are under Today; notification pause and text size are in Settings; language and BGM are at the top."
    ]
  ],
  "zh-CN": [
    [
      "如何登录与保存数据？",
      "从应用设置登录。登录后的资料仅本人可访问；访客输入保存在当前设备，退出登录时清除本地个人副本。"
    ],
    [
      "如何修改资料？",
      "在设置的账户编辑中修改出生信息。出生时间未知时选择未知，不要猜测。"
    ],
    [
      "各方案包含什么？",
      "请查看下方功能和价格比较。AI客服与占术AI咨询独立，不消耗占术咨询次数。"
    ],
    [
      "方案尚未更新怎么办？",
      "在购买页面重新确认订阅。仅确认付款完成且有效期内的订阅授予权限，显示预览不属于购买。"
    ],
    [
      "如何更换卡片、方案或取消？",
      "在设置打开Stripe账户管理。取消于已付期间结束时生效，此前可继续使用；确认变更前请查看生效日期和费用。"
    ],
    [
      "退款、重复扣款或权限未更新？",
      "数字内容原则上不退款，但不排除法定权利。个别账单问题请联系管理员，勿发送卡号。"
    ],
    [
      "占术保证未来或健康效果吗？",
      "不保证。17种占术与AI用于娱乐和自我探索，节律和颜色象征不是医学诊断，也不替代医疗、法律、税务或投资建议。"
    ],
    [
      "如何更换对象和通知？",
      "在设置的目标与诊断对象中选择本人、相关人士或群组。个别提醒在今日，暂停通知和字号在设置，语言与BGM在顶部。"
    ]
  ],
  "zh-TW": [
    [
      "如何登入與儲存資料？",
      "從應用程式設定登入。登入後的資料僅本人可存取；訪客輸入保存在此裝置，登出時清除本地個人副本。"
    ],
    [
      "如何修改資料？",
      "在設定的帳戶編輯修改出生資訊。出生時間未知時選擇未知，不要猜測。"
    ],
    [
      "各方案包含什麼？",
      "請查看下方功能與價格比較。AI客服與占術AI諮詢獨立，不消耗占術諮詢次數。"
    ],
    [
      "方案尚未更新怎麼辦？",
      "在購買頁面重新確認訂閱。僅付款完成且有效期內的訂閱授予權限，顯示預覽不屬於購買。"
    ],
    [
      "如何更換卡片、方案或取消？",
      "在設定開啟Stripe帳戶管理。取消於已付期間結束時生效，此前可繼續使用；確認變更前請查看生效日期與費用。"
    ],
    [
      "退款、重複扣款或權限未更新？",
      "數位內容原則上不退款，但不排除法定權利。個別帳單問題請聯絡管理員，勿傳送卡號。"
    ],
    [
      "占術保證未來或健康效果嗎？",
      "不保證。17種占術與AI用於娛樂和自我探索，節律與顏色象徵不是醫學診斷，也不取代醫療、法律、稅務或投資建議。"
    ],
    [
      "如何更換對象與通知？",
      "在設定的目標與診斷對象選擇本人、相關人士或群組。個別提醒在今日，暫停通知與字級在設定，語言與BGM在頂部。"
    ]
  ],
  "ko": [
    [
      "로그인과 저장은 어떻게 하나요?",
      "앱 설정에서 로그인하세요. 로그인 프로필은 본인만 접근합니다. 비로그인 입력은 현재 기기에 저장되며 로그아웃하면 로컬 개인 사본을 지웁니다."
    ],
    [
      "프로필을 어떻게 수정하나요?",
      "설정의 계정 편집에서 출생 정보를 수정하세요. 시간을 모르면 추측하지 말고 알 수 없음을 선택하세요."
    ],
    [
      "플랜별 기능은 무엇인가요?",
      "아래 기능과 요금 비교를 확인하세요. AI 지원은 점술 상담과 별개이며 상담 횟수를 차감하지 않습니다."
    ],
    [
      "플랜이 갱신되지 않으면?",
      "구매 화면에서 계약 상태를 다시 확인하세요. 결제 완료와 유효 기간이 확인된 계약만 권한을 줍니다. 표시 미리보기는 구매가 아닙니다."
    ],
    [
      "카드·플랜 변경이나 해지는?",
      "설정에서 Stripe 계정 관리를 여세요. 해지는 결제된 기간 종료 시 적용되며 그때까지 사용할 수 있습니다. 변경 전 적용일과 금액을 확인하세요."
    ],
    [
      "환불·중복 결제·권한 오류는?",
      "디지털 구매는 원칙적으로 환불 불가이나 법적 권리는 제외되지 않습니다. 개별 결제 문제는 관리자에게 문의하고 카드 번호는 보내지 마세요."
    ],
    [
      "미래나 건강 효과를 보장하나요?",
      "아니요. 17가지 점술과 AI는 오락과 자기 탐색 참고용입니다. 리듬과 색 상징은 의학 진단이나 의료·법률·세무·투자 조언이 아닙니다."
    ],
    [
      "대상과 알림 변경은?",
      "설정의 목표·진단 대상에서 본인·관계자·그룹을 선택하세요. 개별 알림은 오늘, 일시 중지와 글자 크기는 설정, 언어와 BGM은 상단에 있습니다."
    ]
  ],
  "es": [
    [
      "¿Cómo funcionan el acceso y los datos?",
      "Inicia sesión en Ajustes. El perfil conectado es privado. Los datos de invitado quedan en este dispositivo; cerrar sesión borra las copias personales locales."
    ],
    [
      "¿Cómo edito el perfil?",
      "Edita los datos de nacimiento en los ajustes de cuenta. Si no sabes la hora, indica desconocida sin inventarla."
    ],
    [
      "¿Qué incluye cada plan?",
      "Consulta las funciones y precios abajo. El soporte IA es independiente y no consume consultas de lectura."
    ],
    [
      "¿Por qué no se actualiza el plan?",
      "Actualiza el estado en la página de compra. Solo pagos completados y vigentes conceden acceso; las vistas previas no son compras."
    ],
    [
      "¿Cómo cambio tarjeta, plan o cancelo?",
      "Abre el portal Stripe desde Ajustes. La cancelación se aplica al finalizar el período pagado; conservas acceso hasta entonces. Revisa fechas y cargos antes de confirmar cambios."
    ],
    [
      "¿Reembolsos, cargos duplicados o acceso pendiente?",
      "Las compras digitales generalmente no son reembolsables, sin excluir derechos legales. Contacta al administrador para investigar cobros individuales. No envíes números de tarjeta."
    ],
    [
      "¿Garantizan futuro o salud?",
      "No. Las 17 artes y la IA son entretenimiento y reflexión. Ritmos y colores no son diagnósticos ni sustituyen asesoría médica, legal, fiscal o de inversión."
    ],
    [
      "¿Cómo cambio el sujeto y avisos?",
      "Elige persona o grupo en objetivos de Ajustes. Avisos individuales en Hoy; pausa y tamaño de texto en Ajustes; idioma y BGM arriba."
    ]
  ],
  "fr": [
    [
      "Comment fonctionnent la connexion et les données ?",
      "Connectez-vous dans Réglages. Le profil connecté est privé. Les données invité restent sur cet appareil ; la déconnexion efface les copies personnelles locales."
    ],
    [
      "Comment modifier le profil ?",
      "Modifiez les données de naissance dans les réglages du compte. Si l’heure est inconnue, indiquez-le sans l’inventer."
    ],
    [
      "Que comprend chaque forfait ?",
      "Consultez les fonctions et tarifs ci-dessous. L’assistance IA est distincte des consultations et ne consomme pas leur quota."
    ],
    [
      "Pourquoi le forfait ne change-t-il pas ?",
      "Actualisez l’abonnement sur la page d’achat. Seuls les paiements vérifiés et valides donnent accès ; un aperçu n’est pas un achat."
    ],
    [
      "Comment changer carte, forfait ou résilier ?",
      "Ouvrez le portail Stripe dans Réglages. La résiliation prend effet à la fin de la période payée ; l’accès continue jusque-là. Vérifiez dates et montants avant confirmation."
    ],
    [
      "Remboursement, double débit ou accès manquant ?",
      "Les achats numériques sont généralement non remboursables sans exclure les droits légaux. Contactez l’administrateur pour les cas individuels ; ne transmettez jamais de numéro de carte."
    ],
    [
      "Les lectures garantissent-elles l’avenir ou la santé ?",
      "Non. Les 17 arts et l’IA servent au divertissement et à la réflexion. Rythmes et couleurs ne remplacent ni diagnostic médical ni conseils juridiques, fiscaux ou financiers."
    ],
    [
      "Comment changer le sujet et les rappels ?",
      "Choisissez personne ou groupe dans les objectifs des Réglages. Rappels individuels dans Aujourd’hui ; pause et taille du texte dans Réglages ; langue et BGM en haut."
    ]
  ]
};
export function helpPlanCatalogue(language: Language) { return (["free", "standard", "vip", "b2b", "b2b-premium"] as const).map(plan => ({ plan, name: appearanceUiCopy[language].plans[plan], prices: billingPlans.find(p => p.plan === plan), benefits: planBenefits(plan, language) })); }
