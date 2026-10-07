import type { Language } from "./translations";

type Method = { title: string; background: string; scope: string };
type ArtsGuideCopy = {
  introduction: string;
  originTitle: string;
  origin: string;
  nameOrigin: string;
  nameOrigin1: string;
  nameOrigin2: string;
  summary: string;
  logicTitle: string;
  methodsTitle: string;
  groups: readonly { title: string; body: string }[];
  methods: readonly Method[];
  dialogDescription: string;
  background: string;
  scope: string;
  disclaimer: string;
};

const en: ArtsGuideCopy = {
  introduction: "INTRODUCTION", originTitle: "The stars and the origin of life",
  origin: "All life on Earth moves within vast natural cycles, symbolized by tides and the Sun's energy. Across history, people have connected the motions of the Moon, Sun, and stars with human rhythms and treated the sky at birth as a point of reflection. Agolmen's Compass combines calculated celestial positions with traditional calendars to offer a symbolic map for reviewing the present and choosing a better course. It does not claim that celestial bodies scientifically determine personality or the future.",
  nameOrigin: "The origin of Agolmen",
  nameOrigin1: "Agolmen takes its name from the logarithmic spiral found in snail and nautilus shells—the Fibonacci spiral, a symbol of harmony in nature. The golden ratio (1:1.618) suggests both a home that protects one’s inner axis from outside noise and a pattern of growth that expands from the center.",
  nameOrigin2: "The shell’s center is a place to return to your essence when other voices unsettle you. Its unbroken spiral mirrors a life whose possibilities open through experience and continue in new directions. A compass does not impose an answer; it helps you check the direction already within. The name expresses our wish to be a quiet guide back to choices that feel true to you.",
  summary: "More than fifteen perspectives combine to help you find your own inner compass.", logicTitle: "Fifteen perspectives in the integrated reading", methodsTitle: "Key methods and their roles",
  groups: [
    { title: "Celestial and cosmic", body: "Western astrology (horoscope and ten bodies), Vedic astrology, Zi Wei Dou Shu, and the Earth Calendar" },
    { title: "Eastern destiny systems", body: "Four Pillars, Sanmeigaku, Nine Star Ki, lunar mansions, and the 60-animal model" },
    { title: "Numbers and structure", body: "Numerology, the Maya Tzolkin calendar, and birth-color theory" },
    { title: "Body, environment, and psychology", body: "Name analysis, blood-type folklore, sibling-order psychology, and regional context" },
  ],
  methods: [
    { title: "Fifteen-perspective integrated analysis", background: "A layered framework in which different traditions complement blind spots and apparent contradictions.", scope: "It organizes outward style, inner motives, talents, relationships, and decision timing into a multidimensional reflection." },
    { title: "Name analysis", background: "A traditional East Asian method that examines the written and spoken structure of a name.", scope: "It offers a symbolic view of social impression, visible strengths, relationships, and long-term direction." },
    { title: "Numerology", background: "A number-based model inspired by Pythagorean and Kabbalistic traditions, using the birth date.", scope: "It reflects on central life themes, motives, talents, and the focus of the current period." },
    { title: "Animal personality model", background: "A modern 60-type model inspired by the twelve stages used in Four Pillars and framed as behavioral reflection.", scope: "It explores decision habits, values, motivating language, and preferred ways of acting." },
    { title: "Earth Calendar · Helio Compass", background: "A yearly calendar visualizing the positions of Earth and the planets around the Sun.", scope: "It provides a reflective view of personal and collective rhythms, seasonal transitions, and business decisions—not a promise of success." },
    { title: "Twelve-year animal cycle", background: "A traditional cycle combining the twelve year signs with wood, fire, earth, metal, and water.", scope: "It reflects on persistence, instinctive responses under pressure, and adaptation to changing environments." },
    { title: "Western astrology", background: "A tradition that reads the arrangement of the Sun, Moon, Mercury, Venus, and other bodies at birth.", scope: "It explores identity, emotions, affection, curiosity, and communication style." },
    { title: "Blood-type temperament folklore", background: "A familiar four-category cultural framework. It is not a scientifically established personality test.", scope: "It offers prompts about emotional expression, interpersonal distance, caution, and stress responses." },
    { title: "Traditional feng shui", background: "An environmental tradition combining a birth-year direction type with the annual Flying Star cycle.", scope: "It suggests directions, colors, plants, and room arrangements as general references, not a property-specific survey." },
  ],
  dialogDescription: "How it works and what this app explores", background: "Method and background", scope: "What it explores", disclaimer: "For self-reflection only. It does not determine health, profit, aptitude, or future outcomes.",
};

