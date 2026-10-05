export const languages = [
  { code: "ja", short: "JP", flag: "🇯🇵", label: "日本語" },
  { code: "en", short: "EN", flag: "🇺🇸", label: "English" },
  { code: "zh-CN", short: "CN", flag: "🇨🇳", label: "简体中文" },
  { code: "zh-TW", short: "TW", flag: "🇹🇼", label: "繁體中文" },
  { code: "ko", short: "KO", flag: "🇰🇷", label: "한국어" },
  { code: "es", short: "ES", flag: "🇪🇸", label: "Español" },
  { code: "fr", short: "FR", flag: "🇫🇷", label: "Français" },
] as const;

export type Language = (typeof languages)[number]["code"];

const ja = {
  brand: "アゴルメンの羅針盤", subtitle: "あなたの生まれた秘密を、15の占術で解き明かします",
  profileEntry: "出生プロフィールを入力", step: "STEP", steps: ["生年月日・時間", "出生地", "血液型・兄弟構成"],
  birthDate: "生年月日", birthTime: "出生時間", birthPlace: "出生地（都道府県）", bloodType: "血液型", siblingOrder: "兄弟構成",
  required: "必須", timeUnknown: "出生時間が不明", unknown: "不明", selectPlace: "都道府県を選択してください",
  placeHint: "出生地は西洋占星術のハウス計算などに使用されます。",
  siblings: ["長子", "中子", "末っ子", "一人っ子"],
  back: "戻る", next: "次へ", analyze: "15の占術で自分を解析する", analyzing: "解析中…",
  privacy: "入力された情報は、占術解析のためにのみ使用されます",
  edit: "プロフィールを編集", welcome: "ようこそ", dashboardTitle: "あなたの羅針盤を解析します",
  registeredProfile: "登録プロフィール", artsTitle: "15の占術", preparing: "解析準備中",
  comingSoon: "Step 2 では、これらの占術による総合解析レポートがここに表示されます。",
  arts: ["四柱推命", "数秘術", "西洋占星術", "タロット", "姓名判断", "九星気学", "ルーン", "手相", "動物占い", "カラー占い", "算命学", "宿曜占星術", "易占い", "カバラ数秘術", "紫微斗数"],
  bloodSuffix: "型",
};

