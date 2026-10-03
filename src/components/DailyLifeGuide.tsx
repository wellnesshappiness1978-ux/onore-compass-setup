import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Compass, HeartPulse, LockKeyhole, MessageCircleHeart, ShoppingBag, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "./Onboarding";
import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { planOrder } from "@/lib/plans";
import { directionEnergy, localIso, personal } from "@/lib/day-compass";
import { dayElement, relation, type Element, type TeamMember } from "@/lib/team-analysis";
import { listTeamMembers } from "@/lib/team-members.functions";

// Deterministic daily guide from birth date + today's day element. Reference values, not verified readings.
const ja = {
  title: "今日の生活ガイド", sub: "毎日更新・生年月日と今日の暦から算出した参考値",
  food: "開運フード", shop: "買い物", health: "健康アドバイス", dir: "吉方位",
  lock: "スタンダードプラン以上で毎日の生活ガイドが開きます", upgrade: "プランを見る",
  relTitle: "クイック人間関係ガイド", relSub: "関係者を選ぶと、今日の声かけとNG対応がすぐ分かります",
  say: "今日掛けるべき言葉", ng: "NGな対応", empty: "関係者がまだ登録されていません（マイページのチームから登録）",
  relLock: "スタンダードプラン以上で関係者ガイドが使えます",
  dirs: { N: "北", NE: "北東", E: "東", SE: "南東", S: "南", SW: "南西", W: "西", NW: "北西" } as Record<string, string>,
};
const en = {
  title: "Today's Life Guide", sub: "Updated daily · reference values from your birth date and today's calendar",
  food: "Lucky food", shop: "Shopping", health: "Health tip", dir: "Lucky direction",
  lock: "Unlocks with Standard plan or higher", upgrade: "View plans",
  relTitle: "Quick Relationship Guide", relSub: "Pick a person to see today's words to say and what to avoid",
  say: "Words to say today", ng: "Avoid", empty: "No people registered yet (add them in My Page › Team)",
  relLock: "Relationship guide unlocks with Standard plan or higher",
  dirs: { N: "N", NE: "NE", E: "E", SE: "SE", S: "S", SW: "SW", W: "W", NW: "NW" } as Record<string, string>,
};

const tips: Record<Element, { ja: [string, string, string]; en: [string, string, string] }> = {
  wood: { ja: ["緑の葉物野菜・酸味のある柑橘", "植物・ノート・新しい文房具", "朝のストレッチで体を伸ばす。目を休める時間を取る"], en: ["Leafy greens, citrus", "Plants, notebooks, new stationery", "Morning stretch; rest your eyes"] },
  fire: { ja: ["トマト・赤い果物・ほろ苦い料理", "照明・香り・赤いアクセント小物", "水分をこまめに。夜は早めに照明を落とす"], en: ["Tomatoes, red fruit, bitter dishes", "Lights, fragrance, red accents", "Drink water often; dim lights early"] },
  earth: { ja: ["かぼちゃ・さつまいも・根菜スープ", "器・キッチン用品・黄色の小物", "よく噛んで食べる。胃腸を冷やさない"], en: ["Pumpkin, sweet potato, root soup", "Tableware, kitchen goods, yellow items", "Chew slowly; keep your stomach warm"] },
  metal: { ja: ["大根・白ごはん・梨など白い食材", "アクセサリー・時計・白い小物", "深呼吸と換気。喉と肌の乾燥に注意"], en: ["Radish, rice, pear", "Accessories, watches, white items", "Deep breaths, fresh air; watch dryness"] },
  water: { ja: ["海藻・黒豆・魚介のスープ", "タンブラー・バス用品・紺色の小物", "体を冷やさず、湯船で温まる。睡眠を長めに"], en: ["Seaweed, black beans, seafood soup", "Tumblers, bath goods, navy items", "Stay warm, take a bath, sleep longer"] },
};
const talk: Record<string, { ja: [string, string]; en: [string, string] }> = {
  generate: { ja: ["「いつも助かってる、ありがとう」と具体的に感謝を伝える", "相手の話を途中で遮って結論を急ぐ"], en: ["Thank them for something specific", "Cutting them off to rush a conclusion"] },
  same: { ja: ["「一緒にやろう」と対等に声をかける", "張り合う・どちらが正しいか白黒つける"], en: ["Invite them as an equal: \"Let's do it together\"", "Competing over who is right"] },
  control: { ja: ["「あなたの意見を聞かせて」と先に相手を立てる", "命令口調・急な予定変更を押しつける"], en: ["Ask for their opinion first", "Commanding tone or sudden changes"] },
  neutral: { ja: ["「最近どう？」と軽い近況から話し始める", "返事を急かす・既読スルーを責める"], en: ["Start with light small talk", "Pressuring for a quick reply"] },
};

type Props = { profile: UserProfile; language: Language; plan: Plan; signedIn: boolean; onUpgrade: () => void };

