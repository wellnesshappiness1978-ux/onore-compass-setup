import { useState } from 'react';
import { Compass, Orbit, Gem, Check, Crown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { ThemeSample } from './ThemeSample';
import { appearanceFamilies, appearanceForPlan, appearanceNames, type AppearanceFamily } from '@/lib/appearance-families';
import { colorExperienceCopy } from '@/lib/color-experience-copy';
import type { Plan, DesignMode } from '@/lib/design-modes';
import type { Language } from '@/lib/translations';
const modes: Record<AppearanceFamily, DesignMode> = { minimal: 'classic', celestial: 'masculine', sacred: 'masculine-luxe', royal: 'business-night' };
const tiers: Record<AppearanceFamily, Plan> = { minimal: 'free', celestial: 'standard', sacred: 'vip', royal: 'b2b' };
export function AppearanceFitting({ plan, mode, language, automatic, onAutomaticChange }: { plan: Plan; mode: DesignMode; language: Language; automatic: boolean; onAutomaticChange: (value: boolean) => void }) {
  const current = appearanceForPlan(plan);
  const [fitting, setFitting] = useState<AppearanceFamily>(current);
  const copy = colorExperienceCopy[language].appearance;
  return <div className="mt-5 border-b border-primary/20 pb-6">
    <label className="mb-5 flex items-center justify-between gap-3 text-sm"><span>{copy[1]}<span className="mt-1 block text-xs text-muted-foreground">{copy[2]} · {appearanceNames[current]}</span></span><Switch checked={automatic} onCheckedChange={onAutomaticChange} aria-label={copy[1]} /></label>
    <Tabs value={fitting} onValueChange={v => { if (appearanceFamilies.includes(v as AppearanceFamily)) setFitting(v as AppearanceFamily); }}>
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-transparent p-0 sm:grid-cols-4" aria-label={copy[0]}>
        {appearanceFamilies.map((family, i) => <TabsTrigger key={family} value={family} className="min-h-12 whitespace-normal border border-primary/20 px-2 text-xs">{['Free', 'Standard / Family', 'VIP / Family Premium', 'Business / Corporate'][i]}</TabsTrigger>)}
      </TabsList>
      {appearanceFamilies.map(family => <TabsContent key={family} value={family} className="pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="font-serif text-lg text-primary">{appearanceNames[family]}</h4>{family === current ? <Check className="size-5 text-primary" aria-label={copy[2]} /> : <Crown className="size-5 text-primary" aria-hidden="true" />}</div>
        <ThemeSample mode={family === current ? mode : modes[family]} tier={tiers[family]} name={appearanceNames[family]} family={family} large />
        <p className="mt-3 text-xs leading-6 text-muted-foreground">{family === 'royal' ? copy[8] : copy[7]}</p>
        <h5 className="mt-5 text-sm text-primary">{copy[3]}</h5>
        <div className="mt-3 grid grid-cols-3 gap-2" data-appearance={family}>{[Compass, Orbit, Gem].map((Icon, i) => <article key={i} className="appearance-part rounded-md border border-primary/25 px-2 py-4 text-center"><div className="appearance-part-icon mx-auto grid size-16 place-items-center"><Icon className="size-9 text-primary" strokeWidth={1} /></div><p className="mt-3 break-words text-[11px] leading-5">{copy[4 + i]}</p></article>)}</div>
      </TabsContent>)}
    </Tabs>
    {!automatic && <Button variant="link" className="mt-4 px-0 text-xs" onClick={() => onAutomaticChange(true)}><Check className="size-4" />{copy[1]}</Button>}
  </div>;
}
