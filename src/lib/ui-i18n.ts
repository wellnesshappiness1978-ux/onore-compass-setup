import { theoryCopy } from "./theory-copy";
import type { Language } from "./translations";

type Localized = Record<Language, string>;
const l = (ja: string, en: string, zhCN: string, zhTW: string, ko: string, es: string, fr: string): Localized => ({ ja, en, "zh-CN": zhCN, "zh-TW": zhTW, ko, es, fr });

const messages = {
  "common.brand": l("アゴルメンの羅針盤", "Agolmen's Compass", "阿戈尔曼罗盘", "阿戈爾曼羅盤", "아골멘의 나침반", "La brújula de Agolmen", "La boussole d’Agolmen"),
  "common.referenceNotice": l("診断は自己理解のための参考情報です。健康・投資・将来の結果を保証しません。", "Readings support self-reflection and do not guarantee health, investment, or future outcomes.", "解读仅供自我理解参考，不保证健康、投资或未来结果。", "解讀僅供自我理解參考，不保證健康、投資或未來結果。", "해석은 자기이해를 위한 참고이며 건강, 투자 또는 미래 결과를 보장하지 않습니다.", "Las lecturas sirven para la reflexión y no garantizan resultados de salud, inversión o futuro.", "Les lectures favorisent la réflexion et ne garantissent aucun résultat médical, financier ou futur."),
  "common.structure": l("仕組み・背景", "Method and background", "原理与背景", "原理與背景", "원리와 배경", "Método y contexto", "Méthode et contexte"),
  "common.scope": l("読み取る範囲", "What it explores", "解读范围", "解讀範圍", "해석 범위", "Ce que l’on explore", "Ce qui est exploré"),
  "common.calculationScope": l("計算の背景と、このアプリで読み取る範囲", "How it is calculated and what this app explores", "计算背景与本应用的解读范围", "計算背景與本應用的解讀範圍", "계산 배경과 앱의 해석 범위", "Cómo se calcula y qué explora la aplicación", "Mode de calcul et champ d’interprétation"),
  "common.notFormalReading": l("アプリ内の結果は生年月日・氏名などから算出した参考値で、各伝統の正式な鑑定をすべて実施したものではありません。", "Results are reflective references based on details such as birth date and name, not complete formal consultations in every tradition.", "应用结果依据生日、姓名等生成，仅供参考，并非逐一完成各传统的正式鉴定。", "應用結果依據生日、姓名等生成，僅供參考，並非逐一完成各傳統的正式鑑定。", "앱 결과는 생년월일과 이름 등을 바탕으로 한 참고 자료이며 각 전통의 정식 감정을 모두 수행한 것은 아닙니다.", "Los resultados son referencias basadas en datos como la fecha de nacimiento y el nombre, no consultas formales completas de cada tradición.", "Les résultats sont des repères fondés sur la date de naissance et le nom, et non des consultations formelles complètes de chaque tradition."),

  "arts.originTitle": l("星々の引力と生命の原点", "The stars and the origin of life", "星辰引力与生命原点", "星辰引力與生命原點", "별의 인력과 생명의 기원", "Las estrellas y el origen de la vida", "Les astres et l’origine de la vie"),
  "arts.origin": Object.fromEntries(Object.entries(theoryCopy).map(([language, copy]) => [language, copy.origin])) as Localized,
  "arts.nameOrigin": l("アゴルメンの由来", "The origin of Agolmen", "阿戈尔曼的由来", "阿戈爾曼的由來", "아골멘의 유래", "El origen de Agolmen", "L’origine d’Agolmen"),
  "arts.nameOrigin1": l("「アゴルメン」は、カタツムリやオウムガイの殻に見られる対数螺旋、すなわち自然の調和を象徴するフィボナッチスパイラルに由来します。自然界が描く黄金比（1:1.618）は、外界の乱れから自分の軸を守る家であり、中心から外へ豊かさを広げる発展の象徴です。", "Agolmen takes its name from the logarithmic spiral found in snail and nautilus shells—the Fibonacci spiral, a symbol of harmony in nature. The golden ratio (1:1.618) suggests both a home that protects one’s inner axis from outside noise and a pattern of growth that expands from the center.", "“阿戈尔曼”源自蜗牛与鹦鹉螺贝壳中的对数螺旋，也就是象征自然和谐的斐波那契螺旋。自然界呈现的黄金比例（1:1.618），既像守护内在轴心、不受外界纷扰的家，也象征从中心向外延展的成长。", "「阿戈爾曼」源自蝸牛與鸚鵡螺貝殼中的對數螺旋，也就是象徵自然和諧的費波那契螺旋。自然界呈現的黃金比例（1:1.618），既像守護內在軸心、不受外界紛擾的家，也象徵從中心向外延展的成長。", "‘아골멘’은 달팽이와 앵무조개 껍데기에서 보이는 로그 나선, 즉 자연의 조화를 상징하는 피보나치 나선에서 비롯되었습니다. 자연이 그리는 황금비(1:1.618)는 외부의 소음으로부터 내면의 축을 지키는 집이자 중심에서 바깥으로 풍요를 넓히는 성장의 상징입니다.", "Agolmen nace de la espiral logarítmica de las conchas de caracol y nautilo: la espiral de Fibonacci, símbolo de la armonía natural. La proporción áurea (1:1,618) evoca un hogar que protege el eje interior del ruido externo y un crecimiento que se expande desde el centro.", "Agolmen tire son nom de la spirale logarithmique des coquilles d’escargot et de nautile : la spirale de Fibonacci, symbole d’harmonie naturelle. Le nombre d’or (1:1,618) évoque à la fois un foyer protégeant l’axe intérieur du tumulte extérieur et une croissance rayonnant depuis le centre."),
  "arts.nameOrigin2": l("殻の中心は、周囲の声に揺らいでも自分の本質へ戻る場所。途切れず広がる螺旋は、経験を重ねるほど可能性が開き、新しい方向へ進み続ける生命の姿を映します。羅針盤は答えを押しつけず、自分の内側にある方角を確かめる道具です。複数の伝統的な見立てと現代的な整理を重ね、自分らしい選択へ戻る静かな案内役でありたいという願いを、この名に込めています。", "The shell’s center is a place to return to your essence when other voices unsettle you. Its unbroken spiral mirrors a life whose possibilities open through experience and continue in new directions. A compass does not impose an answer; it helps you check the direction already within. The name expresses our wish to be a quiet guide back to choices that feel true to you, combining traditional perspectives with modern organization.", "贝壳的中心，是在外界声音令人动摇时回到本质的地方。不断向外延伸的螺旋，映照着经验越丰富、可能性越展开，并持续迈向新方向的生命。罗盘不强加答案，而是帮助确认内心已有的方向。这个名字寄托着我们的愿望：融合传统视角与现代整理，成为引导你回到真实选择的安静向导。", "貝殼的中心，是在外界聲音令人動搖時回到本質的地方。不斷向外延伸的螺旋，映照著經驗越豐富、可能性越展開，並持續邁向新方向的生命。羅盤不強加答案，而是協助確認內心已有的方向。這個名字寄託著我們的願望：融合傳統視角與現代整理，成為引導你回到真實選擇的安靜嚮導。", "껍데기의 중심은 주변의 목소리에 흔들릴 때도 자신의 본질로 돌아가는 자리입니다. 끊임없이 펼쳐지는 나선은 경험이 쌓일수록 가능성이 열리고 새로운 방향으로 나아가는 생명의 모습을 비춥니다. 나침반은 답을 강요하지 않고 내면의 방향을 확인하게 돕습니다. 전통의 관점과 현대적 정리를 포개어 자신다운 선택으로 돌아가는 조용한 안내자가 되고자 하는 뜻을 이름에 담았습니다.", "El centro de la concha es el lugar al que volver cuando las voces externas nos apartan de lo esencial. Su espiral continua refleja una vida cuyas posibilidades se abren con la experiencia y avanzan hacia nuevas direcciones. Una brújula no impone respuestas: ayuda a reconocer el rumbo interior. El nombre expresa el deseo de ser una guía serena hacia elecciones auténticas, uniendo perspectivas tradicionales y una lectura contemporánea.", "Le centre de la coquille est le lieu où revenir à son essence lorsque les voix extérieures nous ébranlent. Sa spirale ininterrompue reflète une vie dont les possibles s’ouvrent avec l’expérience et avancent vers de nouvelles directions. Une boussole n’impose pas de réponse : elle aide à reconnaître son cap intérieur. Ce nom exprime le souhait d’être un guide discret vers des choix authentiques, en reliant traditions et lecture contemporaine."),
  "arts.summary": l("16以上の分析視点を重ね、あなた自身の羅針盤を見つけるための参考情報を届けます。", "More than sixteen perspectives combine to help you find your own inner compass.", "融合十六种以上的分析视角，为你寻找内在罗盘提供参考。", "融合十六種以上的分析視角，為你尋找內在羅盤提供參考。", "열여섯 가지가 넘는 관점을 겹쳐 자신만의 나침반을 찾는 데 도움이 되는 정보를 전합니다.", "Más de dieciséis perspectivas se combinan para ayudarte a encontrar tu propia brújula.", "Plus de seize perspectives se croisent pour vous aider à trouver votre propre boussole."),
  "arts.logicTitle": l("統合解析する16の分析ロジック", "Sixteen perspectives in the integrated reading", "综合解读的十六种分析视角", "綜合解讀的十六種分析視角", "통합 해석의 열여섯 가지 관점", "Dieciséis enfoques de la lectura integrada", "Seize approches de la lecture intégrée"),
  "arts.methodsTitle": l("主要な分析手法と役割", "Key methods and their roles", "主要分析方法与作用", "主要分析方法與作用", "주요 분석 방법과 역할", "Métodos principales y su función", "Méthodes principales et leur rôle"),

  "helio.title": l("地球暦 · Helio Compass", "Earth Calendar · Helio Compass", "地球历 · 日心罗盘", "地球曆 · 日心羅盤", "지구력 · 헬리오 나침반", "Calendario terrestre · Brújula heliocéntrica", "Calendrier terrestre · Boussole héliocentrique"),
  "helio.positionDescription": l("{date} 日本時間12時の太陽中心の天体位置。軌道の半径は見やすさのため模式化しています。", "Heliocentric positions at 12:00 Japan time on {date}. Orbit radii are simplified for readability.", "{date} 日本时间12时的日心天体位置。轨道半径为便于查看而采用示意比例。", "{date} 日本時間12時的日心天體位置。軌道半徑為便於查看而採用示意比例。", "{date} 일본 시간 12시의 태양 중심 천체 위치입니다. 궤도 반지름은 보기 쉽게 단순화했습니다.", "Posiciones heliocéntricas a las 12:00, hora de Japón, el {date}. Los radios orbitales están simplificados.", "Positions héliocentriques à 12 h, heure du Japon, le {date}. Les rayons orbitaux sont simplifiés pour la lisibilité."),
  "helio.imageLabel": l("{date}の太陽と6惑星の位置", "Positions of the Sun and six planets on {date}", "{date}太阳与六颗行星的位置", "{date}太陽與六顆行星的位置", "{date} 태양과 여섯 행성의 위치", "Posición del Sol y seis planetas el {date}", "Position du Soleil et de six planètes le {date}"),
  "planets.sun": l("太陽", "Sun", "太阳", "太陽", "태양", "Sol", "Soleil"),
  "planets.mercury": l("水星", "Mercury", "水星", "水星", "수성", "Mercurio", "Mercure"),
  "planets.venus": l("金星", "Venus", "金星", "金星", "금성", "Venus", "Vénus"),
  "planets.earth": l("地球", "Earth", "地球", "地球", "지구", "Tierra", "Terre"),
  "planets.mars": l("火星", "Mars", "火星", "火星", "화성", "Marte", "Mars"),
  "planets.jupiter": l("木星", "Jupiter", "木星", "木星", "목성", "Júpiter", "Jupiter"),
  "planets.saturn": l("土星", "Saturn", "土星", "土星", "토성", "Saturno", "Saturne"),

  "art.mandala": l("バースカラー曼陀羅アート", "Birth Color Mandala Art", "诞生色曼陀罗艺术", "誕生色曼陀羅藝術", "탄생 컬러 만다라 아트", "Arte mandala de colores natales", "Mandala des couleurs natales"),
  "art.cosmic": l("出生宇宙創生図", "Natal Cosmic Creation", "出生宇宙创生图", "出生宇宙創生圖", "출생 우주 창생도", "Creación cósmica natal", "Création cosmique natale"),

  "legal.nav": l("法務とサポート", "Legal and support", "法律与支持", "法律與支援", "법률 및 지원", "Legal y soporte", "Mentions et assistance"),
  "legal.support": l("カスタマーサポート・お問い合わせ", "Customer support", "客户支持与咨询", "客戶支援與諮詢", "고객 지원 및 문의", "Atención al cliente", "Service client"),
  "legal.share": l("SNSシェア", "Share", "社交平台分享", "社群分享", "SNS 공유", "Compartir", "Partager"),
  "legal.copied": l("アプリのリンクをコピーしました。", "App link copied.", "应用链接已复制。", "應用程式連結已複製。", "앱 링크를 복사했습니다.", "Enlace copiado.", "Lien copié."),
  "legal.shareFallback": l("診断カードやアート画像は各画面から保存・共有できます。", "Save or share insight cards and artwork from their screens.", "可在相应页面保存或分享解读卡与艺术图。", "可在相應畫面儲存或分享解讀卡與藝術圖。", "각 화면에서 진단 카드와 작품을 저장하거나 공유할 수 있습니다.", "Guarda o comparte tarjetas y obras desde sus pantallas.", "Enregistrez ou partagez cartes et œuvres depuis leurs écrans."),
  "legal.history": l("お問い合わせの受付と履歴", "Requests and history", "咨询与记录", "諮詢與記錄", "문의 및 내역", "Solicitudes e historial", "Demandes et historique"),
  "legal.openPage": l("この案内を別ページで開く", "Open this notice on its own page", "在单独页面打开", "在獨立頁面開啟", "별도 페이지에서 열기", "Abrir este aviso en otra página", "Ouvrir cet avis sur une autre page"),
} as const;

