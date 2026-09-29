import { ArrowUpRight, Brain, BriefcaseBusiness, Compass, Fingerprint, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";

type Copy = {
  title: string; subtitle: string; preview: string; diagnosis: string; diagnosisHint: string;
  core: string; pattern: string; talent: string; manual: string;
  tags: [string, string, string]; source: string; progress: string;
  archetypes: [string, string, string, string][];
};

const copy: Record<Language, Copy> = {
  ja: { title: "あなたの特性", subtitle: "セルフコア分析", preview: "参考プレビュー · 15占術の正式な統合鑑定ではありません", diagnosis: "本格個別診断", diagnosisHint: "出生・お名前データを確認して、自分のトリセツを見る", core: "本質と最大の強み", pattern: "思考＆行動のパターン", talent: "隠れた才能・ビジネス適性", manual: "セルフ取扱説明書", tags: ["生年月日数", "お名前入力済み", "出生地入力済み"], source: "生年月日から導いた数をもとにした振り返りのヒントです。姓名・出生地から性格や適性を判定していません。", progress: "プロフィール入力", archetypes: [
    ["始める力を活かす", "最初の一歩を小さく決めてから、周囲の意見も聞いてみる。", "新しい企画のたたき台を作る役割を試してみる。", "自分で選べる余地を確保し、孤立して進めない。"],
    ["つなぐ視点を活かす", "結論を急ぐ前に、相手の意図を言葉で確かめてみる。", "人と人の間に立つ調整役を試してみる。", "静かに考える時間を取り、他人の期待だけで決めない。"],
    ["表現する視点を活かす", "アイデアを先に書き出し、優先順位を一つ決める。", "伝える・見せる仕事の小さな実験をしてみる。", "発想の自由と締め切りの両方を用意する。"],
    ["積み上げる視点を活かす", "判断基準を整理し、できることから順に進める。", "仕組みを整え、継続させる役割を試してみる。", "見通しを持ちつつ、完璧を待ちすぎない。"],
  ] },
  en: { title: "Your traits", subtitle: "Self-core reflection", preview: "Illustrative preview · Not a verified 15-arts reading", diagnosis: "Personal reading", diagnosisHint: "Review your birth and name details and explore your personal guide", core: "Core & strength", pattern: "Thinking & action", talent: "Potential at work", manual: "Your own guide", tags: ["Birth-date number", "Name entered", "Birthplace entered"], source: "Reflection prompts based on a birth-date number. Name and birthplace are not used to assess character or aptitude.", progress: "Profile completed", archetypes: [["Try taking initiative", "Choose one small first step, then invite other views.", "Try sketching an early draft of a new idea.", "Keep room to choose, but don't go it alone."], ["Try connecting people", "Check others' intentions before settling on a decision.", "Try a coordinating role between different people.", "Make quiet time; don't decide only for others."], ["Try expressing ideas", "Write ideas down, then pick one priority.", "Experiment with a role that involves communication.", "Make space for creativity and a deadline."], ["Try building steadily", "List your criteria and start with what's possible.", "Try creating processes that can last.", "Aim for clarity without waiting for perfection."]] },
  "zh-CN": { title: "你的特质", subtitle: "自我核心分析", preview: "参考预览 · 非15占术正式综合鉴定", diagnosis: "个人详细分析", diagnosisHint: "核对出生与姓名资料，查看个人指南", core: "本质与优势", pattern: "思考与行动", talent: "潜力与工作方向", manual: "自我使用指南", tags: ["生日数字", "已输入姓名", "已输入出生地"], source: "根据生日数字提供的自我反思建议。姓名与出生地不用于判断性格或能力。", progress: "资料填写", archetypes: [["尝试主动开始", "先确定一小步，再倾听周围意见。", "试着为新想法拟定初稿。", "保留自主空间，也不要独自承担。"], ["尝试连接彼此", "决定前先确认对方的想法。", "尝试协调不同的人。", "留出安静时间，不只为他人而决定。"], ["尝试表达想法", "写下想法，再选出一个重点。", "尝试沟通或展示类工作。", "兼顾创意空间与期限。"], ["尝试稳步积累", "整理判断标准，从能做的开始。", "尝试建立可持续的流程。", "不必等到完美才行动。"]] },
  "zh-TW": { title: "你的特質", subtitle: "自我核心分析", preview: "參考預覽 · 非15占術正式綜合鑑定", diagnosis: "個人詳細分析", diagnosisHint: "確認出生與姓名資料，查看個人指南", core: "本質與優勢", pattern: "思考與行動", talent: "潛力與工作方向", manual: "自我使用指南", tags: ["生日數字", "已輸入姓名", "已輸入出生地"], source: "依生日數字提供的自我反思建議。姓名與出生地不用於判斷性格或能力。", progress: "資料填寫", archetypes: [["試著主動開始", "先決定一小步，再聆聽周圍意見。", "試著為新想法擬定初稿。", "保留自主空間，也不要獨自承擔。"], ["試著連結彼此", "決定前先確認對方的想法。", "嘗試協調不同的人。", "留出安靜時間，不只為他人而決定。"], ["試著表達想法", "寫下想法，再選出一個重點。", "嘗試溝通或展示類工作。", "兼顧創意空間與期限。"], ["試著穩步累積", "整理判斷標準，從能做的開始。", "嘗試建立可持續的流程。", "不必等到完美才行動。"]] },
  ko: { title: "나의 특성", subtitle: "셀프 코어 분석", preview: "참고 미리보기 · 검증된 15가지 통합 분석이 아닙니다", diagnosis: "개인 심층 분석", diagnosisHint: "출생·이름 정보를 확인하고 나만의 가이드를 살펴보세요", core: "핵심과 강점", pattern: "사고와 행동", talent: "잠재력과 업무 방향", manual: "나만의 사용 설명서", tags: ["생일 숫자", "이름 입력됨", "출생지 입력됨"], source: "생일 숫자를 바탕으로 한 성찰 제안입니다. 이름·출생지로 성격이나 능력을 판단하지 않습니다.", progress: "프로필 입력", archetypes: [["시작하는 힘 시도하기", "작은 첫걸음을 정하고 다른 의견도 들어보세요.", "새로운 아이디어의 초안을 만들어보세요.", "선택권을 유지하되 혼자 짊어지지 마세요."], ["사람 연결하기", "결정 전에 상대의 의도를 확인해보세요.", "서로 다른 사람을 잇는 역할을 시도해보세요.", "조용히 생각할 시간을 만들고 남만 위해 결정하지 마세요."], ["생각 표현하기", "아이디어를 적고 한 가지 우선순위를 정하세요.", "전달하고 보여주는 역할을 시도해보세요.", "창의적인 여유와 마감 기한을 함께 두세요."], ["차근차근 쌓기", "판단 기준을 정리하고 할 수 있는 것부터 하세요.", "지속 가능한 과정을 만드는 역할을 시도해보세요.", "완벽해질 때까지 기다리지 마세요."]] },
  es: { title: "Tus rasgos", subtitle: "Reflexión sobre tu esencia", preview: "Vista ilustrativa · No es una lectura verificada de 15 artes", diagnosis: "Análisis personal", diagnosisHint: "Revisa tus datos de nacimiento y nombre para explorar tu guía", core: "Esencia y fortaleza", pattern: "Pensamiento y acción", talent: "Potencial profesional", manual: "Tu propia guía", tags: ["Número natal", "Nombre indicado", "Lugar indicado"], source: "Ideas para reflexionar basadas en el número natal. El nombre y el lugar no evalúan tu carácter ni aptitudes.", progress: "Perfil completado", archetypes: [["Prueba a tomar la iniciativa", "Elige un primer paso pequeño y escucha otras opiniones.", "Prueba a esbozar una idea nueva.", "Mantén autonomía sin hacerlo todo a solas."], ["Prueba a conectar personas", "Pregunta qué quieren los demás antes de decidir.", "Prueba un papel de coordinación.", "Reserva tiempo a solas; no decidas solo por otros."], ["Prueba a expresar ideas", "Anota ideas y elige una prioridad.", "Explora un papel de comunicación.", "Combina libertad creativa y plazos."], ["Prueba a construir con constancia", "Ordena tus criterios y empieza por lo posible.", "Prueba a crear procesos duraderos.", "No esperes a la perfección para actuar."]] },
  fr: { title: "Vos traits", subtitle: "Réflexion sur votre essence", preview: "Aperçu illustratif · Pas une analyse vérifiée des 15 arts", diagnosis: "Analyse personnelle", diagnosisHint: "Vérifiez vos données de naissance et votre nom pour explorer votre guide", core: "Essence et force", pattern: "Pensée et action", talent: "Potentiel professionnel", manual: "Votre guide personnel", tags: ["Nombre natal", "Nom renseigné", "Lieu renseigné"], source: "Pistes de réflexion basées sur un nombre natal. Le nom et le lieu ne servent pas à juger le caractère ou les aptitudes.", progress: "Profil renseigné", archetypes: [["Essayez de prendre l'initiative", "Choisissez un petit premier pas, puis écoutez d'autres avis.", "Essayez d'ébaucher une nouvelle idée.", "Gardez votre autonomie sans tout porter seul."], ["Essayez de relier les personnes", "Vérifiez les intentions d'autrui avant de trancher.", "Essayez un rôle de coordination.", "Prenez du recul; ne décidez pas que pour les autres."], ["Essayez d'exprimer vos idées", "Notez vos idées et choisissez une priorité.", "Expérimentez un rôle de communication.", "Associez liberté créative et échéance."], ["Essayez de construire avec constance", "Clarifiez vos critères et commencez par le possible.", "Essayez de mettre en place des processus durables.", "N'attendez pas la perfection pour agir."]] },
};

type Weekly = { week: string; people: string; caution: string; labels: [string, string, string]; heading: string; note: string; items: [string, string, string][] };
const weeklyJa: Weekly = { heading: "今週のあなた専用ガイド", labels: ["今週の具体的アドバイス", "対人関係のポイント", "避けるべき注意点"], week: "", people: "", caution: "", note: "生年月日の数と今週の暦から選んだ参考ガイドです。", items: [
  ["月〜水に「やりたいこと」を3つ書き出し、金曜までに1つだけ最後までやり切りましょう。家事・勉強・仕事、どれでもOKです。", "話す前に「どう思う？」と一言聞くだけで、家族や友人・同僚との空気がやわらぎます。", "勢いで大きな買い物や約束をしないこと。一晩おいてから決めましょう。"],
  ["今週は人に会う予定を1つ入れて、近況を聞く時間に。思わぬヒントや情報が手に入りやすい週です。", "頼まれごとは「ここまでならできる」と範囲を伝えてから引き受けると、疲れを溜めません。", "他人の期待に合わせすぎて自分の予定を削らないこと。1日30分は一人の時間を確保して。"],
  ["気になっていることをメモやSNS下書きに言葉にしてみましょう。考えが整理され、次の一手が見えます。", "褒め言葉は具体的に（「あの説明わかりやすかった」など）。相手との距離がぐっと縮まります。", "夜更かしとダラダラ見続けるスマホに注意。週の後半に集中力が落ちやすくなります。"],
  ["部屋の一角・机・スケジュール帳など、1か所だけ整えましょう。気持ちが落ち着き、判断が速くなります。", "結論を急がず、相手の話を最後まで聞くこと。信頼が積み上がる週です。", "完璧を目指して始めるのを先延ばしにしないこと。6割できたら一度出してみましょう。"],
] };
const weeklyEn: Weekly = { heading: "Your guide for this week", labels: ["Concrete advice this week", "Relationship tips", "Things to avoid"], week: "", people: "", caution: "", note: "A reference guide chosen from your birth-date number and this week's calendar.", items: [
  ["Write down three things you want to do by Wednesday, and finish just one of them by Friday — chores, study or work all count.", "Simply asking \"What do you think?\" before sharing your view softens things with family, friends and coworkers.", "Avoid big purchases or promises made on impulse. Sleep on it first."],
  ["Plan one catch-up with someone this week. Useful hints and information tend to come through people now.", "When asked for help, say how much you can do before agreeing, so you don't wear yourself out.", "Don't cut your own plans to meet others' expectations. Keep 30 minutes a day for yourself."],
  ["Put what's on your mind into words in a note or draft. Your thoughts will clear and the next step will show.", "Make compliments specific (\"That explanation was really clear\"). It brings people closer.", "Watch out for late nights and endless scrolling — focus tends to dip later in the week."],
  ["Tidy just one spot — a corner, your desk, or your planner. You'll feel calmer and decide faster.", "Listen to the end before concluding. Trust builds up this week.", "Don't postpone starting while aiming for perfection. Share it once it's 60% done."],
] };

export default function SelfCoreCard({ profile, language, onDiagnosis }: { profile: UserProfile; language: Language; onDiagnosis: () => void }) {
  const t = copy[language];
  const digits = profile.birthDate.replace(/\D/g, "");
  const sum = [...digits].reduce((total, digit) => total + Number(digit), 0);
  const number = sum > 0 ? ((sum - 1) % 9) + 1 : 0;
  const ideas = t.archetypes[(number - 1 + 4) % 4] ?? t.archetypes[0];
  if (!ideas) return null;
  const named = Boolean(profile.nameKanji || profile.nameKana || profile.nameRomaji);
  const place = Boolean(profile.birthPlace || profile.birthCity);
  const w = language === "ja" ? weeklyJa : weeklyEn;
  const now = new Date();
  const weekNo = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 604800000);
  const weekItems = w.items[(number + weekNo) % 4] ?? w.items[0]!;
  const completed = [Boolean(profile.birthDate), named, place, Boolean(profile.birthTime && !profile.birthTimeUnknown)].filter(Boolean).length;
  const sections = [
    { icon: Fingerprint, label: t.core, value: ideas[0] },
    { icon: Brain, label: t.pattern, value: ideas[1] },
    { icon: BriefcaseBusiness, label: t.talent, value: ideas[2] },
    { icon: Heart, label: t.manual, value: ideas[3] },
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
        <div><Sparkles className="size-6 text-primary" aria-hidden="true" /><h2 className="mt-4 font-serif text-xl text-foreground sm:text-2xl">{t.diagnosis}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{t.diagnosisHint}</p>
          <h3 className="mt-5 text-xs font-semibold text-primary">{w.heading}</h3>
          <ul className="mt-3 space-y-3">{weekItems.map((item, i) => <li key={i} className={`rounded-md border p-3 ${i === 2 ? "border-destructive/40 bg-destructive/10" : "border-primary/20 bg-primary/5"}`}><p className="text-[11px] font-semibold text-primary">{w.labels[i]}</p><p className="mt-1 text-sm leading-6 text-foreground/90">{item}</p></li>)}</ul>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{w.note}</p></div>
        <div className="mt-7"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>{t.progress}</span><span>{completed}/4</span></div><div className="h-1.5 overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-label={t.progress} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={4}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completed * 25}%` }} /></div><Button variant="champagne" onClick={onDiagnosis} className="mt-5 w-full justify-between whitespace-normal text-sm">{t.diagnosis}<ArrowUpRight className="size-4 shrink-0" /></Button></div>
      </section>
    </div>
  );
}