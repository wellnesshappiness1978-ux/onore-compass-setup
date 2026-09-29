import { Sun, Sparkles, Gem, ArrowUpRight, Brain, BriefcaseBusiness, Compass, Fingerprint, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";

type Copy = {
  title: string; subtitle: string; preview: string; diagnosis: string; diagnosisHint: string;
  core: string; pattern: string; talent: string; manual: string;
  tags: [string, string, string]; source: string; progress: string;
  giftLabels: [string, string, string]; giftNote: string;
  archetypes: [string, string, string, string][];
};

const copy: Record<Language, Copy> = {
  ja: { title: "あなたの特性", subtitle: "セルフコア分析", preview: "参考プレビュー · 15占術の正式な統合鑑定ではありません", diagnosis: "個別診断", diagnosisHint: "出生・お名前データを確認して、自分のトリセツを見る", core: "本質と最大の強み", pattern: "思考＆行動のパターン", talent: "隠れた才能・ビジネス適性", manual: "セルフ取扱説明書", tags: ["生年月日数", "お名前入力済み", "出生地入力済み"], source: "生年月日から導いた数をもとにした振り返りのヒントです。姓名・出生地から性格や適性を判定していません。", progress: "プロフィール入力", giftLabels: ["あなたが生まれ持った「天性・本質」", "輝くアピールポイント・魅力", "秘められた才能・ポテンシャル"], giftNote: "生年月日から導いた数をもとにした参考表示です。正式な15占術の鑑定ではありません。", archetypes: [
    ["始める力を活かす", "最初の一歩を小さく決めてから、周囲の意見も聞いてみる。", "新しい企画のたたき台を作る役割を試してみる。", "自分で選べる余地を確保し、孤立して進めない。"],
    ["つなぐ視点を活かす", "結論を急ぐ前に、相手の意図を言葉で確かめてみる。", "人と人の間に立つ調整役を試してみる。", "静かに考える時間を取り、他人の期待だけで決めない。"],
    ["表現する視点を活かす", "アイデアを先に書き出し、優先順位を一つ決める。", "伝える・見せる仕事の小さな実験をしてみる。", "発想の自由と締め切りの両方を用意する。"],
    ["積み上げる視点を活かす", "判断基準を整理し、できることから順に進める。", "仕組みを整え、継続させる役割を試してみる。", "見通しを持ちつつ、完璧を待ちすぎない。"],
  ] },
  en: { title: "Your traits", subtitle: "Self-core reflection", preview: "Illustrative preview · Not a verified 15-arts reading", diagnosis: "Personal diagnosis", diagnosisHint: "Review your birth and name details and explore your personal guide", core: "Core & strength", pattern: "Thinking & action", talent: "Potential at work", manual: "Your own guide", tags: ["Birth-date number", "Name entered", "Birthplace entered"], source: "Reflection prompts based on a birth-date number. Name and birthplace are not used to assess character or aptitude.", progress: "Profile completed", giftLabels: ["Your innate nature & essence", "Your shining charm & appeal", "Hidden talents & potential"], giftNote: "An illustrative display based on your birth-date number. Not a verified 15-arts reading.", archetypes: [["Try taking initiative", "Choose one small first step, then invite other views.", "Try sketching an early draft of a new idea.", "Keep room to choose, but don't go it alone."], ["Try connecting people", "Check others' intentions before settling on a decision.", "Try a coordinating role between different people.", "Make quiet time; don't decide only for others."], ["Try expressing ideas", "Write ideas down, then pick one priority.", "Experiment with a role that involves communication.", "Make space for creativity and a deadline."], ["Try building steadily", "List your criteria and start with what's possible.", "Try creating processes that can last.", "Aim for clarity without waiting for perfection."]] },
  "zh-CN": { title: "你的特质", subtitle: "自我核心分析", preview: "参考预览 · 非15占术正式综合鉴定", diagnosis: "个人诊断", diagnosisHint: "核对出生与姓名资料，查看个人指南", core: "本质与优势", pattern: "思考与行动", talent: "潜力与工作方向", manual: "自我使用指南", tags: ["生日数字", "已输入姓名", "已输入出生地"], source: "根据生日数字提供的自我反思建议。姓名与出生地不用于判断性格或能力。", progress: "资料填写", giftLabels: ["你与生俱来的「天赋·本质」", "闪亮的魅力·吸引点", "潜藏的才能·潜力"], giftNote: "基于生日数字的参考显示，并非正式的15占术鉴定。", archetypes: [["尝试主动开始", "先确定一小步，再倾听周围意见。", "试着为新想法拟定初稿。", "保留自主空间，也不要独自承担。"], ["尝试连接彼此", "决定前先确认对方的想法。", "尝试协调不同的人。", "留出安静时间，不只为他人而决定。"], ["尝试表达想法", "写下想法，再选出一个重点。", "尝试沟通或展示类工作。", "兼顾创意空间与期限。"], ["尝试稳步积累", "整理判断标准，从能做的开始。", "尝试建立可持续的流程。", "不必等到完美才行动。"]] },
  "zh-TW": { title: "你的特質", subtitle: "自我核心分析", preview: "參考預覽 · 非15占術正式綜合鑑定", diagnosis: "個人診斷", diagnosisHint: "確認出生與姓名資料，查看個人指南", core: "本質與優勢", pattern: "思考與行動", talent: "潛力與工作方向", manual: "自我使用指南", tags: ["生日數字", "已輸入姓名", "已輸入出生地"], source: "依生日數字提供的自我反思建議。姓名與出生地不用於判斷性格或能力。", progress: "資料填寫", giftLabels: ["你與生俱來的「天賦·本質」", "閃耀的魅力·亮點", "潛藏的才能·潛力"], giftNote: "基於生日數字的參考顯示，並非正式的15占術鑑定。", archetypes: [["試著主動開始", "先決定一小步，再聆聽周圍意見。", "試著為新想法擬定初稿。", "保留自主空間，也不要獨自承擔。"], ["試著連結彼此", "決定前先確認對方的想法。", "嘗試協調不同的人。", "留出安靜時間，不只為他人而決定。"], ["試著表達想法", "寫下想法，再選出一個重點。", "嘗試溝通或展示類工作。", "兼顧創意空間與期限。"], ["試著穩步累積", "整理判斷標準，從能做的開始。", "嘗試建立可持續的流程。", "不必等到完美才行動。"]] },
  ko: { title: "나의 특성", subtitle: "셀프 코어 분석", preview: "참고 미리보기 · 검증된 15가지 통합 분석이 아닙니다", diagnosis: "개인 진단", diagnosisHint: "출생·이름 정보를 확인하고 나만의 가이드를 살펴보세요", core: "핵심과 강점", pattern: "사고와 행동", talent: "잠재력과 업무 방향", manual: "나만의 사용 설명서", tags: ["생일 숫자", "이름 입력됨", "출생지 입력됨"], source: "생일 숫자를 바탕으로 한 성찰 제안입니다. 이름·출생지로 성격이나 능력을 판단하지 않습니다.", progress: "프로필 입력", giftLabels: ["타고난 「천성·본질」", "빛나는 매력·어필 포인트", "숨겨진 재능·잠재력"], giftNote: "생일 숫자를 바탕으로 한 참고 표시이며, 정식 15점술 감정이 아닙니다.", archetypes: [["시작하는 힘 시도하기", "작은 첫걸음을 정하고 다른 의견도 들어보세요.", "새로운 아이디어의 초안을 만들어보세요.", "선택권을 유지하되 혼자 짊어지지 마세요."], ["사람 연결하기", "결정 전에 상대의 의도를 확인해보세요.", "서로 다른 사람을 잇는 역할을 시도해보세요.", "조용히 생각할 시간을 만들고 남만 위해 결정하지 마세요."], ["생각 표현하기", "아이디어를 적고 한 가지 우선순위를 정하세요.", "전달하고 보여주는 역할을 시도해보세요.", "창의적인 여유와 마감 기한을 함께 두세요."], ["차근차근 쌓기", "판단 기준을 정리하고 할 수 있는 것부터 하세요.", "지속 가능한 과정을 만드는 역할을 시도해보세요.", "완벽해질 때까지 기다리지 마세요."]] },
  es: { title: "Tus rasgos", subtitle: "Reflexión sobre tu esencia", preview: "Vista ilustrativa · No es una lectura verificada de 15 artes", diagnosis: "Diagnóstico personal", diagnosisHint: "Revisa tus datos de nacimiento y nombre para explorar tu guía", core: "Esencia y fortaleza", pattern: "Pensamiento y acción", talent: "Potencial profesional", manual: "Tu propia guía", tags: ["Número natal", "Nombre indicado", "Lugar indicado"], source: "Ideas para reflexionar basadas en el número natal. El nombre y el lugar no evalúan tu carácter ni aptitudes.", progress: "Perfil completado", giftLabels: ["Tu naturaleza y esencia innatas", "Tu encanto y atractivo brillante", "Talentos y potencial ocultos"], giftNote: "Vista ilustrativa basada en tu número natal. No es una lectura verificada de 15 artes.", archetypes: [["Prueba a tomar la iniciativa", "Elige un primer paso pequeño y escucha otras opiniones.", "Prueba a esbozar una idea nueva.", "Mantén autonomía sin hacerlo todo a solas."], ["Prueba a conectar personas", "Pregunta qué quieren los demás antes de decidir.", "Prueba un papel de coordinación.", "Reserva tiempo a solas; no decidas solo por otros."], ["Prueba a expresar ideas", "Anota ideas y elige una prioridad.", "Explora un papel de comunicación.", "Combina libertad creativa y plazos."], ["Prueba a construir con constancia", "Ordena tus criterios y empieza por lo posible.", "Prueba a crear procesos duraderos.", "No esperes a la perfección para actuar."]] },
  fr: { title: "Vos traits", subtitle: "Réflexion sur votre essence", preview: "Aperçu illustratif · Pas une analyse vérifiée des 15 arts", diagnosis: "Diagnostic personnel", diagnosisHint: "Vérifiez vos données de naissance et votre nom pour explorer votre guide", core: "Essence et force", pattern: "Pensée et action", talent: "Potentiel professionnel", manual: "Votre guide personnel", tags: ["Nombre natal", "Nom renseigné", "Lieu renseigné"], source: "Pistes de réflexion basées sur un nombre natal. Le nom et le lieu ne servent pas à juger le caractère ou les aptitudes.", progress: "Profil renseigné", giftLabels: ["Votre nature et essence innées", "Votre charme et vos atouts qui brillent", "Talents et potentiels cachés"], giftNote: "Affichage illustratif basé sur votre nombre natal. Pas une lecture vérifiée des 15 arts.", archetypes: [["Essayez de prendre l'initiative", "Choisissez un petit premier pas, puis écoutez d'autres avis.", "Essayez d'ébaucher une nouvelle idée.", "Gardez votre autonomie sans tout porter seul."], ["Essayez de relier les personnes", "Vérifiez les intentions d'autrui avant de trancher.", "Essayez un rôle de coordination.", "Prenez du recul; ne décidez pas que pour les autres."], ["Essayez d'exprimer vos idées", "Notez vos idées et choisissez une priorité.", "Expérimentez un rôle de communication.", "Associez liberté créative et échéance."], ["Essayez de construire avec constance", "Clarifiez vos critères et commencez par le possible.", "Essayez de mettre en place des processus durables.", "N'attendez pas la perfection pour agir."]] },
};

type Gifts = { groups: [string, string, string][] };
const gifts: Record<Language, Gifts> = {
  ja: { groups: [
    ["生まれ持った行動力とまっすぐな本質。思い立ったらすぐ動ける推進力が、あなたらしい輝きの源です。", "飾らない言葉と素直な表情。あなたがいるだけで場が明るくなり、まわりが元気になります。", "まだ誰も開いていない新しい道を切りひらく、開拓者の才能。これから大きく花開きます。"],
    ["人と人とをやさしく結ぶ観察眼と想像力。思いやりの深さが、あなたの核となる美しさです。", "じっと話を聞く姿勢と寄り添う言葉。『あなたに話せてよかった』と信頼される存在です。", "信頼を育て、人とご縁を大きく広げる結び手の才能。あなたの輪はこれからも広がり続けます。"],
    ["感じたことを色鮮やかに形にする、表現者の感性。自由な発想があなたの個性の証です。", "ユニークな視点と楽しそうな笑顔。まわりをワクワクさせ、話題を生む存在です。", "あなたの伝える力は、いつか多くの心を動かす言葉や作品へ。無限の可能性を秘めています。"],
    ["コツコツ積み上げて夢を形にする、まっすぐな継続力。誠実さがあなた最大の美点です。", "頼りになる落ち着きと丁寧な仕事ぶり。あなたのまわりには自然と安心感があふれています。", "続ける力は生涯の宝物。時間をかけて着実に花開く、しあわせを育てる才能です。"],
  ] },
  en: { groups: [
    ["A born starter with a bright, direct spirit. Your gift is momentum — turning ideas into first steps.", "Your honest words and genuine smile light up the room and lift everyone around you.", "A pioneer's talent for opening paths no one has walked yet — yours is still to fully bloom."],
    ["A gentle observer with a gift for connecting people. Deep kindness is your core beauty.", "People trust you — 'I'm so glad I could talk to you' is what they say about you.", "A born bridge-builder whose circle of trust keeps growing wider and warmer."],
    ["A creative soul who turns feelings into vivid forms. Free imagination is your signature.", "Your unique perspective and joyful energy make any moment more exciting.", "Your voice will one day move many hearts — as words, works, or ideas yet to come. Limitless potential."],
    ["A steady builder who turns dreams into reality, one step at a time. Sincerity is your finest trait.", "Calm, dependable, and thorough — people feel safe just being near you.", "Consistency is your lifelong treasure: a talent that blooms slowly and grows lasting happiness."],
  ] },
  "zh-CN": { groups: [
    ["天生拥有立刻行动的力量。想到就做的推进力，正是你闪耀的源泉。", "不加修饰的话语和率真的表情。只要有你在，气氛就会明亮，大家也会充满活力。", "拥有开辟新道路的开拓者才能，今后会大大开花结果。"],
    ["天生拥有温柔连接人与人的观察力和想象力。深切的体贴是你核心之美。", "认真倾听和陪伴的姿态，让人说出“能和你聊真是太好了”，深受信赖。", "是培养信任、把缘分越扩越大的纽带型人才，你的圈子会越来越宽广。"],
    ["天生拥有把感受变成鲜明作品的感性，自由的想象力就是你的标志。", "独特的视角和开心的笑容，让周围兴奋、带来话题。", "你的表达力终将打动无数人心，蕴藏无限可能。"],
    ["天生拥有脚踏实地、一步步筑梦的坚持力，认真诚恳是你最大的美德。", "可靠的沉着与细致的做事方式，让身边充满安心感。", "坚持力是一生的宝藏，是慢慢开花、培育幸福的才能。"],
  ] },
  "zh-TW": { groups: [
    ["天生擁有立刻行動的力量。想到就做的推進力，正是你閃耀的源泉。", "不加修飾的話語和率真的表情。只要有你在，氣氛就會明亮，大家也會充滿活力。", "擁有開拓新道路的開拓者才能，今後會大大開花結果。"],
    ["天生擁有溫柔連結人與人的觀察力和想像力。深切的體貼是你核心之美。", "認真傾聽和陪伴的姿態，讓人說出「能和你聊真是太好了」，深受信賴。", "是培養信任、把緣分越擴越大的紐帶型人才，你的圈子會越來越寬廣。"],
    ["天生擁有把感受變成鮮明作品的感性，自由的想像力就是你的標誌。", "獨特的視角和開心的笑容，讓周圍興奮、帶來話題。", "你的表達力終將感動無數人心，蘊藏無限可能。"],
    ["天生擁有腳踏實地、一步步築夢的堅持力，認真誠懇是你最大的美德。", "可靠的沉著與細緻的做事方式，讓身邊充滿安心感。", "堅持力是一生的寶藏，是慢慢開花、培育幸福的才能。"],
  ] },
  ko: { groups: [
    ["타고난 행동력과 곧은 본성. 생각하면 바로 움직이는 추진력이 당신의 빛나는 원천입니다.", "꾸밈없는 말과 솔직한 표정. 당신이 있는 곳이면 분위기가 밝아지고 모두가 힘을 얻습니다.", "아무도 열지 않은 새로운 길을 여는 개척자의 재능. 앞으로 크게 꽃피울 것입니다."],
    ["사람과 사람을 부드럽게 이어주는 관찰력과 상상력. 깊은 배려가 당신의 핵심 미입니다.", "끝까지 들어주는 자세와 다가가는 말. '당신과 이야기해서 다행이야'라는 신뢰를 받는 존재입니다.", "신뢰를 키우고 인연을 넓혀가는 연결형 재능. 당신의 관계는 계속 넓어질 것입니다."],
    ["느낀 것을 선명한 형태로 만드는 표현자의 감성. 자유로운 상상력이 당신의 표지입니다.", "독특한 시선과 즐거운 미소. 주변을 설레게 하고 화제를 만드는 존재입니다.", "당신의 전달력은 언젠가 많은 마음을 움직이는 말과 작품이 될 무한한 가능성입니다."],
    ["한 걸음씩 쌓아 꿈을 현실로 만드는 꾸준함. 성실함이 당신의 가장 큰 미덕입니다.", "믿음직한 침착함과 꼼꼼한 일 처리. 당신 주변에는 자연스럽게 안정감이 넘칩니다.", "꾸준함은 평생의 보물. 천천히 피어나는 행복을 키우는 재능입니다."],
  ] },
  es: { groups: [
    ["Naciste con la fuerza de dar el primer paso. Ese impulso de actuar sin dudar es tu fuente de brillo.", "Tus palabras sinceras y tu expresión genuina alegran cualquier lugar; tu presencia da energía.", "Un talento pionero para abrir caminos que nadie ha recorrido: florecerá en grande."],
    ["Naciste con la sensibilidad de unir a las personas. La empatía profunda es tu belleza esencial.", "Escuchas hasta el final y acompañas: la gente confía en ti de verdad.", "Un talento de puente que cultiva confianza y agranda tus círculos cada día."],
    ["Naciste con la sensibilidad de convertir emociones en formas vivas; tu imaginación libre es tu sello.", "Tu mirada única y tu sonrisa alegre hacen todo más emocionante.", "Tu voz conmovedora tocará muchos corazones: un potencial sin límites."],
    ["Naciste con la constancia de construir sueños paso a paso; la honestidad es tu mayor virtud.", "Tu calma confiable y tu forma meticulosa traen tranquilidad a tu alrededor.", "La constancia es tu tesoro: un talento que florece despacio y cultiva felicidad duradera."],
  ] },
  fr: { groups: [
    ["Né avec la force de faire le premier pas. Cet élan d'agir sans hésiter est ta source d'éclat.", "Tes mots sincères et ton expression authentique illuminent les lieux et redonnent de l'énergie.", "Un talent de pionnier pour ouvrir des chemins inexplorés — il s'épanouira grandement."],
    ["Né avec la sensibilité de relier les personnes. L'empathie profonde est ta beauté essentielle.", "Tu écoutes jusqu'au bout et tu accompagnes : on te fait vraiment confiance.", "Un talent de pont qui cultive la confiance et élargit tes cercles chaque jour."],
    ["Né avec la sensibilité de transformer les émotions en formes vivantes ; ton imagination libre est ta signature.", "Ton regard unique et ton sourire joyeux rendent chaque moment plus vivant.", "Ta voix touchera un jour bien des cœurs : un potentiel sans limites."],
    ["Né avec la constance de bâtir tes rêves pas à pas ; la sincérité est ta plus belle qualité.", "Ton calme fiable et ton soin méticuleux inspirent la sérénité autour de toi.", "La constance est ton trésor : un talent qui s'épanouit doucement et cultive un bonheur durable."],
  ] },
};

export default function SelfCoreCard({ profile, language, onDiagnosis }: { profile: UserProfile; language: Language; onDiagnosis: () => void }) {
  const t = copy[language];
  const digits = profile.birthDate.replace(/\D/g, "");
  const sum = [...digits].reduce((total, digit) => total + Number(digit), 0);
  const number = sum > 0 ? ((sum - 1) % 9) + 1 : 0;
  const ideas = t.archetypes[(number - 1 + 4) % 4] ?? t.archetypes[0];
  if (!ideas) return null;
  const gift = gifts[language].groups[(number - 1 + 4) % 4] ?? gifts[language].groups[0]!;
  const named = Boolean(profile.nameKanji || profile.nameKana || profile.nameRomaji);
  const place = Boolean(profile.birthPlace || profile.birthCity);
  const completed = [Boolean(profile.birthDate), named, place, Boolean(profile.birthTime && !profile.birthTimeUnknown)].filter(Boolean).length;
  const sections = [
    { icon: Fingerprint, label: t.core, value: ideas[0] },
    { icon: Brain, label: t.pattern, value: ideas[1] },
    { icon: BriefcaseBusiness, label: t.talent, value: ideas[2] },
    { icon: Heart, label: t.manual, value: ideas[3] },
  ];
  const giftSections = [
    { icon: Sun, label: t.giftLabels[0], value: gift[0] },
    { icon: Sparkles, label: t.giftLabels[1], value: gift[1] },
    { icon: Gem, label: t.giftLabels[2], value: gift[2] },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.65fr)_minmax(240px,1fr)]">
      <section aria-label={t.title} className="min-w-0 rounded-lg border border-primary/35 bg-card/75 p-5 shadow-champagne backdrop-blur-md sm:p-7">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"><Compass className="size-5" aria-hidden="true" /></div>
          <div className="min-w-0"><p className="text-[11px] text-primary/75">{t.subtitle}</p><h2 className="font-serif text-xl text-gradient-gold sm:text-2xl">{t.title}</h2></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-primary">
          {number > 0 && <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1">{t.tags[0]} {number}</span>}
          {named && <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1">{t.tags[1]}</span>}
          {place && <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1">{t.tags[2]}</span>}
        </div>
        <div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {sections.map(({ icon: Icon, label, value }) => <div key={label} className="min-w-0 border-t border-primary/20 pt-3"><div className="flex items-center gap-2 text-primary"><Icon className="size-4 shrink-0" aria-hidden="true" /><h3 className="text-xs font-semibold">{label}</h3></div><p className="mt-2 text-sm leading-6 text-foreground/85">{value}</p></div>)}
        </div>
        <p className="mt-5 border-t border-primary/15 pt-3 text-xs leading-5 text-muted-foreground">{t.preview}<br />{t.source}</p>
      </section>
      <section aria-label={t.diagnosis} className="flex min-w-0 flex-col justify-between rounded-lg border border-primary/25 bg-card/60 p-5 backdrop-blur-md sm:p-7">
        <div>
          <h2 className="font-serif text-xl text-foreground sm:text-2xl">{t.diagnosis}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.diagnosisHint}</p>
          <ul className="mt-5 space-y-4">
            {giftSections.map(({ icon: Icon, label, value }) => (
              <li key={label} className="rounded-md border border-primary/25 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-primary"><Icon className="size-4 shrink-0" aria-hidden="true" /><h3 className="text-xs font-semibold">{label}</h3></div>
                <p className="mt-2 text-sm leading-6 text-foreground/90">{value}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] leading-4 text-muted-foreground">{t.giftNote}</p>
        </div>
        <div className="mt-7"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{t.progress}</span><span>{completed}/4</span></div><div className="h-1.5 overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-label={t.progress} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={4}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completed * 25}%` }} /></div><Button variant="champagne" onClick={onDiagnosis} className="mt-5 w-full justify-between whitespace-normal text-sm">{t.diagnosis}<ArrowUpRight className="size-4 shrink-0" /></Button></div>
      </section>
    </div>
  );
}
