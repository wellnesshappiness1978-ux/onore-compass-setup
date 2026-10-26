import { useState } from "react";
import { BarChart3, CalendarDays, Crown, Lock, Network, Sparkles, UserRoundCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Plan } from "@/lib/design-modes";
import { canUseFamilyFeature, familyFeatureCopy, type FamilyFeature } from "@/lib/family-features";
import FamilyFeatureDetail from "./team/FamilyFeatureDetail";
import type { Language } from "@/lib/translations";

const items = [
  { icon: Network, tier: "Family", key: "matrix" }, { icon: BarChart3, tier: "Family", key: "layers" },
  { icon: UserRoundCheck, tier: "Family", key: "friction" }, { icon: CalendarDays, tier: "Family", key: "roadmap" },
  { icon: UsersRound, tier: "Family", key: "consult" }, { icon: Sparkles, tier: "Family", key: "colors" },
] as const;

const copy: Record<Language, { upgrade: string; upgradeFamily: string }> = {
  ja: { upgrade: "プランを確認", upgradeFamily: "ファミリープランへアップグレード" },
  en: { upgrade: "View plans", upgradeFamily: "Upgrade to the Family plan" },
  "zh-CN": { upgrade: "查看方案", upgradeFamily: "升级到家庭方案" },
  "zh-TW": { upgrade: "查看方案", upgradeFamily: "升級到家庭方案" },
  ko: { upgrade: "플랜 보기", upgradeFamily: "패밀리 플랜으로 업그레이드" },
  es: { upgrade: "Ver planes", upgradeFamily: "Mejorar al plan Familia" },
  fr: { upgrade: "Voir les offres", upgradeFamily: "Passer à l’offre Famille" },
};

export default function BusinessFeaturePreview({ language, plan, actualPlan, signedIn, previewMode, onUpgrade }: { language: Language; plan: Plan; actualPlan: Plan; signedIn: boolean; previewMode: boolean; onUpgrade: () => void }) {
  const t = copy[language], c = familyFeatureCopy[language];
  const [selected, setSelected] = useState<FamilyFeature | null>(null);
  return <section className="mb-6 border-y border-primary/25 py-6 text-left">
    <h3 className="font-serif text-xl text-primary">{c.title}</h3>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map((item,i) => <Button key={item.key} variant="outline" onClick={() => setSelected(item.key)} className="h-auto min-h-20 justify-start whitespace-normal p-4 text-left">
      <item.icon className="size-5 shrink-0 text-primary"/><span className="min-w-0"><strong className="flex items-center gap-1.5 text-foreground">{!canUseFamilyFeature(plan,item.key) && <Lock className="size-3.5 shrink-0 text-primary"/>}{c.titles[i]}</strong></span>
    </Button>)}</div>
    <Dialog open={selected !== null} onOpenChange={open => !open && setSelected(null)}>
      <DialogContent className="max-w-3xl border-primary/30 bg-card">
        <DialogTitle className="font-serif text-xl text-primary">{selected ? c.titles[items.findIndex(i=>i.key===selected)] : c.title}</DialogTitle>
        <DialogDescription className="text-xs leading-6">{c.note}</DialogDescription>
        {selected && (canUseFamilyFeature(plan,selected) ? <FamilyFeatureDetail feature={selected} language={language} plan={plan} actualPlan={actualPlan} signedIn={signedIn} previewMode={previewMode} onUpgrade={onUpgrade}/> : <div className="py-6"><p className="mb-4 text-sm leading-7">{t.upgradeFamily}</p><Button onClick={() => {setSelected(null);onUpgrade();}}><Crown className="size-4"/>{t.upgrade}</Button></div>)}
      </DialogContent>
    </Dialog>
  </section>;
}
