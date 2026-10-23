// Traditional 12-sign and 12-branch symbolism for explanation and AI phrasing.
// These are cultural reference descriptions, never verified personality measurements.
import type { Language } from "./translations";

export type SignInfo = { name: string; symbol: string; element: string; quality: string; traits: string };
export type BranchInfo = { name: string; animal: string; element: string; yinYang: string; traits: string };

const SIGN_NAMES = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"] as const;
const BRANCH_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

const signData: Record<Language, { symbols: string[]; elements: string[]; qualities: string[]; traits: string[] }> = {
  ja: {
    symbols: ["白羊", "雄牛", "双子", "蟹", "獅子", "乙女", "天秤", "蠍", "射手", "山羊", "水瓶", "魚"],
    elements: ["火", "地", "風", "水", "火", "地", "風", "水", "火", "地", "風", "水"],
    qualities: ["活動宮", "不動宮", "柔軟宮", "活動宮", "不動宮", "柔軟宮", "活動宮", "不動宮", "柔軟宮", "活動宮", "不動宮", "柔軟宮"],
    traits: [
      "始まりを切り開く勇気と純粋な行動力の象徴",
      "五感で豊かさを味わい、着実に育てる安定の象徴",
      "好奇心と言葉で世界をつなぐ柔軟な知性の象徴",
      "守り育てる慈しみと、心のふるさとを大切にする象徴",
      "自己表現の輝きと、周囲を照らす創造性の象徴",
      "整え、分析し、実用へ仕上げる繊細な手つきの象徴",
      "調和と美意識で関係を結ぶバランスの象徴",
      "深く潜り真実を見極める集中と再生の象徴",
      "未知へ矢を放つ探求心と楽観の象徴",
      "時間を味方に頂へ登る責任感と忍耐の象徴",
      "既成の枠を超えて未来を描く革新と博愛の象徴",
      "境界を溶かし、夢と共感で包む感性の象徴",
    ],
  },
  en: {
    symbols: ["Ram", "Bull", "Twins", "Crab", "Lion", "Maiden", "Scales", "Scorpion", "Archer", "Goat", "Water Bearer", "Fish"],
    elements: ["Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water"],
    qualities: ["Cardinal", "Fixed", "Mutable", "Cardinal", "Fixed", "Mutable", "Cardinal", "Fixed", "Mutable", "Cardinal", "Fixed", "Mutable"],
    traits: [
      "Courage to open beginnings and pure drive to act",
      "Steady stability that savors and nurtures abundance",
      "Flexible intellect connecting the world through curiosity and words",
      "Tenderness that protects and cherishes the heart's home",
      "Radiant self-expression and creativity that lights others",
      "A delicate hand that orders, analyzes and perfects",
      "Balance that binds relationships through harmony and beauty",
      "Focus and renewal that dive deep to find truth",
      "Exploration and optimism that aim arrows at the unknown",
      "Responsibility and patience that climb with time as an ally",
      "Innovation and humanity that draw futures beyond convention",
      "Sensitivity that dissolves boundaries in dreams and empathy",
    ],
  },
  "zh-CN": {
    symbols: ["公羊", "公牛", "双子", "螃蟹", "狮子", "少女", "天秤", "蝎子", "射手", "山羊", "水瓶", "双鱼"],
    elements: ["火", "土", "风", "水", "火", "土", "风", "水", "火", "土", "风", "水"],
    qualities: ["基本宫", "固定宫", "变动宫", "基本宫", "固定宫", "变动宫", "基本宫", "固定宫", "变动宫", "基本宫", "固定宫", "变动宫"],
    traits: [
      "开拓开端的勇气与纯粹行动力",
      "以五感品味丰饶、踏实培育的稳定",
      "以好奇与语言连接世界的灵活知性",
      "守护与养育的慈爱，珍惜心灵故乡",
      "自我表达的光芒与照亮周围的创造力",
      "整理、分析并落到实用的细腻手法",
      "以和谐与美感联结关系的平衡",
      "深入探究真相的专注与再生",
      "向未知放箭的探求心与乐观",
      "以时间为友攀登顶峰的责任感与忍耐",
      "超越既有框架描绘未来的革新与博爱",
      "消融边界、以梦与共感包容的感性",
    ],
  },
  "zh-TW": {
    symbols: ["公羊", "公牛", "雙子", "螃蟹", "獅子", "少女", "天秤", "蠍子", "射手", "山羊", "水瓶", "雙魚"],
    elements: ["火", "土", "風", "水", "火", "土", "風", "水", "火", "土", "風", "水"],
    qualities: ["基本宮", "固定宮", "變動宮", "基本宮", "固定宮", "變動宮", "基本宮", "固定宮", "變動宮", "基本宮", "固定宮", "變動宮"],
    traits: [
      "開拓開端的勇氣與純粹行動力",
      "以五感品味豐饒、踏實培育的穩定",
      "以好奇與語言連接世界的靈活知性",
      "守護與養育的慈愛，珍惜心靈故鄉",
      "自我表達的光芒與照亮周圍的創造力",
      "整理、分析並落到實用的細膩手法",
      "以和諧與美感聯結關係的平衡",
      "深入探究真相的專注與再生",
      "向未知放箭的探求心與樂觀",
      "以時間為友攀登頂峰的責任感與忍耐",
      "超越既有框架描繪未來的革新與博愛",
      "消融邊界、以夢與共感包容的感性",
    ],
  },
  ko: {
    symbols: ["양", "황소", "쌍둥이", "게", "사자", "처녀", "천칭", "전갈", "궁수", "염소", "물병", "물고기"],
    elements: ["불", "흙", "바람", "물", "불", "흙", "바람", "물", "불", "흙", "바람", "물"],
    qualities: ["활동궁", "고정궁", "변통궁", "활동궁", "고정궁", "변통궁", "활동궁", "고정궁", "변통궁", "활동궁", "고정궁", "변통궁"],
    traits: [
      "시작을 여는 용기와 순수한 행동력의 상징",
      "오감으로 풍요를 누리며 꾸준히 키우는 안정의 상징",
      "호기심과 언어로 세상을 잇는 유연한 지성의 상징",
      "지키고 기르는 자애와 마음의 고향을 소중히 하는 상징",
      "자기표현의 빛과 주위를 밝히는 창조성의 상징",
      "정돈하고 분석해 실용으로 완성하는 섬세한 손길의 상징",
      "조화와 미의식으로 관계를 잇는 균형의 상징",
      "깊이 들어가 진실을 꿰뚫는 집중과 재생의 상징",
      "미지를 향해 화살을 쏘는 탐구심과 낙관의 상징",
      "시간을 벗 삼아 정상에 오르는 책임감과 인내의 상징",
      "기존 틀을 넘어 미래를 그리는 혁신과 박애의 상징",
      "경계를 녹이고 꿈과 공감으로 감싸는 감성의 상징",
    ],
  },
  es: {
    symbols: ["Carnero", "Toro", "Gemelos", "Cangrejo", "León", "Doncella", "Balanza", "Escorpión", "Arquero", "Cabra", "Aguador", "Peces"],
    elements: ["Fuego", "Tierra", "Aire", "Agua", "Fuego", "Tierra", "Aire", "Agua", "Fuego", "Tierra", "Aire", "Agua"],
    qualities: ["Cardinal", "Fijo", "Mutable", "Cardinal", "Fijo", "Mutable", "Cardinal", "Fijo", "Mutable", "Cardinal", "Fijo", "Mutable"],
    traits: [
      "Coraje para abrir comienzos y pura fuerza de acción",
      "Estabilidad que saborea la abundancia y la cultiva con constancia",
      "Intelecto flexible que conecta el mundo con curiosidad y palabras",
      "Ternura que protege y cuida el hogar del corazón",
      "Expresión radiante y creatividad que ilumina a los demás",
      "Mano delicada que ordena, analiza y lleva a lo práctico",
      "Equilibrio que une relaciones con armonía y sentido estético",
      "Concentración y renovación que se sumergen en busca de la verdad",
      "Exploración y optimismo que lanzan flechas hacia lo desconocido",
      "Responsabilidad y paciencia que ascienden con el tiempo como aliado",
      "Innovación y humanidad que dibujan futuros más allá de lo convencional",
      "Sensibilidad que disuelve fronteras con sueños y empatía",
    ],
  },
  fr: {
    symbols: ["Bélier", "Taureau", "Jumeaux", "Crabe", "Lion", "Vierge", "Balance", "Scorpion", "Archer", "Chèvre", "Verseau", "Poissons"],
    elements: ["Feu", "Terre", "Air", "Eau", "Feu", "Terre", "Air", "Eau", "Feu", "Terre", "Air", "Eau"],
    qualities: ["Cardinal", "Fixe", "Mutable", "Cardinal", "Fixe", "Mutable", "Cardinal", "Fixe", "Mutable", "Cardinal", "Fixe", "Mutable"],
    traits: [
      "Courage d'ouvrir les commencements et pure force d'action",
      "Stabilité qui savoure l'abondance et la fait croître patiemment",
      "Intellect flexible reliant le monde par la curiosité et les mots",
      "Tendresse qui protège et chérit la patrie du cœur",
      "Expression rayonnante et créativité qui éclaire les autres",
      "Main délicate qui ordonne, analyse et rend concret",
      "Équilibre qui relie les relations par l'harmonie et le sens de la beauté",
      "Concentration et renouveau qui plongent au fond de la vérité",
      "Exploration et optimisme qui décochent leurs flèches vers l'inconnu",
      "Responsabilité et patience gravissant les sommets avec le temps pour allié",
      "Innovation et humanité dessinant l'avenir au-delà des cadres établis",
      "Sensibilité qui dissout les frontières dans les rêves et l'empathie",
    ],
  },
};