const ja: ArtsGuideCopy = {
  introduction: "はじめに", originTitle: "星々の引力と生命の原点", origin: "地球上のすべての生命は、潮の満ち引きや太陽エネルギーに象徴される大きな自然の循環の中で生きています。古くから人々は月・太陽・星々の巡りに心身のリズムを重ね、誕生時の空を自分を見つめる原点としてきました。アゴルメンの羅針盤は、計算した天体位置と伝統的な暦を手がかりに、今の状態を振り返り、よりよい航路を選ぶための象徴的な地図を届けます。天体が性格や未来を科学的に決定するという主張ではなく、自然の周期から自分を見つめ直すための参考となる見立てです。", nameOrigin: "アゴルメンの由来", nameOrigin1: "「アゴルメン」は、カタツムリやオウムガイの殻に見られる対数螺旋、すなわち自然の調和を象徴するフィボナッチスパイラルに由来します。自然界が描く黄金比（1:1.618）は、外界の乱れから自分の軸を守る家であり、中心から外へ豊かさを広げる発展の象徴です。", nameOrigin2: "殻の中心は、周囲の声に揺らいでも自分の本質へ戻る場所。途切れず広がる螺旋は、経験を重ねるほど可能性が開き、新しい方向へ進み続ける生命の姿を映します。羅針盤は答えを押しつけず、自分の内側にある方角を確かめる道具です。複数の伝統的な見立てと現代的な整理を重ね、自分らしい選択へ戻る静かな案内役でありたいという願いを、この名に込めています。", summary: "15以上の分析視点を重ね、あなた自身の羅針盤を見つけるための参考情報を届けます。", logicTitle: "統合解析する15の分析ロジック", methodsTitle: "主要な分析手法と役割",
  groups: [{ title: "天体・宇宙系", body: "西洋占星術（ホロスコープ・10天体）、インド占星術、紫微斗数、地球暦" }, { title: "東洋・命理系", body: "四柱推命、算命学、九星気学、宿曜占星術、動物占い（60分類）" }, { title: "数理・構造系", body: "数秘術、マヤ暦（ツォルキン）、バースカラー理論" }, { title: "身体・環境・心理系", body: "姓名判断、血液型気質学、兄弟構成心理学、地域風土心理学" }],
  methods: [
    { title: "15の占術（多層統合解析）", background: "異なる伝統が、単一の見方では見落としやすい矛盾や側面を補い合う統合システムです。", scope: "表の顔、内面の動機、才能、人間関係、決断のタイミングを多面的に整理します。" },
    { title: "本格姓名判断", background: "名前の漢字やよみの構造を手がかりにする東洋の伝統的な見立てです。", scope: "対外印象、社会で評価される強み、対人関係、長期的な方向性を考えます。" },
    { title: "数秘術", background: "ピタゴラス式やカバラの伝統を参考に、生年月日の数字を整理する数理モデルです。", scope: "魂の動機、人生の中心テーマ、才能、今期の課題を考えます。" },
    { title: "動物占い（60分類）", background: "四柱推命の十二運星を参考に、現代的な行動心理として整理した60分類モデルです。", scope: "意思決定の癖、価値観、響く言葉、行動のスイッチを考えます。" },
    { title: "地球暦（Helio Compass）", background: "太陽を中心に地球と各惑星の位置関係を示す1年のカレンダーです。", scope: "個人や集団のリズム、季節の転換、事業判断を考える参考視点であり、成功を保証しません。" },
    { title: "干支占い", background: "生まれ年の十二支と木・火・土・金・水の巡りを組み合わせる伝統的な周期法です。", scope: "粘り強さ、危機での本能的な反応、環境への順応性を考えます。" },
    { title: "西洋占星術", background: "出生時の太陽・月・水星・金星などの天体配置を読む伝統です。", scope: "内面の感情、知性、愛情表現、好奇心、コミュニケーションを考えます。" },
    { title: "血液型気質学", background: "4つの血液型を用いる文化的な見立てで、科学的に確立された性格判定ではありません。", scope: "感情表現、対人距離、警戒心、ストレス反応を振り返ります。" },
    { title: "本格風水学", background: "立春基準の生年と性別から求める方位タイプに、年ごとの飛星を重ねる環境の伝統です。", scope: "方位、色、植物、部屋の整え方を一般的に提案し、住まい固有の現地鑑定は行いません。" },
  ], dialogDescription: "計算の背景と、このアプリで読み取る範囲", background: "仕組み・背景", scope: "読み取る範囲", disclaimer: "自己理解のための参考情報です。健康、利益、適性、未来の結果を確定するものではありません。",
};

const adapted = (base: ArtsGuideCopy, values: Partial<ArtsGuideCopy>): ArtsGuideCopy => ({ ...base, ...values });

