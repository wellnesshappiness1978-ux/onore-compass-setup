import type { Language } from "./translations";

export type ProfileUiCopy = {
  placeholders: { nameKanji: string; nameKana: string; nameRomaji: string; city: string };
  selectGender: string;
  kanaError: string;
  requiredFieldsError: string;
  intro: { eyebrow: string; title: string; body: string; inputs: string; layers: string; portrait: string; note: string; cta: string };
  settings: { active: string; morningPush: string; morningPushUnavailable: string; themeLocked: (plan: string) => string };
  team: {
    simulator: string; shareKicker: string; matrixLabel: string; matrixTitle: string; matrixNote: string; member: string;
    recruit: { title: string; sub: string; name: string; birth: string; run: string; busy: string; fit: string; role: string; motivation: string; onboarding: string; average: string; top: string; note: string };
  };
};

export const profileUiCopy: Record<Language, ProfileUiCopy> = {
  ja: {
    placeholders: { nameKanji: "例：山田 太郎（姓と名の間にスペース）", nameKana: "例：やまだ たろう（ひらがな・姓と名の間にスペース）", nameRomaji: "例：YAMADA TARO（姓と名の間にスペース）", city: "例：横浜市 保土ケ谷区 和田町" },
    selectGender: "選択してください", kanaError: "よみがなはひらがなで入力してください", requiredFieldsError: "必須項目をすべて入力してください",
    intro: { eyebrow: "入力前の30秒プレビュー", title: "なぜ、ひとつの占いだけで見ないのか？", body: "同じ誕生日でも、名前・生まれた時間・場所・家族の中での立場が重なると、見えてくる輪郭は変わります。アゴルメンは一つの答えに決めつけず、複数の視点が重なる部分と食い違う部分を最新AIで読み解きます。", inputs: "姓名・生年月日・出生時刻／場所", layers: "名前・数字・星・暦・動物・方位の6つの視点", portrait: "あなたの本質・強み・迷いやすい構造", note: "15以上の占術知見を背景に、入力値から実際に算出できる6つの視点を統合する参考体験です。未入力情報は推測しません。", cta: "プロフィール入力へ進む" },
    settings: { active: "利用中", morningPush: "毎朝8時のプッシュ通知", morningPushUnavailable: "毎朝8時のプッシュ通知（配信サービス未接続）", themeLocked: (plan) => `このデザインは${plan}で解放されます。` },
    team: { simulator: "組織相性シミュレーター", shareKicker: "チーム相性診断", matrixLabel: "相性と組織最適化マトリクス", matrixTitle: "相性＆組織最適化マトリクス", matrixNote: "80以上は協働候補、65未満は役割・連絡方法を先に確認する参考値。採用・評価・利益を保証する指標ではありません。", member: "関係者", recruit: { title: "採用面接AIフィットネス診断", sub: "応募者の生年月日から、既存チームとの相性・役割予測・定着のヒントを参考表示します。", name: "応募者名（任意）", birth: "生年月日", run: "AI分析する", busy: "分析中…", fit: "既存チームとの相性", role: "組織内での役割予測", motivation: "入社後のモチベーション維持", onboarding: "最初の90日のサポート", average: "チーム平均相性", top: "相性の高いメンバー", note: "生年月日から算出した参考値です。合否判断には使用せず、スキル・経験・面接内容で判断してください。応募者情報は保存されません。" } }
  },
  en: {
    placeholders: { nameKanji: "e.g. Taro Yamada (surname and given name)", nameKana: "Enter the name reading in hiragana", nameRomaji: "e.g. YAMADA TARO", city: "e.g. Yokohama, Hodogaya" },
    selectGender: "Please choose", kanaError: "Please enter the reading in hiragana", requiredFieldsError: "Please complete all required fields",
    intro: { eyebrow: "30-second preview", title: "Why look through more than one lens?", body: "A birth date gains different contours when combined with a name, birth time, place and family context. Agolmen uses the latest AI to compare where several perspectives reinforce or challenge one another instead of forcing a single answer.", inputs: "Name · date · time · place", layers: "Name · numbers · sky · pillars · animal · directions", portrait: "Your nature · strengths · recurring friction", note: "A reflective experience informed by 15+ traditions. Only implemented calculations from supplied data are used; missing details are never guessed.", cta: "Enter my profile" },
    settings: { active: "Active", morningPush: "8 AM push notifications", morningPushUnavailable: "8 AM push notifications (delivery unavailable)", themeLocked: (plan) => `This design unlocks with ${plan}.` },
    team: { simulator: "Team compatibility simulator", shareKicker: "Team compatibility", matrixLabel: "Compatibility and organization matrix", matrixTitle: "Compatibility & organization matrix", matrixNote: "Reference scores: 80+ suggests exploring collaboration; below 65 suggests agreeing roles and communication first. Not a hiring, evaluation, or performance measure.", member: "Member", recruit: { title: "Hiring interview AI fit report", sub: "Reference view of team chemistry, likely role and retention tips from a candidate's birth date.", name: "Candidate name (optional)", birth: "Birth date", run: "Analyze with AI", busy: "Analyzing…", fit: "Fit with current team", role: "Predicted role", motivation: "Sustaining motivation", onboarding: "First 90 days support", average: "Average team fit", top: "Best-matched members", note: "Reference values from birth dates. Never use for pass/fail; decide on skills, experience and the interview. Candidate data is not saved." } }
  },
  "zh-CN": {
    placeholders: { nameKanji: "例：王 小明（姓与名之间留空格）", nameKana: "请用平假名输入姓名读音", nameRomaji: "例：WANG XIAOMING", city: "例：上海市 浦东新区" },
    selectGender: "请选择", kanaError: "请输入平假名读音", requiredFieldsError: "请填写所有必填项目",
    intro: { eyebrow: "填写前30秒预览", title: "为什么不只看一种占术？", body: "即使生日相同，姓名、出生时间与地点、家庭排行相互叠加后，呈现的轮廓也会不同。阿戈尔曼用最新AI解读多种视角的重合与差异，而不是武断地给出唯一答案。", inputs: "姓名・生日・时间／地点", layers: "姓名・数字・天体・四柱・动物・方位", portrait: "本质・优势・反复卡住的结构", note: "这是以15种以上占术知识为背景的参考体验，只使用已实现且可由输入计算的项目，不猜测缺失信息。", cta: "开始填写资料" },
    settings: { active: "使用中", morningPush: "每天早上8点推送通知", morningPushUnavailable: "每天早上8点推送通知（发送服务尚未连接）", themeLocked: (plan) => `此设计将在${plan}解锁。` },
    team: { simulator: "团队默契模拟器", shareKicker: "团队默契诊断", matrixLabel: "默契与组织优化矩阵", matrixTitle: "默契与组织优化矩阵", matrixNote: "80分以上可作为尝试协作的参考，低于65分时建议先确认角色与沟通方式。本分数不用于招聘、评价或业绩预测。", member: "成员", recruit: { title: "招聘面试AI匹配分析", sub: "根据应聘者出生日期，参考显示与现有团队的默契、可能角色及稳定任职提示。", name: "应聘者姓名（选填）", birth: "出生日期", run: "AI分析", busy: "分析中…", fit: "与现有团队的默契", role: "团队角色预测", motivation: "入职后的动力维持", onboarding: "最初90天支持", average: "团队平均匹配度", top: "匹配度较高的成员", note: "这是根据出生日期计算的参考值。请勿用于录用判断，应结合技能、经验与面试内容。应聘者信息不会保存。" } }
  },
  "zh-TW": {
    placeholders: { nameKanji: "例：王 小明（姓與名之間留空格）", nameKana: "請用平假名輸入姓名讀音", nameRomaji: "例：WANG XIAOMING", city: "例：臺北市 信義區" },
    selectGender: "請選擇", kanaError: "請輸入平假名讀音", requiredFieldsError: "請填寫所有必填項目",
    intro: { eyebrow: "填寫前30秒預覽", title: "為什麼不只看一種占術？", body: "即使生日相同，姓名、出生時間與地點、家庭排行互相疊加後，呈現的輪廓也會不同。阿戈爾曼用最新AI解讀多種視角的重合與差異，而不是武斷地給出唯一答案。", inputs: "姓名・生日・時間／地點", layers: "姓名・數字・天體・四柱・動物・方位", portrait: "本質・優勢・反覆卡住的結構", note: "這是以15種以上占術知識為背景的參考體驗，只使用已實作且可由輸入計算的項目，不猜測缺失資訊。", cta: "開始填寫資料" },
    settings: { active: "使用中", morningPush: "每天早上8點推播通知", morningPushUnavailable: "每天早上8點推播通知（傳送服務尚未連接）", themeLocked: (plan) => `此設計將於${plan}解鎖。` },
    team: { simulator: "團隊默契模擬器", shareKicker: "團隊默契診斷", matrixLabel: "默契與組織最佳化矩陣", matrixTitle: "默契與組織最佳化矩陣", matrixNote: "80分以上可作為嘗試協作的參考，低於65分時建議先確認角色與溝通方式。本分數不用於招募、評價或績效預測。", member: "成員", recruit: { title: "招募面試AI契合分析", sub: "依應徵者出生日期，參考顯示與現有團隊的默契、可能角色及穩定任職提示。", name: "應徵者姓名（選填）", birth: "出生日期", run: "AI分析", busy: "分析中…", fit: "與現有團隊的默契", role: "團隊角色預測", motivation: "入職後的動力維持", onboarding: "最初90天支援", average: "團隊平均契合度", top: "契合度較高的成員", note: "這是依出生日期計算的參考值。請勿用於錄取判斷，應結合技能、經驗與面試內容。應徵者資訊不會儲存。" } }
  },
  ko: {
    placeholders: { nameKanji: "예: 김 민준 (성과 이름 사이 띄어쓰기)", nameKana: "이름 읽는 법을 히라가나로 입력", nameRomaji: "예: KIM MINJUN", city: "예: 서울특별시 종로구" },
    selectGender: "선택해 주세요", kanaError: "읽는 법을 히라가나로 입력해 주세요", requiredFieldsError: "필수 항목을 모두 입력해 주세요",
    intro: { eyebrow: "입력 전 30초 미리보기", title: "왜 한 가지 점술만 보지 않을까요?", body: "같은 생일도 이름, 태어난 시간과 장소, 가족 안의 위치가 겹치면 다른 윤곽이 드러납니다. 아골멘은 하나의 답으로 단정하지 않고 최신 AI로 여러 관점이 겹치거나 어긋나는 지점을 읽습니다.", inputs: "이름・생일・시간／장소", layers: "이름・숫자・천체・사주・동물・방위", portrait: "본질・강점・반복되는 막힘", note: "15가지 이상의 점술 지식을 배경으로 한 참고 체험입니다. 입력값으로 계산 가능한 구현 항목만 사용하며 누락 정보는 추측하지 않습니다.", cta: "프로필 입력하기" },
    settings: { active: "이용 중", morningPush: "매일 오전 8시 푸시 알림", morningPushUnavailable: "매일 오전 8시 푸시 알림 (전송 서비스 미연결)", themeLocked: (plan) => `이 디자인은 ${plan}에서 이용할 수 있습니다.` },
    team: { simulator: "팀 궁합 시뮬레이터", shareKicker: "팀 궁합 진단", matrixLabel: "궁합 및 조직 최적화 매트릭스", matrixTitle: "궁합 및 조직 최적화 매트릭스", matrixNote: "80점 이상은 협업 탐색, 65점 미만은 역할과 연락 방식을 먼저 합의하기 위한 참고값입니다. 채용, 평가, 성과를 판단하는 지표가 아닙니다.", member: "관계자", recruit: { title: "채용 면접 AI 적합도 분석", sub: "지원자의 생년월일을 바탕으로 기존 팀과의 궁합, 예상 역할, 정착 힌트를 참고로 보여 줍니다.", name: "지원자 이름 (선택)", birth: "생년월일", run: "AI 분석", busy: "분석 중…", fit: "기존 팀과의 궁합", role: "조직 내 역할 예측", motivation: "입사 후 동기 유지", onboarding: "첫 90일 지원", average: "팀 평균 적합도", top: "궁합이 높은 멤버", note: "생년월일 기반 참고값입니다. 합격 여부 판단에 사용하지 말고 기술, 경험, 면접 내용을 함께 살펴보세요. 지원자 정보는 저장되지 않습니다." } }
  },
  es: {
    placeholders: { nameKanji: "Ej.: García Ana (apellido y nombre)", nameKana: "Escribe la lectura del nombre en hiragana", nameRomaji: "Ej.: GARCIA ANA", city: "Ej.: Madrid, Centro" },
    selectGender: "Selecciona una opción", kanaError: "Escribe la lectura en hiragana", requiredFieldsError: "Completa todos los campos obligatorios",
    intro: { eyebrow: "Vista previa de 30 segundos", title: "¿Por qué mirar con más de una lente?", body: "Una fecha adquiere otros matices al combinarse con el nombre, la hora, el lugar y el contexto familiar. Agolmen usa la IA más reciente para comparar coincidencias y contrastes entre perspectivas sin imponer una sola respuesta.", inputs: "Nombre · fecha · hora · lugar", layers: "Nombre · números · cielo · pilares · animal · direcciones", portrait: "Esencia · fortalezas · fricciones recurrentes", note: "Experiencia reflexiva inspirada en más de 15 tradiciones. Solo usa cálculos implementados con los datos aportados; nunca inventa lo que falta.", cta: "Introducir mi perfil" },
    settings: { active: "En uso", morningPush: "Notificaciones a las 8:00", morningPushUnavailable: "Notificaciones a las 8:00 (servicio no disponible)", themeLocked: (plan) => `Este diseño se desbloquea con ${plan}.` },
    team: { simulator: "Simulador de compatibilidad de equipo", shareKicker: "Compatibilidad de equipo", matrixLabel: "Matriz de compatibilidad y organización", matrixTitle: "Matriz de compatibilidad y organización", matrixNote: "Las puntuaciones son orientativas: 80+ invita a explorar la colaboración; menos de 65 sugiere acordar antes funciones y comunicación. No sirven para contratar, evaluar ni predecir resultados.", member: "Miembro", recruit: { title: "Análisis de afinidad con IA para entrevistas", sub: "Vista orientativa de la compatibilidad con el equipo, el posible rol y la integración a partir de la fecha de nacimiento.", name: "Nombre de la persona candidata (opcional)", birth: "Fecha de nacimiento", run: "Analizar con IA", busy: "Analizando…", fit: "Afinidad con el equipo actual", role: "Rol previsto", motivation: "Mantener la motivación", onboarding: "Apoyo durante los primeros 90 días", average: "Afinidad media del equipo", top: "Miembros más afines", note: "Valores orientativos basados en fechas de nacimiento. No los uses para decidir una contratación; valora habilidades, experiencia y entrevista. Los datos no se guardan." } }
  },
  fr: {
    placeholders: { nameKanji: "Ex. : Martin Léa (nom et prénom)", nameKana: "Saisissez la lecture du nom en hiragana", nameRomaji: "Ex. : MARTIN LEA", city: "Ex. : Paris, 5e arrondissement" },
    selectGender: "Veuillez choisir", kanaError: "Saisissez la lecture en hiragana", requiredFieldsError: "Remplissez tous les champs obligatoires",
    intro: { eyebrow: "Aperçu en 30 secondes", title: "Pourquoi croiser plusieurs regards ?", body: "Une date prend d’autres contours avec le nom, l’heure, le lieu et le contexte familial. Agolmen utilise l’IA la plus récente pour comparer les convergences et les écarts sans imposer une réponse unique.", inputs: "Nom · date · heure · lieu", layers: "Nom · nombres · ciel · piliers · animal · directions", portrait: "Nature · forces · tensions récurrentes", note: "Expérience réflexive inspirée de plus de 15 traditions. Seuls les calculs disponibles à partir des données saisies sont utilisés ; rien n’est inventé.", cta: "Saisir mon profil" },
    settings: { active: "Actif", morningPush: "Notifications à 8 h", morningPushUnavailable: "Notifications à 8 h (service indisponible)", themeLocked: (plan) => `Ce design se débloque avec l’offre ${plan}.` },
    team: { simulator: "Simulateur de compatibilité d’équipe", shareKicker: "Compatibilité d’équipe", matrixLabel: "Matrice de compatibilité et d’organisation", matrixTitle: "Matrice de compatibilité et d’organisation", matrixNote: "Scores indicatifs : 80+ invite à explorer la collaboration ; sous 65, mieux vaut convenir d’abord des rôles et de la communication. Ce n’est pas un outil de recrutement, d’évaluation ou de performance.", member: "Membre", recruit: { title: "Analyse IA d’affinité pour entretien", sub: "Vue indicative de la compatibilité avec l’équipe, du rôle possible et de l’intégration à partir de la date de naissance.", name: "Nom de la personne candidate (facultatif)", birth: "Date de naissance", run: "Analyser avec l’IA", busy: "Analyse…", fit: "Affinité avec l’équipe actuelle", role: "Rôle envisagé", motivation: "Maintenir la motivation", onboarding: "Accompagnement des 90 premiers jours", average: "Affinité moyenne de l’équipe", top: "Membres les plus compatibles", note: "Valeurs indicatives basées sur les dates de naissance. Ne les utilisez pas pour décider d’un recrutement ; évaluez compétences, expérience et entretien. Les données ne sont pas enregistrées." } }
  }
};

