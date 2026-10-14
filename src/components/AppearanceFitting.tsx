import { useEffect, useState } from 'react';
import { Check, LockKeyhole, Save } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeSample } from './ThemeSample';
import { NautilusIcon } from './NautilusIcon';
import { appearanceFamilies } from '@/lib/appearance-families';
import { appearanceUiCopy } from '@/lib/appearance-ui-copy';
import { canUseAppearance, type AppearanceSelection } from '@/lib/appearance-customization';
import { customizationCopy } from '@/lib/customization-copy';
import type { Plan, DesignMode } from '@/lib/design-modes';
import type { Language } from '@/lib/translations';
export function AppearanceFitting({ plan, mode, language, selection, onSave }: { plan: Plan; mode: DesignMode; language: Language; selection: AppearanceSelection; onSave: (selection: AppearanceSelection) => void }) {
  const [draft, setDraft] = useState(selection);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setDraft(selection); setSaved(false); }, [selection.background, selection.parts, selection.icons]);
  const copy = appearanceUiCopy[language];
  const ui = customizationCopy[language];
  const valid = Object.values(draft).every(family => canUseAppearance(plan, family));
  return <div className="mt-5 border-b border-primary/20 pb-6">
    <ThemeSample mode={mode} tier={plan} name={ui.preview} family={draft.parts} background={draft.background} icons={draft.icons} large />
    {(['background', 'parts', 'icons'] as const).map(category => <fieldset key={category} className="mt-5 min-w-0"><legend className="mb-2 text-sm text-primary">{ui[category]}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {appearanceFamilies.map(family => { const available = canUseAppearance(plan, family), selected = draft[category] === family;
        return <Button key={family} variant="outline" aria-pressed={selected} aria-label={`${ui[category]} · ${copy.families[family]}`} onClick={() => { setDraft(prev => ({ ...prev, [category]: family })); setSaved(false); }} className={`h-auto min-h-24 flex-col gap-2 whitespace-normal px-2 py-3 text-xs ${selected ? 'border-primary bg-primary/10' : 'border-primary/20'}`}>
          <NautilusIcon className="size-8" family={family} /><span className="leading-5">{copy.families[family]}</span><span className="flex items-center gap-1 text-muted-foreground">{!available ? <><LockKeyhole className="size-3" />{ui.locked} · {ui.preview}</> : selected ? <Check className="size-3 text-primary" /> : null}</span>
        </Button>;
      })}
    </div></fieldset>)}
    <div className="mt-5 flex flex-wrap items-center gap-3"><Button disabled={!valid} onClick={() => { onSave(draft); setSaved(true); }}><Save className="size-4" />{ui.save}</Button>{saved && <span role="status" className="text-xs text-primary">{ui.saved}</span>}</div>
  </div>;
}