export default function DailyLifeGuide({ profile, language, plan, signedIn, onUpgrade }: Props) {
  const isJa = language === "ja";
  const t = isJa ? ja : en;
  const open = planOrder.indexOf(plan) >= planOrder.indexOf("standard");
  const today = new Date();
  const iso = localIso(today);
  const el = dayElement(iso);
  const tip = tips[el][isJa ? "ja" : "en"];
  const best = useMemo(() => [...directionEnergy(profile.birthDate, today)].sort((a, b) => b.score - a.score)[0], [profile.birthDate, iso]);
  const rhythm = personal(profile.birthDate, today);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pick, setPick] = useState<string>("");
  const list = useServerFn(listTeamMembers);
  useEffect(() => {
    let active = true;
    if (!open) { setMembers([]); return; }
    if (signedIn) list().then(values => { if (active) setMembers(values); }).catch(() => { if (active) setMembers([]); });
    else { try { const values = JSON.parse(localStorage.getItem("onore-team") ?? "[]"); setMembers(Array.isArray(values) ? values : []); } catch { setMembers([]); } }
    return () => { active = false; };
  }, [open, signedIn, list]);
  const me: TeamMember = { id: "me", name: "", birthDate: profile.birthDate, gender: "", bloodType: "", role: "", skills: [] };
  const target = members.find((m) => m.id === pick);
  const advice = target ? talk[relation(me, target)]?.[isJa ? "ja" : "en"] : null;

  const items = [
    { icon: Utensils, label: t.food, value: tip[0] },
    { icon: ShoppingBag, label: t.shop, value: tip[1] },
    { icon: HeartPulse, label: t.health, value: tip[2] },
    { icon: Compass, label: t.dir, value: best ? t.dirs[best.dir] : "—" },
  ];

  const Lock = ({ text }: { text: string }) => (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-primary/25 bg-background/60 p-5 text-center">
      <LockKeyhole className="size-5 text-primary" />
      <p className="text-base text-foreground">{text}</p>
      <Button variant="champagne" onClick={onUpgrade}>{t.upgrade}</Button>
    </div>
  );

  return (
    <div className="border-y border-primary/20 py-6">
      {open && <section aria-label="今日の具体的決断" className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="font-serif text-2xl text-primary">{isJa ? "今日の具体的決断" : "Today's concrete decision"}</h2><span className="text-sm text-muted-foreground">{iso} · {isJa ? "3周期の参考値" : "Three-cycle reference"} {Math.round(rhythm.total)}</span></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><article className="border-l-2 border-primary pl-4"><h3 className="font-serif text-xl text-primary">{isJa ? "攻めるなら" : "Advance"}</h3><p className="mt-2 text-base leading-8">{isJa ? (rhythm.total >= 55 ? "準備済みの提案を1件届ける。送る前に目的・相手の利点・次の一歩を3行で確認。まず小さく反応を確かめる。" : "大きな賭けではなく、小さな試作を1件進める。15分だけ着手して、不明点を1つ解消する。") : (rhythm.total >= 55 ? "Send one prepared proposal. State the goal, benefit and next step; test the response before committing." : "Build one small prototype. Work for 15 minutes and resolve one uncertainty.")}</p></article><article className="border-l border-primary/30 pl-4"><h3 className="font-serif text-xl text-primary">{isJa ? "守るなら" : "Protect"}</h3><p className="mt-2 text-base leading-8">{isJa ? (rhythm.total < 45 ? "費用と期限が大きい判断は、事実・代替案・撤退条件を紙に整理。判断を急がず、信頼できる人の確認を1回入れる。" : "引き受ける前に所要時間と締切を確認。予定に30分の余白を残し、返事は確約できる範囲で伝える。") : "Check costs, deadlines and alternatives. Leave room in your schedule and seek a second review for high-stakes decisions."}</p></article></div>
        <p className="mt-3 text-xs text-muted-foreground">{isJa ? "周期を使った振り返りの提案です。決断・健康・取引の結果を予測しません。" : "Reflection prompts, not predictions of decisions, health or transactions."}</p>
      </section>}
    <div className="grid gap-6 md:grid-cols-2">
      <section className="py-3">
        <h2 className="font-serif text-2xl font-bold text-gradient-gold">{t.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.sub}</p>
        {open ? (
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.label} className="flex gap-3 rounded-md border border-primary/15 bg-background/40 p-3">
                <i.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div><p className="text-sm font-bold text-primary">{i.label}</p><p className="text-base leading-7 text-foreground">{i.value}</p></div>
              </li>
            ))}
          </ul>
        ) : <Lock text={t.lock} />}
      </section>
      <section className="py-3">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-gradient-gold"><MessageCircleHeart className="size-6 text-primary" />{t.relTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.relSub}</p>
        {!open ? <Lock text={t.relLock} /> : members.length === 0 ? <p className="mt-4 text-base text-foreground">{t.empty}</p> : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {members.map((m) => (
                <Button key={m.id} size="sm" variant="outline" onClick={() => setPick(m.id)} className={pick === m.id ? "border-primary bg-primary/15 text-primary" : "border-primary/25"}>{m.name}</Button>
              ))}
            </div>
            {advice && (
              <div className="mt-4 space-y-3">
                <div className="rounded-md border border-primary/30 bg-primary/10 p-3"><p className="text-sm font-bold text-primary">◎ {t.say}</p><p className="text-base leading-7">{advice[0]}</p></div>
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3"><p className="text-sm font-bold text-destructive">✕ {t.ng}</p><p className="text-base leading-7">{advice[1]}</p></div>
              </div>
            )}
          </>
        )}
      </section>
    </div></div>
  );
}