export const artsGuideCopy: Record<Language, ArtsGuideCopy> = {
  ja, en,
  "zh-CN": adapted(en, { introduction: "简介", originTitle: "星辰引力与生命原点", nameOrigin: "阿戈尔曼的由来", summary: "融合十五种以上的分析视角，为你寻找内在罗盘提供参考。", logicTitle: "综合解读的十五种分析视角", methodsTitle: "主要分析方法与作用", dialogDescription: "计算背景与本应用的解读范围", background: "原理与背景", scope: "解读范围", disclaimer: "仅供自我理解参考，不决定健康、收益、能力或未来结果。", groups: [{ title: "天体与宇宙", body: "西方占星、印度占星、紫微斗数、地球历" }, { title: "东方命理", body: "四柱推命、算命学、九星气学、宿曜、动物占卜" }, { title: "数字与结构", body: "数字命理、玛雅历、诞生色理论" }, { title: "身体、环境与心理", body: "姓名分析、血型文化、手足排行心理、地域环境" }] }),
  "zh-TW": adapted(en, { introduction: "簡介", originTitle: "星辰引力與生命原點", nameOrigin: "阿戈爾曼的由來", summary: "融合十五種以上的分析視角，為你尋找內在羅盤提供參考。", logicTitle: "綜合解讀的十五種分析視角", methodsTitle: "主要分析方法與作用", dialogDescription: "計算背景與本應用的解讀範圍", background: "原理與背景", scope: "解讀範圍", disclaimer: "僅供自我理解參考，不決定健康、收益、能力或未來結果。", groups: [{ title: "天體與宇宙", body: "西洋占星、印度占星、紫微斗數、地球曆" }, { title: "東方命理", body: "四柱推命、算命學、九星氣學、宿曜、動物占卜" }, { title: "數字與結構", body: "數字命理、馬雅曆、誕生色理論" }, { title: "身體、環境與心理", body: "姓名分析、血型文化、手足排行心理、地域環境" }] }),
  ko: adapted(en, { introduction: "소개", originTitle: "별의 인력과 생명의 기원", nameOrigin: "아골멘의 유래", summary: "열다섯 가지가 넘는 관점을 겹쳐 자신만의 나침반을 찾는 데 도움을 줍니다.", logicTitle: "통합 해석의 열다섯 가지 관점", methodsTitle: "주요 분석 방법과 역할", dialogDescription: "계산 배경과 앱의 해석 범위", background: "원리와 배경", scope: "해석 범위", disclaimer: "자기이해를 위한 참고이며 건강, 이익, 적성, 미래를 결정하지 않습니다.", groups: [{ title: "천체와 우주", body: "서양 점성술, 인도 점성술, 자미두수, 지구력" }, { title: "동양 명리", body: "사주, 산메이가쿠, 구성기학, 숙요, 동물 점술" }, { title: "수와 구조", body: "수비학, 마야력, 탄생 컬러 이론" }, { title: "몸, 환경, 심리", body: "성명학, 혈액형 문화, 형제 순서 심리, 지역 환경" }] }),
  es: adapted(en, { introduction: "INTRODUCCIÓN", originTitle: "Las estrellas y el origen de la vida", nameOrigin: "El origen de Agolmen", summary: "Más de quince perspectivas se combinan para ayudarte a encontrar tu propia brújula.", logicTitle: "Quince enfoques de la lectura integrada", methodsTitle: "Métodos principales y su función", dialogDescription: "Cómo se calcula y qué explora la aplicación", background: "Método y contexto", scope: "Qué explora", disclaimer: "Solo para reflexión personal; no determina salud, beneficios, aptitudes ni resultados futuros.", groups: [{ title: "Celeste y cósmico", body: "Astrología occidental y védica, Zi Wei Dou Shu y calendario terrestre" }, { title: "Sistemas orientales", body: "Cuatro Pilares, Sanmeigaku, nueve estrellas, mansiones lunares y modelo animal" }, { title: "Números y estructura", body: "Numerología, calendario maya y teoría de colores natales" }, { title: "Cuerpo, entorno y psicología", body: "Nombre, cultura del grupo sanguíneo, orden fraterno y contexto regional" }] }),
  fr: adapted(en, { introduction: "INTRODUCTION", originTitle: "Les astres et l’origine de la vie", nameOrigin: "L’origine d’Agolmen", summary: "Plus de quinze perspectives se croisent pour vous aider à trouver votre propre boussole.", logicTitle: "Quinze approches de la lecture intégrée", methodsTitle: "Méthodes principales et leur rôle", dialogDescription: "Mode de calcul et champ d’interprétation", background: "Méthode et contexte", scope: "Ce qui est exploré", disclaimer: "Pour la réflexion personnelle uniquement ; ne détermine ni santé, ni gains, ni aptitudes, ni avenir.", groups: [{ title: "Céleste et cosmique", body: "Astrologie occidentale et védique, Zi Wei Dou Shu et calendrier terrestre" }, { title: "Systèmes orientaux", body: "Quatre Piliers, Sanmeigaku, neuf étoiles, demeures lunaires et modèle animal" }, { title: "Nombres et structure", body: "Numérologie, calendrier maya et théorie des couleurs natales" }, { title: "Corps, environnement et psychologie", body: "Nom, culture du groupe sanguin, rang dans la fratrie et contexte régional" }] }),
};