type Translation = typeof ja;
export const translations: Record<Language, Translation> = {
  ja,
  en: {
    brand: "Agolmen's Compass", subtitle: "Discover the secrets of your birth through 15 divination traditions",
    profileEntry: "Enter Birth Profile", step: "STEP", steps: ["Birth date & time", "Birth place", "Blood type & siblings"],
    birthDate: "Birth Date", birthTime: "Birth Time", birthPlace: "Birth Place (Prefecture)", bloodType: "Blood Type", siblingOrder: "Sibling Order",
    required: "Required", timeUnknown: "I don't know my birth time", unknown: "Unknown", selectPlace: "Select a prefecture",
    placeHint: "Your birth place is used for calculations such as astrological houses.",
    siblings: ["Eldest", "Middle child", "Youngest", "Only child"],
    back: "Back", next: "Next", analyze: "Explore myself with 15 divination arts", analyzing: "Analyzing…",
    privacy: "Your information is used only for your reading.",
    edit: "Edit profile", welcome: "Welcome", dashboardTitle: "Discover your inner compass",
    registeredProfile: "Your Profile", artsTitle: "15 Divination Arts", preparing: "Preparing your reading",
    comingSoon: "Your combined reading from these traditions will appear here in Step 2.",
    arts: ["Four Pillars", "Numerology", "Western Astrology", "Tarot", "Name Analysis", "Nine Star Ki", "Runes", "Palmistry", "Animal Astrology", "Color Reading", "Sanmeigaku", "Lunar Mansion Astrology", "I Ching", "Kabbalah Numerology", "Zi Wei Dou Shu"],
    bloodSuffix: "",
  },
  "zh-CN": {
    brand: "阿戈尔曼的罗盘", subtitle: "通过多层统合占术，解读你出生的秘密",
    profileEntry: "填写出生资料", step: "步骤", steps: ["出生日期与时间", "出生地", "血型与排行"],
    birthDate: "出生日期", birthTime: "出生时间", birthPlace: "出生地（都道府县）", bloodType: "血型", siblingOrder: "兄弟姐妹排行",
    required: "必填", timeUnknown: "不知道出生时间", unknown: "未知", selectPlace: "请选择都道府县",
    placeHint: "出生地用于西方占星术的宫位等计算。", siblings: ["老大", "中间", "最小", "独生子女"],
    back: "返回", next: "下一步", analyze: "用多层统合占术解析自我", analyzing: "正在解析…",
    privacy: "所填信息仅用于占术解析。", edit: "编辑资料", welcome: "欢迎", dashboardTitle: "解读你的内在罗盘",
    registeredProfile: "已登记资料", artsTitle: "多层统合占术", preparing: "解析准备中",
    comingSoon: "第二步将在此显示综合解析报告。",
    arts: ["四柱推命", "数字命理", "西方占星术", "塔罗牌", "姓名分析", "九星气学", "卢恩符文", "手相", "动物占卜", "色彩占卜", "算命学", "宿曜占星术", "易经占卜", "卡巴拉数字命理", "紫微斗数"],
    bloodSuffix: "型",
  },
  "zh-TW": {
    brand: "阿戈爾曼的羅盤", subtitle: "透過多層統合占術，解讀你出生的秘密",
    profileEntry: "填寫出生資料", step: "步驟", steps: ["出生日期與時間", "出生地", "血型與排行"],
    birthDate: "出生日期", birthTime: "出生時間", birthPlace: "出生地（都道府縣）", bloodType: "血型", siblingOrder: "兄弟姊妹排行",
    required: "必填", timeUnknown: "不知道出生時間", unknown: "未知", selectPlace: "請選擇都道府縣",
    placeHint: "出生地用於西洋占星術的宮位等計算。", siblings: ["老大", "中間", "最小", "獨生子女"],
    back: "返回", next: "下一步", analyze: "用多層統合占術解析自我", analyzing: "正在解析…",
    privacy: "填寫的資訊僅用於占術解析。", edit: "編輯資料", welcome: "歡迎", dashboardTitle: "解讀你的內在羅盤",
    registeredProfile: "已登記資料", artsTitle: "多層統合占術", preparing: "解析準備中",
    comingSoon: "第二步將在此顯示綜合解析報告。",
    arts: ["四柱推命", "數字命理", "西洋占星術", "塔羅牌", "姓名分析", "九星氣學", "盧恩符文", "手相", "動物占卜", "色彩占卜", "算命學", "宿曜占星術", "易經占卜", "卡巴拉數字命理", "紫微斗數"],
    bloodSuffix: "型",
  },
  ko: {
    brand: "아골멘의 나침반", subtitle: "다층 통합 점술로 탄생의 비밀을 발견하세요",
    profileEntry: "출생 정보 입력", step: "단계", steps: ["생년월일·시간", "출생지", "혈액형·형제 순서"],
    birthDate: "생년월일", birthTime: "출생 시간", birthPlace: "출생지 (일본 현)", bloodType: "혈액형", siblingOrder: "형제 순서",
    required: "필수", timeUnknown: "출생 시간을 모릅니다", unknown: "모름", selectPlace: "현을 선택하세요",
    placeHint: "출생지는 서양 점성술의 하우스 계산 등에 사용됩니다.", siblings: ["첫째", "가운데", "막내", "외동"],
    back: "뒤로", next: "다음", analyze: "다층 통합 점술로 나를 분석하기", analyzing: "분석 중…",
    privacy: "입력하신 정보는 점술 분석에만 사용됩니다.", edit: "프로필 수정", welcome: "환영합니다", dashboardTitle: "내면의 나침반을 발견하세요",
    registeredProfile: "등록된 프로필", artsTitle: "다층 통합 점술", preparing: "분석 준비 중",
    comingSoon: "2단계에서 종합 분석 결과가 여기에 표시됩니다.",
    arts: ["사주명리", "수비학", "서양 점성술", "타로", "성명학", "구성기학", "룬", "손금", "동물 점술", "컬러 점술", "산메이가쿠", "숙요 점성술", "주역", "카발라 수비학", "자미두수"],
    bloodSuffix: "형",
  },
  es: {
    brand: "La brújula de Agolmen", subtitle: "Descubre los secretos de tu nacimiento con artes adivinatorias multicapa",
    profileEntry: "Introduce tus datos de nacimiento", step: "PASO", steps: ["Fecha y hora", "Lugar de nacimiento", "Grupo sanguíneo y hermanos"],
    birthDate: "Fecha de nacimiento", birthTime: "Hora de nacimiento", birthPlace: "Lugar de nacimiento (prefectura)", bloodType: "Grupo sanguíneo", siblingOrder: "Orden entre hermanos",
    required: "Obligatorio", timeUnknown: "No sé mi hora de nacimiento", unknown: "Desconocida", selectPlace: "Selecciona una prefectura",
    placeHint: "El lugar de nacimiento se usa para calcular las casas astrológicas.", siblings: ["Mayor", "Intermedio", "Menor", "Hijo único"],
    back: "Atrás", next: "Siguiente", analyze: "Descubrirme con artes adivinatorias multicapa", analyzing: "Analizando…",
    privacy: "Tus datos solo se utilizan para tu lectura.", edit: "Editar perfil", welcome: "Bienvenido", dashboardTitle: "Descubre tu brújula interior",
    registeredProfile: "Tu perfil", artsTitle: "artes adivinatorias multicapa", preparing: "Preparando la lectura",
    comingSoon: "Tu lectura combinada aparecerá aquí en el paso 2.",
    arts: ["Cuatro Pilares", "Numerología", "Astrología occidental", "Tarot", "Análisis del nombre", "Ki de nueve estrellas", "Runas", "Quiromancia", "Astrología animal", "Lectura del color", "Sanmeigaku", "Astrología lunar", "I Ching", "Numerología cabalística", "Zi Wei Dou Shu"],
    bloodSuffix: "",
  },
  fr: {
    brand: "La boussole d’Agolmen", subtitle: "Découvrez les secrets de votre naissance grâce à arts divinatoires multicouches",
    profileEntry: "Saisir votre profil de naissance", step: "ÉTAPE", steps: ["Date et heure", "Lieu de naissance", "Groupe sanguin et fratrie"],
    birthDate: "Date de naissance", birthTime: "Heure de naissance", birthPlace: "Lieu de naissance (préfecture)", bloodType: "Groupe sanguin", siblingOrder: "Rang dans la fratrie",
    required: "Obligatoire", timeUnknown: "Je ne connais pas mon heure de naissance", unknown: "Inconnue", selectPlace: "Choisir une préfecture",
    placeHint: "Le lieu de naissance sert au calcul des maisons astrologiques.", siblings: ["Aîné(e)", "Cadet(te)", "Benjamine / Benjamin", "Enfant unique"],
    back: "Retour", next: "Suivant", analyze: "Me découvrir grâce à arts divinatoires multicouches", analyzing: "Analyse en cours…",
    privacy: "Vos données sont utilisées uniquement pour votre lecture.", edit: "Modifier le profil", welcome: "Bienvenue", dashboardTitle: "Découvrez votre boussole intérieure",
    registeredProfile: "Votre profil", artsTitle: "arts divinatoires multicouches", preparing: "Lecture en préparation",
    comingSoon: "Votre lecture combinée apparaîtra ici à l’étape 2.",
    arts: ["Quatre Piliers", "Numérologie", "Astrologie occidentale", "Tarot", "Analyse du nom", "Ki des neuf étoiles", "Runes", "Chiromancie", "Astrologie animale", "Lecture des couleurs", "Sanmeigaku", "Astrologie lunaire", "Yi Jing", "Numérologie kabbalistique", "Zi Wei Dou Shu"],
    bloodSuffix: "",
  },
};

