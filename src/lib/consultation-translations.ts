import type { Language } from "./translations";

export type ConsultationTranslation = {
  title: string;
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
};

export const consultationTranslations: Record<Language, ConsultationTranslation> = {
  ja: {
    title: "AIオノレ相談室",
    subtitle: "決断の輪郭を、静かに照らす",
    active: "稼働中",
    engine: "多層統合占術×動物占い クロス解析AI",
    remaining: (count) => `本日あと ${count} 回 無料で相談可能`,
    vip: "無制限でAI相談を利用する（VIP特典）",
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
    limit: "本日の無料相談回数を使い切りました。",
    disclaimer: "AIによる内省サポートです。占術の実計算・未来の保証・専門家の助言ではありません。",
    error: "相談を受け取れませんでした。表示された内容を確認して、もう一度お試しください。",
  },
  en: {
    title: "AI Onore Chamber",
    subtitle: "Bring quiet clarity to your next decision",
    active: "Online",
    engine: "multi-layer arts × animal horoscope reflective AI",
    remaining: (count) => `${count} free consultations remaining today`,
    vip: "Unlimited AI consultations (VIP)",
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
    limit: "You have used today's free consultations.",
    disclaimer:
      "AI reflection support only—not a calculated reading, prediction, or professional advice.",
    error: "The consultation could not be completed. Review the message shown and try again.",
  },
  "zh-CN": {
    title: "AI自我咨询室",
    subtitle: "静静照亮你的下一步决定",
    active: "运行中",
    engine: "多层统合占术×动物占卜 反思型AI",
    remaining: (count) => `今日还可免费咨询 ${count} 次`,
    vip: "无限使用AI咨询（VIP特权）",
    quickLabel: "快捷提问",
    quick: [
      "本月的关键时期是？",
      "新事业的启动时机",
      "团队相性诊断",
      "A公司和B公司的签约时机？",
    ],
    greeting:
      "欢迎。请告诉我你正在犹豫或需要决定的事情。我会把占术主题仅作为反思线索，帮你梳理现实选项与下一步。",
    placeholder: "输入你的烦恼或想决定的事情...",
    send: "发送咨询",
    thinking: "正在解读方向…",
    empty: "请先输入咨询内容。",
    limit: "今日免费咨询次数已用完。",
    disclaimer: "仅为AI反思支持，并非实际占术、未来预测或专业建议。",
    error: "暂时无法完成咨询。请查看提示后重试。",
  },
  "zh-TW": {
    title: "AI自我諮詢室",
    subtitle: "靜靜照亮你的下一步決定",
    active: "運行中",
    engine: "多層統合占術×動物占卜 反思型AI",
    remaining: (count) => `今日還可免費諮詢 ${count} 次`,
    vip: "無限使用AI諮詢（VIP特典）",
    quickLabel: "快速提問",
    quick: [
      "本月的關鍵時期是？",
      "新事業的啟動時機",
      "團隊相性診斷",
      "A公司和B公司的簽約時機？",
    ],
    greeting:
      "歡迎。請告訴我你正在猶豫或需要決定的事情。我會把占術主題僅作為反思線索，幫你整理現實選項與下一步。",
    placeholder: "輸入你的煩惱或想決定的事情...",
    send: "送出諮詢",
    thinking: "正在解讀方向…",
    empty: "請先輸入諮詢內容。",
    limit: "今日免費諮詢次數已用完。",
    disclaimer: "僅為AI反思支援，並非實際占術、未來預測或專業建議。",
    error: "暫時無法完成諮詢。請查看提示後再試。",
  },
  ko: {
    title: "AI 오노레 상담실",
    subtitle: "다음 결정을 차분히 비춰드립니다",
    active: "가동 중",
    engine: "다층 통합 점술×동물 운세 성찰형 AI",
    remaining: (count) => `오늘 무료 상담 ${count}회 남음`,
    vip: "AI 상담 무제한 이용 (VIP 혜택)",
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
  },
  es: {
    title: "Sala AI Onore",
    subtitle: "Ilumina con calma tu próxima decisión",
    active: "Activa",
    engine: "IA reflexiva · artes multicapa × horóscopo animal",
    remaining: (count) => `Te quedan ${count} consultas gratuitas hoy`,
    vip: "Consultas IA ilimitadas (VIP)",
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
  },
  fr: {
    title: "Salon AI Onore",
    subtitle: "Éclairer calmement votre prochaine décision",
    active: "Actif",
    engine: "IA réflexive · multi-layer arts × horoscope animal",
    remaining: (count) => `Encore ${count} consultations gratuites aujourd’hui`,
    vip: "Consultations IA illimitées (VIP)",
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
  },
};
