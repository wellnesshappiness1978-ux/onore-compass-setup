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
  brand: "オノレコンパス", subtitle: "あなたの生まれた秘密を、15の占術で解き明かします",
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
    brand: "Self Compass", subtitle: "Discover the secrets of your birth through 15 divination traditions",
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
    brand: "自我罗盘", subtitle: "通过15种占术，解读你出生的秘密",
    profileEntry: "填写出生资料", step: "步骤", steps: ["出生日期与时间", "出生地", "血型与排行"],
    birthDate: "出生日期", birthTime: "出生时间", birthPlace: "出生地（都道府县）", bloodType: "血型", siblingOrder: "兄弟姐妹排行",
    required: "必填", timeUnknown: "不知道出生时间", unknown: "未知", selectPlace: "请选择都道府县",
    placeHint: "出生地用于西方占星术的宫位等计算。", siblings: ["老大", "中间", "最小", "独生子女"],
    back: "返回", next: "下一步", analyze: "用15种占术解析自我", analyzing: "正在解析…",
    privacy: "所填信息仅用于占术解析。", edit: "编辑资料", welcome: "欢迎", dashboardTitle: "解读你的内在罗盘",
    registeredProfile: "已登记资料", artsTitle: "15种占术", preparing: "解析准备中",
    comingSoon: "第二步将在此显示综合解析报告。",
    arts: ["四柱推命", "数字命理", "西方占星术", "塔罗牌", "姓名分析", "九星气学", "卢恩符文", "手相", "动物占卜", "色彩占卜", "算命学", "宿曜占星术", "易经占卜", "卡巴拉数字命理", "紫微斗数"],
    bloodSuffix: "型",
  },
  "zh-TW": {
    brand: "自我羅盤", subtitle: "透過15種占術，解讀你出生的秘密",
    profileEntry: "填寫出生資料", step: "步驟", steps: ["出生日期與時間", "出生地", "血型與排行"],
    birthDate: "出生日期", birthTime: "出生時間", birthPlace: "出生地（都道府縣）", bloodType: "血型", siblingOrder: "兄弟姊妹排行",
    required: "必填", timeUnknown: "不知道出生時間", unknown: "未知", selectPlace: "請選擇都道府縣",
    placeHint: "出生地用於西洋占星術的宮位等計算。", siblings: ["老大", "中間", "最小", "獨生子女"],
    back: "返回", next: "下一步", analyze: "用15種占術解析自我", analyzing: "正在解析…",
    privacy: "填寫的資訊僅用於占術解析。", edit: "編輯資料", welcome: "歡迎", dashboardTitle: "解讀你的內在羅盤",
    registeredProfile: "已登記資料", artsTitle: "15種占術", preparing: "解析準備中",
    comingSoon: "第二步將在此顯示綜合解析報告。",
    arts: ["四柱推命", "數字命理", "西洋占星術", "塔羅牌", "姓名分析", "九星氣學", "盧恩符文", "手相", "動物占卜", "色彩占卜", "算命學", "宿曜占星術", "易經占卜", "卡巴拉數字命理", "紫微斗數"],
    bloodSuffix: "型",
  },
  ko: {
    brand: "셀프 컴퍼스", subtitle: "15가지 점술로 탄생의 비밀을 발견하세요",
    profileEntry: "출생 정보 입력", step: "단계", steps: ["생년월일·시간", "출생지", "혈액형·형제 순서"],
    birthDate: "생년월일", birthTime: "출생 시간", birthPlace: "출생지 (일본 현)", bloodType: "혈액형", siblingOrder: "형제 순서",
    required: "필수", timeUnknown: "출생 시간을 모릅니다", unknown: "모름", selectPlace: "현을 선택하세요",
    placeHint: "출생지는 서양 점성술의 하우스 계산 등에 사용됩니다.", siblings: ["첫째", "가운데", "막내", "외동"],
    back: "뒤로", next: "다음", analyze: "15가지 점술로 나를 분석하기", analyzing: "분석 중…",
    privacy: "입력하신 정보는 점술 분석에만 사용됩니다.", edit: "프로필 수정", welcome: "환영합니다", dashboardTitle: "내면의 나침반을 발견하세요",
    registeredProfile: "등록된 프로필", artsTitle: "15가지 점술", preparing: "분석 준비 중",
    comingSoon: "2단계에서 종합 분석 결과가 여기에 표시됩니다.",
    arts: ["사주명리", "수비학", "서양 점성술", "타로", "성명학", "구성기학", "룬", "손금", "동물 점술", "컬러 점술", "산메이가쿠", "숙요 점성술", "주역", "카발라 수비학", "자미두수"],
    bloodSuffix: "형",
  },
  es: {
    brand: "Brújula Interior", subtitle: "Descubre los secretos de tu nacimiento con 15 artes adivinatorias",
    profileEntry: "Introduce tus datos de nacimiento", step: "PASO", steps: ["Fecha y hora", "Lugar de nacimiento", "Grupo sanguíneo y hermanos"],
    birthDate: "Fecha de nacimiento", birthTime: "Hora de nacimiento", birthPlace: "Lugar de nacimiento (prefectura)", bloodType: "Grupo sanguíneo", siblingOrder: "Orden entre hermanos",
    required: "Obligatorio", timeUnknown: "No sé mi hora de nacimiento", unknown: "Desconocida", selectPlace: "Selecciona una prefectura",
    placeHint: "El lugar de nacimiento se usa para calcular las casas astrológicas.", siblings: ["Mayor", "Intermedio", "Menor", "Hijo único"],
    back: "Atrás", next: "Siguiente", analyze: "Descubrirme con 15 artes adivinatorias", analyzing: "Analizando…",
    privacy: "Tus datos solo se utilizan para tu lectura.", edit: "Editar perfil", welcome: "Bienvenido", dashboardTitle: "Descubre tu brújula interior",
    registeredProfile: "Tu perfil", artsTitle: "15 artes adivinatorias", preparing: "Preparando la lectura",
    comingSoon: "Tu lectura combinada aparecerá aquí en el paso 2.",
    arts: ["Cuatro Pilares", "Numerología", "Astrología occidental", "Tarot", "Análisis del nombre", "Ki de nueve estrellas", "Runas", "Quiromancia", "Astrología animal", "Lectura del color", "Sanmeigaku", "Astrología lunar", "I Ching", "Numerología cabalística", "Zi Wei Dou Shu"],
    bloodSuffix: "",
  },
  fr: {
    brand: "Boussole Intérieure", subtitle: "Découvrez les secrets de votre naissance grâce à 15 arts divinatoires",
    profileEntry: "Saisir votre profil de naissance", step: "ÉTAPE", steps: ["Date et heure", "Lieu de naissance", "Groupe sanguin et fratrie"],
    birthDate: "Date de naissance", birthTime: "Heure de naissance", birthPlace: "Lieu de naissance (préfecture)", bloodType: "Groupe sanguin", siblingOrder: "Rang dans la fratrie",
    required: "Obligatoire", timeUnknown: "Je ne connais pas mon heure de naissance", unknown: "Inconnue", selectPlace: "Choisir une préfecture",
    placeHint: "Le lieu de naissance sert au calcul des maisons astrologiques.", siblings: ["Aîné(e)", "Cadet(te)", "Benjamine / Benjamin", "Enfant unique"],
    back: "Retour", next: "Suivant", analyze: "Me découvrir grâce à 15 arts divinatoires", analyzing: "Analyse en cours…",
    privacy: "Vos données sont utilisées uniquement pour votre lecture.", edit: "Modifier le profil", welcome: "Bienvenue", dashboardTitle: "Découvrez votre boussole intérieure",
    registeredProfile: "Votre profil", artsTitle: "15 arts divinatoires", preparing: "Lecture en préparation",
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
  ja: { home: "ホーム", arts: "15占術", consult: "AI相談室", mandala: "曼陀羅", settings: "設定", today: "今日のコンパス", theme: "今日のテーマ", attack: "攻め", energy: "高エネルギー", expansion: "拡大のとき", wheelHint: "リングをなぞって方角を変える", biorhythm: "地球暦バイオリズム", rhythmSubtitle: "今日のリズム", actionFocus: "アクション指針", momentum: "行動力", clarity: "明晰さ", intuition: "直感", decision: "決断コンパス", decisionSubtitle: "一歩を踏み出すためのヒント", timing: "今日の勝負タイミングを診る", timingResult: "今日は前に進む意識を。大切な決断は、気持ちが整ったときに。", demo: "プレビュー表示 · 占術による計算は未接続", notifications: "お知らせ", noNotifications: "新しいお知らせはありません", vip: "VIP", artsSubtitle: "15の占術をひとつの視点に", comingFeature: "この機能は準備中です", profile: "登録プロフィール", rotate: "コンパスを回す" },
  en: { home: "Home", arts: "15 Arts", consult: "AI Guide", mandala: "Mandala", settings: "Settings", today: "Today's compass", theme: "Today's theme", attack: "Go forward", energy: "High energy", expansion: "A time to expand", wheelHint: "Drag the ring to turn the compass", biorhythm: "Earth Calendar Biorhythm", rhythmSubtitle: "Today's rhythm", actionFocus: "Action focus", momentum: "Momentum", clarity: "Clarity", intuition: "Intuition", decision: "Decision Compass", decisionSubtitle: "A moment to find your next step", timing: "Explore today's timing", timingResult: "Move forward with intention today. Make important decisions when you feel centered.", demo: "Preview only · No divination calculation connected", notifications: "Notifications", noNotifications: "No new notifications", vip: "VIP", artsSubtitle: "Fifteen traditions, one perspective", comingFeature: "This feature is coming soon", profile: "Saved profile", rotate: "Rotate compass" },
  "zh-CN": { home: "首页", arts: "15种占术", consult: "AI咨询", mandala: "曼陀罗", settings: "设置", today: "今日罗盘", theme: "今日主题", attack: "进取", energy: "高能量", expansion: "拓展之时", wheelHint: "拖动圆环旋转罗盘", biorhythm: "地球历生物节律", rhythmSubtitle: "今日节律", actionFocus: "行动指引", momentum: "行动力", clarity: "清晰度", intuition: "直觉", decision: "决策罗盘", decisionSubtitle: "寻找下一步的方向", timing: "查看今日良机", timingResult: "今天适合主动前进。重要决定请在内心平静时做出。", demo: "预览展示 · 尚未接入占术计算", notifications: "通知", noNotifications: "暂无新通知", vip: "VIP", artsSubtitle: "十五种占术，一个视角", comingFeature: "此功能即将推出", profile: "已登记资料", rotate: "旋转罗盘" },
  "zh-TW": { home: "首頁", arts: "15種占術", consult: "AI諮詢", mandala: "曼陀羅", settings: "設定", today: "今日羅盤", theme: "今日主題", attack: "進取", energy: "高能量", expansion: "拓展之時", wheelHint: "拖動圓環旋轉羅盤", biorhythm: "地球曆生物節律", rhythmSubtitle: "今日節律", actionFocus: "行動指引", momentum: "行動力", clarity: "清晰度", intuition: "直覺", decision: "決策羅盤", decisionSubtitle: "尋找下一步的方向", timing: "查看今日良機", timingResult: "今天適合主動前進。重要決定請在內心平靜時做出。", demo: "預覽展示 · 尚未接入占術計算", notifications: "通知", noNotifications: "暫無新通知", vip: "VIP", artsSubtitle: "十五種占術，一個視角", comingFeature: "此功能即將推出", profile: "已登記資料", rotate: "旋轉羅盤" },
  ko: { home: "홈", arts: "15가지 점술", consult: "AI 상담", mandala: "만다라", settings: "설정", today: "오늘의 나침반", theme: "오늘의 테마", attack: "전진", energy: "높은 에너지", expansion: "확장의 시간", wheelHint: "원을 끌어 나침반을 돌려보세요", biorhythm: "지구력 바이오리듬", rhythmSubtitle: "오늘의 리듬", actionFocus: "행동 방향", momentum: "추진력", clarity: "명료함", intuition: "직감", decision: "결정의 나침반", decisionSubtitle: "다음 걸음을 위한 힌트", timing: "오늘의 타이밍 보기", timingResult: "오늘은 의도적으로 앞으로 나아가세요. 중요한 결정은 마음이 차분할 때 하세요.", demo: "미리보기 · 점술 계산 미연결", notifications: "알림", noNotifications: "새 알림이 없습니다", vip: "VIP", artsSubtitle: "열다섯 가지 전통, 하나의 시선", comingFeature: "이 기능은 준비 중입니다", profile: "등록된 프로필", rotate: "나침반 회전" },
  es: { home: "Inicio", arts: "15 artes", consult: "Consulta IA", mandala: "Mandala", settings: "Ajustes", today: "Brújula de hoy", theme: "Tema de hoy", attack: "Avanzar", energy: "Alta energía", expansion: "Momento de expandirse", wheelHint: "Arrastra el anillo para girar", biorhythm: "Biorritmo del calendario terrestre", rhythmSubtitle: "Ritmo de hoy", actionFocus: "Enfoque de acción", momentum: "Impulso", clarity: "Claridad", intuition: "Intuición", decision: "Brújula de decisiones", decisionSubtitle: "Una pista para dar el siguiente paso", timing: "Explorar el momento de hoy", timingResult: "Avanza con intención hoy. Toma decisiones importantes cuando te sientas en calma.", demo: "Vista previa · Sin cálculo astrológico", notifications: "Avisos", noNotifications: "No hay avisos nuevos", vip: "VIP", artsSubtitle: "Quince tradiciones, una perspectiva", comingFeature: "Esta función estará disponible pronto", profile: "Perfil guardado", rotate: "Girar brújula" },
  fr: { home: "Accueil", arts: "15 arts", consult: "Conseil IA", mandala: "Mandala", settings: "Réglages", today: "Boussole du jour", theme: "Thème du jour", attack: "Avancer", energy: "Énergie élevée", expansion: "Le temps de s'ouvrir", wheelHint: "Faites glisser l'anneau pour tourner", biorhythm: "Biorythme du calendrier terrestre", rhythmSubtitle: "Rythme du jour", actionFocus: "Cap du jour", momentum: "Élan", clarity: "Clarté", intuition: "Intuition", decision: "Boussole de décision", decisionSubtitle: "Une piste pour votre prochain pas", timing: "Explorer le moment du jour", timingResult: "Avancez avec intention aujourd'hui. Prenez vos décisions importantes l'esprit apaisé.", demo: "Aperçu · Aucun calcul divinatoire connecté", notifications: "Notifications", noNotifications: "Aucune nouvelle notification", vip: "VIP", artsSubtitle: "Quinze traditions, un regard", comingFeature: "Cette fonctionnalité arrive bientôt", profile: "Profil enregistré", rotate: "Tourner la boussole" },
};