// Prefecture names are proper nouns; show romanized names for Latin-script languages.
export const prefecturesRomanized = [
  "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima",
  "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa",
  "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu",
  "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo",
  "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi",
  "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki",
  "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa",
];

export const dashboardTranslations: Record<Language, {
  home: string; arts: string; consult: string; mandala: string; settings: string;
  today: string; theme: string; attack: string; energy: string; expansion: string;
  wheelHint: string; biorhythm: string; rhythmSubtitle: string; actionFocus: string;
  momentum: string; clarity: string; intuition: string; decision: string;
  decisionSubtitle: string; timing: string; timingResult: string; demo: string;
  notifications: string; noNotifications: string; vip: string; artsSubtitle: string;
  comingFeature: string; profile: string; rotate: string;
}> = {
  ja: { home: "ホーム", arts: "多層統合占術", consult: "AI相談室", mandala: "曼陀羅", settings: "設定", today: "今日のコンパス", theme: "今日のテーマ", attack: "攻め", energy: "高エネルギー", expansion: "拡大のとき", wheelHint: "リングをなぞって方角を変える", biorhythm: "地球暦バイオリズム", rhythmSubtitle: "今日のリズム", actionFocus: "アクション指針", momentum: "行動力", clarity: "明晰さ", intuition: "直感", decision: "決断コンパス", decisionSubtitle: "一歩を踏み出すためのヒント", timing: "今日の勝負タイミングを診る", timingResult: "今日は前に進む意識を。大切な決断は、気持ちが整ったときに。", demo: "プレビュー表示 · 占術による計算は未接続", notifications: "お知らせ", noNotifications: "新しいお知らせはありません", vip: "VIP", artsSubtitle: "15の占術をひとつの視点に", comingFeature: "この機能は準備中です", profile: "登録プロフィール", rotate: "コンパスを回す" },
  en: { home: "Home", arts: "Multi-layer Arts", consult: "AI Guide", mandala: "Mandala", settings: "Settings", today: "Today's compass", theme: "Today's theme", attack: "Go forward", energy: "High energy", expansion: "A time to expand", wheelHint: "Drag the ring to turn the compass", biorhythm: "Earth Calendar Biorhythm", rhythmSubtitle: "Today's rhythm", actionFocus: "Action focus", momentum: "Momentum", clarity: "Clarity", intuition: "Intuition", decision: "Decision Compass", decisionSubtitle: "A moment to find your next step", timing: "Explore today's timing", timingResult: "Move forward with intention today. Make important decisions when you feel centered.", demo: "Preview only · No divination calculation connected", notifications: "Notifications", noNotifications: "No new notifications", vip: "VIP", artsSubtitle: "Fifteen traditions, one perspective", comingFeature: "This feature is coming soon", profile: "Saved profile", rotate: "Rotate compass" },
  "zh-CN": { home: "首页", arts: "多层统合占术", consult: "AI咨询", mandala: "曼陀罗", settings: "设置", today: "今日罗盘", theme: "今日主题", attack: "进取", energy: "高能量", expansion: "拓展之时", wheelHint: "拖动圆环旋转罗盘", biorhythm: "地球历生物节律", rhythmSubtitle: "今日节律", actionFocus: "行动指引", momentum: "行动力", clarity: "清晰度", intuition: "直觉", decision: "决策罗盘", decisionSubtitle: "寻找下一步的方向", timing: "查看今日良机", timingResult: "今天适合主动前进。重要决定请在内心平静时做出。", demo: "预览展示 · 尚未接入占术计算", notifications: "通知", noNotifications: "暂无新通知", vip: "VIP", artsSubtitle: "十五种占术，一个视角", comingFeature: "此功能即将推出", profile: "已登记资料", rotate: "旋转罗盘" },
  "zh-TW": { home: "首頁", arts: "多層統合占術", consult: "AI諮詢", mandala: "曼陀羅", settings: "設定", today: "今日羅盤", theme: "今日主題", attack: "進取", energy: "高能量", expansion: "拓展之時", wheelHint: "拖動圓環旋轉羅盤", biorhythm: "地球曆生物節律", rhythmSubtitle: "今日節律", actionFocus: "行動指引", momentum: "行動力", clarity: "清晰度", intuition: "直覺", decision: "決策羅盤", decisionSubtitle: "尋找下一步的方向", timing: "查看今日良機", timingResult: "今天適合主動前進。重要決定請在內心平靜時做出。", demo: "預覽展示 · 尚未接入占術計算", notifications: "通知", noNotifications: "暫無新通知", vip: "VIP", artsSubtitle: "十五種占術，一個視角", comingFeature: "此功能即將推出", profile: "已登記資料", rotate: "旋轉羅盤" },
  ko: { home: "홈", arts: "다층 통합 점술", consult: "AI 상담", mandala: "만다라", settings: "설정", today: "오늘의 나침반", theme: "오늘의 테마", attack: "전진", energy: "높은 에너지", expansion: "확장의 시간", wheelHint: "원을 끌어 나침반을 돌려보세요", biorhythm: "지구력 바이오리듬", rhythmSubtitle: "오늘의 리듬", actionFocus: "행동 방향", momentum: "추진력", clarity: "명료함", intuition: "직감", decision: "결정의 나침반", decisionSubtitle: "다음 걸음을 위한 힌트", timing: "오늘의 타이밍 보기", timingResult: "오늘은 의도적으로 앞으로 나아가세요. 중요한 결정은 마음이 차분할 때 하세요.", demo: "미리보기 · 점술 계산 미연결", notifications: "알림", noNotifications: "새 알림이 없습니다", vip: "VIP", artsSubtitle: "열다섯 가지 전통, 하나의 시선", comingFeature: "이 기능은 준비 중입니다", profile: "등록된 프로필", rotate: "나침반 회전" },
  es: { home: "Inicio", arts: "artes multicapa", consult: "Consulta IA", mandala: "Mandala", settings: "Ajustes", today: "Brújula de hoy", theme: "Tema de hoy", attack: "Avanzar", energy: "Alta energía", expansion: "Momento de expandirse", wheelHint: "Arrastra el anillo para girar", biorhythm: "Biorritmo del calendario terrestre", rhythmSubtitle: "Ritmo de hoy", actionFocus: "Enfoque de acción", momentum: "Impulso", clarity: "Claridad", intuition: "Intuición", decision: "Brújula de decisiones", decisionSubtitle: "Una pista para dar el siguiente paso", timing: "Explorar el momento de hoy", timingResult: "Avanza con intención hoy. Toma decisiones importantes cuando te sientas en calma.", demo: "Vista previa · Sin cálculo astrológico", notifications: "Avisos", noNotifications: "No hay avisos nuevos", vip: "VIP", artsSubtitle: "Quince tradiciones, una perspectiva", comingFeature: "Esta función estará disponible pronto", profile: "Perfil guardado", rotate: "Girar brújula" },
  fr: { home: "Accueil", arts: "arts multicouches", consult: "Conseil IA", mandala: "Mandala", settings: "Réglages", today: "Boussole du jour", theme: "Thème du jour", attack: "Avancer", energy: "Énergie élevée", expansion: "Le temps de s'ouvrir", wheelHint: "Faites glisser l'anneau pour tourner", biorhythm: "Biorythme du calendrier terrestre", rhythmSubtitle: "Rythme du jour", actionFocus: "Cap du jour", momentum: "Élan", clarity: "Clarté", intuition: "Intuition", decision: "Boussole de décision", decisionSubtitle: "Une piste pour votre prochain pas", timing: "Explorer le moment du jour", timingResult: "Avancez avec intention aujourd'hui. Prenez vos décisions importantes l'esprit apaisé.", demo: "Aperçu · Aucun calcul divinatoire connecté", notifications: "Notifications", noNotifications: "Aucune nouvelle notification", vip: "VIP", artsSubtitle: "Quinze traditions, un regard", comingFeature: "Cette fonctionnalité arrive bientôt", profile: "Profil enregistré", rotate: "Tourner la boussole" },
};

