import type { Language } from "./translations";

/** Stable sentinel stored in group member lists to mean "the account owner". Nil UUID keeps server validation intact. */
export const SELF_MEMBER_ID = "00000000-0000-0000-0000-000000000000";

type Family = "red" | "orange" | "gold" | "green" | "teal" | "blue" | "violet" | "rose" | "neutral";
const hueOf = (hex: string): Family => {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 0.08) return "neutral";
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 70) return "gold";
  if (h < 160) return "green";
  if (h < 195) return "teal";
  if (h < 255) return "blue";
  if (h < 300) return "violet";
  return "rose";
};

type Meaning = { name: string; essence: string; energy: string; role: string; advice: string };
const M: Record<Family, Record<Language, Meaning>> = {
  red: {
    ja: { name: "紅炎の結束色", essence: "情熱と行動力が重なり合う、前へ進む力の色です。", energy: "熱く速い波動。決めたことを一気に形にする推進力として表れやすい組み合わせです。", role: "停滞を破る起爆剤。新しい挑戦や立ち上げの場面で真価を発揮します。", advice: "勢いが強いぶん、決める前に一呼吸おいて全員の声を確認すると摩擦が減ります。" },
    en: { name: "Crimson Flame Bond", essence: "A color where passion and drive overlap into forward momentum.", energy: "A hot, fast vibration that tends to turn decisions into action quickly.", role: "The spark that breaks stagnation — strongest when launching something new.", advice: "Pause once before deciding and check every voice; it softens friction." },
    "zh-CN": { name: "红焰结盟色", essence: "热情与行动力交汇、向前推进的颜色。", energy: "炽热而迅速的波动，容易把决定迅速化为行动。", role: "打破停滞的引爆点，在新挑战和启动阶段最能发挥。", advice: "势头强时，决定前停一停，听取每个人的意见可减少摩擦。" },
    "zh-TW": { name: "紅焰結盟色", essence: "熱情與行動力交會、向前推進的顏色。", energy: "熾熱而迅速的波動，容易把決定迅速化為行動。", role: "打破停滯的引爆點，在新挑戰與啟動階段最能發揮。", advice: "勢頭強時，決定前停一停，聽取每個人的意見可減少摩擦。" },
    ko: { name: "홍염의 결속색", essence: "열정과 행동력이 겹쳐 앞으로 나아가는 힘의 색입니다.", energy: "뜨겁고 빠른 파동으로, 결정을 빠르게 행동으로 옮기기 쉽습니다.", role: "정체를 깨는 기폭제. 새로운 도전과 시작에서 진가를 발휘합니다.", advice: "결정 전에 한 번 숨을 고르고 모두의 의견을 확인하면 마찰이 줄어듭니다." },
    es: { name: "Lazo de llama carmesí", essence: "Un color donde la pasión y el impulso se suman en avance.", energy: "Una vibración cálida y rápida que convierte decisiones en acción.", role: "La chispa que rompe el estancamiento; brilla al iniciar proyectos.", advice: "Haced una pausa antes de decidir y escuchad todas las voces." },
    fr: { name: "Lien de flamme pourpre", essence: "Une couleur où passion et élan se rejoignent pour avancer.", energy: "Une vibration chaude et rapide qui transforme vite les décisions en actes.", role: "L'étincelle qui brise la stagnation, idéale pour lancer un projet.", advice: "Marquez une pause avant de décider et écoutez chaque voix." },
  },
  orange: {
    ja: { name: "陽橙の交歓色", essence: "明るさと親しみやすさが集まる、場を温める色です。", energy: "社交的で弾む波動。会話から自然にアイデアが生まれやすい組み合わせです。", role: "人と人をつなぐ潤滑油。家族行事やチームの雰囲気づくりに向きます。", advice: "楽しさが先行しやすいので、役割と期限を一行で共有しておくと安心です。" },
    en: { name: "Sunlit Orange Harmony", essence: "A warm color where brightness and friendliness gather.", energy: "A sociable, buoyant vibration — ideas tend to arise from conversation.", role: "The connector between people; great for gatherings and team mood.", advice: "Fun can lead the way, so share roles and deadlines in one line." },
    "zh-CN": { name: "阳橙交欢色", essence: "明亮与亲切汇聚、温暖气氛的颜色。", energy: "社交而轻快的波动，容易在对话中自然产生点子。", role: "连接人与人的润滑剂，适合家庭活动与团队氛围。", advice: "容易以快乐为先，用一句话共享分工和期限会更安心。" },
    "zh-TW": { name: "陽橙交歡色", essence: "明亮與親切匯聚、溫暖氣氛的顏色。", energy: "社交而輕快的波動，容易在對話中自然產生點子。", role: "連結人與人的潤滑劑，適合家庭活動與團隊氛圍。", advice: "容易以快樂為先，用一句話共享分工與期限會更安心。" },
    ko: { name: "햇살 오렌지 교감색", essence: "밝음과 친근함이 모여 분위기를 데우는 색입니다.", energy: "사교적이고 경쾌한 파동으로, 대화에서 아이디어가 나오기 쉽습니다.", role: "사람을 잇는 윤활유. 가족 행사와 팀 분위기에 좋습니다.", advice: "즐거움이 앞서기 쉬우니 역할과 기한을 한 줄로 공유하세요." },
    es: { name: "Armonía naranja solar", essence: "Un color cálido donde se reúnen alegría y cercanía.", energy: "Vibración sociable y ligera; las ideas surgen al conversar.", role: "Une a las personas; ideal para reuniones y ambiente de equipo.", advice: "Compartid roles y plazos en una frase para no perder el rumbo." },
    fr: { name: "Harmonie orange solaire", essence: "Une couleur chaleureuse où se rassemblent gaieté et proximité.", energy: "Vibration sociable et légère ; les idées naissent de la conversation.", role: "Le lien entre les personnes, idéal pour l'ambiance d'équipe.", advice: "Partagez rôles et échéances en une phrase pour rester clairs." },
  },
  gold: {
    ja: { name: "黄金の実り色", essence: "安定と豊かさを育てる、実りを分かち合う色です。", energy: "穏やかで温かい波動。信頼を積み重ね、成果を形に残しやすい組み合わせです。", role: "全体を支える土台。長期計画や家計・資産の話し合いに向きます。", advice: "慎重さが強まる日は、小さな成功を言葉にして称え合うと流れが軽くなります。" },
    en: { name: "Golden Harvest", essence: "A color that nurtures stability and shared abundance.", energy: "A calm, warm vibration that builds trust and lasting results.", role: "The foundation of the whole; suited to long-term and money talks.", advice: "When caution grows, name small wins aloud to lighten the flow." },
    "zh-CN": { name: "黄金丰收色", essence: "培育稳定与丰盛、分享成果的颜色。", energy: "温和而温暖的波动，容易积累信任并留下成果。", role: "支撑整体的基础，适合长期计划与财务讨论。", advice: "谨慎变强时，说出小小的成功并互相称赞，能让流动变轻。" },
    "zh-TW": { name: "黃金豐收色", essence: "培育穩定與豐盛、分享成果的顏色。", energy: "溫和而溫暖的波動，容易累積信任並留下成果。", role: "支撐整體的基礎，適合長期計畫與財務討論。", advice: "謹慎變強時，說出小小的成功並互相稱讚，能讓流動變輕。" },
    ko: { name: "황금 결실색", essence: "안정과 풍요를 키우며 결실을 나누는 색입니다.", energy: "온화하고 따뜻한 파동으로, 신뢰를 쌓고 성과를 남기기 쉽습니다.", role: "전체를 받치는 토대. 장기 계획과 재정 대화에 좋습니다.", advice: "신중함이 커지는 날엔 작은 성공을 말로 칭찬해 보세요." },
    es: { name: "Cosecha dorada", essence: "Un color que cultiva estabilidad y abundancia compartida.", energy: "Vibración serena y cálida que construye confianza y resultados.", role: "La base del grupo; ideal para planes a largo plazo y finanzas.", advice: "Si crece la cautela, celebrad en voz alta los pequeños logros." },
    fr: { name: "Moisson dorée", essence: "Une couleur qui nourrit stabilité et abondance partagée.", energy: "Vibration calme et chaude qui bâtit confiance et résultats.", role: "Le socle du groupe, adapté aux projets longs et aux finances.", advice: "Quand la prudence domine, célébrez à voix haute les petites réussites." },
  },
  green: {
    ja: { name: "翠緑の成長色", essence: "互いを育て合い、ゆっくり伸びていく成長の色です。", energy: "やわらかく回復力のある波動。違いを受け入れながら調和を育てやすい組み合わせです。", role: "癒しと成長の場。学び・健康習慣・子育ての協力に向きます。", advice: "変化を急がず、週に一度の振り返りを習慣にすると絆が深まります。" },
    en: { name: "Emerald Growth", essence: "A color of mutual nurturing and steady growth.", energy: "A soft, restorative vibration that grows harmony through differences.", role: "A space for healing and growth — learning, health habits, parenting.", advice: "Don't rush change; a weekly check-in deepens the bond." },
    "zh-CN": { name: "翠绿成长色", essence: "相互培育、慢慢成长的颜色。", energy: "柔和而有恢复力的波动，容易在包容差异中培养和谐。", role: "疗愈与成长的场域，适合学习、健康习惯与育儿合作。", advice: "不急于改变，养成每周一次回顾的习惯能加深羁绊。" },
    "zh-TW": { name: "翠綠成長色", essence: "相互培育、慢慢成長的顏色。", energy: "柔和而有恢復力的波動，容易在包容差異中培養和諧。", role: "療癒與成長的場域，適合學習、健康習慣與育兒合作。", advice: "不急於改變，養成每週一次回顧的習慣能加深羈絆。" },
    ko: { name: "비취 성장색", essence: "서로를 키우며 천천히 자라는 성장의 색입니다.", energy: "부드럽고 회복력 있는 파동으로, 차이를 받아들이며 조화를 키웁니다.", role: "치유와 성장의 장. 배움, 건강 습관, 육아 협력에 좋습니다.", advice: "변화를 서두르지 말고 주 1회 되돌아보기를 습관으로 하세요." },
    es: { name: "Crecimiento esmeralda", essence: "Un color de cuidado mutuo y crecimiento constante.", energy: "Vibración suave y reparadora que crea armonía en la diferencia.", role: "Espacio de sanación y crecimiento: estudio, salud, crianza.", advice: "Sin prisas: un repaso semanal fortalece el vínculo." },
    fr: { name: "Croissance émeraude", essence: "Une couleur de soin mutuel et de croissance régulière.", energy: "Vibration douce et réparatrice qui crée l'harmonie dans la différence.", role: "Espace de guérison et de croissance : études, santé, parentalité.", advice: "Sans précipitation : un point hebdomadaire renforce le lien." },
  },
  teal: {
    ja: { name: "碧水の共鳴色", essence: "冷静さと思いやりが溶け合う、澄んだ対話の色です。", energy: "澄んで流れる波動。感情を整理し、率直に話し合いやすい組み合わせです。", role: "調整役の場。意見の違う場面での合意づくりに向きます。", advice: "結論を急がず、まず相手の言葉を言い換えて確認すると誤解が減ります。" },
    en: { name: "Aqua Resonance", essence: "A clear color where calm and care blend into honest dialogue.", energy: "A clear, flowing vibration that helps sort feelings and talk openly.", role: "The mediator's space — building agreement when opinions differ.", advice: "Restate each other's words before concluding to avoid misunderstanding." },
    "zh-CN": { name: "碧水共鸣色", essence: "冷静与体贴交融、清澈对话的颜色。", energy: "清澈流动的波动，容易整理情绪、坦率交谈。", role: "协调者的场域，适合在意见分歧时达成共识。", advice: "不急于下结论，先复述对方的话确认，可减少误会。" },
    "zh-TW": { name: "碧水共鳴色", essence: "冷靜與體貼交融、清澈對話的顏色。", energy: "清澈流動的波動，容易整理情緒、坦率交談。", role: "協調者的場域，適合在意見分歧時達成共識。", advice: "不急於下結論，先複述對方的話確認，可減少誤會。" },
    ko: { name: "벽수 공명색", essence: "차분함과 배려가 섞인 맑은 대화의 색입니다.", energy: "맑게 흐르는 파동으로, 감정을 정리하고 솔직히 말하기 쉽습니다.", role: "조정자의 장. 의견이 다를 때 합의를 만드는 데 좋습니다.", advice: "결론 전에 상대의 말을 바꿔 말해 확인하면 오해가 줄어듭니다." },
    es: { name: "Resonancia aguamarina", essence: "Un color claro donde calma y cuidado se unen en diálogo sincero.", energy: "Vibración fluida que ayuda a ordenar emociones y hablar con franqueza.", role: "Espacio mediador para lograr acuerdos entre opiniones distintas.", advice: "Repetid lo que dijo el otro antes de concluir." },
    fr: { name: "Résonance aigue-marine", essence: "Une couleur claire où calme et attention mènent au dialogue sincère.", energy: "Vibration fluide qui aide à clarifier les émotions et parler franchement.", role: "Espace de médiation pour s'accorder malgré les divergences.", advice: "Reformulez les propos de l'autre avant de conclure." },
  },
  blue: {
    ja: { name: "蒼穹の信頼色", essence: "誠実さと知性が重なる、深い信頼の色です。", energy: "静かで深い波動。計画を論理的に進め、約束を守り合いやすい組み合わせです。", role: "全体の羅針盤。戦略・学習・大切な決断の場に向きます。", advice: "理屈が強まる日は、気持ちを一言添えると温度が伝わります。" },
    en: { name: "Azure Trust", essence: "A color of deep trust where sincerity and intellect overlap.", energy: "A quiet, deep vibration suited to logical plans and kept promises.", role: "The group's compass — strategy, study and important decisions.", advice: "On logic-heavy days, add one line about feelings to share warmth." },
    "zh-CN": { name: "苍穹信赖色", essence: "诚实与智慧交叠、深厚信任的颜色。", energy: "安静而深沉的波动，容易有逻辑地推进计划并守约。", role: "整体的罗盘，适合战略、学习与重大决定。", advice: "道理变强时，加一句感受能传递温度。" },
    "zh-TW": { name: "蒼穹信賴色", essence: "誠實與智慧交疊、深厚信任的顏色。", energy: "安靜而深沉的波動，容易有邏輯地推進計畫並守約。", role: "整體的羅盤，適合戰略、學習與重大決定。", advice: "道理變強時，加一句感受能傳遞溫度。" },
    ko: { name: "창공 신뢰색", essence: "성실함과 지성이 겹치는 깊은 신뢰의 색입니다.", energy: "고요하고 깊은 파동으로, 계획을 논리적으로 진행하고 약속을 지키기 쉽습니다.", role: "전체의 나침반. 전략, 학습, 중요한 결정에 좋습니다.", advice: "논리가 강한 날엔 마음을 한마디 덧붙이세요." },
    es: { name: "Confianza celeste", essence: "Un color de confianza profunda donde se unen sinceridad e intelecto.", energy: "Vibración serena y profunda para planes lógicos y promesas cumplidas.", role: "La brújula del grupo: estrategia, estudio y decisiones clave.", advice: "En días muy racionales, añadid una frase sobre cómo os sentís." },
    fr: { name: "Confiance azur", essence: "Une couleur de confiance profonde mêlant sincérité et intelligence.", energy: "Vibration calme et profonde pour des plans logiques et des promesses tenues.", role: "La boussole du groupe : stratégie, études, décisions importantes.", advice: "Les jours très rationnels, ajoutez un mot sur vos ressentis." },
  },
  violet: {
    ja: { name: "紫雲の霊感色", essence: "直感と精神性が響き合う、ひらめきの色です。", energy: "神秘的で繊細な波動。言葉にならない思いを感じ取り合いやすい組み合わせです。", role: "ビジョンを描く場。夢や理念の共有、創作に向きます。", advice: "理想が高まるぶん、今日できる一歩を一つだけ決めると現実に根づきます。" },
    en: { name: "Violet Inspiration", essence: "A color of insight where intuition and spirit resonate.", energy: "A mystical, delicate vibration — unspoken feelings are easily sensed.", role: "A space for vision: shared dreams, ideals and creative work.", advice: "Ideals rise high, so choose one step you can take today." },
    "zh-CN": { name: "紫云灵感色", essence: "直觉与精神共鸣、灵光乍现的颜色。", energy: "神秘而细腻的波动，容易感受到彼此未说出口的心意。", role: "描绘愿景的场域，适合共享梦想、理念与创作。", advice: "理想越高，越要决定今天能迈出的一步。" },
    "zh-TW": { name: "紫雲靈感色", essence: "直覺與精神共鳴、靈光乍現的顏色。", energy: "神秘而細膩的波動，容易感受到彼此未說出口的心意。", role: "描繪願景的場域，適合共享夢想、理念與創作。", advice: "理想越高，越要決定今天能邁出的一步。" },
    ko: { name: "자운 영감색", essence: "직관과 정신성이 울리는 영감의 색입니다.", energy: "신비롭고 섬세한 파동으로, 말하지 않은 마음을 느끼기 쉽습니다.", role: "비전을 그리는 장. 꿈과 이념 공유, 창작에 좋습니다.", advice: "이상이 높아지는 만큼 오늘 할 한 걸음을 정하세요." },
    es: { name: "Inspiración violeta", essence: "Un color de intuición donde resuenan mente y espíritu.", energy: "Vibración mística y delicada; se perciben sentimientos no dichos.", role: "Espacio de visión: sueños compartidos, ideales y creación.", advice: "Con ideales altos, elegid un solo paso para hoy." },
    fr: { name: "Inspiration violette", essence: "Une couleur d'intuition où résonnent esprit et sensibilité.", energy: "Vibration mystique et délicate ; les non-dits se ressentent.", role: "Espace de vision : rêves partagés, idéaux et création.", advice: "Avec des idéaux élevés, choisissez un seul pas pour aujourd'hui." },
  },
  rose: {
    ja: { name: "薔薇の慈愛色", essence: "優しさと受容が満ちる、愛情を育む色です。", energy: "柔らかく包み込む波動。相手を思いやる気持ちが伝わりやすい組み合わせです。", role: "心の安全基地。家族の絆や関係修復の場面で力を発揮します。", advice: "遠慮が重なりやすいので、お願いごとははっきり言葉にすると楽になります。" },
    en: { name: "Rose Compassion", essence: "A color full of kindness and acceptance that nurtures affection.", energy: "A soft, enveloping vibration where care is easily felt.", role: "An emotional safe base — family bonds and mending relationships.", advice: "Politeness can pile up; say requests clearly to ease things." },
    "zh-CN": { name: "蔷薇慈爱色", essence: "充满温柔与接纳、培育爱意的颜色。", energy: "柔软包容的波动，体贴之心容易传达。", role: "心灵的安全基地，在家庭羁绊与关系修复中发挥力量。", advice: "容易彼此客气，把请求清楚说出来会更轻松。" },
    "zh-TW": { name: "薔薇慈愛色", essence: "充滿溫柔與接納、培育愛意的顏色。", energy: "柔軟包容的波動，體貼之心容易傳達。", role: "心靈的安全基地，在家庭羈絆與關係修復中發揮力量。", advice: "容易彼此客氣，把請求清楚說出來會更輕鬆。" },
    ko: { name: "장미 자애색", essence: "다정함과 수용이 가득한, 애정을 키우는 색입니다.", energy: "부드럽게 감싸는 파동으로, 배려가 잘 전해집니다.", role: "마음의 안전기지. 가족의 유대와 관계 회복에 힘을 발휘합니다.", advice: "서로 사양하기 쉬우니 부탁은 분명히 말로 하세요." },
    es: { name: "Compasión rosa", essence: "Un color de ternura y aceptación que cultiva el afecto.", energy: "Vibración suave y envolvente donde el cuidado se siente.", role: "Base emocional segura: lazos familiares y reconciliación.", advice: "Decid las peticiones con claridad para evitar cortesías acumuladas." },
    fr: { name: "Compassion rose", essence: "Une couleur de douceur et d'accueil qui nourrit l'affection.", energy: "Vibration douce et enveloppante où l'attention se ressent.", role: "Base affective sûre : liens familiaux et réconciliation.", advice: "Exprimez clairement vos demandes pour éviter l'excès de politesse." },
  },
  neutral: {
    ja: { name: "月白の調和色", essence: "個性が溶け合い、どの色にも寄り添える中庸の色です。", energy: "静かで均衡のとれた波動。偏りが少なく、状況に応じて形を変えやすい組み合わせです。", role: "全体のバランサー。多様なメンバーをまとめる場面に向きます。", advice: "主張が控えめになりやすいので、各自の希望を一つずつ出し合ってみましょう。" },
    en: { name: "Moonlit Balance", essence: "A middle color where individualities blend and support any other.", energy: "A quiet, balanced vibration that adapts easily to circumstances.", role: "The balancer — uniting diverse members.", advice: "Voices may stay soft; let each person name one wish." },
    "zh-CN": { name: "月白调和色", essence: "个性交融、能与任何颜色相伴的中庸之色。", energy: "安静而均衡的波动，偏差少，容易随情况调整。", role: "整体的平衡者，适合凝聚多样成员。", advice: "主张容易偏弱，试着让每人说出一个愿望。" },
    "zh-TW": { name: "月白調和色", essence: "個性交融、能與任何顏色相伴的中庸之色。", energy: "安靜而均衡的波動，偏差少，容易隨情況調整。", role: "整體的平衡者，適合凝聚多樣成員。", advice: "主張容易偏弱，試著讓每人說出一個願望。" },
    ko: { name: "월백 조화색", essence: "개성이 녹아 어떤 색과도 어울리는 중용의 색입니다.", energy: "고요하고 균형 잡힌 파동으로, 상황에 따라 유연하게 바뀝니다.", role: "전체의 균형추. 다양한 멤버를 모으는 데 좋습니다.", advice: "주장이 약해지기 쉬우니 각자 바람을 하나씩 말해 보세요." },
    es: { name: "Equilibrio lunar", essence: "Un color intermedio donde las personalidades se funden.", energy: "Vibración serena y equilibrada que se adapta con facilidad.", role: "El equilibrador que une a miembros diversos.", advice: "Que cada persona exprese un deseo propio." },
    fr: { name: "Équilibre lunaire", essence: "Une couleur médiane où les personnalités se fondent.", energy: "Vibration calme et équilibrée qui s'adapte facilement.", role: "L'équilibreur qui unit des membres variés.", advice: "Que chacun exprime un souhait." },
  },
};

