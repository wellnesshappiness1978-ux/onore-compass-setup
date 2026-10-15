import { Fragment, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BriefcaseBusiness, CalendarHeart, CalendarRange, Compass, Crown, Eye, Flower2, HeartPulse, LineChart, LockKeyhole, MessageCircleHeart, ShoppingBag, Sparkles, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { UserProfile } from "./Onboarding";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { canUseToday, familyRoadmapMin, helioRangeDays, planOrder, todayFeatures, type TodayFeature } from "@/lib/plans";
import { dateAt, daysInYear, directionEnergy, localIso, personal, roadmap, type Direction, type Phase } from "@/lib/day-compass";
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

// Deterministic reference values from birth date and today's calendar; not verified readings or predictions.
type Pair = { ja: string; en: string };
const P = (ja: string, en: string): Pair => ({ ja, en });

const titles: Record<TodayFeature, Pair> = {
  decision: P("今日の具体的決断（攻める／守る）", "Today's concrete decision"),
  dailyLucky: P("本日の3ラッキー", "Today's three lucky picks"),
  direction: P("吉方位・開運エネルギー", "Lucky direction"),
  shopping: P("総合運気を上げる買い物ガイド", "Shopping guide"),
  health: P("健康アドバイス（心身のメンテナンス）", "Health tip"),
  relations: P("クイック対人ガイド", "Quick relationship guide"),
  monthlyLucky: P("今月の3ラッキー", "This month's three lucky picks"),
  directionExtended: P("吉方位（生まれ持った方位タイプと今年の方位）", "Birth direction type & this year's direction"),
  helio: P("地球暦・コンパス・当日詳細・バイオリズム（当日分）", "Earth Calendar, compass & biorhythm (today)"),
  biorhythm365: P("個人・ファミリーのバイオリズム", "Personal & family biorhythm"),
  familyRoadmap: P("ファミリーの365日ロードマップとバイオリズム", "Family 365-day roadmap & biorhythm"),
};
const icons: Record<TodayFeature, typeof Compass> = { decision: Swords, dailyLucky: Sparkles, direction: Compass, directionExtended: Compass, shopping: ShoppingBag, health: HeartPulse, relations: MessageCircleHeart, monthlyLucky: Flower2, helio: CalendarHeart, biorhythm365: LineChart, familyRoadmap: BriefcaseBusiness };

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
  { flower: P("キク", "Chrysanthemum"), meaning: P("高貴・長寿", "Nobility, longevity"), why: P("実りの季節に咲く花が、これまでの努力を味わう時期に寄り添うから。", "Blooming at harvest, it honors effort so far."), action: P("家族や仲間に労いを伝える", "Thank family or teammates for their effort"), item: P("小さな財布", "A small wallet") },
  { flower: P("ポインセチア", "Poinsettia"), meaning: P("祝福", "Blessing"), why: P("冬を彩る赤が、一年を祝い次へつなぐ今月の締めくくりに合うから。", "Its winter red celebrates the year and bridges to the next."), action: P("一年の振り返りと来年の一文を書く", "Review the year and write one line for next year"), item: P("赤いリボン", "A red ribbon") },
];
const dirNames: Record<Direction, Pair> = { N: P("北", "North"), NE: P("北東", "Northeast"), E: P("東", "East"), SE: P("南東", "Southeast"), S: P("南", "South"), SW: P("南西", "Southwest"), W: P("西", "West"), NW: P("北西", "Northwest") };

type Props = { profile: UserProfile; language: Language; plan: Plan; signedIn: boolean; onUpgrade: () => void };

