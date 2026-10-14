import { useState } from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { ThemeSample } from './ThemeSample';
import { selectableAppearanceFamilies, appearancePlan, type AppearanceFamily } from '@/lib/appearance-families';
import { appearanceUiCopy } from '@/lib/appearance-ui-copy';
import { canUseAppearance, type AppearanceSelection } from '@/lib/appearance-customization';
import { designCopy, type Plan, type DesignMode } from '@/lib/design-modes';
import type { Language } from '@/lib/translations';
const familyModes: Record<AppearanceFamily, DesignMode> = { minimal: 'classic', celestial: 'aura-gold-luxe', sacred: 'masculine-luxe', harmony: 'business-night', sovereign: 'business-zero', royal: 'business-emperor' };
export function AppearanceFitting({ plan, language, selection, onSave, onModeChange, onUpgrade }: { plan: Plan; language: Language; selection: AppearanceSelection; onSave: (selection: AppearanceSelection) => void; onModeChange: (mode: DesignMode) => void; onUpgrade: () => void }) {
  const [preview, setPreview] = useState<AppearanceFamily | null>(null);
  const copy = appearanceUiCopy[language];
  const dc = designCopy[language];
  return <>
    <div className="appearance-selection mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label={dc.title}>
      {selectableAppearanceFamilies.map(family => {
        const available = canUseAppearance(plan, family);
        const selected = Object.values(selection).every(value => value === family);
        return <Button key={family} variant="outline" aria-pressed={selected} aria-label={copy.families[family]} onClick={() => {
          if (!available) { setPreview(family); return; }
          onSave({ background: family, parts: family, icons: family });
          onModeChange(familyModes[family]);
        }} className={`theme-choice min-w-0 h-auto flex-col items-stretch gap-0 overflow-hidden rounded-md p-0 ${selected ? 'ring-2 ring-primary' : ''}`}>
          <ThemeSample mode={familyModes[family]} tier={appearancePlan[family]} name={copy.families[family]} family={family} compact />
          <span className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-1 px-2 py-1 text-left text-[11px] leading-4">
            <span className="min-w-0 whitespace-normal"><span className="block font-semibold text-primary">{copy.plans[appearancePlan[family]]}</span><span className="block">{copy.families[family]}</span></span>
            {!available ? <LockKeyhole className="size-3.5 shrink-0 text-primary" aria-label={dc.requires} /> : selected ? <Check className="size-3.5 shrink-0 text-primary" aria-label={copy.current} /> : null}
          </span>
        </Button>;
      })}
    </div>
    <Dialog open={preview !== null} onOpenChange={open => { if (!open) setPreview(null); }}>
      <DialogContent className="max-w-md gap-3 border-primary/30 bg-card p-4 text-foreground">
        {preview && <>
          <DialogTitle className="font-serif text-lg text-primary">{copy.families[preview]}</DialogTitle>
          <ThemeSample mode={familyModes[preview]} tier={appearancePlan[preview]} name={copy.families[preview]} family={preview} />
          <DialogDescription>{dc.locked(copy.plans[appearancePlan[preview]])}</DialogDescription>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPreview(null)}>{dc.later}</Button><Button onClick={() => { setPreview(null); onUpgrade(); }}>{dc.upgrade}</Button></div>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}