type TorisetsuTranslation = {
  manual: string; compatibility: string; manualTitle: string; manualIntro: string;
  coreTitle: string; coreBody: string; decisionTitle: string; decisionBody: string; timingTitle: string; timingBody: string;
  colorsTitle: string; colorsIntro: string; colorLabels: string[]; colorNames: string[];
  partnerName: string; partnerNamePlaceholder: string; partnerTime: string; partnerPlace: string; optional: string;
  relationLabel: string; relations: string[];
  analyzeCta: string; coreLabel: string; coreDynamics: [string, string, string, string];
  partnerBirthDate: string; partnerHint: string; calculate: string; score: string;
  advice: [string, string, string]; lockedTitle: string; lockedBody: string; unlock: string;
  preview: string; detailLabel: string; summaryThemes: string[];
};

export const torisetsuTranslations: Record<Language, TorisetsuTranslation> = {
  ja: {
    manual: "自分のトリセツ", compatibility: "相性診断（相手）", manualTitle: "多層統合占術×動物占い 総合クロス解析", manualIntro: "統合AIプロフィール · 多層統合占術と動物占いを横断する統合プロフィールのプレビュー",
    coreTitle: "あなたの本質・コアアイデンティティ", coreBody: "西洋占星術の気質、四柱推命の巡り、数秘術の傾向、動物占いの個性、東洋の八卦の視点をひとつに。好奇心と慎重さの両方を持ち、確信を得ると一歩を踏み出す人物像です。",
    decisionTitle: "思考と決断のバイアス", decisionBody: "選択肢を広く眺めてから核心をつかむタイプ。直感で方向を見つけ、最後は具体的な根拠を確かめると強みが生きます。考えすぎたときは、次の小さな一歩を決めて。",
    timingTitle: "攻め時・守り時の行動指針", timingBody: "新しい提案や挑戦は、目的と準備が揃ったときに前へ。疲れを感じたり情報が足りないときは、急いで決めずに整える時間を。これは日付に基づく吉凶判定ではありません。",
    colorsTitle: "パーソナルカラー", colorsIntro: "6つのテーマを支える色", colorLabels: ["総合", "金運", "仕事", "恋愛", "対人", "健康"], colorNames: ["シャンパンゴールド", "翡翠", "瑠璃", "珊瑚", "藤", "琥珀"],
    partnerName: "お相手のお名前・ニックネーム", partnerNamePlaceholder: "例：A社 〇〇社長",
    partnerTime: "お相手の出生時間", partnerPlace: "お相手の出生地", optional: "任意",
    relationLabel: "関係性カテゴリ", relations: ["ビジネス", "上司・部下", "恋愛・パートナー", "友人・家族"],
    analyzeCta: "多層統合占術×動物占いで相性をクロス解析する", coreLabel: "相性の核ダイナミクス",
    coreDynamics: ["互いの専門性を認め合う「戦友型」。目的を共有すると進捗が加速します。", "役割が自然に分かれる「補完型」。指示より対話で合意を作ると強みが生きます。", "感情の温度が近い「共鳴型」。距離感を確認し合うと絆が長持ちします。", "気負わず過ごせる「安らぎ型」。何も求め合わない時間が関係を深めます。"],
    partnerBirthDate: "お相手の生年月日", partnerHint: "多層統合占術×動物占いの相性診断イメージ。生年月日と関係性からデモスコアを表示します。", calculate: "相性を診る", score: "相性スコア",
    advice: ["違いを急いで埋めず、互いのペースを言葉にすると関係が整います。", "共通点と違いのバランスが良好。小さな相談を重ねるほど信頼が深まります。", "自然に呼吸が合う組み合わせ。大切な決断ほど、二人の目的を確認しましょう。"],
    lockedTitle: "詳しい相性レポート", lockedBody: "価値観・会話・恋愛・長期関係の詳細アドバイスはVIP機能です。", unlock: "VIPで全機能解放", preview: "プレビュー表示 · 実際の占術計算ではありません", detailLabel: "読み解きを開く", summaryThemes: ["本質と人生のリズム", "決断と行動の傾向", "人との距離感", "才能が活きる場面", "心を整えるヒント"]
  },
  en: {
    manual: "My Manual", compatibility: "Compatibility", manualTitle: "Multi-layer Arts × Animal Horoscope · Integrated Profile", manualIntro: "INTEGRATED AI PROFILE · A sample cross-tradition portrait, not a calculated reading.",
    coreTitle: "Your essence & core identity", coreBody: "Imagine Western astrology, Four Pillars, numerology, animal horoscope and Eastern trigrams as one lens. This sample portrait balances curiosity with care, stepping forward when conviction grows.",
    decisionTitle: "Thinking & decision biases", decisionBody: "You may scan possibilities before finding the essential thread. Let intuition set direction, then check the evidence. When overthinking, choose one small next step.",
    timingTitle: "When to advance, when to pause", timingBody: "Move on new ideas when purpose and preparation align. If you're tired or missing context, make room to regroup. This is not a date-based timing forecast.",
    colorsTitle: "Personal Colors", colorsIntro: "Colors supporting six parts of life", colorLabels: ["Overall", "Wealth", "Work", "Love", "Social", "Health"], colorNames: ["Champagne Gold", "Jade", "Lapis", "Coral", "Wisteria", "Amber"],
    partnerName: "Their name or nickname", partnerNamePlaceholder: "e.g., Mr. Sato, ABC Corp",
    partnerTime: "Their birth time", partnerPlace: "Their birth place", optional: "Optional",
    relationLabel: "Relationship", relations: ["Business / Client", "Boss / Subordinate", "Romance / Partner", "Friend / Family"],
    analyzeCta: "Cross-analyze with multi-layer arts × animal horoscope", coreLabel: "Core dynamic",
    coreDynamics: ["Comrades in craft — shared goals speed up progress.", "Naturally complementary roles — agree through dialogue, not directives.", "Resonant temperaments — checking the distance keeps the bond long-lasting.", "Easy calm — time with no expectations deepens the relationship."],
    partnerBirthDate: "Partner's birth date", partnerHint: "A multi-layer × animal-horoscope compatibility concept. Enter a date and relationship for a demo score.", calculate: "View compatibility", score: "Compatibility score",
    advice: ["Name your different rhythms instead of rushing to resolve them.", "You balance similarities and differences well. Small conversations deepen trust.", "Your rhythms align naturally. Revisit shared goals before major decisions."],
    lockedTitle: "Detailed compatibility report", lockedBody: "Values, communication, romance, and long-term guidance are available with VIP.", unlock: "Unlock all with VIP", preview: "Preview only · Not a real divination calculation", detailLabel: "Open insight", summaryThemes: ["Core nature and life rhythm", "Decision and action patterns", "Relationship boundaries", "Where talent shines", "A cue for inner balance"]
  },
  "zh-CN": {
    manual: "我的使用说明", compatibility: "缘分诊断（对方）", manualTitle: "多层统合占术×动物占卜 综合交叉解析", manualIntro: "INTEGRATED AI PROFILE · 跨传统综合画像预览，并非实际计算结果。",
    coreTitle: "你的本质与核心身份", coreBody: "将西方占星、四柱推命、数字命理、动物占卜与东方八卦视为一个整体。这份示例画像描绘出兼具好奇与审慎、确认方向后愿意前进的性格。",
    decisionTitle: "思考与决策倾向", decisionBody: "你可能先审视多种选择，再抓住关键。让直觉指引方向，再用事实核实；想得太多时，不妨先确定一个小步骤。",
    timingTitle: "进取与休整的行动指引", timingBody: "目标与准备都明确时，适合推进新想法。疲惫或信息不足时，不妨暂缓决定、重新调整。这不是基于日期的吉凶预测。",
    colorsTitle: "个人色彩", colorsIntro: "支持六大生活主题的颜色", colorLabels: ["综合", "财运", "事业", "恋爱", "人际", "健康"], colorNames: ["香槟金", "翡翠", "琉璃", "珊瑚", "紫藤", "琥珀"],
    partnerName: "对方的姓名或昵称", partnerNamePlaceholder: "例：A公司 ○○社长",
    partnerTime: "对方出生时间", partnerPlace: "对方出生地", optional: "选填",
    relationLabel: "关系类别", relations: ["商务", "上司·部下", "恋爱·伴侣", "朋友·家人"],
    analyzeCta: "用多层统合占术×动物占卜交叉解析缘分", coreLabel: "缘分核心动力",
    coreDynamics: ["互相认可专业能力的“战友型”。共享目标会让进展加速。", "角色自然分工的“互补型”。以对话达成共识更能发挥优势。", "情感温度相近的“共鸣型”。确认彼此距离能让纽带更长久。", "可以放松相处的“安心型”。不互相期待的时光会加深关系。"],
    partnerBirthDate: "对方的出生日期", partnerHint: "多层统合占术×动物占卜的缘分诊断概念。输入日期与关系可查看示例分数。", calculate: "查看缘分", score: "缘分分数", advice: ["不要急于消除差异，说出彼此的节奏会让关系更稳定。", "共同点与差异平衡良好，日常沟通会加深信任。", "你们的节奏自然契合，重要决定前请确认共同目标。"],
    lockedTitle: "详细缘分报告", lockedBody: "价值观、沟通、恋爱与长期关系建议为VIP功能。", unlock: "VIP解锁全部功能", preview: "预览展示 · 并非真实占术计算", detailLabel: "展开解读", summaryThemes: ["本质与人生节奏", "决策与行动倾向", "人际距离感", "才能发挥场景", "内心平衡提示"]
  },
  "zh-TW": {
    manual: "我的使用說明", compatibility: "緣分診斷（對方）", manualTitle: "多層統合占術×動物占卜 綜合交叉解析", manualIntro: "INTEGRATED AI PROFILE · 跨傳統綜合畫像預覽，並非實際計算結果。",
    coreTitle: "你的本質與核心身份", coreBody: "將西洋占星、四柱推命、數字命理、動物占卜與東方八卦視為一體。這份示例畫像描繪出兼具好奇與審慎、確認方向後願意前進的性格。",
    decisionTitle: "思考與決策傾向", decisionBody: "你可能先審視多種選擇，再抓住關鍵。讓直覺指引方向，再用事實核實；想得太多時，不妨先確定一個小步驟。",
    timingTitle: "進取與休整的行動指引", timingBody: "目標與準備都明確時，適合推進新想法。疲憊或資訊不足時，不妨暫緩決定、重新調整。這不是基於日期的吉凶預測。",
    colorsTitle: "個人色彩", colorsIntro: "支持六大生活主題的顏色", colorLabels: ["綜合", "財運", "事業", "戀愛", "人際", "健康"], colorNames: ["香檳金", "翡翠", "琉璃", "珊瑚", "紫藤", "琥珀"],
    partnerName: "對方的姓名或暱稱", partnerNamePlaceholder: "例：A公司 ○○社長",
    partnerTime: "對方出生時間", partnerPlace: "對方出生地", optional: "選填",
    relationLabel: "關係類別", relations: ["商務", "上司·部下", "戀愛·伴侶", "朋友·家人"],
    analyzeCta: "用多層統合占術×動物占卜交叉解析緣分", coreLabel: "緣分核心動力",
    coreDynamics: ["互相認可專業能力的「戰友型」。共享目標會讓進展加速。", "角色自然分工的「互補型」。以對話達成共識更能發揮優勢。", "情感溫度相近的「共鳴型」。確認彼此距離能讓羈絆更長久。", "可以放鬆相處的「安心型」。不互相期待的時光會加深關係。"],
    partnerBirthDate: "對方的出生日期", partnerHint: "多層統合占術×動物占卜的緣分診斷概念。輸入日期與關係可查看示例分數。", calculate: "查看緣分", score: "緣分分數", advice: ["不要急於消除差異，說出彼此的節奏會讓關係更穩定。", "共同點與差異平衡良好，日常溝通會加深信任。", "你們的節奏自然契合，重要決定前請確認共同目標。"],
    lockedTitle: "詳細緣分報告", lockedBody: "價值觀、溝通、戀愛與長期關係建議為VIP功能。", unlock: "VIP解鎖全部功能", preview: "預覽展示 · 並非真實占術計算", detailLabel: "展開解讀", summaryThemes: ["本質與人生節奏", "決策與行動傾向", "人際距離感", "才能發揮場景", "內心平衡提示"]
  },
  ko: {
    manual: "나의 사용 설명서", compatibility: "궁합 진단 (상대)", manualTitle: "다층 통합 점술 × 동물 점술 통합 분석", manualIntro: "INTEGRATED AI PROFILE · 여러 관점을 합친 예시이며 실제 계산 결과가 아닙니다.",
    coreTitle: "본질과 핵심 정체성", coreBody: "서양 점성술, 사주, 수비학, 동물 점술, 동양의 팔괘를 하나의 시선으로 엮습니다. 이 예시 프로필은 호기심과 신중함을 함께 지니고, 확신이 생기면 앞으로 나아가는 모습을 그립니다.",
    decisionTitle: "생각과 결정의 편향", decisionBody: "여러 가능성을 살핀 뒤 핵심을 찾아갑니다. 직감으로 방향을 잡고 근거를 확인해 보세요. 고민이 길어질 때는 작은 다음 행동 하나를 정해 보세요.",
    timingTitle: "전진할 때와 멈출 때", timingBody: "목적과 준비가 맞으면 새로운 도전을 시작하세요. 지쳤거나 정보가 부족하면 잠시 정리할 시간을 가지세요. 날짜에 따른 길흉 예측은 아닙니다.",
    colorsTitle: "퍼스널 컬러", colorsIntro: "삶의 여섯 영역을 돕는 색", colorLabels: ["종합", "재물", "직업", "연애", "대인", "건강"], colorNames: ["샴페인 골드", "비취", "청금석", "산호", "등나무꽃", "호박"],
    partnerName: "상대의 이름 또는 별명", partnerNamePlaceholder: "예: A사 ○○ 대표",
    partnerTime: "상대의 출생 시간", partnerPlace: "상대의 출생지", optional: "선택",
    relationLabel: "관계 유형", relations: ["비즈니스", "상사·부하", "연애·파트너", "친구·가족"],
    analyzeCta: "다층 통합 점술 × 동물 점술로 궁합 교차 분석", coreLabel: "궁합 핵심 다이내믹",
    coreDynamics: ["서로의 전문성을 인정하는 '전우형'. 목표를 공유하면 진행이 빨라집니다.", "역할이 자연스럽게 나뉘는 '보완형'. 지시보다 대화로 합의하면 강점이 살아납니다.", "감정 온도가 비슷한 '공명형'. 거리감을 확인하면 유대가 오래갑니다.", "편하게 쉴 수 있는 '안심형'. 아무것도 바라지 않는 시간이 관계를 깊게 합니다."],
    partnerBirthDate: "상대방 생년월일", partnerHint: "다층 통합 점술 × 동물 점술 궁합의 예시입니다. 날짜와 관계를 입력하면 데모 점수가 표시됩니다.", calculate: "궁합 보기", score: "궁합 점수", advice: ["차이를 서둘러 없애기보다 서로의 속도를 말로 나눠보세요.", "공통점과 차이의 균형이 좋습니다. 작은 대화가 신뢰를 키웁니다.", "자연스럽게 호흡이 맞습니다. 큰 결정 전 공동 목표를 확인하세요."],
    lockedTitle: "상세 궁합 리포트", lockedBody: "가치관, 대화, 연애, 장기 관계 조언은 VIP 기능입니다.", unlock: "VIP로 모든 기능 열기", preview: "미리보기 · 실제 점술 계산이 아닙니다", detailLabel: "해석 열기", summaryThemes: ["본질과 삶의 리듬", "결정과 행동 패턴", "관계의 거리감", "재능이 빛나는 순간", "마음의 균형 힌트"]
  },
  es: {
    manual: "Mi manual", compatibility: "Compatibilidad", manualTitle: "artes multicapa × Horóscopo animal · Perfil integrado", manualIntro: "INTEGRATED AI PROFILE · Una síntesis ilustrativa, no una lectura calculada.",
    coreTitle: "Tu esencia e identidad", coreBody: "Imagina la astrología occidental, los Cuatro Pilares, la numerología, el horóscopo animal y los trigramas como una sola lente. Este retrato de ejemplo combina curiosidad y prudencia, avanzando cuando llega la convicción.",
    decisionTitle: "Sesgos al pensar y decidir", decisionBody: "Exploras posibilidades antes de llegar a lo esencial. Usa la intuición para orientarte y después comprueba los hechos. Si piensas demasiado, elige un pequeño paso.",
    timingTitle: "Cuándo avanzar y cuándo pausar", timingBody: "Avanza con ideas nuevas cuando el propósito y la preparación coincidan. Si falta información o energía, date tiempo para reorganizarte. No es un pronóstico basado en fechas.",
    colorsTitle: "Colores personales", colorsIntro: "Colores para seis áreas de tu vida", colorLabels: ["General", "Dinero", "Trabajo", "Amor", "Social", "Salud"], colorNames: ["Oro champán", "Jade", "Lapislázuli", "Coral", "Glicinia", "Ámbar"],
    partnerName: "Su nombre o apodo", partnerNamePlaceholder: "p. ej., Sr. Sato, ABC S.A.",
    partnerTime: "Su hora de nacimiento", partnerPlace: "Su lugar de nacimiento", optional: "Opcional",
    relationLabel: "Tipo de relación", relations: ["Negocios / Cliente", "Jefe / Subordinado", "Amor / Pareja", "Amigo / Familia"],
    analyzeCta: "Analizar la compatibilidad con artes multicapa × horóscopo animal", coreLabel: "Dinámica central",
    coreDynamics: ["Camaradas de oficio — las metas compartidas aceleran el avance.", "Roles complementarios — acuerden dialogando, no con órdenes.", "Temperamentos resonantes — revisar la distancia mantiene el vínculo.", "Calma fácil — el tiempo sin expectativas profundiza la relación."],
    partnerBirthDate: "Fecha de nacimiento de tu pareja", partnerHint: "Concepto de compatibilidad de artes multicapa y horóscopo animal. Introduce una fecha y relación para ver una puntuación de ejemplo.", calculate: "Ver compatibilidad", score: "Puntuación", advice: ["Expresad vuestros ritmos sin apresurar las diferencias.", "Hay buen equilibrio. Las pequeñas conversaciones refuerzan la confianza.", "Vuestros ritmos encajan. Confirmad metas comunes antes de decisiones importantes."],
    lockedTitle: "Informe detallado", lockedBody: "Valores, comunicación, romance y orientación a largo plazo están disponibles con VIP.", unlock: "Desbloquear todo con VIP", preview: "Solo vista previa · No es un cálculo real", detailLabel: "Abrir lectura", summaryThemes: ["Esencia y ritmo vital", "Decisión y acción", "Límites en relaciones", "Dónde brilla el talento", "Clave para el equilibrio"]
  },
  fr: {
    manual: "Mon mode d'emploi", compatibility: "Compatibilité", manualTitle: "arts multicouches × Horoscope animal · Profil intégré", manualIntro: "INTEGRATED AI PROFILE · Une synthèse illustrative, pas une analyse calculée.",
    coreTitle: "Votre essence et identité", coreBody: "Imaginez l'astrologie occidentale, les Quatre Piliers, la numérologie, l'horoscope animal et les trigrammes comme un seul regard. Ce portrait fictif associe curiosité et prudence, puis avance avec conviction.",
    decisionTitle: "Biais de réflexion et de décision", decisionBody: "Vous explorez les possibilités avant de saisir l'essentiel. Laissez l'intuition vous orienter, puis vérifiez les faits. Si vous hésitez trop, choisissez une petite prochaine étape.",
    timingTitle: "Quand avancer, quand ralentir", timingBody: "Avancez quand l'objectif et la préparation s'accordent. Si vous manquez d'énergie ou d'informations, prenez le temps de vous recentrer. Ce n'est pas une prévision liée aux dates.",
    colorsTitle: "Couleurs personnelles", colorsIntro: "Six couleurs pour vos domaines de vie", colorLabels: ["Global", "Finances", "Travail", "Amour", "Relations", "Santé"], colorNames: ["Or champagne", "Jade", "Lapis", "Corail", "Glycine", "Ambre"],
    partnerName: "Son nom ou surnom", partnerNamePlaceholder: "ex. M. Sato, société ABC",
    partnerTime: "Son heure de naissance", partnerPlace: "Son lieu de naissance", optional: "Facultatif",
    relationLabel: "Type de relation", relations: ["Business / Client", "Supérieur / Subordonné", "Amour / Partenaire", "Ami / Famille"],
    analyzeCta: "Analyse croisée arts multicouches × horoscope animal", coreLabel: "Dynamique centrale",
    coreDynamics: ["Compagnons de métier — des buts partagés accélèrent l'avancement.", "Rôles complémentaires — concluez par le dialogue, pas par des directives.", "Tempéraments résonants — vérifier la distance garde le lien durable.", "Calme facile — le temps sans attentes approfondit la relation."],
    partnerBirthDate: "Date de naissance du partenaire", partnerHint: "Concept de compatibilité de multi-layer arts et horoscope animal. Saisissez une date et une relation pour un score de démonstration.", calculate: "Voir la compatibilité", score: "Score de compatibilité", advice: ["N'effacez pas les différences trop vite : exprimez vos rythmes.", "L'équilibre est bon. De petits échanges renforcent la confiance.", "Vos rythmes s'accordent naturellement. Confirmez vos buts communs avant les grands choix."],
    lockedTitle: "Rapport détaillé", lockedBody: "Valeurs, communication, amour et conseils à long terme sont disponibles avec VIP.", unlock: "Tout débloquer avec VIP", preview: "Aperçu uniquement · Aucun calcul réel", detailLabel: "Ouvrir l'analyse", summaryThemes: ["Nature et rythme de vie", "Décision et action", "Distance relationnelle", "Expression des talents", "Clé d'équilibre intérieur"]
  }
};