export default function TodayGuide({ profile, language, plan, signedIn, onUpgrade }: Props) {
  const ja = language === "ja";
  const L = (p: Pair) => (ja ? p.ja : p.en);
  const voice = companionCopy[language];
  const names = teamCopy[language].planNames;
  const today = useMemo(() => new Date(), []);
  const iso = localIso(today);
  const el = dayElement(iso);
  const birth = profile.birthDate;
  const rhythm = personal(birth, today);
  const spectrum = birthColorSpectrum(profile);
  const energy = useMemo(() => [...directionEnergy(birth, today)].sort((a, b) => b.score - a.score), [birth, iso]);
  const best = energy[0]!;
  const rank = (p: Plan) => planOrder.indexOf(p);

  // Daily lucky color rotates through the six personal colors by day of year.
  const dayIdx = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(today.getFullYear(), 0, 1)) / 864e5);
  const luckyColor = spectrum ? [spectrum.main, spectrum.sub, spectrum.money, spectrum.work, spectrum.love, spectrum.health][dayIdx % 6]! : null;
  const word = words[el][dayIdx % 3]!;
  const month = months[today.getMonth()]!;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pick, setPick] = useState("");
  const list = useServerFn(listTeamMembers);
  const wantsMembers = rank(plan) >= rank("vip");
  useEffect(() => {
    let active = true;
    if (!wantsMembers) { setMembers([]); return; }
    if (signedIn) list().then((v) => { if (active) setMembers(v); }).catch(() => { if (active) setMembers([]); });
    else { try { const v = JSON.parse(localStorage.getItem("onore-team") ?? "[]"); setMembers(Array.isArray(v) ? v : []); } catch { setMembers([]); } }
    return () => { active = false; };
  }, [wantsMembers, signedIn, list]);
  const me: TeamMember = { id: "me", name: "", birthDate: birth, gender: "", bloodType: "", role: "", skills: [] };
  const target = members.find((m) => m.id === pick);
  const advice = target ? talk[relation(me, target)] : null;

  const year = today.getFullYear();
  const yearCurve = useMemo(() => birth ? Array.from({ length: daysInYear(year) }, (_, d) => Math.round(personal(birth, dateAt(year, d)).total)) : [], [birth, year]);
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
  const notifyEmoji: Partial<Record<TodayFeature, string>> = { decision: "💡", dailyLucky: "🎨", direction: "🧭", helio: "🌍", shopping: "🛍️", health: "🌿", monthlyLucky: "🌸", directionExtended: "🧭", relations: "🤝", biorhythm365: "📈", familyRoadmap: "👨‍👩‍👧" };
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
    dailyLucky: {
      notify: `${luckyColor ? localizeBirthColorName(luckyColor.name, language) : ""} / ${L(word)}`,
      body: <ul className="space-y-2 text-sm leading-6">
        <li className="flex items-start gap-2"><span className="mt-1 size-4 shrink-0 rounded-full border border-primary/40" style={{ background: luckyColor?.code }} /><span><strong className="text-primary">{ja ? "ラッキーカラー" : "Lucky color"}</strong>：{luckyColor ? `${localizeBirthColorName(luckyColor.name, language)}（${luckyColor.code}）` : (ja ? "生年月日の登録で表示されます" : "Add your birth date")}</span></li>
        <li><strong className="text-primary">{ja ? "ラッキーワード" : "Lucky word"}</strong>：{L(word)}</li>
        <li><strong className="text-primary">{ja ? "運気アップフード 選りすぐり5品" : "5 lucky foods"}</strong>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5">{foods[el].map((f, i) => <li key={i}>{L(f)}</li>)}</ol>
          <span className="text-[11px] opacity-90">{ja ? "スーパーの食材で手軽に作れる、今日の気分を明るくする参考メニューです。" : "Easy reference dishes from everyday ingredients."}</span></li>
      </ul>,
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
      </>,
    },
    directionExtended: {
      notify: `${ja ? `${stars.year}年の大開運方位` : `${stars.year} direction`}: ${yearDir ? L(dirNames[yearDir]) : "—"}`,
      body: <div className="space-y-1 text-sm">
        <p>{ja ? "生まれ持った吉方位タイプ" : "Birth direction type"}：{gua ? `${gua.group === "east" ? (ja ? "東四命" : "East group") : (ja ? "西四命" : "West group")} · ${L(dirNames[gua.shengQi])}` : (ja ? "性別（男性／女性）の登録で表示されます" : "Shown when gender is set to male or female")}</p>
        <p>{ja ? `${stars.year}年の大開運方位` : `${stars.year} favorable direction`}：<strong className="text-primary">{yearDir ? L(dirNames[yearDir]) : "—"}</strong></p>
      </div>,
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
      body: <ul className="space-y-2 text-sm leading-6">
        <li><strong className="text-primary">{ja ? "ラッキーフラワー" : "Lucky flower"}</strong>：{L(month.flower)}（{ja ? "花言葉" : "Meaning"}：{L(month.meaning)}）<br /><span className="text-muted-foreground">{L(month.why)}</span></li>
        <li><strong className="text-primary">{ja ? "ラッキー行動と目標" : "Lucky action & goal"}</strong>：{L(month.action)}</li>
        <li><strong className="text-primary">{ja ? "ラッキーアイテム" : "Lucky item"}</strong>：{L(month.item)}</li>
      </ul>,
    },
    helio: { notify: ja ? "今日の地球暦と宇宙の特性が更新されました" : "Today's Earth Calendar is updated", body: <><p className="mb-1 text-xs text-muted-foreground">{ja ? `閲覧できる期間：${rangeLabel}` : `Browsing range: ${rangeLabel}`}</p>{rangeBanner}<DayCompass dialOnly rangeDays={helioRangeDays[plan]} profile={profile} language={language} plan={plan} onUpgrade={onUpgrade} /><h4 className="mb-1 mt-5 border-t border-primary/20 pt-4 font-serif text-sm text-primary">{ja ? "今日のカレンダー（どなたでも閲覧できます）" : "Today's calendar (open to everyone)"}</h4><HelioCalendar date={today} profile={profile} plan={plan} language={language} onUpgrade={onUpgrade} /></> },
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

  // One-line personal teasers for locked cards, computed from the user's own reference values.
  const hour = 9 + ([...birth].reduce((a, ch) => a + (Number(ch) || 0), 0) + dayIdx) % 9;
  const peak = monthAvg.indexOf(Math.max(...monthAvg));
  const firstSentence = (s: string) => s.split(/(?<=[。.])/)[0] ?? s;
  const teaser: Partial<Record<TodayFeature, string | undefined>> = {
    shopping: ja ? "今日の運気を上げるお買い物、ひとつだけ選ぶなら？" : "One purchase to lift today's luck?",
    health: ja ? "今日のからだが喜ぶ、小さな習慣があります。" : "A small habit your body will enjoy today.",
    helio: ja ? `今日は地球暦で一年の${dayIdx + 1}日目。あなたの円盤に今日の位置が灯ります。` : `Day ${dayIdx + 1} on your Earth Calendar dial.`,
    relations: ja ? `今日のあなたの大勝負の時間帯は${hour}時！` : `Your key moment today is around ${hour}:00!`,
    biorhythm365: birth ? (ja ? `${peak + 1}月は人生の転機バイオリズム。` : `${monthLabels[peak]} is your turning-point rhythm.`) : undefined,
    monthlyLucky: ja ? `今月のあなたの花は「${L(month.flower)}」。` : `Your flower this month: ${L(month.flower)}.`,
    directionExtended: gua ? (ja ? `あなたは${gua.group === "east" ? "東四命" : "西四命"}タイプ。` : `You are ${gua.group === "east" ? "East" : "West"} group.`) : (ja ? `${stars.year}年のあなたの大開運方位が分かります。` : `See your ${stars.year} favorable direction.`),
    familyRoadmap: map ? (ja ? `今年の攻め月は${map.attack.slice(0, 2).map((m) => `${m + 1}月`).join("・")}。` : `Advance months: ${map.attack.slice(0, 2).map((m) => monthLabels[m]).join(", ")}.`) : undefined,
  };

  content.biorhythm365 = { ...content.biorhythm365, body: <>
    <p className="mb-2 text-xs text-muted-foreground">{ja ? `閲覧できる期間：${rangeLabel}` : `Browsing range: ${rangeLabel}`}</p>
    <h4 className="mb-1 font-serif text-sm text-primary">{ja ? "個人のバイオリズム" : "Personal biorhythm"}</h4>
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
  const openCount = todayFeatures.filter((f) => canUseToday(plan, f.id)).length;
  const lastOpen = todayFeatures.map((f) => canUseToday(plan, f.id)).lastIndexOf(true);
  const nextLocked = todayFeatures.find((f) => !canUseToday(plan, f.id));

  const shareData = {
    kicker: ja ? "今日の占い" : "Today's guide", title: iso, score: Math.round(rhythm.total), names: profile.nameKanji ? [profile.nameKanji] : [], kind: "daily" as const,
    lines: [
      rhythm.total >= 55 ? (ja ? "決断：準備した一歩を小さく試す日" : "Decision: test one prepared step") : (ja ? "決断：確認と余白を整える日" : "Decision: verify and leave space"),
      `${ja ? "3ラッキー" : "3 lucky"}: ${luckyColor ? localizeBirthColorName(luckyColor.name, language) : "—"} / ${L(word)} / ${L(foods[el][0]!)}`,
      `${ja ? "吉方位" : "Direction"}: ${L(dirNames[best.dir])}（${best.score}）`,
      ...(rank(plan) >= rank("standard") ? [
        `${ja ? "買い物" : "Shopping"}: ${firstSentence(L(shop[el]))}`,
        `${ja ? "健康" : "Health"}: ${firstSentence(L(health[el]))}`,
        `${ja ? "地球暦" : "Earth Calendar"}: ${ja ? `一年の${dayIdx + 1}日目` : `day ${dayIdx + 1}`}`,
      ] : []),
      ...(rank(plan) >= rank("vip") ? [
        `${ja ? "今月の3ラッキー" : "Monthly lucky"}: ${L(month.flower)} / ${L(month.action)} / ${L(month.item)}`,
        ...(yearDir ? [`${ja ? `${stars.year}年の大開運方位` : `${stars.year} direction`}: ${L(dirNames[yearDir])}`] : []),
        `${ja ? "対人" : "Relations"}: ${advice ? L(advice[0]) : (ja ? "感謝をひとつ具体的に伝える" : "Share one specific thanks")}`,
        `${ja ? "バイオリズム" : "Biorhythm"}: ${Math.round(rhythm.total)}`,
      ] : []),
      ...(rank(plan) >= rank("b2b") && members.length ? [`${ja ? "ファミリー運気" : "Family rhythm"}: ${ja ? `${members.length}名の平均` : `avg of ${members.length}`} ${Math.round(members.reduce((t, m) => t + personal(m.birthDate, today).total, 0) / members.length)}`] : []),
    ],
    palette: luckyColor ? [{ label: ja ? "ラッキーカラー" : "Lucky color", code: luckyColor.code }] : [],
  };
  const share = (key: string) => <div key={key} className="flex justify-center"><ShareCardButton language={language} autoOpen={false} label={ja ? "今日の占いを1タップでシェア" : "Share today's guide"} className="h-auto min-h-12 w-full whitespace-normal px-4 py-3 sm:w-auto" data={shareData} /></div>;

  const neon = luckyColor ? neonOf(luckyColor.code) : null;
  const luckyStyle = neon ? ({
    background: `radial-gradient(120% 90% at 0% 0%, hsl(${neon.h} 100% 72% / .95), transparent 60%), linear-gradient(135deg, hsl(${neon.h} 100% 55%) 0%, hsl(${(neon.h + 25) % 360} 100% 50%) 55%, hsl(${(neon.h + 330) % 360} 100% 45%) 100%)`,
    boxShadow: `0 0 24px hsl(${neon.h} 100% 55% / .55), inset 0 0 0 1px hsl(${neon.h} 100% 85% / .7)`,
    "--lucky-fg": neon.light ? "#0B132B" : "#FFFFFF",
    "--lucky-accent": neon.light ? "#0B132B" : "#FFF3B0",
    "--lucky-muted": neon.light ? "rgba(11,19,43,.8)" : "rgba(255,255,255,.88)",
  } as CSSProperties) : undefined;

  return (
    <div className="today-guide mx-auto mt-4 grid min-w-0 w-full max-w-4xl grid-cols-[minmax(0,1fr)] gap-3 text-left md:gap-4">
      <section className="card-lux design-daily-panel rounded-lg p-3 md:p-4" aria-label={ja ? "プラン特典の解放状況" : "Plan unlock progress"}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="min-w-0 text-foreground">{ja ? "現在のプラン" : "Current plan"}：<strong className="text-primary">{names[plan]}</strong>
            {nextLocked && <span className="text-muted-foreground"> ｜ {ja ? `あと1ステップで${L(titles[nextLocked.id])}（${names[nextLocked.min]}）解放！` : `One step to ${L(titles[nextLocked.id])} (${names[nextLocked.min]})!`}</span>}
          </p>
          {nextLocked && <Button size="sm" variant="champagne" onClick={onUpgrade}><Crown className="size-3.5" />{ja ? "プラン詳細・アップグレード" : "Plans & upgrade"}</Button>}
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-valuemin={0} aria-valuemax={todayFeatures.length} aria-valuenow={openCount}><div className="h-full rounded-full bg-champagne-gradient transition-all" style={{ width: `${(openCount / todayFeatures.length) * 100}%` }} /></div>
        <p className="mt-1 text-[11px] text-muted-foreground">{ja ? `${todayFeatures.length}機能中 ${openCount}機能を解放中` : `${openCount} of ${todayFeatures.length} unlocked`}</p>
      </section>
      {todayFeatures.map(({ id, min }, i) => {
        const open = canUseToday(plan, id);
        const Icon = icons[id];
        const lucky = id === "dailyLucky" && open && luckyStyle;
        return (<Fragment key={id}>
          <section id={`today-${id}`} style={lucky ? luckyStyle : undefined} className={`today-feature design-daily-panel card-lux min-w-0 w-full max-w-full rounded-lg p-3 md:p-5 ${lucky ? "lucky-themed" : ""}`} aria-label={L(titles[id])}>
            <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <h3 className="flex min-w-0 items-start gap-2 font-serif text-lg text-foreground"><span className="text-primary">{i + 1}.</span><Icon className="mt-1 size-4 shrink-0 text-primary" /><span className={`min-w-0 break-words ${lucky ? "lucky-shine-title" : ""}`}>{L(titles[id])}</span></h3>
              {!open && <span className="shrink-0 rounded-md border border-primary/30 px-2 py-0.5 text-[10px] text-primary">{names[min]}+</span>}
            </div>
            {open ? content[id].body : (
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
            <FeatureNotifySwitch id={id} title={`${notifyEmoji[id] ?? "🧭"} ${L(titles[id])}`} body={content[id].notify} language={language} disabled={!open} color={id === "dailyLucky" ? luckyColor?.code : undefined} />
          </section>
          {i === lastOpen && share("share-open")}
        </Fragment>);
      })}
      <FengShuiGuide profile={profile} date={today} language={language} />
      {share("share-bottom")}
      <Dialog open={sample !== null} onOpenChange={(v) => !v && setSample(null)}>
        <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border-primary/35 sm:max-w-lg">
          <DialogHeader className="text-left"><DialogDescription className="text-xs text-primary">{sample === "relations" || sample === "familyRoadmap" ? (ja ? "診断例（架空のデータです）" : "Sample (fictional data)") : (ja ? "診断例（あなたの今日の参考値）" : "Sample (your reference values today)")}</DialogDescription><DialogTitle className="font-serif text-xl">{sample ? L(titles[sample]) : ""}</DialogTitle></DialogHeader>
          <div className="text-foreground">{sample === "familyRoadmap" ? <SampleFamily ja={ja} /> : sample === "relations" ? <SampleVip ja={ja} /> : sample ? content[sample].body : null}</div>
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
    <svg viewBox="0 0 120 50" className="h-36 w-full" role="img" aria-label={ja ? "家族4人のバイオリズム重ね合わせ（例）" : "Four-person biorhythm overlay (sample)"}>
      {members.map((_, k) => <polyline key={k} fill="none" className={cls[k]} strokeWidth="1" points={Array.from({ length: 61 }, (_, x) => `${x * 2},${25 - 18 * Math.sin((x + k * 9) / (5 + k))}`).join(" ")} />)}
    </svg>
    <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">{members.map((m, k) => <li key={m} className="flex items-center gap-2"><span className={`h-0.5 w-5 border-t-2 ${cls[k]!.replace("stroke", "border")}`} />{m}</li>)}</ul>
    <p className="mt-2 text-xs text-muted-foreground">{ja ? "ファミリーは最大30名、ファミリープレミアムは最大100名まで重ねて比べられます。" : "Family compares up to 30 people; Family Premium up to 100."}</p>
  </div>;
}
