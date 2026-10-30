import type { Language } from "./translations";
import { planBenefitsCopy } from './plan-benefits';

export type ConsultationTranslation = {
  title: string;
  signIn?: string;
  subtitle: string;
  active: string;
  engine: string;
  remaining: (count: number) => string;
  vip: string;
  quickLabel: string;
  quick: [string, string, string, string];
  greeting: string;
  placeholder: string;
  send: string;
  thinking: string;
  empty: string;
  limit: string;
  disclaimer: string;
  error: string;
  quickTopics: [string, string, string, string];
  badge: (count: number) => string;
  unlimitedBadge: string;
  bookmark: string;
  bookmarked: string;
  shareCard: string;
  bookmarkError: string;
  bookmarkSignIn: string;
  saved: string;
  modalTitle: string;
  modalBody: string;
  modalCta: string;
  modalClose: string;
  modalNote: string;
  ownerLabel: string;
  targetLabel: string;
};

const baseConsultationTranslations: Record<Language, ConsultationTranslation> = {
  ja: {
    ownerLabel: "あなた",
    targetLabel: "相談する対象",
    title: "アゴルメン相談室",
    subtitle: "決断の輪郭を、静かに照らす",
    active: "稼働中",
    engine: "多層統合占術×動物占い クロス解析AI",
    remaining: (count) => `本日あと ${count} 回 無料で相談可能`,
    vip: "1日10回のAI相談を利用する（VIP特典）",
    quickLabel: "クイック質問",
    quick: [
      "今月の勝負時期は？",
      "新事業の立ち上げタイミング",
      "チームの相性診断",
      "A社とB社の契約タイミングは？",
    ],
    greeting:
      "ようこそ。迷っていることや、決めたいことを聞かせてください。占術の視点は内省のヒントとして扱い、現実的な選択肢と次の一歩を一緒に整理します。",
    placeholder: "あなたの悩みや決断したいことを入力...",
    send: "相談を送る",
    thinking: "方角を読み解いています…",
    empty: "相談内容を入力してください",
    limit: "本日の相談上限に達しました。",
    disclaimer: "AIによる内省サポートです。占術の実計算・未来の保証・専門家の助言ではありません。",
    error: "相談を受け取れませんでした。表示された内容を確認して、もう一度お試しください。",
    quickTopics: [
      "🎯 今日の決断・勝負時のアドバイス",
      "🤝 特定の相手（チーム/ファミリー）との円滑な接し方",
      "🧭 本日の吉方位とおすすめ開運アクション",
      "🧘 今日のエネルギーを整えるリセット法",
    ],
    badge: (count) => `本日の残りAI相談：あと${count}回`,
    unlimitedBadge: "本日のAI相談：無制限",
    bookmark: "お気に入りに保存",
    bookmarked: "お気に入り保存済み",
    shareCard: "カード画像でシェア",
    bookmarkError: "お気に入りを保存できませんでした。もう一度お試しください。",
    bookmarkSignIn: "お気に入り保存にはログインが必要です。",
    saved: "お気に入りに保存しました",
    modalTitle: "本日のAI相談枠を使い切りました",
    modalBody:
      "VIPなら1日10回まで、気になることを続けて相談できます。今日の回数は日付が変わると戻ります。",
    modalCta: "VIPプランを見る",
    modalClose: "明日また相談する",
    modalNote: "現在はプランのご案内のみで、決済は行われません。",
  },
  en: {
    ownerLabel: "You (owner)",
    targetLabel: "Consultation subject",
    title: "Agolmen AI Chamber",
    subtitle: "Bring quiet clarity to your next decision",
    active: "Online",
    engine: "multi-layer arts × animal horoscope reflective AI",
    remaining: (count) => `${count} free consultations remaining today`,
    vip: "10 AI consultations per day (VIP)",
    quickLabel: "Quick questions",
    quick: [
      "When is my key window this month?",
      "Timing for launching a new business",
      "Team compatibility reading",
      "When should I time the contract with Company A or B?",
    ],
    greeting:
      "Welcome. Tell me what feels uncertain or what you need to decide. I’ll use divination themes only as reflective prompts and help organize practical options and a next step.",
    placeholder: "Describe what is troubling you or what you need to decide...",
    send: "Send consultation",
    thinking: "Reading the direction…",
    empty: "Enter a consultation first.",
    limit: "You have used today's AI consultations.",
    disclaimer:
      "AI reflection support only—not a calculated reading, prediction, or professional advice.",
    error: "The consultation could not be completed. Review the message shown and try again.",
    quickTopics: [
      "🎯 Advice for today's decision or key moment",
      "🤝 How to connect smoothly with a team member or family member",
      "🧭 Today's favorable direction and lucky action",
      "🧘 A reset ritual for today's energy",
    ],
    badge: (count) => `AI consultations left today: ${count}`,
    unlimitedBadge: "AI consultations today: unlimited",
    bookmark: "Save to favorites",
    bookmarked: "Saved to favorites",
    shareCard: "Share as image card",
    bookmarkError: "Could not save this favorite. Please try again.",
    bookmarkSignIn: "Sign in to save favorites.",
    saved: "Saved to favorites",
    modalTitle: "Today's AI consultations are complete",
    modalBody:
      "VIP gives you up to 10 consultations a day for follow-up questions. Your count refreshes when the date changes.",
    modalCta: "View VIP",
    modalClose: "Consult again tomorrow",
    modalNote: "This currently shows plan information only; no payment is taken.",
  },
  "zh-CN": {
    ownerLabel: "本人（账户所有者）",
    targetLabel: "咨询对象",
    title: "AI自我咨询室",
    subtitle: "静静照亮你的下一步决定",
    active: "运行中",
    engine: "多层统合占术×动物占卜 反思型AI",
    remaining: (count) => `今日还可免费咨询 ${count} 次`,
    vip: "每天10次AI咨询（VIP特权）",
    quickLabel: "快捷提问",
    quick: ["本月的关键时期是？", "新事业的启动时机", "团队相性诊断", "A公司和B公司的签约时机？"],
    greeting:
      "欢迎。请告诉我你正在犹豫或需要决定的事情。我会把占术主题仅作为反思线索，帮你梳理现实选项与下一步。",
    placeholder: "输入你的烦恼或想决定的事情...",
    send: "发送咨询",
    thinking: "正在解读方向…",
    empty: "请先输入咨询内容。",
    limit: "今日免费咨询次数已用完。",
    disclaimer: "仅为AI反思支持，并非实际占术、未来预测或专业建议。",
    error: "暂时无法完成咨询。请查看提示后重试。",
    quickTopics: [
      "🎯 今日决断与关键时刻建议",
      "🤝 与特定对象（团队/家人）顺畅相处",
      "🧭 今日吉方位与开运行动",
      "🧘 调整今日能量的重置方法",
    ],
    badge: (count) => `今日剩余AI咨询：${count}次`,
    unlimitedBadge: "今日AI咨询：无限",
    bookmark: "收藏",
    bookmarked: "已收藏",
    shareCard: "生成图片卡分享",
    bookmarkError: "无法收藏，请重试。",
    bookmarkSignIn: "登录后即可收藏。",
    saved: "已收藏",
    modalTitle: "今日AI咨询次数已用完",
    modalBody: "VIP每天最多可咨询10次，方便继续追问。日期变更后次数会恢复。",
    modalCta: "查看VIP",
    modalClose: "明天再咨询",
    modalNote: "目前仅提供方案介绍，不会扣款。",
  },
  "zh-TW": {
    ownerLabel: "本人（帳戶擁有人）",
    targetLabel: "諮詢對象",
    title: "AI自我諮詢室",
    subtitle: "靜靜照亮你的下一步決定",
    active: "運行中",
    engine: "多層統合占術×動物占卜 反思型AI",
    remaining: (count) => `今日還可免費諮詢 ${count} 次`,
    vip: "每天10次AI諮詢（VIP特典）",
    quickLabel: "快速提問",
    quick: ["本月的關鍵時期是？", "新事業的啟動時機", "團隊相性診斷", "A公司和B公司的簽約時機？"],
    greeting:
      "歡迎。請告訴我你正在猶豫或需要決定的事情。我會把占術主題僅作為反思線索，幫你整理現實選項與下一步。",
    placeholder: "輸入你的煩惱或想決定的事情...",
    send: "送出諮詢",
    thinking: "正在解讀方向…",
    empty: "請先輸入諮詢內容。",
    limit: "今日免費諮詢次數已用完。",
    disclaimer: "僅為AI反思支援，並非實際占術、未來預測或專業建議。",
    error: "暫時無法完成諮詢。請查看提示後再試。",
    quickTopics: [
      "🎯 今日決斷與關鍵時刻建議",
      "🤝 與特定對象（團隊/家人）順暢相處",
      "🧭 今日吉方位與開運行動",
      "🧘 調整今日能量的重置方法",
    ],
    badge: (count) => `今日剩餘AI諮詢：${count}次`,
    unlimitedBadge: "今日AI諮詢：無限",
    bookmark: "收藏",
    bookmarked: "已收藏",
    shareCard: "製作圖片卡分享",
    bookmarkError: "無法收藏，請再試一次。",
    bookmarkSignIn: "登入後即可收藏。",
    saved: "已收藏",
    modalTitle: "今日AI諮詢次數已用完",
    modalBody: "VIP每天最多可諮詢10次，方便繼續追問。日期變更後次數會恢復。",
    modalCta: "查看VIP",
    modalClose: "明天再諮詢",
    modalNote: "目前僅提供方案介紹，不會扣款。",
  },
  ko: {
    ownerLabel: "본인(계정 소유자)",
    targetLabel: "상담 대상",
    title: "아골멘 AI 상담실",
    subtitle: "다음 결정을 차분히 비춰드립니다",
    active: "가동 중",
    engine: "다층 통합 점술×동물 운세 성찰형 AI",
    remaining: (count) => `오늘 무료 상담 ${count}회 남음`,
    vip: "하루 10회 AI 상담 (VIP 혜택)",
    quickLabel: "빠른 질문",
    quick: [
      "이번 달 승부 시기는?",
      "신사업 시작 타이밍",
      "팀 궁합 진단",
      "A사와 B사의 계약 타이밍은?",
    ],
    greeting:
      "환영합니다. 망설이는 일이나 결정하고 싶은 일을 들려주세요. 점술 주제는 성찰의 힌트로만 활용하고, 현실적인 선택지와 다음 행동을 함께 정리합니다.",
    placeholder: "고민이나 결정하고 싶은 내용을 입력하세요...",
    send: "상담 보내기",
    thinking: "방향을 읽고 있어요…",
    empty: "상담 내용을 먼저 입력하세요.",
    limit: "오늘의 무료 상담을 모두 사용했습니다.",
    disclaimer: "AI 성찰 지원이며 실제 점술 계산, 미래 보장 또는 전문가 조언이 아닙니다.",
    error: "상담을 완료하지 못했습니다. 안내를 확인하고 다시 시도하세요.",
    quickTopics: [
      "🎯 오늘의 결정과 승부 타이밍 조언",
      "🤝 특정 상대(팀/가족)와 원활하게 지내는 법",
      "🧭 오늘의 길한 방향과 개운 행동",
      "🧘 오늘의 에너지를 정돈하는 리셋법",
    ],
    badge: (count) => `오늘 남은 AI 상담: ${count}회`,
    unlimitedBadge: "오늘 AI 상담: 무제한",
    bookmark: "즐겨찾기 저장",
    bookmarked: "즐겨찾기 저장됨",
    shareCard: "이미지 카드로 공유",
    bookmarkError: "즐겨찾기를 저장하지 못했습니다. 다시 시도하세요.",
    bookmarkSignIn: "즐겨찾기 저장은 로그인 후 이용할 수 있습니다.",
    saved: "즐겨찾기에 저장했습니다",
    modalTitle: "오늘의 AI 상담을 모두 이용했습니다",
    modalBody:
      "VIP는 하루 최대 10회까지 이어서 상담할 수 있습니다. 날짜가 바뀌면 횟수가 다시 채워집니다.",
    modalCta: "VIP 보기",
    modalClose: "내일 다시 상담하기",
    modalNote: "현재는 플랜 안내만 제공하며 결제는 진행되지 않습니다.",
  },
  es: {
    ownerLabel: "Tú (titular)",
    targetLabel: "Persona de la consulta",
    title: "Sala IA Agolmen",
    subtitle: "Ilumina con calma tu próxima decisión",
    active: "Activa",
    engine: "IA reflexiva · artes multicapa × horóscopo animal",
    remaining: (count) => `Te quedan ${count} consultas gratuitas hoy`,
    vip: "10 consultas IA al día (VIP)",
    quickLabel: "Preguntas rápidas",
    quick: [
      "¿Cuál es mi momento clave este mes?",
      "Momento para lanzar un nuevo negocio",
      "Compatibilidad del equipo",
      "¿Cuándo firmar con la empresa A o B?",
    ],
    greeting:
      "Bienvenido. Cuéntame qué te genera dudas o qué necesitas decidir. Usaré los temas adivinatorios solo como reflexión y te ayudaré a ordenar opciones prácticas y un próximo paso.",
    placeholder: "Escribe tu preocupación o decisión...",
    send: "Enviar consulta",
    thinking: "Leyendo la dirección…",
    empty: "Escribe primero tu consulta.",
    limit: "Has agotado las consultas gratuitas de hoy.",
    disclaimer:
      "Apoyo reflexivo con IA; no es una lectura calculada, predicción ni asesoría profesional.",
    error: "No se pudo completar la consulta. Revisa el aviso e inténtalo de nuevo.",
    quickTopics: [
      "🎯 Consejo para la decisión o momento clave de hoy",
      "🤝 Cómo tratar con fluidez a alguien del equipo o la familia",
      "🧭 Dirección favorable y acción de suerte de hoy",
      "🧘 Ritual para reajustar la energía de hoy",
    ],
    badge: (count) => `Consultas IA restantes hoy: ${count}`,
    unlimitedBadge: "Consultas IA hoy: ilimitadas",
    bookmark: "Guardar en favoritos",
    bookmarked: "Guardado en favoritos",
    shareCard: "Compartir como tarjeta",
    bookmarkError: "No se pudo guardar el favorito. Inténtalo de nuevo.",
    bookmarkSignIn: "Inicia sesión para guardar favoritos.",
    saved: "Guardado en favoritos",
    modalTitle: "Has completado las consultas IA de hoy",
    modalBody:
      "Con VIP puedes hacer hasta 10 consultas al día y seguir preguntando. El contador se renueva al cambiar la fecha.",
    modalCta: "Ver VIP",
    modalClose: "Consultar mañana",
    modalNote: "Por ahora solo se muestra información del plan; no se realiza ningún pago.",
  },
  fr: {
    ownerLabel: "Vous (titulaire)",
    targetLabel: "Personne concernée",
    title: "Salon IA Agolmen",
    subtitle: "Éclairer calmement votre prochaine décision",
    active: "Actif",
    engine: "IA réflexive · arts multicouches × horoscope animal",
    remaining: (count) => `Encore ${count} consultations gratuites aujourd’hui`,
    vip: "10 consultations IA par jour (VIP)",
    quickLabel: "Questions rapides",
    quick: [
      "Quel est mon moment clé ce mois-ci ?",
      "Timing pour lancer une nouvelle activité",
      "Compatibilité de l’équipe",
      "Quand signer avec l’entreprise A ou B ?",
    ],
    greeting:
      "Bienvenue. Dites-moi ce qui vous fait hésiter ou ce que vous devez décider. Les thèmes divinatoires resteront des pistes de réflexion pour organiser des options concrètes et une prochaine étape.",
    placeholder: "Décrivez votre préoccupation ou décision...",
    send: "Envoyer la consultation",
    thinking: "Lecture de la direction…",
    empty: "Saisissez d’abord votre consultation.",
    limit: "Vous avez utilisé les consultations gratuites du jour.",
    disclaimer:
      "Soutien réflexif par IA, sans calcul divinatoire, prédiction ni conseil professionnel.",
    error: "La consultation n’a pas abouti. Consultez le message et réessayez.",
    quickTopics: [
      "🎯 Conseil pour la décision ou le moment clé du jour",
      "🤝 Échanger sereinement avec une personne de l’équipe ou de la famille",
      "🧭 Direction favorable et action porte-bonheur du jour",
      "🧘 Rituel pour rééquilibrer l’énergie du jour",
    ],
    badge: (count) => `Consultations IA restantes aujourd’hui : ${count}`,
    unlimitedBadge: "Consultations IA aujourd’hui : illimitées",
    bookmark: "Ajouter aux favoris",
    bookmarked: "Ajouté aux favoris",
    shareCard: "Partager en carte image",
    bookmarkError: "Impossible d’enregistrer ce favori. Réessayez.",
    bookmarkSignIn: "Connectez-vous pour enregistrer des favoris.",
    saved: "Ajouté aux favoris",
    modalTitle: "Les consultations IA du jour sont utilisées",
    modalBody:
      "Avec VIP, vous pouvez consulter jusqu’à 10 fois par jour et poursuivre vos questions. Le compteur se renouvelle au changement de date.",
    modalCta: "Voir VIP",
    modalClose: "Revenir demain",
    modalNote:
      "Seules les informations du forfait sont affichées actuellement ; aucun paiement n’est effectué.",
  },
};
const signInCopy: Record<Language,string> = { ja:'AI相談にはサインインしてください', en:'Sign in to consult AI', 'zh-CN':'请登录后进行AI咨询', 'zh-TW':'請登入後進行AI諮詢', ko:'AI 상담을 위해 로그인하세요', es:'Accede para consultar a la IA', fr:'Connectez-vous pour consulter l’IA' };
export const consultationTranslations: Record<Language, ConsultationTranslation> = Object.fromEntries((Object.keys(baseConsultationTranslations) as Language[]).map(language=>[language,{...baseConsultationTranslations[language],signIn:signInCopy[language],vip:baseConsultationTranslations[language].vip,modalBody:planBenefitsCopy[language].freeReached,unlimitedBadge:planBenefitsCopy[language].unlimitedBadge}])) as Record<Language, ConsultationTranslation>;