type TorisetsuTranslation = {
  manual: string; compatibility: string; manualTitle: string; manualIntro: string;
  colorsTitle: string; colorsIntro: string; colorLabels: string[]; colorNames: string[];
  partnerBirthDate: string; partnerHint: string; calculate: string; score: string;
  advice: [string, string, string]; lockedTitle: string; lockedBody: string; unlock: string;
  preview: string; detailLabel: string; summaryThemes: string[];
};

export const torisetsuTranslations: Record<Language, TorisetsuTranslation> = {
  ja: {
    manual: "自分のトリセツ", compatibility: "相性診断（相手）", manualTitle: "15占術から見る、あなたの輪郭", manualIntro: "異なる視点を重ねて、持ち味と行動傾向を読み解くプレビューです。",
    colorsTitle: "パーソナルカラー", colorsIntro: "6つのテーマを支える色", colorLabels: ["総合", "金運", "仕事", "恋愛", "対人", "健康"], colorNames: ["シャンパンゴールド", "翡翠", "瑠璃", "珊瑚", "藤", "琥珀"],
    partnerBirthDate: "お相手の生年月日", partnerHint: "生年月日を入力すると、相性の傾向をプレビューします。", calculate: "相性を診る", score: "相性スコア",
    advice: ["違いを急いで埋めず、互いのペースを言葉にすると関係が整います。", "共通点と違いのバランスが良好。小さな相談を重ねるほど信頼が深まります。", "自然に呼吸が合う組み合わせ。大切な決断ほど、二人の目的を確認しましょう。"],
    lockedTitle: "詳しい相性レポート", lockedBody: "価値観・会話・恋愛・長期関係の詳細アドバイスはVIP機能です。", unlock: "VIPで全機能解放", preview: "プレビュー表示 · 実際の占術計算ではありません", detailLabel: "読み解きを開く", summaryThemes: ["本質と人生のリズム", "決断と行動の傾向", "人との距離感", "才能が活きる場面", "心を整えるヒント"]
  },
  en: {
    manual: "My Manual", compatibility: "Compatibility", manualTitle: "Your outline through 15 traditions", manualIntro: "A preview layering different perspectives on your strengths and patterns.",
    colorsTitle: "Personal Colors", colorsIntro: "Colors supporting six parts of life", colorLabels: ["Overall", "Wealth", "Work", "Love", "Social", "Health"], colorNames: ["Champagne Gold", "Jade", "Lapis", "Coral", "Wisteria", "Amber"],
    partnerBirthDate: "Partner's birth date", partnerHint: "Enter a date to preview your compatibility pattern.", calculate: "View compatibility", score: "Compatibility score",
    advice: ["Name your different rhythms instead of rushing to resolve them.", "You balance similarities and differences well. Small conversations deepen trust.", "Your rhythms align naturally. Revisit shared goals before major decisions."],
    lockedTitle: "Detailed compatibility report", lockedBody: "Values, communication, romance, and long-term guidance are available with VIP.", unlock: "Unlock all with VIP", preview: "Preview only · Not a real divination calculation", detailLabel: "Open insight", summaryThemes: ["Core nature and life rhythm", "Decision and action patterns", "Relationship boundaries", "Where talent shines", "A cue for inner balance"]
  },
  "zh-CN": {
    manual: "我的使用说明", compatibility: "缘分诊断（对方）", manualTitle: "15种占术描绘的你", manualIntro: "从不同角度叠加解读你的优势与行动倾向。",
    colorsTitle: "个人色彩", colorsIntro: "支持六大生活主题的颜色", colorLabels: ["综合", "财运", "事业", "恋爱", "人际", "健康"], colorNames: ["香槟金", "翡翠", "琉璃", "珊瑚", "紫藤", "琥珀"],
    partnerBirthDate: "对方的出生日期", partnerHint: "输入日期即可预览缘分倾向。", calculate: "查看缘分", score: "缘分分数", advice: ["不要急于消除差异，说出彼此的节奏会让关系更稳定。", "共同点与差异平衡良好，日常沟通会加深信任。", "你们的节奏自然契合，重要决定前请确认共同目标。"],
    lockedTitle: "详细缘分报告", lockedBody: "价值观、沟通、恋爱与长期关系建议为VIP功能。", unlock: "VIP解锁全部功能", preview: "预览展示 · 并非真实占术计算", detailLabel: "展开解读", summaryThemes: ["本质与人生节奏", "决策与行动倾向", "人际距离感", "才能发挥场景", "内心平衡提示"]
  },
  "zh-TW": {
    manual: "我的使用說明", compatibility: "緣分診斷（對方）", manualTitle: "15種占術描繪的你", manualIntro: "從不同角度疊加解讀你的優勢與行動傾向。",
    colorsTitle: "個人色彩", colorsIntro: "支持六大生活主題的顏色", colorLabels: ["綜合", "財運", "事業", "戀愛", "人際", "健康"], colorNames: ["香檳金", "翡翠", "琉璃", "珊瑚", "紫藤", "琥珀"],
    partnerBirthDate: "對方的出生日期", partnerHint: "輸入日期即可預覽緣分傾向。", calculate: "查看緣分", score: "緣分分數", advice: ["不要急於消除差異，說出彼此的節奏會讓關係更穩定。", "共同點與差異平衡良好，日常溝通會加深信任。", "你們的節奏自然契合，重要決定前請確認共同目標。"],
    lockedTitle: "詳細緣分報告", lockedBody: "價值觀、溝通、戀愛與長期關係建議為VIP功能。", unlock: "VIP解鎖全部功能", preview: "預覽展示 · 並非真實占術計算", detailLabel: "展開解讀", summaryThemes: ["本質與人生節奏", "決策與行動傾向", "人際距離感", "才能發揮場景", "內心平衡提示"]
  },
  ko: {
    manual: "나의 사용 설명서", compatibility: "궁합 진단 (상대)", manualTitle: "15가지 점술로 보는 나", manualIntro: "서로 다른 관점으로 강점과 행동 성향을 살펴보는 미리보기입니다.",
    colorsTitle: "퍼스널 컬러", colorsIntro: "삶의 여섯 영역을 돕는 색", colorLabels: ["종합", "재물", "직업", "연애", "대인", "건강"], colorNames: ["샴페인 골드", "비취", "청금석", "산호", "등나무꽃", "호박"],
    partnerBirthDate: "상대방 생년월일", partnerHint: "날짜를 입력하면 궁합 성향을 미리 볼 수 있습니다.", calculate: "궁합 보기", score: "궁합 점수", advice: ["차이를 서둘러 없애기보다 서로의 속도를 말로 나눠보세요.", "공통점과 차이의 균형이 좋습니다. 작은 대화가 신뢰를 키웁니다.", "자연스럽게 호흡이 맞습니다. 큰 결정 전 공동 목표를 확인하세요."],
    lockedTitle: "상세 궁합 리포트", lockedBody: "가치관, 대화, 연애, 장기 관계 조언은 VIP 기능입니다.", unlock: "VIP로 모든 기능 열기", preview: "미리보기 · 실제 점술 계산이 아닙니다", detailLabel: "해석 열기", summaryThemes: ["본질과 삶의 리듬", "결정과 행동 패턴", "관계의 거리감", "재능이 빛나는 순간", "마음의 균형 힌트"]
  },
  es: {
    manual: "Mi manual", compatibility: "Compatibilidad", manualTitle: "Tu perfil a través de 15 tradiciones", manualIntro: "Una vista previa de tus fortalezas y patrones desde distintas perspectivas.",
    colorsTitle: "Colores personales", colorsIntro: "Colores para seis áreas de tu vida", colorLabels: ["General", "Dinero", "Trabajo", "Amor", "Social", "Salud"], colorNames: ["Oro champán", "Jade", "Lapislázuli", "Coral", "Glicinia", "Ámbar"],
    partnerBirthDate: "Fecha de nacimiento de tu pareja", partnerHint: "Introduce una fecha para ver la tendencia de compatibilidad.", calculate: "Ver compatibilidad", score: "Puntuación", advice: ["Expresad vuestros ritmos sin apresurar las diferencias.", "Hay buen equilibrio. Las pequeñas conversaciones refuerzan la confianza.", "Vuestros ritmos encajan. Confirmad metas comunes antes de decisiones importantes."],
    lockedTitle: "Informe detallado", lockedBody: "Valores, comunicación, romance y orientación a largo plazo están disponibles con VIP.", unlock: "Desbloquear todo con VIP", preview: "Solo vista previa · No es un cálculo real", detailLabel: "Abrir lectura", summaryThemes: ["Esencia y ritmo vital", "Decisión y acción", "Límites en relaciones", "Dónde brilla el talento", "Clave para el equilibrio"]
  },
  fr: {
    manual: "Mon mode d'emploi", compatibility: "Compatibilité", manualTitle: "Votre profil selon 15 traditions", manualIntro: "Un aperçu croisant plusieurs regards sur vos forces et vos tendances.",
    colorsTitle: "Couleurs personnelles", colorsIntro: "Six couleurs pour vos domaines de vie", colorLabels: ["Global", "Finances", "Travail", "Amour", "Relations", "Santé"], colorNames: ["Or champagne", "Jade", "Lapis", "Corail", "Glycine", "Ambre"],
    partnerBirthDate: "Date de naissance du partenaire", partnerHint: "Saisissez une date pour afficher la tendance de compatibilité.", calculate: "Voir la compatibilité", score: "Score de compatibilité", advice: ["N'effacez pas les différences trop vite : exprimez vos rythmes.", "L'équilibre est bon. De petits échanges renforcent la confiance.", "Vos rythmes s'accordent naturellement. Confirmez vos buts communs avant les grands choix."],
    lockedTitle: "Rapport détaillé", lockedBody: "Valeurs, communication, amour et conseils à long terme sont disponibles avec VIP.", unlock: "Tout débloquer avec VIP", preview: "Aperçu uniquement · Aucun calcul réel", detailLabel: "Ouvrir l'analyse", summaryThemes: ["Nature et rythme de vie", "Décision et action", "Distance relationnelle", "Expression des talents", "Clé d'équilibre intérieur"]
  }
};