const signNames: Record<Language, string[]> = {
  ja: [...SIGN_NAMES],
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  "zh-CN": ["白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座", "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座"],
  "zh-TW": ["白羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座", "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"],
  ko: ["양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "사수자리", "염소자리", "물병자리", "물고기자리"],
  es: ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"],
  fr: ["Bélier", "Taureau", "Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons"],
};

/** Localized info for a stored Japanese sign name (e.g. "牡羊座"). */
export function signInfo(jaName: string, language: Language): SignInfo | null {
  const i = SIGN_NAMES.indexOf(jaName as (typeof SIGN_NAMES)[number]);
  if (i < 0) return null;
  const d = signData[language];
  return { name: signNames[language][i]!, symbol: d.symbols[i]!, element: d.elements[i]!, quality: d.qualities[i]!, traits: d.traits[i]! };
}

/** All twelve signs in zodiac order for explanation screens. */
export function allSigns(language: Language): SignInfo[] {
  return SIGN_NAMES.map((_, i) => signInfo(SIGN_NAMES[i]!, language)!);
}

const branchAnimals: Record<Language, string[]> = {
  ja: ["鼠", "牛", "虎", "兎", "龍", "蛇", "馬", "羊", "猿", "鶏", "犬", "猪"],
  en: ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Boar"],
  "zh-CN": ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
  "zh-TW": ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"],
  ko: ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"],
  es: ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Jabalí"],
  fr: ["Rat", "Buffle", "Tigre", "Lapin", "Dragon", "Serpent", "Cheval", "Chèvre", "Singe", "Coq", "Chien", "Sanglier"],
};
const BRANCH_ELEMENTS = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"] as const;
const branchElements: Record<Language, string[]> = {
  ja: [...BRANCH_ELEMENTS],
  en: ["Water", "Earth", "Wood", "Wood", "Earth", "Fire", "Fire", "Earth", "Metal", "Metal", "Earth", "Water"],
  "zh-CN": ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"],
  "zh-TW": ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"],
  ko: ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"],
  es: ["Agua", "Tierra", "Madera", "Madera", "Tierra", "Fuego", "Fuego", "Tierra", "Metal", "Metal", "Tierra", "Agua"],
  fr: ["Eau", "Terre", "Bois", "Bois", "Terre", "Feu", "Feu", "Terre", "Métal", "Métal", "Terre", "Eau"],
};
const branchTraits: Record<Language, string[]> = {
  ja: [
    "機転と蓄えの知恵。小さな種から豊かさを育てる",
    "粘り強さと誠実。一歩一歩、確かな土台を築く",
    "勇気と情熱。困難に立ち向かう開拓の力",
    "穏やかさと気配り。調和を結ぶ跳躍の力",
    "理想と気魄。大きな志で周囲を引っ張る",
    "知性と直感。静かに本質を見極める",
    "行動力と明るさ。風のように駆ける自由さ",
    "優しさと協調。和を大切にする包容力",
    "器用さと好奇心。変化を楽しむ柔軟さ",
    "几帳面さと誠実さ。時を告げる真面目さ",
    "忠実さと正義感。信頼を守り抜く誠意",
    "素直さと包容力。まっすぐに突き進む温かさ",
  ],
  en: [
    "Resourcefulness and the wisdom to save; growing abundance from small seeds",
    "Perseverance and sincerity; building firm ground step by step",
    "Courage and passion; a pioneering force that faces hardship",
    "Gentleness and care; a leaping force that binds harmony",
    "Ideals and spirit; pulling others along with great ambition",
    "Intellect and intuition; quietly discerning the essence",
    "Drive and brightness; a freedom that runs like the wind",
    "Kindness and cooperation; an embrace that treasures peace",
    "Dexterity and curiosity; flexibility that enjoys change",
    "Precision and honesty; the earnestness to announce the hour",
    "Loyalty and justice; sincerity that protects trust",
    "Candor and warmth; pressing straight ahead with heart",
  ],
  "zh-CN": [
    "机敏与积蓄的智慧，从小种子培育丰饶",
    "坚韧与诚实，一步一步筑牢地基",
    "勇气与热情，直面困难的开拓之力",
    "温和与体贴，联结和谐的跳跃之力",
    "理想与气魄，以远大志向带动周围",
    "知性与直觉，安静地洞察本质",
    "行动力与开朗，如风般驰骋的自由",
    "温柔与协作，珍视和睦的包容力",
    "灵巧与好奇，享受变化的柔韧",
    "严谨与诚恳，报时的认真",
    "忠诚与正义感，守护信任的诚意",
    "率直与包容，勇往直前的温暖",
  ],
  "zh-TW": [
    "機敏與積蓄的智慧，從小種子培育豐饒",
    "堅韌與誠實，一步一步築牢地基",
    "勇氣與熱情，直面困難的開拓之力",
    "溫和與體貼，聯結和諧的跳躍之力",
    "理想與氣魄，以遠大志向帶動周圍",
    "知性與直覺，安靜地洞察本質",
    "行動力與開朗，如風般馳騁的自由",
    "溫柔與協作，珍視和睦的包容力",
    "靈巧與好奇，享受變化的柔韌",
    "嚴謹與誠懇，報時的認真",
    "忠誠與正義感，守護信任的誠意",
    "率直與包容，勇往直前的溫暖",
  ],
  ko: [
    "재치와 저축의 지혜. 작은 씨앗에서 풍요를 키움",
    "끈기와 성실. 한 걸음씩 단단한 토대를 쌓음",
    "용기와 열정. 어려움에 맞서는 개척의 힘",
    "온화함과 배려. 조화를 잇는 도약의 힘",
    "이상과 기백. 큰 뜻으로 주위를 이끔",
    "지성과 직관. 조용히 본질을 꿰뚫음",
    "행동력과 밝음. 바람처럼 달리는 자유",
    "다정함과 협조. 화합을 소중히 하는 포용력",
    "손재주와 호기심. 변화를 즐기는 유연함",
    "꼼꼼함과 성실함. 시간을 알리는 진지함",
    "충실함과 정의감. 신뢰를 지키는 성의",
    "순수함과 포용력. 곧장 나아가는 따뜻함",
  ],
  es: [
    "Ingenio y sabiduría para ahorrar; abundancia desde semillas pequeñas",
    "Perseverancia y sinceridad; cimientos firmes paso a paso",
    "Coraje y pasión; fuerza pionera ante la adversidad",
    "Dulzura y atención; un salto que une en armonía",
    "Ideales y temple; arrastra a otros con gran ambición",
    "Intelecto e intuición; discierne la esencia en silencio",
    "Impulso y alegría; libertad que corre como el viento",
    "Bondad y cooperación; abrazo que cuida la paz",
    "Destreza y curiosidad; flexibilidad que disfruta el cambio",
    "Precisión y honestidad; la seriedad que anuncia la hora",
    "Lealtad y justicia; sinceridad que protege la confianza",
    "Franqueza y calidez; avanza directo con el corazón",
  ],
  fr: [
    "Débrouillardise et sagesse d'épargne ; l'abondance naît de petites graines",
    "Persévérance et sincérité ; des fondations solides pas à pas",
    "Courage et passion ; une force pionnière face à l'épreuve",
    "Douceur et attention ; un bond qui tisse l'harmonie",
    "Idéaux et fougue ; entraîne les autres avec de grandes ambitions",
    "Intellect et intuition ; discerne l'essentiel en silence",
    "Élan et gaieté ; une liberté qui court comme le vent",
    "Bonté et coopération ; une étreinte qui chérit la paix",
    "Adresse et curiosité ; une souplesse qui aime le changement",
    "Précision et honnêteté ; le sérieux qui annonce l'heure",
    "Loyauté et sens de la justice ; une sincérité qui protège la confiance",
    "Franchise et chaleur ; avance droit avec le cœur",
  ],
};
const yinYangLabels: Record<Language, [string, string]> = {
  ja: ["陽", "陰"], en: ["Yang", "Yin"], "zh-CN": ["阳", "阴"], "zh-TW": ["陽", "陰"], ko: ["양", "음"], es: ["Yang", "Yin"], fr: ["Yang", "Yin"],
};

/** Localized info for a branch index 0-11 (子=0). */
export function branchInfo(index: number, language: Language): BranchInfo {
  const i = ((index % 12) + 12) % 12;
  return { name: BRANCH_NAMES[i]!, animal: branchAnimals[language][i]!, element: branchElements[language][i]!, yinYang: yinYangLabels[language][i % 2]!, traits: branchTraits[language][i]! };
}

/** All twelve branches in traditional order for explanation screens. */
export function allBranches(language: Language): BranchInfo[] {
  return BRANCH_NAMES.map((_, i) => branchInfo(i, language));
}

/** Birth-year branch index (子=0), using the 立春 boundary like Four Pillars. */
export function yearBranchIndex(birthDate: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  // Approximate 立春 (Feb 4) boundary, matching the four-pillars year rule closely enough for the year branch.
  const year = mo < 2 || (mo === 2 && d < 4) ? y - 1 : y;
  return ((year - 4) % 12 + 12) % 12;
}