export type UiMessageKey = keyof typeof messages;
export type TranslationValues = Record<string, string | number>;

export function translate(language: Language, key: UiMessageKey, values: TranslationValues = {}) {
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), messages[key][language]);
}

export function createTranslator(language: Language) {
  return (key: UiMessageKey, values?: TranslationValues) => translate(language, key, values);
}

export const directionLabels: Record<Language, Record<"N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW" | "C", string>> = {
  ja: { N: "北", NE: "北東", E: "東", SE: "南東", S: "南", SW: "南西", W: "西", NW: "北西", C: "中央" },
  en: { N: "North", NE: "Northeast", E: "East", SE: "Southeast", S: "South", SW: "Southwest", W: "West", NW: "Northwest", C: "Center" },
  "zh-CN": { N: "北", NE: "东北", E: "东", SE: "东南", S: "南", SW: "西南", W: "西", NW: "西北", C: "中央" },
  "zh-TW": { N: "北", NE: "東北", E: "東", SE: "東南", S: "南", SW: "西南", W: "西", NW: "西北", C: "中央" },
  ko: { N: "북", NE: "북동", E: "동", SE: "남동", S: "남", SW: "남서", W: "서", NW: "북서", C: "중앙" },
  es: { N: "Norte", NE: "Noreste", E: "Este", SE: "Sureste", S: "Sur", SW: "Suroeste", W: "Oeste", NW: "Noroeste", C: "Centro" },
  fr: { N: "Nord", NE: "Nord-Est", E: "Est", SE: "Sud-Est", S: "Sud", SW: "Sud-Ouest", W: "Ouest", NW: "Nord-Ouest", C: "Centre" },
};

