import { useState } from 'react';
import { Check, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ThemeSample } from './ThemeSample';
import { NautilusIcon } from './NautilusIcon';
import { appearanceFamilies, appearanceForPlan, type AppearanceFamily } from '@/lib/appearance-families';
import { appearanceTabLabels, appearanceUiCopy } from '@/lib/appearance-ui-copy';
import type { Plan, DesignMode } from '@/lib/design-modes';
import type { Language } from '@/lib/translations';
const modes: Record<AppearanceFamily, DesignMode> = { minimal: 'classic', celestial: 'masculine', sacred: 'masculine-luxe', royal: 'business-night' };
const tiers: Record<AppearanceFamily, Plan> = { minimal: 'free', celestial: 'standard', sacred: 'vip', royal: 'b2b' };
export function AppearanceFitting({ plan, mode, language }: { plan: Plan; mode: DesignMode; language: Language }) {
  const current = appearanceForPlan(plan);
  const [fitting, setFitting] = useState<AppearanceFamily>(current);
  const copy = appearanceUiCopy[language];
  const labels = appearanceTabLabels(language);
  return <div className="mt-5 border-b border-primary/20 pb-6">
    <Tabs value={fitting} onValueChange={v => { if (appearanceFamilies.includes(v as AppearanceFamily)) setFitting(v as AppearanceFamily); }}>
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-4" aria-label={copy.preview}>
        {appearanceFamilies.map(family => <TabsTrigger key={family} value={family} className="appearance-plan-tab min-h-24 flex-col gap-2 whitespace-normal rounded-md border border-primary/20 px-2 py-3 text-xs">
          <NautilusIcon className="size-8" family={family} />
          <span className="block leading-5">{labels[family].map(label => <span className="block" key={label}>{label}</span>)}</span>
        </TabsTrigger>)}
      </TabsList>
      {appearanceFamilies.map(family => <TabsContent key={family} value={family} className="pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="font-serif text-lg text-primary">{copy.families[family]}</h4><span className="flex items-center gap-1.5 text-xs text-muted-foreground">{family === current ? <Check className="size-4 text-primary" /> : <Eye className="size-4" />}{family === current ? copy.current : copy.preview}</span></div>
        <ThemeSample mode={family === current ? mode : modes[family]} tier={tiers[family]} name={copy.families[family]} family={family} large />
      </TabsContent>)}
    </Tabs>
  </div>;
}
