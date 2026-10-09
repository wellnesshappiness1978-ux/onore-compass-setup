import { useState } from "react";
import { LockKeyhole, Palette, Sparkles } from "lucide-react";
import { birthColorSpectrum, localizeBirthColorName } from "@/lib/birth-color-spectrum";
import { birthColorCopy, type BirthColorRole } from "@/lib/birth-color-copy";
import type { UserProfile } from "./Onboarding";
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";
import { canUse } from "@/lib/plans";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

const roles: BirthColorRole[] = ["main", "sub", "money", "work", "love", "health", "mind"];

export default function BirthColorGuide({ profile, plan, language, onUpgrade }: { profile: UserProfile; plan: Plan; language: Language; onUpgrade?: () => void }) {
  const [selected, setSelected] = useState<BirthColorRole | null>(null);
  const palette = birthColorSpectrum(profile);
  const copy = birthColorCopy[language];
  const full = canUse(plan, "birthColorsFull");
  if (!palette) return null;
  const selectedColor = selected ? palette[selected] : null;
  const selectedCopy = selected ? copy.roles[selected] : null;

  return <section className="border-y border-primary/25 py-7" aria-labelledby="birth-color-title">
    <div className="flex items-start gap-3"><Palette className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" /><div><h3 id="birth-color-title" className="font-serif text-xl text-primary">{copy.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{copy.intro}</p></div></div>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {roles.map((role, index) => {
        const color = palette[role];
        const roleCopy = copy.roles[role];
        const unlocked = index === 0 || full;
        return unlocked ? <Button key={role} type="button" variant="outline" onClick={() => setSelected(role)} aria-label={`${roleCopy.label}: ${localizeBirthColorName(color.name, language)}. ${copy.open}`} className="h-auto min-h-40 flex-col items-stretch justify-start gap-3 rounded-md border-primary/25 bg-background/35 p-4 text-left hover:border-primary/60 hover:bg-primary/5">
          <span className="flex items-center gap-3"><span className="size-11 shrink-0 rounded-full border border-primary/35 shadow-[0_0_18px_var(--gold-glow)]" style={{ backgroundColor: color.code }} aria-hidden="true" /><span className="min-w-0"><span className="block text-xs text-muted-foreground">{roleCopy.label}</span><strong className="mt-0.5 block break-words text-sm text-primary">{localizeBirthColorName(color.name, language)}</strong></span></span>
          <span className="block text-xs leading-6 text-foreground">{roleCopy.summary}</span><span className="mt-auto flex items-center gap-1 text-[11px] text-primary"><Sparkles className="size-3" aria-hidden="true" />{copy.open}</span>
        </Button> : <div key={role} className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-primary/25 p-4 text-center"><LockKeyhole className="size-5 text-primary" aria-hidden="true" /><p className="text-sm text-foreground">{roleCopy.label}</p><p className="text-xs leading-5 text-muted-foreground">{copy.locked}</p>{onUpgrade && <Button type="button" variant="link" onClick={onUpgrade} className="h-auto p-0 text-xs">{copy.upgrade}</Button>}</div>;
      })}
    </div>
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg border-primary/35 bg-card text-foreground">
        {selectedColor && selectedCopy && <><div className="flex items-center gap-4 pr-8"><span className="size-16 shrink-0 rounded-full border border-primary/40 shadow-[0_0_24px_var(--gold-glow)]" style={{ backgroundColor: selectedColor.code }} aria-hidden="true" /><div><DialogTitle className="font-serif text-xl text-gradient-gold">{selectedCopy.label}</DialogTitle><p className="mt-1 text-sm text-primary">{localizeBirthColorName(selectedColor.name, language)} · {selectedColor.code}</p></div></div><DialogDescription className="text-base leading-8 text-foreground">{selectedCopy.detail}</DialogDescription><p className="border-t border-primary/20 pt-3 text-xs leading-6 text-muted-foreground">{copy.dialogNote}</p></>}
      </DialogContent>
    </Dialog>
  </section>;
}