const nineStarNames: Record<Language, readonly string[]> = {
  ja: ["", "一白水星", "二黒土星", "三碧木星", "四緑木星", "五黄土星", "六白金星", "七赤金星", "八白土星", "九紫火星"],
  en: ["", "1 White Mercury", "2 Black Earth", "3 Jade Wood", "4 Green Wood", "5 Yellow Earth", "6 White Metal", "7 Red Metal", "8 White Earth", "9 Purple Fire"],
  "zh-CN": ["", "一白水星", "二黑土星", "三碧木星", "四绿木星", "五黄土星", "六白金星", "七赤金星", "八白土星", "九紫火星"],
  "zh-TW": ["", "一白水星", "二黑土星", "三碧木星", "四綠木星", "五黃土星", "六白金星", "七赤金星", "八白土星", "九紫火星"],
  ko: ["", "1 백수성", "2 흑토성", "3 벽목성", "4 녹목성", "5 황토성", "6 백금성", "7 적금성", "8 백토성", "9 자화성"],
  es: ["", "1 Mercurio blanco", "2 Tierra negra", "3 Madera jade", "4 Madera verde", "5 Tierra amarilla", "6 Metal blanco", "7 Metal rojo", "8 Tierra blanca", "9 Fuego púrpura"],
  fr: ["", "1 Mercure blanc", "2 Terre noire", "3 Bois jade", "4 Bois vert", "5 Terre jaune", "6 Métal blanc", "7 Métal rouge", "8 Terre blanche", "9 Feu pourpre"],
};

