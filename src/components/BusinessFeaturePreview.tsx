import { useState } from "react";
import { BarChart3, CalendarDays, Crown, Lock, Network, Compass, Activity, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Plan } from "@/lib/design-modes";
import { canUseFamilyFeature, familyFeatureCopy, type FamilyFeature } from "@/lib/family-features";
import FamilyFeatureDetail from "./team/FamilyFeatureDetail";
import type { Language } from "@/lib/translations";
import { useFocus } from './FocusProvider';
import { useFamilyReading } from '@/hooks/use-family-reading';
import { todayIso } from '@/lib/team-analysis';
import { familyReadingCopy } from '@/lib/family-reading-copy';
import { nextPlan } from '@/lib/plans';
import { teamCopy } from '@/lib/team-copy';
import ChunkedText from './ChunkedText';
import { usageStatusCopy } from '@/lib/usage-status-copy';

const items = [
  { icon: Network, tier: "Family", key: "matrix" }, { icon: BarChart3, tier: "Family", key: "layers" },
  { icon: UserRoundCheck, tier: "Family", key: "friction" }, { icon: CalendarDays, tier: "Family", key: "roadmap" },
  { icon: Compass, tier: "Family", key: "directions" }, { icon: Activity, tier: "Family", key: "rhythm" },
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
  const focus = useFocus();
  const eligible = signedIn && (actualPlan === 'b2b' || actualPlan === 'b2b-premium') && !previewMode;
  const signature = JSON.stringify([focus?.owner,focus?.members,focus?.group,focus?.focus.goal]);
  const reading = useFamilyReading({groupId:focus?.group?.group.id ?? null,language,day:todayIso()},signature,eligible);
  const rc = familyReadingCopy[language];
  const recommended = nextPlan(signedIn ? actualPlan : plan);
  return <section className="mb-6 border-y border-primary/25 py-6 text-left">
    <h3 className="font-serif text-xl text-primary">{c.title}</h3>
    {eligible && !reading.data && !reading.isPending && !reading.errorMessage && <Button variant="outline" className="mt-4 h-auto whitespace-normal" disabled={reading.status==='pending'} onClick={reading.generate}>{rc.generate}</Button>}
    {reading.status === 'pending' && <p role="status" className="mt-3 text-sm text-muted-foreground">{rc.pending}</p>}
    {reading.errorMessage && !selected && <div className="mt-3 space-y-2"><p role="alert" className="text-sm text-destructive">{rc.failed}</p><Button variant="outline" disabled={reading.isFetching || reading.status==='pending'} onClick={()=>void reading.retry()}>{usageStatusCopy[language].retry}</Button></div>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map((item,i) => <Button key={item.key} variant="outline" onClick={() => setSelected(item.key)} className="h-auto min-h-20 justify-start whitespace-normal p-4 text-left">
      <item.icon className="size-5 shrink-0 text-primary"/><span className="min-w-0"><strong className="flex items-center gap-1.5 text-foreground">{!canUseFamilyFeature(plan,item.key) && <Lock className="size-3.5 shrink-0 text-primary"/>}{c.titles[i]}</strong></span>
    </Button>)}</div>
    <Dialog open={selected !== null} onOpenChange={open => !open && setSelected(null)}>
      <DialogContent className="max-w-3xl border-primary/30 bg-card">
        <DialogTitle className="font-serif text-xl text-primary">{selected ? c.titles[items.findIndex(i=>i.key===selected)] : c.title}</DialogTitle>
        <DialogDescription className="text-xs leading-6">{c.note}</DialogDescription>
        {selected && (canUseFamilyFeature(plan,selected) ? <>
          {!eligible && <p className="mb-3 text-xs text-muted-foreground">{rc.preview}</p>}
          {reading.status==='pending' && <p role="status" className="text-sm text-muted-foreground">{rc.pending}</p>}
          {reading.errorMessage && <div className="space-y-2"><p role="alert" className="text-sm text-destructive">{rc.failed}</p><Button variant="outline" disabled={reading.isFetching || reading.status==='pending'} onClick={()=>void reading.retry()}>{usageStatusCopy[language].retry}</Button></div>}
          {eligible && !reading.data && !reading.isPending && !reading.errorMessage && <Button variant="outline" disabled={reading.status==='pending'} onClick={reading.generate}>{rc.generate}</Button>}
          <FamilyFeatureDetail feature={selected} language={language} plan={plan} actualPlan={actualPlan} signedIn={signedIn} previewMode={previewMode} onUpgrade={onUpgrade}/>
          {reading.reading && <ChunkedText text={reading.reading[selected]} className="mt-5 border-t border-primary/25 pt-4 text-sm leading-7"/>}
        </> : <div className="py-6"><p className="mb-2 text-sm leading-7">{recommended ? teamCopy[language].planNames[recommended] : ''}</p><Button onClick={() => {setSelected(null);onUpgrade();}}><Crown className="size-4"/>{t.upgrade}</Button></div>)}
      </DialogContent>
    </Dialog>
  </section>;
}
