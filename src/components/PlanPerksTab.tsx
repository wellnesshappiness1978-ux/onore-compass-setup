import { useState } from "react";
import { Check, Crown, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import HelioCalendar from "./HelioCalendar";
import FengShuiGuide from "./FengShuiGuide";
import TeamStudio from "@/components/team/TeamStudio";
import type { UserProfile } from "./Onboarding";
import { planCardsCopy, type PaidPlanId } from "@/lib/plan-cards";
import { planOrder } from "@/lib/plans";
import { teamCopy } from "@/lib/team-copy";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";

export type PerkTarget = "art" | "consult" | "team" | "plans";

const ui: Record<Language, { title: string; lead: string; active: string; locked: string; mandala: string; voice: string; team: string; plans: string; gantt: string; premium: string }> = {
  ja: { title: "プラン特典", lead: "各プランの限定機能をここに集約しています。上位プランは下位プランの特典をすべて引き継ぎます。", active: "ご利用可能", locked: "このプランで解放されます", mandala: "3D曼陀羅アートを開く", voice: "AIボイス相談室を開く", team: "組織相性シミュレーターを開く", plans: "プランを比較する", gantt: "経営ガントチャートと勝負日アラートは、下の地球暦カレンダー内に表示されます（参考値）。", premium: "全機能が上限なしで使え、100名までの組織分析と優先AI表示が加わります。" },
  en: { title: "Plan benefits", lead: "Each plan's exclusive features are gathered here. Higher plans include every benefit from lower plans.", active: "Available", locked: "Unlocks with this plan", mandala: "Open mandala art", voice: "Open AI voice consultation", team: "Open team simulator", plans: "Compare plans", gantt: "The business timeline and key-date alerts appear in the Earth Calendar below as reference values.", premium: "Use every feature without caps, with analysis for up to 100 people and priority AI labeling." },
  "zh-CN": { title: "方案特权", lead: "各方案的专属功能集中于此。较高方案包含所有较低方案的权益。", active: "可使用", locked: "升级此方案即可解锁", mandala: "打开曼陀罗艺术", voice: "打开AI语音咨询", team: "打开团队模拟器", plans: "比较方案", gantt: "经营时间图与重点日期提醒显示在下方地球历中，仅供参考。", premium: "全部功能不限次数，并提供最多100人的组织分析与优先AI标识。" },
  "zh-TW": { title: "方案特權", lead: "各方案的專屬功能集中於此。較高方案包含所有較低方案的權益。", active: "可使用", locked: "升級此方案即可解鎖", mandala: "開啟曼陀羅藝術", voice: "開啟AI語音諮詢", team: "開啟團隊模擬器", plans: "比較方案", gantt: "經營時間圖與重點日期提醒顯示於下方地球曆中，僅供參考。", premium: "全部功能不限次數，並提供最多100人的組織分析與優先AI標示。" },
  ko: { title: "플랜 혜택", lead: "플랜별 전용 기능을 한곳에 모았습니다. 상위 플랜은 하위 플랜의 모든 혜택을 포함합니다.", active: "이용 가능", locked: "이 플랜에서 잠금 해제", mandala: "만다라 아트 열기", voice: "AI 음성 상담 열기", team: "팀 시뮬레이터 열기", plans: "플랜 비교", gantt: "경영 일정표와 주요 날짜 알림은 아래 지구력에 참고값으로 표시됩니다.", premium: "모든 기능을 제한 없이 이용하고 최대 100명의 조직 분석과 우선 AI 표시를 사용할 수 있습니다." },
  es: { title: "Ventajas del plan", lead: "Aquí se reúnen las funciones exclusivas de cada plan. Los planes superiores incluyen todas las ventajas de los anteriores.", active: "Disponible", locked: "Se desbloquea con este plan", mandala: "Abrir arte mandala", voice: "Abrir consulta de voz con IA", team: "Abrir simulador de equipo", plans: "Comparar planes", gantt: "El cronograma de gestión y las alertas de fechas clave aparecen abajo en el Calendario terrestre como valores orientativos.", premium: "Todas las funciones sin límites, análisis de hasta 100 personas y prioridad en las funciones de IA." },
  fr: { title: "Avantages du forfait", lead: "Les fonctions exclusives de chaque forfait sont regroupées ici. Les forfaits supérieurs incluent tous les avantages précédents.", active: "Disponible", locked: "Débloqué avec ce forfait", mandala: "Ouvrir l’art mandala", voice: "Ouvrir la consultation vocale IA", team: "Ouvrir le simulateur d’équipe", plans: "Comparer les forfaits", gantt: "Le calendrier de gestion et les alertes de dates clés figurent ci-dessous dans le Calendrier terrestre à titre indicatif.", premium: "Toutes les fonctions sans plafond, l’analyse de 100 personnes et la priorité des fonctions IA." },
};

export default function PlanPerksTab({ profile, language, plan, actualPlan, signedIn, go }: { profile: UserProfile; language: Language; plan: Plan; actualPlan: Plan; signedIn: boolean; go: (target: PerkTarget) => void }) {
  const copy = planCardsCopy[language];
  const t = ui[language];
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
          {active === "vip" && <><Button variant="outline" onClick={() => go("art")}>{t.mandala}</Button><Button variant="outline" onClick={() => go("consult")}>{t.voice}</Button></>}
          {(active === "b2b" || active === "b2b-premium") && <Button variant="outline" onClick={() => document.getElementById("team-studio-entry")?.scrollIntoView({ behavior: "smooth", block: "start" })}>{t.team}</Button>}
          {!unlocked && <Button variant="champagne" onClick={upgrade}>{t.plans}</Button>}
        </div>
        {active === "b2b-premium" && <p className="mt-4 text-sm leading-7 text-foreground">{t.premium}</p>}
        {active === "b2b" && <p className="mt-4 text-sm leading-7 text-muted-foreground">{t.gantt}</p>}
      </section>
      {active === "vip" && <FengShuiGuide profile={profile} date={new Date()} language={language} />}
      {active !== "vip" && <HelioCalendar date={new Date()} profile={profile} plan={plan} language={language} onUpgrade={upgrade} />}
      {(active === "b2b" || active === "b2b-premium") && <div id="team-studio-entry" className="scroll-mt-6"><TeamStudio plan={plan} actualPlan={actualPlan} language={language} signedIn={signedIn} ownerBirthDate={profile.birthDate} /></div>}
    </div>
  );
}