export const nineStarName = (language: Language, value: number) => nineStarNames[language][value] ?? String(value);

const trigramNames: Record<Language, Record<"son" | "ri" | "kon" | "shin" | "center" | "da" | "gon" | "kan" | "ken", string>> = {
  ja: { son: "巽", ri: "離", kon: "坤", shin: "震", center: "中宮", da: "兌", gon: "艮", kan: "坎", ken: "乾" },
  en: { son: "Xun", ri: "Li", kon: "Kun", shin: "Zhen", center: "Center", da: "Dui", gon: "Gen", kan: "Kan", ken: "Qian" },
  "zh-CN": { son: "巽", ri: "离", kon: "坤", shin: "震", center: "中宫", da: "兑", gon: "艮", kan: "坎", ken: "乾" },
  "zh-TW": { son: "巽", ri: "離", kon: "坤", shin: "震", center: "中宮", da: "兌", gon: "艮", kan: "坎", ken: "乾" },
  ko: { son: "손", ri: "리", kon: "곤", shin: "진", center: "중궁", da: "태", gon: "간", kan: "감", ken: "건" },
  es: { son: "Xun", ri: "Li", kon: "Kun", shin: "Zhen", center: "Centro", da: "Dui", gon: "Gen", kan: "Kan", ken: "Qian" },
  fr: { son: "Xun", ri: "Li", kon: "Kun", shin: "Zhen", center: "Centre", da: "Dui", gon: "Gen", kan: "Kan", ken: "Qian" },
};

export type TrigramId = keyof (typeof trigramNames)["ja"];
export const trigramLabel = (language: Language, trigram: TrigramId, direction: keyof (typeof directionLabels)["ja"]) => trigram === "center" ? directionLabels[language].C : `${trigramNames[language][trigram]} · ${directionLabels[language][direction]}`;