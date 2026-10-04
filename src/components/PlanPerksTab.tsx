import { useState } from "react";
import { Check, Crown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import BirthColorGuide from "./BirthColorGuide";
import HelioCalendar from "./HelioCalendar";
import FengShuiGuide from "./FengShuiGuide";
import type { UserProfile } from "./Onboarding";
import { planCardsCopy, type PaidPlanId } from "@/lib/plan-cards";
import { planOrder } from "@/lib/plans";
import { teamCopy } from "@/lib/team-copy";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";

export type PerkTarget = "mandala" | "consult" | "team" | "plans";

const ui = (language: Language) => {
  const ja = language === "ja";
  const zh = language === "zh-TW" || language === "zh-CN";
  return {
    title: ja ? "プラン特典" : zh ? "方案特權" : "Plan perks",
    lead: ja ? "各プランの限定機能をここに集約しています。上位プランは下位プランの特典をすべて引き継ぎます。" : zh ? "此處匯集各方案的專屬功能。上位方案完整保留下位方案的特權。" : "Each plan's exclusive features in one place. Higher plans keep every benefit of the plans below.",
    active: ja ? "ご利用可能" : zh ? "可使用" : "Available",
    locked: ja ? "このプランで解放されます" : zh ? "升級此方案即可解鎖" : "Unlocked with this plan",
    mandala: ja ? "3D曼陀羅アートを開く" : zh ? "開啟曼陀羅藝術" : "Open mandala art",
    voice: ja ? "AIボイス相談室を開く" : zh ? "開啟AI語音諮詢" : "Open AI voice consultation",
    team: ja ? "組織相性シミュレーターを開く" : zh ? "開啟組織相性模擬器" : "Open team simulator",
    plans: ja ? "プランを比較する" : zh ? "比較方案" : "Compare plans",
    gantt: ja ? "経営ガントチャートと勝負日アラートは、下の地球暦カレンダー内に表示されます（参考値）。" : zh ? "經營甘特圖與重點日提醒顯示於下方地球曆（參考值）。" : "The business Gantt chart and key-day alerts appear in the earth calendar below (reference values).",
    premium: ja ? "全機能が上限なしで使え、100名までの組織分析と優先AI表示が加わります。" : zh ? "全部功能無上限，並加入最多100名的組織分析與優先AI標示。" : "Every feature without caps, plus 100-member team analysis and priority AI labeling.",
  };
};

export default function PlanPerksTab({ profile, language, plan, go }: { profile: UserProfile; language: Language; plan: Plan; go: (target: PerkTarget) => void }) {
  const copy = planCardsCopy[language];
  const t = ui(language);
  const initial = (copy.cards.find((c) => c.id === plan)?.id ?? "standard") as PaidPlanId;
  const [active, setActive] = useState<PaidPlanId>(initial);
  const card = copy.cards.find((c) => c.id === active) ?? copy.cards[0];
  const unlocked = planOrder.indexOf(plan) >= planOrder.indexOf(active);
  const upgrade = () => go("plans");
  if (!card) return null;
  return (
    <div className="space-y-6">
      <p className="text-center text-sm leading-7 text-muted-foreground">{t.lead}</p>
      <div role="tablist" aria-label={t.title} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {copy.cards.map((c) => {
          const open = planOrder.indexOf(plan) >= planOrder.indexOf(c.id);
          return (
            <Button key={c.id} type="button" role="tab" aria-selected={active === c.id} variant={active === c.id ? "default" : "outline"} onClick={() => setActive(c.id)} className="h-auto min-h-12 whitespace-normal px-2 text-sm">
              {!open && <LockKeyhole className="size-3.5" aria-hidden="true" />}
              {teamCopy[language].planNames[c.id]}
            </Button>
          );
        })}
      </div>
      <section role="tabpanel" className="card-lux rounded-lg p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Crown className="size-5 text-primary" aria-hidden="true" />
          <h3 className="font-serif text-xl text-gradient-gold">{teamCopy[language].planNames[active]}</h3>
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${unlocked ? "bg-primary text-primary-foreground" : "border border-primary/40 text-primary"}`}>{unlocked ? t.active : t.locked}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{card.tagline}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {card.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm leading-6 text-foreground"><Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />{f}</li>)}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          {active === "vip" && <><Button variant="outline" onClick={() => go("mandala")}>{t.mandala}</Button><Button variant="outline" onClick={() => go("consult")}>{t.voice}</Button></>}
          {(active === "b2b" || active === "b2b-premium") && <Button variant="outline" onClick={() => go("team")}>{t.team}</Button>}
          {!unlocked && <Button variant="champagne" onClick={upgrade}>{t.plans}</Button>}
        </div>
        {active === "b2b-premium" && <p className="mt-4 text-sm leading-7 text-foreground">{t.premium}</p>}
        {active === "b2b" && <p className="mt-4 text-sm leading-7 text-muted-foreground">{t.gantt}</p>}
      </section>
      {active === "standard" && <BirthColorGuide profile={profile} plan={plan} onUpgrade={upgrade} />}
      {active === "vip" && <FengShuiGuide profile={profile} date={new Date()} language={language} />}
      {active !== "vip" && <HelioCalendar date={new Date()} profile={profile} plan={plan} onUpgrade={upgrade} />}
    </div>
  );
}