const zhCnPrefectures = ["北海道","青森县","岩手县","宫城县","秋田县","山形县","福岛县","茨城县","栃木县","群马县","埼玉县","千叶县","东京都","神奈川县","新潟县","富山县","石川县","福井县","山梨县","长野县","岐阜县","静冈县","爱知县","三重县","滋贺县","京都府","大阪府","兵库县","奈良县","和歌山县","鸟取县","岛根县","冈山县","广岛县","山口县","德岛县","香川县","爱媛县","高知县","福冈县","佐贺县","长崎县","熊本县","大分县","宫崎县","鹿儿岛县","冲绳县"];
const zhTwPrefectures = ["北海道","青森縣","岩手縣","宮城縣","秋田縣","山形縣","福島縣","茨城縣","栃木縣","群馬縣","埼玉縣","千葉縣","東京都","神奈川縣","新潟縣","富山縣","石川縣","福井縣","山梨縣","長野縣","岐阜縣","靜岡縣","愛知縣","三重縣","滋賀縣","京都府","大阪府","兵庫縣","奈良縣","和歌山縣","鳥取縣","島根縣","岡山縣","廣島縣","山口縣","德島縣","香川縣","愛媛縣","高知縣","福岡縣","佐賀縣","長崎縣","熊本縣","大分縣","宮崎縣","鹿兒島縣","沖繩縣"];
const koPrefectures = ["홋카이도","아오모리현","이와테현","미야기현","아키타현","야마가타현","후쿠시마현","이바라키현","도치기현","군마현","사이타마현","지바현","도쿄도","가나가와현","니가타현","도야마현","이시카와현","후쿠이현","야마나시현","나가노현","기후현","시즈오카현","아이치현","미에현","시가현","교토부","오사카부","효고현","나라현","와카야마현","돗토리현","시마네현","오카야마현","히로시마현","야마구치현","도쿠시마현","가가와현","에히메현","고치현","후쿠오카현","사가현","나가사키현","구마모토현","오이타현","미야자키현","가고시마현","오키나와현"];

export function localizePrefecture(language: Language, index: number, japanese: string, romanized: string) {
  if (language === "ja") return japanese;
  if (language === "zh-CN") return zhCnPrefectures[index] ?? romanized;
  if (language === "zh-TW") return zhTwPrefectures[index] ?? romanized;
  if (language === "ko") return koPrefectures[index] ?? romanized;
  return romanized;
}