export function groupColorMeaning(hex: string, language: Language): Meaning { return M[hueOf(hex)][language]; }

export const groupInsightCopy: Record<Language, { essence: string; energy: string; role: string; advice: string; map: string; rhythmTable: string; physical: string; emotional: string; intellectual: string; today: string; peak: (n: string) => string; care: (n: string) => string; best: (a: string, b: string) => string; note: string; self: string }> = {
  ja: { essence: "色の本質", energy: "波動とエネルギー", role: "グループでの役割", advice: "今日の最適アドバイス", map: "相性マップ（メンバー同士）", rhythmTable: "メンバー別の今日のリズム", physical: "身体", emotional: "感情", intellectual: "知性", today: "グループ全体の今日の運勢", peak: n => `今日いちばん勢いがあるのは${n}さん。先頭に立つ役をお願いすると流れが生まれます。`, care: n => `${n}さんは今日リズムが低め。負担の少ない役割と声かけを。`, best: (a, b) => `最も噛み合うペアは${a}さん×${b}さん。大切な相談はこの二人から始めるとスムーズです。`, note: "グループの読み解きは各メンバーの生年月日から計算した参考値です。", self: "本人" },
  en: { essence: "Essence", energy: "Vibration & energy", role: "Role in the group", advice: "Today's best advice", map: "Compatibility map (pairs)", rhythmTable: "Today's rhythm by member", physical: "Body", emotional: "Emotion", intellectual: "Mind", today: "Group fortune today", peak: n => `${n} has the strongest momentum today — let them lead.`, care: n => `${n}'s rhythm is low today; offer a lighter role and a kind word.`, best: (a, b) => `The best-matched pair is ${a} × ${b}. Start important talks with them.`, note: "Group readings are reference values calculated from each member's birth date.", self: "Me" },
  "zh-CN": { essence: "颜色本质", energy: "波动与能量", role: "在团体中的角色", advice: "今日最佳建议", map: "相性图（成员两两）", rhythmTable: "各成员今日节律", physical: "身体", emotional: "情绪", intellectual: "智力", today: "团体整体今日运势", peak: n => `今天最有势头的是${n}，请其带头会带来流动。`, care: n => `${n}今天节律偏低，请安排轻松的角色并多关心。`, best: (a, b) => `最契合的组合是${a}×${b}，重要商量可从二人开始。`, note: "团体解读是根据各成员出生日期计算的参考值。", self: "本人" },
  "zh-TW": { essence: "顏色本質", energy: "波動與能量", role: "在團體中的角色", advice: "今日最佳建議", map: "相性圖（成員兩兩）", rhythmTable: "各成員今日節律", physical: "身體", emotional: "情緒", intellectual: "智力", today: "團體整體今日運勢", peak: n => `今天最有勢頭的是${n}，請其帶頭會帶來流動。`, care: n => `${n}今天節律偏低，請安排輕鬆的角色並多關心。`, best: (a, b) => `最契合的組合是${a}×${b}，重要商量可從二人開始。`, note: "團體解讀是根據各成員出生日期計算的參考值。", self: "本人" },
  ko: { essence: "색의 본질", energy: "파동과 에너지", role: "그룹 내 역할", advice: "오늘의 최적 조언", map: "궁합 맵(멤버 쌍)", rhythmTable: "멤버별 오늘의 리듬", physical: "신체", emotional: "감정", intellectual: "지성", today: "그룹 전체 오늘의 운세", peak: n => `오늘 가장 기세가 좋은 사람은 ${n}님. 앞장서 달라고 부탁해 보세요.`, care: n => `${n}님은 오늘 리듬이 낮습니다. 가벼운 역할과 격려를.`, best: (a, b) => `가장 잘 맞는 쌍은 ${a}님×${b}님. 중요한 상의는 두 사람부터.`, note: "그룹 해석은 각 멤버의 생년월일로 계산한 참고값입니다.", self: "본인" },
  es: { essence: "Esencia", energy: "Vibración y energía", role: "Papel en el grupo", advice: "Consejo de hoy", map: "Mapa de afinidad (parejas)", rhythmTable: "Ritmo de hoy por miembro", physical: "Cuerpo", emotional: "Emoción", intellectual: "Mente", today: "Fortuna del grupo hoy", peak: n => `${n} tiene hoy el mayor impulso: que tome la iniciativa.`, care: n => `El ritmo de ${n} está bajo hoy; ofrecedle un papel ligero.`, best: (a, b) => `La pareja más afín es ${a} × ${b}. Empezad por ellos las charlas importantes.`, note: "Las lecturas de grupo son valores de referencia calculados con la fecha de nacimiento.", self: "Yo" },
  fr: { essence: "Essence", energy: "Vibration et énergie", role: "Rôle dans le groupe", advice: "Conseil du jour", map: "Carte des affinités (paires)", rhythmTable: "Rythme du jour par membre", physical: "Corps", emotional: "Émotion", intellectual: "Esprit", today: "Fortune du groupe aujourd'hui", peak: n => `${n} a le plus d'élan aujourd'hui : confiez-lui la tête.`, care: n => `Le rythme de ${n} est bas aujourd'hui ; proposez un rôle léger.`, best: (a, b) => `La paire la plus accordée est ${a} × ${b}. Commencez par eux.`, note: "Les lectures de groupe sont des valeurs de référence calculées à partir des dates de naissance.", self: "Moi" },
};

