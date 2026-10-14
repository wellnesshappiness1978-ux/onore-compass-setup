import type { Language } from "./translations";
import { companionCopy } from "./companion-copy";
export type ColorExperienceCopy = {
 steps: string[]; titles: string[]; labels: string[]; science: string; basis: string; provisional: string; symbolNote: string; protect: string; protectNote: string; psych: string[]; elements: string[]; daily: string[]; scenes: string[]; sceneTips: string[]; nonSpectral: string; reference: string; palette: string; appearance: string[];
};
export const colorExperienceCopy: Record<Language, ColorExperienceCopy> = {
  "ja": {
    "steps": [
      "本質",
      "共鳴",
      "実践"
    ],
    "titles": [
      "色が持つ表情を知る",
      "あなたの色を読み解く",
      "暮らしの中で色を使う"
    ],
    "labels": [
      "光の波長",
      "色彩心理",
      "対応チャクラ・領域（象徴）",
      "宇宙・五行の象徴",
      "算出の手がかり",
      "6つのテーマ",
      "毎日の取り入れ方",
      "シーン別の活用"
    ],
    "science": "HEXは画面上のRGB混色です。この色に固有の単一波長はありません。可視光はおよそ380〜780 nmで、下記は色相に近い光の参考範囲です。",
    "basis": "現在は生年月日・出生時刻・出生都道府県と太陽黄経から作る再現可能な参考パレットです。同じ入力なら同じ色になりますが、測定された固有波長ではありません。家系ルーツは算出に使っていません。",
    "provisional": "出生時刻が不明のため、正午を使った参考色です。",
    "symbolNote": "宇宙・五行は芸術的な連想です。伝統的な五行の確定対応や出生星座の判定ではありません。",
    "protect": "補正・プロテクトカラー",
    "protectNote": "気持ちの境界を整える象徴色です。魔除け、治癒、運の改善を保証しません。",
    "psych": [
      "赤系は活力や注意を連想させます。強く感じるときは小さな差し色に。",
      "橙系は温もりや親しみを連想させます。穏やかな背景色と合わせて。",
      "黄系は明るさや軽快さを連想させます。強い発光や長時間の凝視は避けて。",
      "緑系は自然や落ち着きを連想させます。心地よい濃さを選んで。",
      "青緑系は透明感や爽やかさを連想させます。余白と組み合わせて。",
      "青系は静けさや信頼を連想させます。暗さや冷たさを感じたら量を控えて。",
      "紫系は神秘や想像力を連想させます。小物で上品なアクセントに。",
      "桃・マゼンタ系は柔らかさや華やぎを連想させます。単一のスペクトル波長では再現できません。"
    ],
    "elements": [
      "火 · 恒星の光",
      "火 · 暁の光",
      "土 · 星の砂",
      "木 · 生命の芽",
      "水 · 星間の流れ",
      "水 · 深宇宙",
      "金 · 星晶のきらめき",
      "火 · 星雲の花"
    ],
    "daily": [
      "スマホ壁紙：文字が読める暗さを保ち、差し色として。",
      "財布・名刺入れ：選択前に優先順位を思い出す目印に。",
      "服・インテリア：ハンカチやクッション一つから。アロマコインは色を添える小物として。"
    ],
    "scenes": [
      "商談・プレゼン",
      "瞑想・休息",
      "対人交渉"
    ],
    "sceneTips": [
      "仕事色をノートに添え、伝えたい要点を一つ書く。色より準備と相手への配慮を大切に。",
      "休息色を視界の隅へ。楽な姿勢で休み、眩しさを避ける。治療や睡眠改善の代わりにはしない。",
      "対人色を小物に添え、相手の話を最後まで聞く合図に。気持ちや結果を色で決めつけない。"
    ],
    "nonSpectral": "混色・非スペクトル色",
    "reference": "参考範囲",
    "palette": "補助のサブカラー",
    "appearance": [
      "テーマ試着",
      "契約プランに合わせる",
      "適用中のテーマ",
      "装飾の比較",
      "羅針盤の枠",
      "天球儀・軌道",
      "宝石・神聖幾何学",
      "試着のみ · 契約や利用権限は変わりません",
      "法人向け · 試着のみ"
    ]
  },
  "en": {
    "steps": [
      "Essence",
      "Resonance",
      "Practice"
    ],
    "titles": [
      "The character of color",
      "Your reflective palette",
      "Color in everyday life"
    ],
    "labels": [
      "Light wavelength",
      "Color psychology",
      "Chakra & region (symbolic)",
      "Cosmic & element symbolism",
      "How it is derived",
      "Six themes",
      "Everyday details",
      "Choose a scene"
    ],
    "science": "HEX is an RGB mixture on a screen, not a single physical wavelength. Visible light spans roughly 380–780 nm; the ranges below refer only to similar spectral hues.",
    "basis": "This reproducible reference palette uses birth date, time, prefecture and solar longitude. Equal inputs give equal colors, not a measured lifelong frequency. Family roots are not used.",
    "provisional": "Unknown birth time: a noon reference is used.",
    "symbolNote": "Cosmic and five-element associations are artistic, not verified traditional correspondences or a natal zodiac reading.",
    "protect": "Balance & protection color",
    "protectNote": "A symbolic cue for personal boundaries, not protection from harm, healing or improved fortune.",
    "psych": [
      "Red can suggest energy and attention. Use a small accent if it feels intense.",
      "Orange can suggest warmth and approachability. Pair it with quiet surroundings.",
      "Yellow can suggest brightness and lightness. Avoid intense glare.",
      "Green can suggest nature and calm. Choose a comfortable intensity.",
      "Turquoise can suggest freshness and clarity. Give it breathing room.",
      "Blue can suggest quiet and trust. Reduce it if it feels cold or dark.",
      "Violet can suggest mystery and imagination. Try a subtle accessory.",
      "Pink and magenta can suggest softness or celebration. They are mixed, non-spectral hues."
    ],
    "elements": [
      "Fire · starlight",
      "Fire · dawn",
      "Earth · stellar dust",
      "Wood · growth",
      "Water · interstellar flow",
      "Water · deep space",
      "Metal · star crystal",
      "Fire · nebula blossom"
    ],
    "daily": [
      "Wallpaper: retain readable contrast and use the color as an accent.",
      "Wallet or business-card case: a cue to check your priorities.",
      "Clothes and interiors: start with one scarf or cushion. An aroma coin can be a decorative accent."
    ],
    "scenes": [
      "Pitch & presentation",
      "Meditation & rest",
      "Negotiation"
    ],
    "sceneTips": [
      "Add your work color to notes and write one key point. Preparation matters more than color.",
      "Keep the rest color at the edge of your view and avoid glare. It is not treatment or a sleep aid.",
      "Use the connection color as a reminder to listen fully. It cannot determine someone’s feelings or the outcome."
    ],
    "nonSpectral": "Mixed / non-spectral",
    "reference": "Reference range",
    "palette": "Supporting shade",
    "appearance": [
      "Theme fitting",
      "Follow my plan",
      "Current theme",
      "Craft comparison",
      "Compass frame",
      "Astrolabe & orbits",
      "Gems & sacred geometry",
      "Fitting only · membership and access stay unchanged",
      "Corporate · fitting only"
    ]
  },
  "zh-CN": {
    "steps": [
      "本质",
      "共鸣",
      "实践"
    ],
    "titles": [
      "认识色彩的表情",
      "解读你的参考色盘",
      "把色彩融入生活"
    ],
    "labels": [
      "光的波长",
      "色彩心理",
      "脉轮与领域（象征）",
      "宇宙与五行象征",
      "计算依据",
      "六大主题",
      "日常应用",
      "选择场景"
    ],
    "science": "HEX是屏幕RGB混色，并非单一波长。可见光约380–780 nm，下方仅为相近光谱色的参考范围。",
    "basis": "目前根据出生日期、时间、都道府县和太阳黄经生成可重复的参考色盘。相同输入得到相同颜色，并非测量所得的终身固有波长。家系根源未参与计算。",
    "provisional": "出生时间未知，采用正午参考。",
    "symbolNote": "宇宙和五行仅是艺术联想，不是确定的传统对应或出生星座判断。",
    "protect": "平衡与守护色",
    "protectNote": "象征个人边界，不保证辟邪、疗愈或运势改善。",
    "psych": [
      "红色联想到活力和注意，可少量点缀。",
      "橙色联想到温暖和亲切。",
      "黄色联想到明快，避免刺眼。",
      "绿色联想到自然和平静。",
      "青绿色联想到清爽与透明。",
      "蓝色联想到安静和信任。",
      "紫色联想到神秘与想象。",
      "粉色与品红联想到柔和与华丽，属于非光谱混色。"
    ],
    "elements": [
      "火·星光",
      "火·曙光",
      "土·星尘",
      "木·萌芽",
      "水·星际流动",
      "水·深空",
      "金·星晶",
      "火·星云之花"
    ],
    "daily": [
      "壁纸：保持文字对比，少量点缀。",
      "钱包或名片夹：提醒确认优先顺序。",
      "服饰和室内：从一条手帕或靠垫开始，芳香币可作为装饰小物。"
    ],
    "scenes": [
      "商谈与演讲",
      "冥想与休息",
      "人际交涉"
    ],
    "sceneTips": [
      "在笔记加上工作色，写下一个重点。准备比颜色更重要。",
      "把休息色置于视线边缘，避免眩光，不能替代治疗。",
      "用人际色提醒自己听完对方的话，不以颜色判断结果。"
    ],
    "nonSpectral": "混色／非光谱色",
    "reference": "参考范围",
    "palette": "辅助色",
    "appearance": [
      "主题试穿",
      "跟随当前方案",
      "当前主题",
      "工艺比较",
      "罗盘框",
      "天球仪与轨道",
      "宝石与神圣几何",
      "仅试穿·不改变会员和权限",
      "法人·仅试穿"
    ]
  },
  "zh-TW": {
    "steps": [
      "本質",
      "共鳴",
      "實踐"
    ],
    "titles": [
      "認識色彩的表情",
      "解讀你的參考色盤",
      "把色彩融入生活"
    ],
    "labels": [
      "光的波長",
      "色彩心理",
      "脈輪與領域（象徵）",
      "宇宙與五行象徵",
      "計算依據",
      "六大主題",
      "日常應用",
      "選擇情境"
    ],
    "science": "HEX是螢幕RGB混色，並非單一波長。可見光約380–780 nm，下方僅為相近光譜色的參考範圍。",
    "basis": "目前根據出生日期、時間、都道府縣和太陽黃經產生可重複的參考色盤。相同輸入得到相同顏色，並非測量所得的終身固有波長。家系根源未參與計算。",
    "provisional": "出生時間未知，採用正午參考。",
    "symbolNote": "宇宙和五行僅是藝術聯想，不是確定的傳統對應或出生星座判斷。",
    "protect": "平衡與守護色",
    "protectNote": "象徵個人界線，不保證避邪、療癒或運勢改善。",
    "psych": [
      "紅色聯想到活力和注意，可少量點綴。",
      "橙色聯想到溫暖和親切。",
      "黃色聯想到明快，避免刺眼。",
      "綠色聯想到自然和平靜。",
      "青綠色聯想到清爽與透明。",
      "藍色聯想到安靜和信任。",
      "紫色聯想到神秘與想像。",
      "粉色與洋紅聯想到柔和與華麗，屬於非光譜混色。"
    ],
    "elements": [
      "火·星光",
      "火·曙光",
      "土·星塵",
      "木·萌芽",
      "水·星際流動",
      "水·深空",
      "金·星晶",
      "火·星雲之花"
    ],
    "daily": [
      "桌布：保持文字對比，少量點綴。",
      "錢包或名片夾：提醒確認優先順序。",
      "服飾和室內：從一條手帕或靠墊開始，芳香幣可作為裝飾小物。"
    ],
    "scenes": [
      "商談與演講",
      "冥想與休息",
      "人際交涉"
    ],
    "sceneTips": [
      "在筆記加上工作色，寫下一個重點。準備比顏色更重要。",
      "把休息色置於視線邊緣，避免眩光，不能替代治療。",
      "用人際色提醒自己聽完對方的話，不以顏色判斷結果。"
    ],
    "nonSpectral": "混色／非光譜色",
    "reference": "參考範圍",
    "palette": "輔助色",
    "appearance": [
      "主題試穿",
      "跟隨目前方案",
      "目前主題",
      "工藝比較",
      "羅盤框",
      "天球儀與軌道",
      "寶石與神聖幾何",
      "僅試穿·不改變會員和權限",
      "法人·僅試穿"
    ]
  },
  "ko": {
    "steps": [
      "본질",
      "공명",
      "실천"
    ],
    "titles": [
      "색의 표정 이해하기",
      "나의 참고 팔레트",
      "일상 속 색 활용"
    ],
    "labels": [
      "빛의 파장",
      "색채 심리",
      "차크라·영역 (상징)",
      "우주와 오행 상징",
      "산출 근거",
      "여섯 주제",
      "일상 활용",
      "상황 선택"
    ],
    "science": "HEX는 화면의 RGB 혼색이며 단일 파장이 아닙니다. 가시광선은 약 380–780 nm이며 아래는 유사한 스펙트럼 색의 참고 범위입니다.",
    "basis": "생년월일, 시간, 도도부현과 태양 황경으로 재현 가능한 참고 팔레트를 만듭니다. 같은 입력은 같은 색이지만 측정된 평생 고유 파장은 아닙니다. 가계 뿌리는 사용하지 않습니다.",
    "provisional": "출생 시각을 모르면 정오를 참고합니다.",
    "symbolNote": "우주와 오행은 예술적 연상이며 검증된 전통 대응이나 출생 별자리 판정이 아닙니다.",
    "protect": "균형과 보호 색",
    "protectNote": "개인 경계의 상징이며 액막이, 치료나 행운을 보장하지 않습니다.",
    "psych": [
      "빨강은 활력과 주의를 연상시킵니다.",
      "주황은 온기와 친근함을 연상시킵니다.",
      "노랑은 밝음을 연상시키며 눈부심을 피하세요.",
      "초록은 자연과 차분함을 연상시킵니다.",
      "청록은 상쾌함을 연상시킵니다.",
      "파랑은 고요함과 신뢰를 연상시킵니다.",
      "보라는 신비와 상상력을 연상시킵니다.",
      "분홍과 마젠타는 부드러움과 화려함을 연상시키는 비스펙트럼 혼색입니다."
    ],
    "elements": [
      "화·별빛",
      "화·새벽",
      "토·별 먼지",
      "목·새싹",
      "수·성간 흐름",
      "수·깊은 우주",
      "금·별 결정",
      "화·성운 꽃"
    ],
    "daily": [
      "배경화면: 글자 대비를 유지하고 포인트로 사용하세요.",
      "지갑·명함집: 우선순위를 확인하는 신호로.",
      "옷과 인테리어: 손수건이나 쿠션 하나부터. 아로마 코인은 장식 소품으로."
    ],
    "scenes": [
      "상담·발표",
      "명상·휴식",
      "대인 협상"
    ],
    "sceneTips": [
      "업무색을 노트에 더하고 핵심 한 가지를 적으세요. 준비가 색보다 중요합니다.",
      "휴식색을 시야 가장자리에 두고 눈부심을 피하세요. 치료를 대신하지 않습니다.",
      "관계색으로 끝까지 듣기를 기억하세요. 색으로 결과를 단정하지 마세요."
    ],
    "nonSpectral": "혼색 / 비스펙트럼",
    "reference": "참고 범위",
    "palette": "보조 색",
    "appearance": [
      "테마 피팅",
      "내 플랜에 맞추기",
      "현재 테마",
      "공예 비교",
      "나침반 프레임",
      "천구의와 궤도",
      "보석과 신성 기하학",
      "피팅만 · 회원 권한은 바뀌지 않습니다",
      "법인 · 피팅만"
    ]
  },
  "es": {
    "steps": [
      "Esencia",
      "Resonancia",
      "Práctica"
    ],
    "titles": [
      "El carácter del color",
      "Tu paleta de reflexión",
      "El color en tu vida"
    ],
    "labels": [
      "Longitud de onda",
      "Psicología del color",
      "Chakra y región (simbólicos)",
      "Simbolismo cósmico",
      "Cómo se obtiene",
      "Seis temas",
      "Detalles cotidianos",
      "Elige una situación"
    ],
    "science": "HEX mezcla RGB en pantalla, no una sola longitud de onda. La luz visible abarca unos 380–780 nm; abajo se indican tonos espectrales similares.",
    "basis": "Paleta reproducible basada en fecha, hora, prefectura natal y longitud solar. Los mismos datos dan los mismos colores, no una frecuencia personal medida. No se usan raíces familiares.",
    "provisional": "Hora desconocida: referencia del mediodía.",
    "symbolNote": "El cosmos y los elementos son asociaciones artísticas, no correspondencias tradicionales verificadas ni un zodiaco natal.",
    "protect": "Color de equilibrio y protección",
    "protectNote": "Símbolo de límites personales, sin promesas de protección, curación o fortuna.",
    "psych": [
      "El rojo evoca energía y atención.",
      "El naranja evoca calidez y cercanía.",
      "El amarillo evoca luz; evita deslumbramientos.",
      "El verde evoca naturaleza y calma.",
      "El turquesa evoca frescura.",
      "El azul evoca quietud y confianza.",
      "El violeta evoca misterio e imaginación.",
      "El rosa y magenta evocan suavidad y celebración; son mezclas no espectrales."
    ],
    "elements": [
      "Fuego · estrellas",
      "Fuego · alba",
      "Tierra · polvo estelar",
      "Madera · brotes",
      "Agua · flujo interestelar",
      "Agua · espacio profundo",
      "Metal · cristal estelar",
      "Fuego · flor nebular"
    ],
    "daily": [
      "Fondo de pantalla: conserva el contraste del texto.",
      "Cartera o tarjetero: una señal para revisar prioridades.",
      "Ropa y hogar: comienza con un pañuelo o cojín. Una moneda aromática puede ser decorativa."
    ],
    "scenes": [
      "Presentación",
      "Meditación y descanso",
      "Negociación"
    ],
    "sceneTips": [
      "Añade el color de trabajo a tus notas y escribe una idea clave. Prepararte importa más que el color.",
      "Deja el color de descanso al borde de la vista, sin brillo intenso. No sustituye tratamientos.",
      "Usa el color de conexión para recordar escuchar. No determina sentimientos ni resultados."
    ],
    "nonSpectral": "Mezcla / no espectral",
    "reference": "Rango orientativo",
    "palette": "Color de apoyo",
    "appearance": [
      "Probar tema",
      "Seguir mi plan",
      "Tema actual",
      "Comparar artesanía",
      "Marco de brújula",
      "Astrolabio y órbitas",
      "Gemas y geometría sagrada",
      "Solo prueba · sin cambiar acceso ni membresía",
      "Empresa · solo prueba"
    ]
  },
  "fr": {
    "steps": [
      "Essence",
      "Résonance",
      "Pratique"
    ],
    "titles": [
      "Le caractère de la couleur",
      "Votre palette de réflexion",
      "La couleur au quotidien"
    ],
    "labels": [
      "Longueur d’onde",
      "Psychologie des couleurs",
      "Chakra et région (symboliques)",
      "Symbolisme cosmique",
      "Méthode de calcul",
      "Six thèmes",
      "Détails du quotidien",
      "Choisir une situation"
    ],
    "science": "HEX est un mélange RGB à l’écran, pas une longueur d’onde unique. La lumière visible couvre environ 380–780 nm ; les plages ci-dessous concernent des teintes spectrales proches.",
    "basis": "Palette reproductible issue de la date, de l’heure, de la préfecture de naissance et de la longitude solaire. Les mêmes données donnent les mêmes couleurs, pas une fréquence personnelle mesurée. Les racines familiales ne sont pas utilisées.",
    "provisional": "Heure inconnue : référence de midi.",
    "symbolNote": "Cosmos et éléments sont des associations artistiques, non des correspondances traditionnelles vérifiées ni un zodiaque natal.",
    "protect": "Couleur d’équilibre et de protection",
    "protectNote": "Un symbole de limites personnelles, sans promesse de protection, de guérison ou de chance.",
    "psych": [
      "Le rouge évoque énergie et attention.",
      "L’orange évoque chaleur et proximité.",
      "Le jaune évoque luminosité ; évitez l’éblouissement.",
      "Le vert évoque nature et calme.",
      "Le turquoise évoque fraîcheur.",
      "Le bleu évoque silence et confiance.",
      "Le violet évoque mystère et imagination.",
      "Rose et magenta évoquent douceur et fête ; ce sont des mélanges non spectraux."
    ],
    "elements": [
      "Feu · étoiles",
      "Feu · aube",
      "Terre · poussière stellaire",
      "Bois · bourgeons",
      "Eau · flux interstellaire",
      "Eau · espace profond",
      "Métal · cristal stellaire",
      "Feu · fleur de nébuleuse"
    ],
    "daily": [
      "Fond d’écran : gardez le texte lisible.",
      "Portefeuille ou porte-cartes : un rappel de vos priorités.",
      "Vêtements et intérieur : commencez par un foulard ou coussin. Une pièce aromatique peut être décorative."
    ],
    "scenes": [
      "Présentation",
      "Méditation et repos",
      "Négociation"
    ],
    "sceneTips": [
      "Ajoutez la couleur de travail aux notes et écrivez une idée clé. La préparation compte plus que la couleur.",
      "Gardez la couleur de repos au bord du regard, sans éblouissement. Elle ne remplace pas un traitement.",
      "La couleur relationnelle rappelle d’écouter jusqu’au bout. Elle ne décide ni des sentiments ni du résultat."
    ],
    "nonSpectral": "Mélange / non spectral",
    "reference": "Plage indicative",
    "palette": "Teinte de soutien",
    "appearance": [
      "Essayage des thèmes",
      "Suivre mon offre",
      "Thème actuel",
      "Comparer l’artisanat",
      "Cadre de boussole",
      "Astrolabe et orbites",
      "Gemmes et géométrie sacrée",
      "Essayage seulement · accès et abonnement inchangés",
      "Entreprise · essayage seulement"
    ]
  }
};

// Keep educational color science intact; only practice prose uses the companion voice.
for (const language of Object.keys(colorExperienceCopy) as Language[]) {
  colorExperienceCopy[language].daily = companionCopy[language].colorDaily;
  colorExperienceCopy[language].sceneTips = companionCopy[language].colorScenes;
}
