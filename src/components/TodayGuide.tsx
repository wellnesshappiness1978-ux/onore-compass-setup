import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BriefcaseBusiness, CalendarHeart, CalendarRange, ChefHat, ChevronRight, Compass, Crown, Eye, Flower2, HeartPulse, LineChart, LockKeyhole, MessageCircleHeart, ShoppingBag, Sparkles, Stars, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { UserProfile } from "./Onboarding";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { canUseToday, canReadThreeWaves, luckyFoodLimit, familyRoadmapMin, helioRangeDays, planOrder, todayFeatures, type TodayFeature } from "@/lib/plans";
import { dateAt, daysInYear, directionEnergy, localIso, personal, roadmap, type Direction, type Phase } from "@/lib/day-compass";
import { almanacDay } from "@/lib/helio-almanac";
import { dayElement, relation, type Element, type TeamMember } from "@/lib/team-analysis";
import { listTeamMembers } from "@/lib/team-members.functions";
import { birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import { companionCopy } from "@/lib/companion-copy";
import { teamCopy } from "@/lib/team-copy";
import { annualFlyingStars, mingGua } from "@/lib/feng-shui";
import ShareCardButton from "./ShareCardButton";
import FeatureNotifySwitch from "./FeatureNotifySwitch";
import DayCompass from "./DayCompass";
import HelioCalendar from "./HelioCalendar";
import FengShuiGuide from "./FengShuiGuide";
import { consultationUxCopy } from "@/lib/consultation-ux-copy";
import { higherTodayBenefits, todayBenefitCategories, todayBenefitCopy, todayBenefitCount } from "@/lib/today-benefits";
import { recipesForElement, recipeDetails, COURSE_ORDER, courseLabels } from "@/lib/lucky-recipes";
import { flowerImageForMonth } from "@/lib/flower-images";
import RecipeStep, { cleanRecipeSteps } from "./RecipeStep";
import { recipeLabels, recipeReason } from "@/lib/recipe-presentation";
import { buildTodayDepth, type DeepSection } from "@/lib/today-depth";
import { useFocus } from "./FocusProvider";
import { goalText, memberToProfile } from "@/lib/focus";
import { TodayInsight, TodayLuckyTrio, useTodayFortune } from "./TodayFortuneAi";
import TodayReminders from './TodayReminders';
import { TodayCard } from './TodayCard';
import { todayAccessCopy } from '@/lib/today-access-copy';
import { todaySample } from '@/lib/today-samples';
import { subjectSignals, subjectDirections } from '@/lib/today-subject';
import { readingDate, monthlyLabels, servingsLabel } from "@/lib/reading-presentation";
import { recipeImage } from "@/lib/recipe-images";
import { groupBirthPalette } from '@/lib/group-palette';
import DailyLuckyColor from './DailyLuckyColor';

// Deterministic reference values from birth date and today's calendar; not verified readings or predictions.
type Pair = { ja: string; en: string };
const P = (ja: string, en: string): Pair => ({ ja, en });

export const todayTitles: Record<TodayFeature, Pair> = {

  decision: P("今日の具体的決断（攻める／守る）", "Today's concrete decision"),
  starPath: P("本日の星巡りと志の導き", "Today's star path & guiding aspiration"),
  dailyLucky: P("本日の3ラッキー", "Today's three lucky picks"),
  direction: P("吉方位・開運エネルギー", "Lucky direction"),
  shopping: P("総合運気を上げる買い物ガイド", "Shopping guide"),
  health: P("健康アドバイス（心身のメンテナンス）", "Health tip"),
  relations: P("クイック対人ガイド", "Quick relationship guide"),
  monthlyLucky: P("今月の3ラッキー", "This month's three lucky picks"),
  directionExtended: P("吉方位（生まれ持った方位タイプと今年の方位）", "Birth direction type & this year's direction"),
  helio: P("地球暦から読み解く", "Reading the Earth Calendar"),
  biorhythm365: P("個人・ファミリーのバイオリズム", "Personal & family biorhythm"),
  familyRoadmap: P("ファミリーの365日ロードマップとバイオリズム", "Family 365-day roadmap & biorhythm"),
};
const titles = todayTitles;
export const todayNotifyEmoji: Partial<Record<TodayFeature, string>> = { decision: "💡", starPath: "✨", dailyLucky: "🎨", direction: "🧭", helio: "🌍", shopping: "🛍️", health: "🌿", monthlyLucky: "🌸", directionExtended: "🧭", relations: "🤝", biorhythm365: "📈", familyRoadmap: "👨‍👩‍👧" };
const icons: Record<TodayFeature, typeof Compass> = { decision: Swords, starPath: Stars, dailyLucky: Sparkles, direction: Compass, directionExtended: Compass, shopping: ShoppingBag, health: HeartPulse, relations: MessageCircleHeart, monthlyLucky: Flower2, helio: CalendarHeart, biorhythm365: LineChart, familyRoadmap: BriefcaseBusiness };

const words: Record<Element, Pair[]> = {
  wood: [P("朝の散歩で新しい道を選ぶ", "Take a new route on a morning walk"), P("「まず芽を出す」", "\"Plant the first seed\""), P("ストレッチとヨガ", "Stretching and yoga")],
  fire: [P("笑顔で先に挨拶する", "Greet people first with a smile"), P("「情熱は小さな火から」", "\"Passion starts with a small flame\""), P("ダンスや軽いジョギング", "Dancing or a light jog")],
  earth: [P("机の上をひとつ片づける", "Clear one spot on your desk"), P("「足元を固めて進む」", "\"Steady footing, steady steps\""), P("ウォーキングと深呼吸", "Walking and deep breaths")],
  metal: [P("要らない物を一つ手放す", "Let go of one unneeded item"), P("「選ぶことは磨くこと」", "\"Choosing is polishing\""), P("姿勢を整える筋トレ", "Posture-building strength work")],
  water: [P("気になる人に一言連絡する", "Send a short note to someone you miss"), P("「流れに乗って柔らかく」", "\"Flow softly with the current\""), P("水泳やゆったり入浴", "Swimming or a slow bath")],
};
const foods: Record<Element, Pair[]> = {
  wood: [P("ほうれん草とツナの和え物", "Spinach and tuna salad"), P("小松菜と油揚げの味噌汁", "Komatsuna and fried-tofu miso soup"), P("鶏むね肉のレモン蒸し", "Lemon-steamed chicken breast"), P("ブロッコリーのごま和え", "Sesame broccoli"), P("きゅうりの浅漬け", "Quick-pickled cucumber")],
  fire: [P("トマトと卵の炒め物", "Tomato and egg stir-fry"), P("パプリカの肉詰め", "Stuffed bell peppers"), P("ゴーヤチャンプルー", "Bitter-melon champuru"), P("にんじんしりしり", "Carrot and egg shiri-shiri"), P("いちごヨーグルト", "Strawberry yogurt")],
  earth: [P("かぼちゃの煮物", "Simmered pumpkin"), P("さつまいもご飯", "Sweet-potato rice"), P("根菜たっぷり豚汁", "Root-vegetable pork soup"), P("肉じゃが", "Nikujaga (meat and potato stew)"), P("とうもろこしのかき揚げ", "Corn kakiage fritters")],
  metal: [P("ぶり大根", "Yellowtail with radish"), P("白身魚の塩焼き", "Salt-grilled white fish"), P("れんこんのきんぴら", "Lotus-root kinpira"), P("大根と豚バラの煮物", "Daikon and pork belly stew"), P("白菜と豆腐のスープ", "Napa cabbage and tofu soup")],
  water: [P("わかめと豆腐の味噌汁", "Wakame and tofu miso soup"), P("鮭のホイル焼き", "Foil-baked salmon"), P("ひじきと黒豆の煮物", "Hijiki and black beans"), P("なめこおろし", "Nameko mushrooms with grated radish"), P("しじみの味噌汁", "Shijimi clam miso soup")],
};
const shop: Record<Element, Pair> = {
  wood: P("観葉植物・ノート・新しい文房具。午前中の買い物が好相性。予算を先に決めると満足度が上がります。", "Plants, notebooks, stationery. Morning shopping suits today; set a budget first."),
  fire: P("照明・香り・赤いアクセント小物。昼過ぎの買い物が好相性。体験にお金を使うと気分が明るくなります。", "Lighting, fragrance, red accents. Early afternoon suits today; spend on experiences."),
  earth: P("器・キッチン用品・黄色の小物。長く使える物を一つ選ぶと、暮らしの土台が整います。", "Tableware, kitchen goods, yellow items. Choose one long-lasting piece."),
  metal: P("アクセサリー・時計・白い小物。手入れ用品も好相性。買う前に一晩おくと賢い選択に。", "Accessories, watches, white items. Sleep on it before buying."),
  water: P("タンブラー・バス用品・紺色の小物。夕方の買い物が好相性。貯金箱に小銭を入れるのも◎。", "Tumblers, bath goods, navy items. Evening suits today; save a few coins too."),
};
const health: Record<Element, Pair> = {
  wood: P("目と肩をいたわる日。1時間に一度遠くを見て、朝に体を伸ばしましょう。睡眠は23時前に。", "Care for eyes and shoulders. Look far away hourly and stretch in the morning."),
  fire: P("心と巡りをいたわる日。水分をこまめに、夜は照明を早めに落としましょう。", "Care for circulation. Drink water often and dim lights early."),
  earth: P("胃腸をいたわる日。よく噛み、温かい汁物を一杯。食後に10分歩くと軽やかです。", "Care for digestion. Chew slowly, have warm soup, walk 10 minutes after meals."),
  metal: P("喉と肌をいたわる日。深呼吸と換気、保湿を意識しましょう。", "Care for throat and skin. Breathe deeply, ventilate and moisturize."),
  water: P("体を温める日。湯船につかり、いつもより30分長めの睡眠を。", "Stay warm. Take a bath and sleep 30 minutes longer."),
};
const talk: Record<string, [Pair, Pair, Pair]> = {
  generate: [P("「いつも助かってる、ありがとう」と具体的に感謝を伝える", "Thank them for something specific"), P("話を途中で遮って結論を急ぐ", "Cutting them off to rush a conclusion"), P("相手のペースを一呼吸待つ", "Wait one breath for their pace")],
  same: [P("「一緒にやろう」と対等に声をかける", "Invite them as an equal"), P("どちらが正しいか白黒つける", "Competing over who is right"), P("役割を分けて得意を活かし合う", "Split roles to use each other's strengths")],
  control: [P("「あなたの意見を聞かせて」と先に相手を立てる", "Ask for their opinion first"), P("命令口調や急な予定変更", "Commanding tone or sudden changes"), P("結論より気持ちを先に受け止める", "Receive feelings before conclusions")],
  neutral: [P("「最近どう？」と軽い近況から話す", "Start with light small talk"), P("返事を急かす", "Pressuring for a quick reply"), P("短いメッセージで温度を保つ", "Keep warmth with short messages")],
};
const months: { flower: Pair; meaning: Pair; why: Pair; action: Pair; item: Pair }[] = [
  { flower: P("スイセン", "Narcissus"), meaning: P("自己愛・希望", "Self-respect, hope"), why: P("寒さの中で凛と咲く姿が、新年の決意を自分らしく貫く力を映すから。", "It blooms upright in the cold, mirroring a new-year resolve."), action: P("一年の目標を3行で書き、毎朝読む", "Write a 3-line yearly goal and read it each morning"), item: P("白い手帳", "A white planner") },
  { flower: P("ウメ", "Plum blossom"), meaning: P("忍耐・気品", "Patience, grace"), why: P("春を先取りして咲く花が、準備を重ねる今月の流れに寄り添うから。", "It blooms ahead of spring, matching a month of preparation."), action: P("後回しの手続きを一つ片づける", "Finish one postponed task"), item: P("梅柄のハンカチ", "A plum-pattern handkerchief") },
  { flower: P("チューリップ", "Tulip"), meaning: P("思いやり", "Kindness"), why: P("まっすぐ伸びる茎が、新しい環境で素直に始める背中を押すから。", "Its straight stem encourages honest new starts."), action: P("新しい習慣を一つ21日続ける", "Keep one new habit for 21 days"), item: P("新しいペン", "A new pen") },
  { flower: P("スズラン", "Lily of the valley"), meaning: P("再び幸せが訪れる", "Return of happiness"), why: P("小さな鈴のような花が、ささやかな喜びを集める今月にぴったりだから。", "Its tiny bells suit a month of collecting small joys."), action: P("感謝を毎日一つメモする", "Note one thank-you each day"), item: P("鈴のチャーム", "A small bell charm") },
  { flower: P("バラ", "Rose"), meaning: P("愛・美", "Love, beauty"), why: P("最盛期を迎える花が、人とのつながりを深める今月の追い風を表すから。", "Peaking in bloom, it reflects deepening connections."), action: P("大切な人と食事の予定を立てる", "Plan a meal with someone dear"), item: P("ローズの香り", "A rose fragrance") },
  { flower: P("アジサイ", "Hydrangea"), meaning: P("辛抱強い愛・団らん", "Patient love, togetherness"), why: P("雨に映えて色を変える姿が、変化を楽しむ柔らかさを教えてくれるから。", "It shines in rain and changes color, teaching gentle flexibility."), action: P("家の一角を模様替えする", "Rearrange one corner at home"), item: P("お気に入りの傘", "A favorite umbrella") },
  { flower: P("ヒマワリ", "Sunflower"), meaning: P("憧れ・あなただけを見つめる", "Adoration"), why: P("太陽を追う花が、目標へ顔を上げて進む今月のエネルギーと重なるから。", "Following the sun, it matches a month of looking up toward goals."), action: P("夏の挑戦を一つ決めて宣言する", "Declare one summer challenge"), item: P("黄色の小物", "A yellow accessory") },
  { flower: P("アサガオ", "Morning glory"), meaning: P("固い絆", "Firm bonds"), why: P("朝に開く花が、早起きのリズムで運気を整える今月に合うから。", "Opening at dawn, it suits an early-rising rhythm."), action: P("朝15分を自分の時間にする", "Keep 15 morning minutes for yourself"), item: P("ガラスのコップ", "A glass tumbler") },
  { flower: P("リンドウ", "Gentian"), meaning: P("誠実", "Sincerity"), why: P("秋の始まりに凛と咲く青が、誠実な積み重ねを後押しするから。", "Its autumn blue supports sincere, steady effort."), action: P("学びたいことの本を一冊読む", "Read one book on something you want to learn"), item: P("藍色のブックカバー", "An indigo book cover") },
  { flower: P("キンモクセイ", "Osmanthus"), meaning: P("謙虚・真実", "Humility, truth"), why: P("遠くまで届く香りが、静かな実力が周りに伝わる今月を象徴するから。", "Its far-reaching scent symbolizes quiet skill being noticed."), action: P("成果を一つ見える形にまとめる", "Summarize one achievement visibly"), item: P("金色のしおり", "A gold bookmark") },
  { flower: P("キク", "Chrysanthemum"), meaning: P("高貴・長寿", "Nobility, longevity"), why: P("実りの季節に咲く花が、これまでの努力を味わう時期に寄り添うから。", "Blooming at harvest, it honors effort so far."), action: P("ファミリーや仲間に労いを伝える", "Thank family or teammates for their effort"), item: P("小さな財布", "A small wallet") },
  { flower: P("ポインセチア", "Poinsettia"), meaning: P("祝福", "Blessing"), why: P("冬を彩る赤が、一年を祝い次へつなぐ今月の締めくくりに合うから。", "Its winter red celebrates the year and bridges to the next."), action: P("一年の振り返りと来年の一文を書く", "Review the year and write one line for next year"), item: P("赤いリボン", "A red ribbon") },
];
const dirNames: Record<Direction, Pair> = { N: P("北", "North"), NE: P("北東", "Northeast"), E: P("東", "East"), SE: P("南東", "Southeast"), S: P("南", "South"), SW: P("南西", "Southwest"), W: P("西", "West"), NW: P("北西", "Northwest") };

type Props = { profile: UserProfile; language: Language; plan: Plan; signedIn: boolean; onUpgrade: () => void };

export default function TodayGuide({ profile, language, plan, signedIn, onUpgrade }: Props) {
  const ja = language === "ja";
  const L = (p: Pair) => (ja ? p.ja : p.en);
  const voice = companionCopy[language];
  const names = teamCopy[language].planNames;
  const benefit = todayBenefitCopy[language];
  const focus = useFocus();
  const [recipeIndex, setRecipeIndex] = useState<number | null>(null);
  const [today, setToday] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setToday(old => localIso(old) === localIso(new Date()) ? old : new Date()), 30_000); return () => clearInterval(id); }, []);
  const iso = localIso(today);
  // AI reading is built for the actual subject: group members, a family member, or the owner — never reused across subjects.
  const fortuneReq = useMemo(() => {
    const toReq = (p: UserProfile, rel = "", relType = "") => ({ nameKanji: p.nameKanji ?? "", nameKana: p.nameKana ?? "", nameRomaji: p.nameRomaji ?? "", birthDate: p.birthDate, birthTime: p.birthTime ?? "", birthTimeUnknown: p.birthTimeUnknown ?? true, birthPlace: p.birthPlace ?? "", birthCity: p.birthCity ?? "", gender: p.gender ?? "undisclosed", bloodType: p.bloodType ?? "", siblingOrder: p.siblingOrder ?? "", father: p.father, mother: p.mother, relationship: rel, relationshipType: relType });
    const goal = focus ? goalText(focus.focus, language) : "";
    if (focus?.group) {
      const ms = focus.group.members.filter(m => m.birthDate).slice(0, 30).map(m => toReq(memberToProfile(m), m.relationship ?? "", m.relationshipType ?? ""));
      return ms.length ? { language, day: iso, goal, subject: { kind: "group" as const, key: `g-${focus.group.group.id}`, label: focus.label(language) }, members: ms } : null;
    }
    if (!profile.birthDate) return null;
    if (focus?.member) return { language, day: iso, goal, subject: { kind: "member" as const, key: `m-${focus.member.id}`, label: focus.label(language) }, members: [toReq(profile, focus.member.relationship ?? "", focus.member.relationshipType ?? "")] };
    return { language, day: iso, goal, subject: { kind: "self" as const, key: "self", label: "" }, members: [toReq(profile)] };
  }, [focus, profile, language, iso]);
  const fortune = useTodayFortune(fortuneReq);
  const el = dayElement(iso);
  const dailyRecipes = recipesForElement(el, iso, profile.birthDate);
  const selectedRecipe = recipeIndex === null ? null : dailyRecipes[recipeIndex];
  const recipe = selectedRecipe ? recipeDetails(selectedRecipe, language) : null;
  const starPoem = useMemo(() => {
    const m = today.getMonth();
    const doy = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const seed = doy + Number((profile.birthDate ?? "").replace(/-/g, "").slice(-4) || 0);
    const seasonJa = ["凍てつく澄んだ空気に、春を待つ土の匂いが眠る", "梅の香りがかすかに漂い、光が少しずつ伸びてゆく", "芽吹きの青い匂いが、地球を淡くつつみはじめる", "花の香りと若葉の風が、地球を明るく満たす", "新緑の息吹が濃くなり、光が力強く降りそそぐ", "雨の匂いが土をうるおし、命が静かに深まる", "夏の陽が地球を照らし、雲が高く湧き立つ", "熱をおびた大気に、実りへの予感が満ちてゆく", "澄みはじめた風に、稲穂と秋の気配が香る", "深まる秋の光が、木々を金色に染めてゆく", "冷たく澄んだ空に、星々がひときわ近く瞬く", "冬至へ向かう静けさの中、地球は光の再生を待つ"][m];
    const seasonEn = ["Crisp winter air holds the sleeping scent of soil", "A hint of plum blossom rides the lengthening light", "The green scent of new buds softly wraps the Earth", "Blossoms and young leaves fill the Earth with brightness", "Fresh green deepens as strong light pours down", "The scent of rain nourishes the soil and life deepens", "Summer sun lights the Earth as clouds rise high", "Warm air carries the promise of harvest", "Clearing winds bring the scent of ripening grain", "Deep autumn light turns the trees to gold", "In the cold clear sky the stars feel close", "In the stillness before the solstice, the Earth awaits returning light"][m];
    const aspJa = ["幾千年、人は星を見上げて道を描き、その志は今もあなたの足元を照らしています", "先人たちが一歩ずつ積み重ねた想いは、未来への道標として今日へ受け継がれています", "名もなき人々の小さな志が重なり、人類の歩みは大きな光の道となりました", "偉人たちもまた、迷いながら一日を大切に重ね、志を形にしてきました"][seed % 4];
    const aspEn = ["For millennia people have looked to the stars to find their way, and that aspiration still lights your path", "The care our predecessors built step by step is handed to today as a signpost to the future", "Countless small aspirations have joined into humanity's great path of light", "Great figures, too, honored each day while unsure, and gave their aspirations form"][seed % 4];
    const elJa: Record<string, string> = { wood: "まっすぐ伸びる心で、ひとつ新しい芽を育てて", fire: "胸の灯を大切に、誰かを温めるひと言を届けて", earth: "足元をととのえ、安心できる場所を育んで", metal: "大切なものを見極め、澄んだ選択をひとつ重ねて", water: "しなやかな心で流れを読み、深い気づきを味わって" };
    const elEn: Record<string, string> = { wood: "grow one new sprout with an upright heart", fire: "cherish your inner flame and offer someone a warm word", earth: "tend your footing and nurture a place of calm", metal: "see what matters and make one clear choice", water: "read the flow with a supple heart and savor a deep insight" };
    const wishJa = `今日という尊い一日、あなたは${elJa[el] ?? elJa["earth"]}ください。あなたの歩みが、明日の誰かの道標になりますように。`;
    const wishEn = `On this precious day, may you ${elEn[el] ?? elEn["earth"]}. May your steps become a signpost for someone tomorrow.`;
    return ja
      ? { text: `${seasonJa}。\n${aspJa}。\n${wishJa}`, notify: wishJa.slice(0, 60) }
      : { text: `${seasonEn}.\n${aspEn}.\n${wishEn}`, notify: wishEn };
  }, [today, profile.birthDate, el, ja]);
  // Seasonal guidance for the star path: current solar term plus three prepare/mindset blocks.
  const seasonGuide = useMemo(() => {
    const alm = almanacDay(today);
    const m = today.getMonth();
    const adjustJa = ["寒暖差で自律神経が揺れやすい時期。ぬるめの湯に浸かり、朝の光を5分浴びて体内時計を整えましょう。", "乾燥と寒さの境目。白湯で体を温め、首元を守る服装で気持ちも落ち着きます。", "芽吹きの気が動き、心もそわそわしやすい時。深呼吸を日に3回、肩の力を抜く時間を。", "環境の変化で疲れが出やすい季節。睡眠を15分早め、緑に触れる散歩で心身をリセット。", "日差しが強まり活動量が増える時期。こまめな水分と、正午の少しの休憩で波に乗りましょう。", "湿気で体が重くなりがち。換気と軽いストレッチ、消化にやさしい温かい食事で整えて。", "暑さで消耗しやすい季節。涼しい朝に動き、夜は照明を落として休息の質を高めましょう。", "残暑と秋の気配が混ざる境目。冷やしすぎを見直し、足元を温めると心も安定します。", "空気が澄み、集中力が戻る時期。朝のルーティンを一つ整えると一日が軽やかに。", "日照が短くなり気持ちが沈みがち。夕方の散歩と温かい汁物で、心に火を灯して。", "冷え込みで体がこわばる季節。入浴で芯から温め、早めの就寝でエネルギーを蓄えて。", "一年で最も静かな時期。部屋を整え、温かい飲み物とともに内側を休ませましょう。"][m];
    const adjustEn = ["Temperature swings can unsettle your rhythm. Take a lukewarm bath and greet the morning light for five minutes.", "Between dryness and cold, warm yourself with hot water and protect your neck to settle the mind.", "Sprouting energy can make you restless. Three deep breaths a day and time to drop your shoulders.", "Seasonal change tires easily. Sleep 15 minutes earlier and reset with a walk among green.", "As sunlight strengthens, hydrate often and take a short midday pause to ride the wave.", "Humidity weighs the body down. Ventilate, stretch gently, and choose warm, easy meals.", "Heat drains energy. Move in the cool morning and dim the lights at night for deeper rest.", "Late heat mixes with autumn air. Ease off cold drinks and warm your feet to steady the heart.", "Clear air brings focus back. Tidy one morning routine and the whole day lightens.", "Shorter days can dim the mood. An evening walk and warm soup keep your inner flame lit.", "Cold tightens the body. Warm to the core with a bath and store energy with earlier sleep.", "The quietest season of the year. Tidy your room and rest inwardly with a warm drink."][m];
    const prepareJa = ["次の季節の種まきの時期。今年の目標を一行で書き、不要な予定を一つ手放しましょう。", "春の準備期。使わない物を一つ手放し、新しい計画のための空間をつくりましょう。", "始まりの季節。新しい習慣は小さく始め、三日続いた自分をまず認めましょう。", "人との縁が動く時期。会いたい人に連絡し、夏までの計画を軽く書き出して。", "勢いが増す季節。挑戦したいことを一つ選び、最初の一歩の日付を決めましょう。", "土台を固める時期。家計や持ち物を見直し、夏の忙しさに備える余白を。", "実りに向かう季節。進んでいることを一つ仕上げ、次の目標を静かに描いて。", "収穫と整理の季節。夏の疲れを労い、秋に始めたい学びを一つ選びましょう。", "実りを味わう時期。感謝を伝えると同時に、冬に向けて体を整える習慣を。", "深まりの季節。今年の成果を振り返り、大切な人と過ごす時間を確保して。", "備えの季節。一年の締めくくりに向け、やり残しを一つ片づけましょう。", "再生の季節。来年の志を一行書き、心身を休めることを最優先に。"][m];
    const prepareEn = ["A time to sow next season's seeds. Write one line for this year's goal and release one needless commitment.", "Preparation for spring. Let go of one unused thing and make space for a new plan.", "A season of beginnings. Start a new habit small and honor yourself for three days of it.", "Connections stir now. Message someone you miss and sketch light plans toward summer.", "Momentum grows. Choose one challenge and set a date for its first step.", "Time to firm the ground. Review spending and belongings, leaving margin for summer's rush.", "A season toward harvest. Finish one thing in motion and quietly picture the next goal.", "A season of harvest and order. Thank yourself for summer's effort and pick one autumn study.", "Time to savor the yield. Express gratitude and begin a habit that steadies you toward winter.", "A deepening season. Review this year's fruits and protect time with those you love.", "A season of readiness. Clear one leftover task as the year turns toward its close.", "A season of renewal. Write one line of aspiration for next year and make rest the priority."][m];
    const mindsetJa = `今日は「${alm.term ?? alm.zassetsu[0] ?? "季節の巡り"}」の気が満ちる日。急がず、しかし止まらず。星の巡りと地球の呼吸に合わせ、目の前の一つを丁寧に仕上げることが、あなたの志をいちばん確かに育てます。`;
    const mindsetEn = `Today carries the spirit of "${alm.term ?? alm.zassetsu[0] ?? "the turning season"}". Unhurried, yet never still — align with the stars and the Earth's breath, and finish one thing before you with care. That is the surest way to grow your aspiration.`;
    return ja
      ? { term: alm.term, zassetsu: alm.zassetsu, adjust: adjustJa, prepare: prepareJa, mindset: mindsetJa, headings: ["🌱 季節の変わり目のエネルギー調整", "🧭 今の時期に向けた準備と行動", "✨ 本日の志と心構え"] as const }
      : { term: alm.term, zassetsu: alm.zassetsu, adjust: adjustEn, prepare: prepareEn, mindset: mindsetEn, headings: ["🌱 Seasonal energy adjustment", "🧭 Preparation & action for this season", "✨ Today's aspiration & mindset"] as const };
  }, [today, ja]);
  const birth = profile.birthDate;
  const subjectMembers = fortuneReq?.members ?? [];
  const rhythm = subjectSignals(subjectMembers, today);
  const access = todayAccessCopy[language];
  const spectrum = focus?.group ? groupBirthPalette(focus.group.members) : birthColorSpectrum(profile);
  const energy = useMemo(() => subjectDirections(subjectMembers, today), [JSON.stringify(subjectMembers), iso]);
  const best = energy[0]!;
  const rank = (p: Plan) => planOrder.indexOf(p);

  // Daily lucky color rotates through the six personal colors by day of year.
  const dayIdx = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(today.getFullYear(), 0, 1)) / 864e5);
  const luckyColor = spectrum ? [spectrum.main, spectrum.sub, spectrum.money, spectrum.work, spectrum.love, spectrum.health][dayIdx % 6]! : null;
  const word = words[el][dayIdx % 3]!;
  const luckyHex = fortune.data?.luckyColor.hex ?? luckyColor?.code;
  const month = months[today.getMonth()]!;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pick, setPick] = useState("");
  const list = useServerFn(listTeamMembers);
  const wantsMembers = rank(plan) >= rank("vip");
  const [rosterTick, setRosterTick] = useState(0);
  useEffect(() => {
    const onReload = () => setRosterTick((v) => v + 1);
    window.addEventListener("onore-focus-reload", onReload);
    return () => window.removeEventListener("onore-focus-reload", onReload);
  }, []);
  useEffect(() => {
    let active = true;
    if (!wantsMembers) { setMembers([]); return; }
    if (signedIn) list().then((v) => { if (active) setMembers(v); }).catch(() => { if (active) setMembers([]); });
    else { try { const v = JSON.parse(localStorage.getItem("onore-team") ?? "[]"); setMembers(Array.isArray(v) ? v : []); } catch { setMembers([]); } }
    return () => { active = false; };
  }, [wantsMembers, signedIn, list, rosterTick]);
  const me: TeamMember = { id: "me", name: "", birthDate: birth, gender: "", bloodType: "", role: "", skills: [] };
  const target = members.find((m) => m.id === pick);
  const advice = target ? talk[relation(me, target)] : null;

  const year = today.getFullYear();
  const yearCurve = useMemo(() => birth ? Array.from({ length: daysInYear(year) }, (_, d) => Math.round(subjectSignals(subjectMembers, dateAt(year, d)).total)) : [], [JSON.stringify(subjectMembers), year]);
  const monthAvg = useMemo(() => Array.from({ length: 12 }, (_, m) => { const days = yearCurve.filter((_, d) => dateAt(year, d).getMonth() === m); return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0; }), [yearCurve, year]);
  const map = useMemo(() => (birth ? roadmap(birth, year) : null), [birth, year]);
  const gua = mingGua(birth, profile.gender)?.branches[0];
  const stars = annualFlyingStars(today);
  const yearDir = stars.palaces.find((p) => p.star === 8 && p.dir !== "C")?.dir as Direction | undefined;
  const monthLabels = ja ? ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"] : ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const phases: Record<Phase, Pair> = { attack: P("攻め", "Advance"), defend: P("守り", "Protect"), newBiz: P("新規", "New"), contract: P("契約", "Sign") };

  const rangeLabel = Number.isFinite(helioRangeDays[plan]) ? (helioRangeDays[plan] === 0 ? (ja ? "当日分" : "Today") : helioRangeDays[plan] <= 31 ? (ja ? "前後1ヶ月" : "±1 month") : (ja ? "前後1年" : "±1 year")) : (ja ? "全期間" : "Unlimited");
  const rangeBanner = (
    <div className="helio-range-pr mx-auto mb-3 w-full max-w-md rounded-lg border border-primary/40 bg-primary/10 p-3 text-left shadow-champagne">
      <p className="flex items-center gap-1.5 font-serif text-sm text-primary"><CalendarRange className="size-4" />{ja ? "地球暦の閲覧期間" : "Earth Calendar browsing range"}</p>
      <ul className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] sm:grid-cols-4">
        {([["free", ja ? "当日分" : "Today"], ["standard", ja ? "前後1ヶ月" : "±1 month"], ["vip", ja ? "前後1年" : "±1 year"], ["b2b", ja ? "全期間無制限" : "Unlimited"]] as const).map(([p, v]) => (
          <li key={p} className={`rounded-md border px-2 py-1.5 text-center ${plan === p || (p === "b2b" && plan === "b2b-premium") ? "border-primary bg-primary/20 font-bold text-primary" : "border-primary/20 text-foreground"}`}>{names[p]}<br /><span className="text-xs">{v}</span></li>
        ))}
      </ul>
      {plan !== "b2b" && plan !== "b2b-premium" && <Button size="sm" variant="champagne" className="mt-2 w-full" onClick={onUpgrade}><Crown className="size-3.5" />{ja ? "プランを見る・期間を広げる" : "View plans"}</Button>}
    </div>
  );
  const notifyEmoji = todayNotifyEmoji;
  const extBody = <div className="space-y-1 text-sm">
        <p>{ja ? "生まれ持った吉方位タイプ" : "Birth direction type"}：{gua ? `${gua.group === "east" ? (ja ? "東四命" : "East group") : (ja ? "西四命" : "West group")} · ${L(dirNames[gua.shengQi])}` : (ja ? "性別（男性／女性）の登録で表示されます" : "Shown when gender is set to male or female")}</p>
        <p>{ja ? `${stars.year}年の大開運方位` : `${stars.year} favorable direction`}：<strong className="text-primary">{yearDir ? L(dirNames[yearDir]) : "—"}</strong></p>
      </div>;
  const content: Record<TodayFeature, { body: ReactNode; notify: string }> = {
    decision: {
      notify: rhythm.total >= 55 ? (ja ? "今日は準備した一歩を小さく試す日" : "Test one prepared step today") : (ja ? "今日は確認と余白を整える日" : "Verify and leave space today"),
      body: <>
        <p className="text-xs text-muted-foreground">{ja ? "3周期の参考値" : "Three-cycle reference"} {Math.round(rhythm.total)}</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <article className="border-l-2 border-primary pl-3"><h4 className="font-serif text-base text-primary">{ja ? "攻めるなら" : "Advance"}</h4><p className="mt-1 text-sm leading-6">{voice.advance[rhythm.total >= 55 ? 0 : 1]}</p></article>
          <article className="border-l border-primary/40 pl-3"><h4 className="font-serif text-base text-primary">{ja ? "守るなら" : "Protect"}</h4><p className="mt-1 text-sm leading-6">{voice.protect[rhythm.total < 45 ? 0 : 1]}</p></article>
        </div>
      </>,
    },
    starPath: {
      notify: starPoem.notify,
      body: <div>
        <p className="whitespace-pre-line font-serif text-sm leading-7">{starPoem.text}</p>
        {(seasonGuide.term || seasonGuide.zassetsu.length > 0) && (
          <p className="mt-3 inline-flex flex-wrap gap-1.5 text-[11px]">
            {seasonGuide.term && <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary">{seasonGuide.term}</span>}
            {seasonGuide.zassetsu.map((z) => <span key={z} className="rounded-full border border-primary/25 px-2.5 py-1 text-muted-foreground">{z}</span>)}
          </p>
        )}
        <div className="mt-4 space-y-3">
          {[seasonGuide.headings[0], seasonGuide.headings[1], seasonGuide.headings[2]].map((h, i) => (
            <article key={h} className="rounded-md border border-primary/25 bg-card/50 p-4">
              <h4 className="font-serif text-sm text-primary">{h}</h4>
              <p className="mt-1.5 text-sm leading-7 text-foreground">{[seasonGuide.adjust, seasonGuide.prepare, seasonGuide.mindset][i]}</p>
            </article>
          ))}
        </div>
      </div>,
    },
    dailyLucky: {
      notify: fortune.data ? `${fortune.data.luckyColor.name} / ${fortune.data.luckyWord.word} / ${fortune.data.foods[0]?.name ?? ""}` : `${luckyColor ? localizeBirthColorName(luckyColor.name, language) : ""} / ${L(word)}`,
      body: <TodayLuckyTrio state={fortune} language={language} plan={plan} onUpgrade={onUpgrade} fallback={<ul className="space-y-2 text-sm leading-6">
        {luckyColor && <li><DailyLuckyColor language={language} hex={luckyColor.code} name={localizeBirthColorName(luckyColor.name, language)} /></li>}
        <li><strong className="text-primary">{ja ? "ラッキーワード" : "Lucky word"}</strong>：{L(word)}</li>
        <li><strong className="text-primary">{ja ? "運気アップフード 選りすぐり5品" : "5 lucky foods"}</strong>
          <p className="mt-2 text-xs leading-6">{access.rules}</p><p className="mt-1 flex items-center gap-1.5 text-xs"><ChefHat className="size-4 shrink-0" />{benefit.recipeHint}</p>
          <ol className="mt-2 grid gap-2 sm:grid-cols-2">{dailyRecipes.map((f, i) => <li key={f.id}>{i >= luckyFoodLimit[plan] ? <Button variant="outline" className="h-auto min-h-12 w-full whitespace-normal" onClick={onUpgrade}><LockKeyhole className="size-4" />{courseLabels[language][COURSE_ORDER[i]!]} · {i < 3 ? "Standard+" : "VIP+"}</Button> : <><Button variant="outline" onClick={() => { if (i < luckyFoodLimit[plan]) setRecipeIndex(i); }} className="grid h-auto min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] gap-2 whitespace-normal border-primary/35 bg-background/90 px-3 py-2 text-left text-foreground"><span className="flex min-w-0 items-center gap-3"><img src={recipeImage(f.id)} alt="" loading="lazy" width={384} height={512} className="h-20 w-16 shrink-0 rounded object-cover" /><span><span className="block text-xs text-primary">{courseLabels[language][COURSE_ORDER[i]!]}</span>{f.names[language]}</span></span><ChevronRight className="size-4 shrink-0" /></Button></>}</li>)}</ol>
          <span className="text-[11px] opacity-90">{ja ? "スーパーの食材で手軽に作れる、今日の気分を明るくする参考メニューです。" : "Easy reference dishes from everyday ingredients."}</span></li>
      </ul>} />,
    },
    direction: {
      notify: `${ja ? "今日の吉方位" : "Today's direction"}: ${L(dirNames[best.dir])}`,
      body: <>
        <p className="text-sm">{ja ? "今日の吉方位" : "Today's lucky direction"}：<strong className="text-lg text-primary">{L(dirNames[best.dir])}</strong>（{best.score}）</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">{energy.slice(0, 8).map((e) => { const lv = e.score >= 80 ? "great" : e.score >= 60 ? "good" : e.score >= 40 ? "mid" : "care"; return <span key={e.dir} className={`rounded-md border-2 px-1 py-1.5 text-center text-[11px] font-medium ${lv === "great" ? "fortune-great border-primary bg-primary text-primary-foreground shadow-champagne" : lv === "good" ? "border-fortune-good bg-fortune-good/15 text-foreground" : lv === "mid" ? "border-muted-foreground/40 bg-muted/40 text-foreground" : "border-destructive/60 bg-destructive/10 text-foreground"}`}>{L(dirNames[e.dir])}<br /><strong className="text-sm">{e.score}</strong></span>; })}</div>
        <div className="mt-3 rounded-md border border-primary/30 bg-background/60 p-2.5 text-[11px] leading-5">
          <p className="font-medium text-foreground">{ja ? "数値＝開運エネルギーの強さ（参考値）" : "Number = luck-energy strength (reference)"}</p>
          <ul className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-primary" />{ja ? "80以上：大吉方位" : "80+: Excellent"}</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-fortune-good" />{ja ? "60〜79：吉方位" : "60–79: Good"}</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-muted-foreground/50" />{ja ? "40〜59：中立" : "40–59: Neutral"}</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm border border-destructive bg-destructive/30" />{ja ? "39以下：ひと呼吸" : "≤39: Take it gently"}</li>
          </ul>
        </div>
        <div className="mt-3 border-t border-primary/20 pt-3">
          {canUseToday(plan, "directionExtended") ? (
            <details className="group rounded-md border border-primary/25 bg-card/40">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 font-serif text-sm text-primary [&::-webkit-details-marker]:hidden">
                <span>{ja ? "風水：生まれ持った吉方位タイプと今年の方位" : "Feng shui: birth direction type & this year's direction"}</span>
                <span className="text-xs text-muted-foreground transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="space-y-3 border-t border-primary/15 px-3 pb-3 pt-3">
                {extBody}
                <FengShuiGuide profile={profile} date={today} language={language} />
              </div>
            </details>
          ) : (
            <div className="rounded-md border border-primary/25 p-3">
              <h4 className="mb-1 font-serif text-sm text-primary">{ja ? "風水：生まれ持った吉方位タイプと今年の方位" : "Feng shui: birth direction type & this year's direction"}</h4>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-4 text-primary" /><span>{names.standard}+</span>
                <Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className="border-primary/40"><Eye className="size-3.5" />{consultationUxCopy[language].sample}</Button></DialogTrigger>
                  <DialogContent className="max-h-[90dvh] overflow-y-auto border-primary/35"><DialogHeader><DialogDescription className="text-xs text-primary">{consultationUxCopy[language].sample}</DialogDescription><DialogTitle className="font-serif text-primary">{ja ? "風水：生まれ持った吉方位タイプと今年の方位" : "Feng shui: birth direction type & this year's direction"}</DialogTitle></DialogHeader><p className="text-xs leading-6 text-muted-foreground">{access.sample}</p><p className="mt-2 whitespace-pre-line text-sm leading-7">{todaySample("directionExtended", language)}</p><Button variant="champagne" onClick={onUpgrade}><Crown className="size-4" />{access.plans}</Button></DialogContent>
                </Dialog>
                <Button size="sm" variant="champagne" onClick={onUpgrade}><Crown className="size-3.5" />{access.plans}</Button></div>
            </div>
          )}
        </div>
      </>,
    },
    directionExtended: {
      notify: `${ja ? `${stars.year}年の大開運方位` : `${stars.year} direction`}: ${yearDir ? L(dirNames[yearDir]) : "—"}`,
      body: extBody,
    },
    shopping: { notify: L(shop[el]), body: <p className="text-sm leading-6">{L(shop[el])}</p> },
    health: { notify: L(health[el]), body: <><p className="text-sm leading-6">{L(health[el])}</p><p className="mt-2 text-[11px] text-muted-foreground">{ja ? "生活習慣の参考です。体調が気になる時は専門家にご相談くださいね。" : "Lifestyle reference only; consult a professional for health concerns."}</p></> },
    relations: {
      notify: ja ? "今日の人間関係のヒントを確認しましょう" : "Check today's relationship tip",
      body: members.length === 0 ? <p className="text-sm">{ja ? "ファミリータブでメンバーを登録すると、ここに表示されます。" : "Add members in the Family tab to see them here."}</p> : <>
        <div className="flex flex-wrap gap-2">{members.map((m) => <Button key={m.id} size="sm" variant="outline" onClick={() => setPick(m.id)} className={pick === m.id ? "border-primary bg-primary/15 text-primary" : "border-primary/25"}>{m.name}</Button>)}</div>
        {advice && <div className="mt-3 space-y-2 text-sm leading-6">
          <p className="rounded-md border border-primary/30 bg-primary/10 p-2.5"><strong className="text-primary">◎ {ja ? "吉対応" : "Good approach"}</strong>：{L(advice[0])}</p>
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5"><strong className="text-destructive">✕ {ja ? "NG対応" : "Avoid"}</strong>：{L(advice[1])}</p>
          <p className="rounded-md border border-primary/20 p-2.5"><strong className="text-primary">♡ {ja ? "心がけ" : "Mindset"}</strong>：{L(advice[2])}</p>
        </div>}
      </>,
    },
    monthlyLucky: {
      notify: `${L(month.flower)} / ${L(month.action)}`,
      body: <div className="space-y-3">
        <img src={flowerImageForMonth(today.getMonth() + 1)} alt={L(month.flower)} loading="lazy" width={1024} height={768} className="w-full rounded-md border border-primary/25 object-cover shadow-champagne" />
        <ul className="space-y-2 text-sm leading-6">
          <li><strong className="text-primary">{ja ? "ラッキーフラワー" : "Lucky flower"}</strong>：{L(month.flower)}（{ja ? "花言葉" : "Meaning"}：{L(month.meaning)}）<br /><span className="text-muted-foreground">{L(month.why)}</span></li>
          <li><strong className="text-primary">{ja ? "ラッキー行動と目標" : "Lucky action & goal"}</strong>：{L(month.action)}</li>
          <li><strong className="text-primary">{ja ? "ラッキーアイテム" : "Lucky item"}</strong>：{L(month.item)}</li>
        </ul>
      </div>,
    },
    helio: { notify: ja ? "今日の地球暦と宇宙の特性が更新されました" : "Today's Earth Calendar is updated", body: <><p className="mb-1 text-xs text-muted-foreground">{ja ? `閲覧できる期間：${rangeLabel}` : `Browsing range: ${rangeLabel}`}</p>{rangeBanner}<DayCompass dialOnly rangeDays={helioRangeDays[plan]} profile={profile} language={language} plan={plan} onUpgrade={onUpgrade} /><h4 className="mb-1 mt-5 border-t border-primary/20 pt-4 font-serif text-sm text-primary">{ja ? "今日のカレンダー（どなたでも閲覧できます）" : "Today's calendar (open to everyone)"}</h4><HelioCalendar hideDirections date={today} profile={profile} plan={plan} language={language} onUpgrade={onUpgrade} /></> },
    biorhythm365: {
      notify: `${ja ? "今日のバイオリズム" : "Today's biorhythm"} ${Math.round(rhythm.total)}`,
      body: yearCurve.length ? <>
        <svg viewBox={`0 0 ${yearCurve.length} 100`} preserveAspectRatio="none" className="h-28 w-full" role="img" aria-label={titles.biorhythm365[ja ? "ja" : "en"]}>
          <line x1="0" x2={yearCurve.length} y1="50" y2="50" className="stroke-primary/25" strokeWidth="0.6" />
          <polyline fill="none" className="stroke-primary" strokeWidth="1.4" vectorEffect="non-scaling-stroke" points={yearCurve.map((v, d) => `${d},${100 - v}`).join(" ")} />
          <line x1={dayIdx} x2={dayIdx} y1="0" y2="100" className="stroke-destructive" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        <p className="mt-1 text-sm">{ja ? "今日" : "Today"}：<strong className="text-primary">{Math.round(rhythm.total)}</strong> · {ja ? "好調期" : "High"} ≥ 55 · {ja ? "調整期" : "Rest"} &lt; 45</p>
        <div className="mt-2 grid grid-cols-6 gap-1 text-center text-[11px] sm:grid-cols-12">{monthAvg.map((v, i) => <span key={i} className={`rounded-sm border px-0.5 py-1 ${v >= 52 ? "border-primary bg-primary/15 text-primary" : v < 48 ? "border-primary/15 text-muted-foreground" : "border-primary/25"}`}>{monthLabels[i]}<br />{v}</span>)}</div>
      </> : <p className="text-sm">{ja ? "生年月日を登録すると表示されます。" : "Add your birth date to see this."}</p>,
    },
    familyRoadmap: {
      notify: ja ? "ファミリーの今日のリズムを確認しましょう" : "Check your family's rhythm today",
      body: <>
        {map ? <div className="max-w-full overflow-x-auto"><div className="min-w-[520px] text-[10px]">
          <div className="grid grid-cols-[56px_repeat(12,1fr)] gap-0.5 text-muted-foreground"><span />{monthLabels.map((m, i) => <span key={i} className={`text-center ${i === today.getMonth() ? "font-bold text-primary" : ""}`}>{m}</span>)}</div>
          {(Object.keys(phases) as Phase[]).map((ph) => <div key={ph} className="mt-1 grid grid-cols-[56px_repeat(12,1fr)] items-center gap-0.5"><span>{L(phases[ph])}</span>{monthLabels.map((m, i) => <span key={i} className={`h-4 rounded-sm ${map[ph].includes(i) ? (ph === "defend" ? "bg-muted-foreground/50" : "bg-champagne-gradient") : "bg-primary/5"}`} />)}</div>)}
        </div></div> : <p className="text-sm">{ja ? "生年月日を登録すると表示されます。" : "Add your birth date to see this."}</p>}
        <p className="mt-3 text-xs text-primary">{ja ? "ファミリーの今日のバイオリズム" : "Family biorhythm today"}</p>
        {members.length ? <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">{members.map((m) => { const v = Math.round(personal(m.birthDate, today).total); return <li key={m.id} className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{m.name}</span><span className="h-1.5 w-20 rounded-full bg-primary/10"><span className="block h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></span><span className="w-7 text-right">{v}</span></li>; })}</ul> : <p className="text-sm">{ja ? "ファミリータブでメンバーを登録すると一覧になります。" : "Add members in the Family tab to list them."}</p>}
      </>,
    },
  };

  const guide = (v: { action: string; reason: string; benefit: string }) => <div className="space-y-3 text-sm leading-7"><p className="font-medium text-primary">{v.action}</p><p><strong>{access.reason}：</strong>{v.reason}</p><p><strong>{access.benefit}：</strong>{v.benefit}</p></div>;
  content.decision = { notify: fortune.data?.decision.advance ?? content.decision.notify, body: fortune.data ? <div className="space-y-3 text-sm leading-7"><h4 className="text-primary">{access.advance}</h4><p>{fortune.data.decision.advance}</p><h4 className="text-primary">{access.protect}</h4><p>{fortune.data.decision.protect}</p><p><strong>{access.reason}：</strong>{fortune.data.decision.reason}</p></div> : <TodayInsight state={fortune} language={language} /> };
  content.shopping = { notify: fortune.data?.shopping.action ?? access.loading, body: fortune.data ? guide(fortune.data.shopping) : <TodayInsight state={fortune} language={language} /> };
  content.health = { notify: fortune.data?.maintenance.action ?? access.loading, body: fortune.data ? guide(fortune.data.maintenance) : <TodayInsight state={fortune} language={language} /> };
  content.monthlyLucky = { notify: fortune.data?.monthly.action.action ?? access.loading, body: fortune.data ? <div className="min-w-0 space-y-4 [overflow-wrap:anywhere]"><p className="font-serif text-lg text-primary">{readingDate(iso, language, true)}</p><div className="grid min-w-0 gap-3">{[fortune.data.monthly.action, fortune.data.monthly.item, fortune.data.monthly.flower].map((item, i) => <article key={i} className="min-w-0 rounded-md border border-primary/30 bg-card p-4 shadow-champagne"><h4 className="mb-3 font-serif text-base text-primary">{i + 1}. {monthlyLabels[language][i]}</h4>{i === 2 && <img src={flowerImageForMonth(today.getMonth() + 1)} alt={item.action} loading="lazy" width={1024} height={768} className="mb-3 w-full rounded-md border border-primary/25 object-cover" />}{guide(item)}</article>)}</div><p className="text-sm leading-7">{fortune.data.monthly.outlook}</p></div> : <TodayInsight state={fortune} language={language} /> };
  if (focus?.group) {
    const group = focus.group;
    const each = (render: (p: UserProfile) => ReactNode) => <div className="space-y-3">{group.members.map(m => <details key={m.id} className="border-t border-primary/25 pt-3"><summary className="cursor-pointer font-serif text-primary">{m.nickname || m.name}</summary><div className="mt-3">{render(memberToProfile(m))}</div></details>)}</div>;
    content.starPath = { notify: fortune.data?.headline ?? access.loading, body: <TodayInsight state={fortune} language={language} /> };
    content.directionExtended = { notify: access.action, body: each(p => <FengShuiGuide profile={p} date={today} language={language} />) };
    content.direction = { ...content.direction, body: <><p className="text-sm">{focus.label(language)} · {L(dirNames[best.dir])}（{best.score}）</p>{each(p => <><p className="text-sm">{subjectDirections([p], today).map(e => `${L(dirNames[e.dir])} ${e.score}`).join(' / ')}</p>{canUseToday(plan, 'directionExtended') && <FengShuiGuide profile={p} date={today} language={language} />}</>)}</> };
    content.helio = { ...content.helio, body: <>{rangeBanner}{each(p => <><DayCompass dialOnly rangeDays={helioRangeDays[plan]} profile={p} language={language} plan={plan} onUpgrade={onUpgrade} /><HelioCalendar hideDirections date={today} profile={p} plan={plan} language={language} onUpgrade={onUpgrade} /></>)}</> };
    content.familyRoadmap = { ...content.familyRoadmap, body: each(p => <DayCompass rangeDays={helioRangeDays[plan]} profile={p} language={language} plan={plan} onUpgrade={onUpgrade} />) };
  }
  // One-line personal teasers for locked cards, computed from the user's own reference values.
  const hour = 9 + ([...birth].reduce((a, ch) => a + (Number(ch) || 0), 0) + dayIdx) % 9;
  const peak = monthAvg.indexOf(Math.max(...monthAvg));
  const firstSentence = (s: string) => s.split(/(?<=[。.])/)[0] ?? s;
  const teaser: Partial<Record<TodayFeature, string | undefined>> = {
    shopping: ja ? "今日の運気を上げるお買い物、ひとつだけ選ぶなら？" : "One purchase to lift today's luck?",
    health: ja ? "今日のからだが喜ぶ、小さな習慣があります。" : "A small habit your body will enjoy today.",
    helio: ja ? `今日は地球暦で一年の${dayIdx + 1}日目。あなたの円盤に今日の位置が灯ります。` : `Day ${dayIdx + 1} on your Earth Calendar dial.`,
    relations: access.choose,
    biorhythm365: birth ? (ja ? `${peak + 1}月は参考モデルの月平均が高めです。` : `${monthLabels[peak]} has a higher modeled monthly mean.`) : undefined,
    monthlyLucky: access.action + ' · ' + access.reason,
    directionExtended: gua ? (ja ? `あなたは${gua.group === "east" ? "東四命" : "西四命"}タイプ。` : `You are ${gua.group === "east" ? "East" : "West"} group.`) : (ja ? `${stars.year}年のあなたの大開運方位が分かります。` : `See your ${stars.year} favorable direction.`),
    familyRoadmap: map ? (ja ? `今年の攻め月は${map.attack.slice(0, 2).map((m) => `${m + 1}月`).join("・")}。` : `Advance months: ${map.attack.slice(0, 2).map((m) => monthLabels[m]).join(", ")}.`) : undefined,
  };

  content.biorhythm365 = { ...content.biorhythm365, body: <>
    <p className="mb-2 text-xs text-muted-foreground">{ja ? `閲覧できる期間：${rangeLabel}` : `Browsing range: ${rangeLabel}`}</p>
    <p className="mb-2 text-xs text-primary">{access.rhythm}</p><h4 className="mb-1 font-serif text-sm text-primary">{focus?.label(language)} · {titles.biorhythm365[ja ? "ja" : "en"]}</h4>
    {content.biorhythm365.body}
    <h4 className="mb-1 mt-5 border-t border-primary/20 pt-4 font-serif text-sm text-primary">{ja ? "ファミリーのロードマップとバイオリズム" : "Family roadmap & biorhythm"}</h4>
    {planOrder.indexOf(plan) >= planOrder.indexOf(familyRoadmapMin) ? content.familyRoadmap.body : (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/25 p-3 text-sm">
        <span>{teaser.familyRoadmap ?? (ja ? "ファミリーの1年の流れを一緒に見られます。" : "See your family's year together.")}</span>
        <span className="flex gap-2"><Button size="sm" variant="outline" className="border-primary/40" onClick={() => setSample("familyRoadmap")}>{ja ? "サンプルを見る" : "See sample"}</Button><Button size="sm" variant="champagne" onClick={onUpgrade}>{ja ? "プランを見る" : "See plans"}</Button></span>
      </div>)}
  </> };

  const [sample, setSample] = useState<TodayFeature | null>(null);
  const sampleMin = sample === "familyRoadmap" ? familyRoadmapMin : sample ? todayFeatures.find((f) => f.id === sample)!.min : "vip";
  const openCount = todayBenefitCount(plan);
  const higherBenefits = higherTodayBenefits(plan);
  const renderDepth = (section: DeepSection) => {
    const reading = buildTodayDepth(section, plan, language, {date: iso, day: dayIdx + 1, total: Math.round(rhythm.total), physical: Math.round(rhythm.physical * 100), emotional: Math.round(rhythm.emotional * 100), intellectual: Math.round(rhythm.intellectual * 100), goal: focus ? goalText(focus.focus, language) : "", members: focus?.group?.members.length ?? (focus?.member ? 1 : members.length)});
    return reading ? <div data-reading-depth={section} className="mt-5 space-y-3 border-t border-primary/20 pt-4"><h4 className="font-serif text-sm text-primary">{reading.title}</h4>{reading.paragraphs.map((paragraph, index) => <p key={index} className="text-sm leading-7 text-foreground">{paragraph}</p>)}</div> : null;
  };

  const shareData = {
    kicker: ja ? "今日の占い" : "Today's guide", title: iso, score: Math.round(rhythm.total), names: focus?.group ? [focus.label(language)] : profile.nameKanji ? [profile.nameKanji] : [], kind: "daily" as const,
    lines: [
      fortune.data?.decision.advance ?? (rhythm.total >= 55 ? (ja ? "決断：準備した一歩を小さく試す日" : "Decision: test one prepared step") : (ja ? "決断：確認と余白を整える日" : "Decision: verify and leave space")),
      fortune.data ? `${ja ? "3ラッキー" : "3 lucky"}: ${fortune.data.luckyColor.name} / ${fortune.data.luckyWord.word} / ${fortune.data.foods[0]?.name ?? ""}` : `${ja ? "3ラッキー" : "3 lucky"}: ${luckyColor ? localizeBirthColorName(luckyColor.name, language) : "—"} / ${L(word)} / ${L(foods[el][0]!)}`,
      `${ja ? "吉方位" : "Direction"}: ${L(dirNames[best.dir])}（${best.score}）`,
      ...(rank(plan) >= rank("standard") ? [
        `${ja ? "買い物" : "Shopping"}: ${firstSentence(fortune.data?.shopping.action ?? access.loading)}`,
        `${ja ? "健康" : "Health"}: ${firstSentence(fortune.data?.maintenance.action ?? access.loading)}`,
        `${ja ? "地球暦" : "Earth Calendar"}: ${ja ? `一年の${dayIdx + 1}日目` : `day ${dayIdx + 1}`}`,
      ] : []),
      ...(rank(plan) >= rank("vip") ? [
        `${ja ? "今月の3ラッキー" : "Monthly lucky"}: ${fortune.data ? [fortune.data.monthly.flower.action, fortune.data.monthly.action.action, fortune.data.monthly.item.action].join(' / ') : access.loading}`,
        ...(yearDir ? [`${ja ? `${stars.year}年の大開運方位` : `${stars.year} direction`}: ${L(dirNames[yearDir])}`] : []),
        `${ja ? "対人" : "Relations"}: ${advice ? L(advice[0]) : (ja ? "感謝をひとつ具体的に伝える" : "Share one specific thanks")}`,
        `${ja ? "バイオリズム" : "Biorhythm"}: ${Math.round(rhythm.total)}`,
      ] : []),
      ...(rank(plan) >= rank("b2b") && members.length ? [`${ja ? "ファミリー運気" : "Family rhythm"}: ${ja ? `${members.length}名の平均` : `avg of ${members.length}`} ${Math.round(members.reduce((t, m) => t + personal(m.birthDate, today).total, 0) / members.length)}`] : []),
    ],
    palette: luckyHex ? [{ label: ja ? "ラッキーカラー" : "Lucky color", code: luckyHex }] : [],
  };
  const share = (key: string) => <div key={key} className="flex justify-center"><ShareCardButton language={language} autoOpen={false} label={ja ? "今日の占いを1タップでシェア" : "Share today's guide"} className="h-auto min-h-12 w-full whitespace-normal px-4 py-3 sm:w-auto" data={shareData} /></div>;


  // The daily lucky color becomes the screen's accent: card borders, dividers and a soft aura follow it.
  const luckyTheme = luckyHex && /^#[0-9a-f]{6}$/i.test(luckyHex) ? luckyHex : null;
  return (
    <div className={`today-guide mx-auto mt-4 grid min-w-0 w-full max-w-4xl grid-cols-[minmax(0,1fr)] gap-3 text-left md:gap-4${luckyTheme ? " lucky-themed" : ""}`} style={luckyTheme ? ({ "--lucky-color": luckyTheme } as CSSProperties) : undefined}>
      <section className="card-lux design-daily-panel rounded-lg p-3 md:p-4" aria-label={ja ? "プラン特典の解放状況" : "Plan unlock progress"}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-sm">
          <p className="min-w-0 text-foreground">{benefit.current}：<strong className="text-primary">{names[plan]}</strong></p>
          {higherBenefits.length > 0 && <Button size="icon" variant="champagne" onClick={onUpgrade} aria-label={benefit.plans} title={benefit.plans} className="size-11 shrink-0"><Crown className="size-4" /></Button>}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-label={benefit.catalogue} aria-valuemin={0} aria-valuemax={12} aria-valuenow={openCount}><div className="h-full rounded-full bg-champagne-gradient transition-all" style={{ width: `${(openCount / 12) * 100}%` }} /></div>
        <p className="mt-2 text-sm font-medium text-primary">{openCount === 12 ? benefit.complete : benefit.progress.replace("{n}", String(openCount))}</p>
        {plan === "vip" && <p className="mt-2 text-sm leading-6">{benefit.vipNext}</p>}
        {plan === "b2b" && <p className="mt-2 text-sm leading-6">{benefit.familyNext}</p>}
        <p className="mt-2 text-xs text-muted-foreground">{benefit.countNote}</p>
        <details className="mt-3 border-t border-primary/20 pt-3"><summary className="cursor-pointer text-sm text-primary">{benefit.catalogue}</summary><ol className="mt-2 grid gap-1 text-xs sm:grid-cols-2">{todayBenefitCategories.map((c, i) => <li key={c.id} className={rank(plan) >= rank(c.min) ? "text-foreground" : "text-muted-foreground"}>{i + 1}. {benefit[c.id as keyof typeof benefit]} · {names[c.min]}</li>)}</ol></details>
        {higherBenefits.length > 0 && <div className="mt-3 space-y-2 border-t border-primary/20 pt-3"><h4 className="text-xs text-primary">{benefit.higher}</h4>{higherBenefits.map(({tier, categories}) => <p key={tier} className="text-xs leading-6"><strong className="text-primary">{names[tier]}</strong>：{categories.map(c => benefit[c.id as keyof typeof benefit]).join(" / ")}</p>)}</div>}
      </section>
      <TodayCard id="today-insight" title={ja ? "今日だけの深層リーディング" : "Today's deep reading"} summary={<h3 className="flex items-center gap-2 font-serif text-lg text-foreground"><Sparkles className="size-4 text-primary" />{ja ? "今日だけの深層リーディング" : "Today's deep reading"}</h3>}>
        <p className="mb-4 text-base font-medium tabular-nums text-primary">{readingDate(iso, language)}</p>
        <TodayInsight state={fortune} language={language} />
        <FeatureNotifySwitch id="insight" title={`🔮 ${ja ? "今日の深層リーディング" : "Today's deep reading"}`} body={fortune.data?.headline ?? (ja ? "今日だけのメッセージが届いています" : "Your message for today is ready")} language={language} />
      </TodayCard>
      {todayFeatures.filter(f => f.id !== "relations").map(({ id, min }, i) => {
        const open = canUseToday(plan, id);
        const Icon = icons[id];
        const lucky = id === "dailyLucky" && open;
        return (<Fragment key={id}>
          <TodayCard id={`today-${id}`} className={lucky ? "lucky-readable shadow-champagne" : ""} title={L(titles[id])} summary={
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <h3 className="flex min-w-0 items-start gap-2 font-serif text-lg text-foreground"><span className="text-primary">{i + 1}.</span><Icon className="mt-1 size-4 shrink-0 text-primary" /><span className={`min-w-0 break-words ${lucky ? "font-semibold" : ""}`}>{L(titles[id])}</span></h3>
              {!open && <span className="shrink-0 rounded-md border border-primary/30 px-2 py-0.5 text-[10px] text-primary">{names[min]}+</span>}
            </div>}>
            {open ? <>{content[id].body}{id === "starPath" || id === "helio" ? renderDepth(id) : id === "biorhythm365" ? <>{canReadThreeWaves(plan) ? renderDepth("biorhythm") : <div className="mt-3 border-t border-primary/25 pt-3"><p className="text-sm text-primary">{access.waves}</p><Button variant="outline" onClick={onUpgrade}><LockKeyhole className="size-4" />{access.plans}</Button></div>}{renderDepth("family")}</> : null}</> : (
              <div className="relative overflow-hidden rounded-md border border-primary/20 p-3">
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-champagne-gradient opacity-10 blur-sm" />
                <div className="relative flex flex-col items-center gap-2 text-center">
                  <LockKeyhole className="size-5 text-primary" />
                  {teaser[id] && <p className="text-sm font-medium text-foreground">✦ {teaser[id]}</p>}
                  <p className="text-xs text-muted-foreground">{ja ? `${names[min]}以上でお楽しみいただけます` : `Enjoy with ${names[min]} or higher`}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button size="sm" variant="outline" className="border-primary/40" onClick={() => setSample(id)}><Eye className="size-3.5" />{ja ? "サンプルを見る" : "See sample"}</Button>
                    <Button size="sm" variant="champagne" onClick={onUpgrade}><Crown className="size-3.5" />{ja ? "プランを見る" : "View plans"}</Button>
                  </div>
                </div>
              </div>
            )}
            <FeatureNotifySwitch id={id} title={`${notifyEmoji[id] ?? "🧭"} ${L(titles[id])}`} body={content[id].notify} language={language} disabled={!open} color={id === "dailyLucky" ? luckyHex : undefined} />
          </TodayCard>
          {id === "helio" && <TodayReminders kind="evening" language={language} plan={plan} onUpgrade={onUpgrade} />}
        </Fragment>);
      })}
      {share("share-bottom")}
      <Dialog open={recipe !== null} onOpenChange={v => { if (!v) setRecipeIndex(null); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-lg min-w-0 overflow-x-hidden overflow-y-auto border-primary/35 bg-card text-foreground [overflow-wrap:anywhere]"><DialogHeader className="text-left"><DialogTitle className="flex items-center gap-2 font-serif text-primary"><ChefHat className="size-5 shrink-0" />{recipe?.name}</DialogTitle><DialogDescription className="sr-only">{servingsLabel[language]}</DialogDescription></DialogHeader>{recipe && <div className="space-y-5 text-left">{recipeIndex !== null && <img src={recipeImage(dailyRecipes[recipeIndex]?.id)} alt={recipe.name} loading="lazy" width={1024} height={640} className="w-full rounded-md border border-primary/25 object-cover shadow-champagne" />}{selectedRecipe && <section className="rounded-md border border-primary/30 bg-primary/5 p-3"><h3 className="font-serif text-sm text-primary">{recipeLabels[language].why}</h3><p className="mt-1 text-sm leading-7">{recipeReason({ language, dayElement: el, dishElement: selectedRecipe.element, season: selectedRecipe.season, rhythm: selectedRecipe.rhythm, birthDate: profile.birthDate })}</p></section>}<section className="recipe-ingredients"><h3 className="mb-2 text-center font-serif text-primary">{benefit.ingredients}</h3><ul className="space-y-1 text-sm">{recipe.ingredients.map(item => <li key={item} className="border-b border-primary/10 py-1">{item}</li>)}</ul></section><section><h3 className="mb-2 font-serif text-primary">{benefit.steps}</h3><ol className="list-decimal space-y-3 pl-5 text-sm leading-7">{cleanRecipeSteps(recipe.steps).map((step, i) => <li key={i}><RecipeStep text={step} /></li>)}</ol></section><section className="rounded-md border border-primary/35 bg-background/60 p-3 shadow-champagne"><h3 className="font-serif text-primary">{recipeLabels[language].luck}</h3><p className="mt-2 text-sm leading-7">{recipe.luck}</p></section><p className="border-t border-primary/15 pt-2 text-xs leading-5 text-muted-foreground">{servingsLabel[language]} · {benefit.recipeNote}</p></div>}<Button variant="outline" onClick={() => setRecipeIndex(null)}>{benefit.close}</Button></DialogContent></Dialog>
      <Dialog open={sample !== null} onOpenChange={(v) => !v && setSample(null)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border-primary/35 sm:max-w-lg">
          <DialogHeader className="text-left"><DialogDescription className="text-xs text-primary">{consultationUxCopy[language].sample}</DialogDescription><DialogTitle className="font-serif text-xl">{sample ? L(titles[sample]) : ""}</DialogTitle></DialogHeader>
          <div className="text-left text-foreground">
            <p data-sample-intro className="text-sm leading-7">{access.sample}</p>
            <div className="mt-4 rounded-md border border-primary/15 bg-card p-3">
              <p className="whitespace-pre-line text-sm leading-7">{sample ? todaySample(sample, language) : ""}</p>
            </div>
          </div>
          <p className="text-sm text-primary">{ja ? `${names[sampleMin]}になると、これが毎日・詳細に占えます。` : `With ${names[sampleMin]}, this arrives daily in detail.`}</p>
          <Button variant="champagne" className="w-full" onClick={() => { setSample(null); onUpgrade(); }}><Crown className="size-4" />{ja ? "プラン詳細を見る" : "View plan details"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Vivid neon variant of a lucky color: same hue, full saturation; `light` picks dark text for bright hues. */
function neonOf(hex: string) {
  const v = hex.replace("#", ""); const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255) as [number, number, number];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = Math.round((h * 60 + 360) % 360);
  return { h, light: h >= 40 && h <= 200 };
}


function SampleVip({ ja }: { ja: boolean }) {
  const rows = [
    { name: ja ? "パートナー（例）" : "Partner (sample)", good: ja ? "「いつもありがとう」と具体的に伝える" : "Thank them for something specific", score: 86 },
    { name: ja ? "お子さま（例）" : "Child (sample)", good: ja ? "結論より気持ちを先に受け止める" : "Receive feelings first", score: 74 },
    { name: ja ? "同僚（例）" : "Colleague (sample)", good: ja ? "役割を分けて得意を活かし合う" : "Split roles by strengths", score: 68 },
  ];
  return <ul className="space-y-2">{rows.map((r) => <li key={r.name} className="rounded-md border border-primary/25 p-3 text-sm"><div className="flex items-center justify-between"><strong className="text-primary">{r.name}</strong><span className="text-xs">{ja ? "今日の相性" : "Today"} {r.score}</span></div><p className="mt-1 leading-6">◎ {r.good}</p></li>)}</ul>;
}

function SampleFamily({ ja }: { ja: boolean }) {
  const members = [ja ? "わたし" : "Me", ja ? "パートナー" : "Partner", ja ? "長女" : "Daughter", ja ? "長男" : "Son"];
  const cls = ["stroke-primary", "stroke-chart-2", "stroke-chart-3", "stroke-chart-4"];
  return <div>
    <svg viewBox="0 0 120 50" className="h-36 w-full" role="img" aria-label={ja ? "ファミリー4人のバイオリズム重ね合わせ（例）" : "Four-person biorhythm overlay (sample)"}>
      {members.map((_, k) => <polyline key={k} fill="none" className={cls[k]} strokeWidth="1" points={Array.from({ length: 61 }, (_, x) => `${x * 2},${25 - 18 * Math.sin((x + k * 9) / (5 + k))}`).join(" ")} />)}
    </svg>
    <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">{members.map((m, k) => <li key={m} className="flex items-center gap-2"><span className={`h-0.5 w-5 border-t-2 ${cls[k]!.replace("stroke", "border")}`} />{m}</li>)}</ul>
    <p className="mt-2 text-xs text-muted-foreground">{ja ? "ファミリーは最大30名、ファミリープレミアムは最大100名まで重ねて比べられます。" : "Family compares up to 30 people; Family Premium up to 100."}</p>
  </div>;
}