export function groupDayLine(avg: number, language: Language): string {
  const tiers: Record<Language, [string, string, string]> = {
    ja: ["全体の波が高まる日。共同作業や決めごとを前に進めるチャンスです。", "落ち着いた安定日。役割分担を見直し、着実に積み上げましょう。", "全体が充電モードの日。無理に進めず、労い合う時間を優先しましょう。"],
    en: ["A rising day for the group — move shared work and decisions forward.", "A steady day — review roles and build step by step.", "A recharge day — don't push; prioritize appreciating each other."],
    "zh-CN": ["整体上升的日子，是推进合作与决定的机会。", "平稳的日子，重新分工、踏实积累。", "整体充电的日子，不勉强推进，优先互相慰劳。"],
    "zh-TW": ["整體上升的日子，是推進合作與決定的機會。", "平穩的日子，重新分工、踏實累積。", "整體充電的日子，不勉強推進，優先互相慰勞。"],
    ko: ["전체 파동이 높아지는 날. 공동 작업과 결정을 진행할 기회입니다.", "차분한 안정일. 역할을 재점검하고 착실히 쌓아 가세요.", "전체가 충전 모드인 날. 무리하지 말고 서로 격려하세요."],
    es: ["Día en ascenso: avanzad en trabajo y decisiones compartidas.", "Día estable: revisad roles y construid paso a paso.", "Día de recarga: no forcéis, priorizad el reconocimiento mutuo."],
    fr: ["Journée montante : faites avancer travail et décisions communs.", "Journée stable : revoyez les rôles et avancez pas à pas.", "Journée de recharge : ne forcez pas, valorisez-vous mutuellement."],
  };
  const t = tiers[language];
  return avg >= 60 ? t[0] : avg >= 40 ? t[1] : t[2];
}
