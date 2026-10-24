import { useState } from "react";
import { LockKeyhole, Palette, Sparkles } from "lucide-react";
import { birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import { birthColorCopy, type BirthColorRole } from "@/lib/birth-color-copy";
import type { UserProfile } from "./Onboarding";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { canUse } from "@/lib/plans";
import { todayAccessCopy } from '@/lib/today-access-copy';
import { birthColorLimit } from '@/lib/plans';
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { BirthColorDetails } from "./BirthColorDetails";

const roles: BirthColorRole[] = ["main", "sub", "money", "work", "love", "health", "mind"];

export default function BirthColorGuide({ profile, plan, language, onUpgrade }: { profile: UserProfile; plan: Plan; language: Language; onUpgrade?: () => void }) {
  const [selected, setSelected] = useState<BirthColorRole | null>(null);
  const palette = birthColorSpectrum(profile);
  const copy = birthColorCopy[language];
  const full = canUse(plan, "birthColorsFull");
  if (!palette) return null;

  return <section className="min-w-0 border-y border-primary/25 py-4 sm:py-7" aria-labelledby="birth-color-title">
    <div className="flex items-start gap-3"><Palette className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" /><div className="min-w-0 [overflow-wrap:anywhere]"><h3 id="birth-color-title" className="font-serif text-xl text-primary">{copy.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground sm:mt-2 sm:text-sm sm:leading-7">{copy.intro}</p></div></div>
    <p className="mt-2 text-xs text-primary sm:mt-3 sm:text-sm">{todayAccessCopy[language].colors(birthColorLimit(plan))}</p>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {roles.map((role, index) => {
        const color = palette[role];
        const roleCopy = copy.roles[role];
        const unlocked = index < birthColorLimit(plan);
        return unlocked ? <Button key={role} type="button" variant="outline" onClick={() => setSelected(role)} aria-label={`${roleCopy.label}: ${localizeBirthColorName(color.name, language)}. ${copy.open}`} className="h-auto min-h-0 min-w-0 whitespace-normal [overflow-wrap:anywhere] flex-col items-stretch justify-start gap-1.5 rounded-md border-primary/25 bg-background/35 p-2.5 sm:min-h-40 sm:gap-3 sm:p-4 text-left hover:border-primary/60 hover:bg-primary/5">
          <span className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2"><span className="size-8 shrink-0 rounded-full sm:size-11 border border-primary/35 shadow-[0_0_18px_var(--gold-glow)]" style={{ backgroundColor: color.code }} aria-hidden="true" /><span className="min-w-0"><span className="block text-xs text-muted-foreground">{roleCopy.label}</span><strong className="mt-0.5 block break-words text-sm text-primary">{localizeBirthColorName(color.name, language)}</strong></span></span>
          <span className="line-clamp-2 whitespace-normal text-[11px] leading-5 text-foreground sm:line-clamp-none sm:max-h-36 sm:overflow-y-auto sm:text-xs sm:leading-6">{roleCopy.summary}</span><span className="mt-auto flex min-w-0 items-center gap-1 whitespace-normal text-[11px] text-primary"><Sparkles className="size-3" aria-hidden="true" />{copy.open}</span>
        </Button> : <div key={role} className="flex min-h-0 min-w-0 [overflow-wrap:anywhere] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-primary/25 p-2.5 sm:min-h-40 sm:gap-2 sm:p-4 text-center"><LockKeyhole className="size-5 text-primary" aria-hidden="true" /><p className="text-sm text-foreground">{roleCopy.label}</p><p className="text-xs leading-5 text-muted-foreground">{copy.locked}</p>{onUpgrade && <Button type="button" variant="link" onClick={onUpgrade} className="h-auto p-0 text-xs">{copy.upgrade}</Button>}</div>;
      })}
    </div>
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      {selected && <BirthColorDetails key={selected} profile={profile} role={selected} full={full} language={language} />}
    </Dialog>
  </section>;
}