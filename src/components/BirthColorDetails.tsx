import { useState, type CSSProperties } from 'react';
import { Palette, Orbit, Sparkles, BriefcaseBusiness, Heart, Leaf } from 'lucide-react';
import { DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { birthColorCopy, type BirthColorRole } from '@/lib/birth-color-copy';
import { birthColorSpectrum, localizeBirthColorName } from '@/lib/birth-color-spectrum';
import { colorExperienceCopy } from '@/lib/color-experience-copy';
import { colorReference, colorReferenceCopy } from '@/lib/color-reference';
import type { UserProfile } from './Onboarding';
import type { Language } from '@/lib/translations';
const sixRoles: BirthColorRole[] = ['main', 'money', 'work', 'love', 'health', 'mind'];
export function BirthColorDetails({ profile, role, full, language }: { profile: UserProfile; role: BirthColorRole; full: boolean; language: Language }) {
  const [scene, setScene] = useState(0);
  const palette = birthColorSpectrum(profile);
  if (!palette) return null;
  const color = palette[role], copy = colorExperienceCopy[language], old = birthColorCopy[language];
  const essence = colorReference(color.code), reference = colorReferenceCopy[language];
  const sceneRoles: BirthColorRole[] = ['work', 'health', 'love'];
  const sceneRole = sceneRoles[scene] ?? 'main';
  return <DialogContent className="color-detail-dialog flex max-h-[90dvh] min-w-0 w-[calc(100%-1.5rem)] [overflow-wrap:anywhere] max-w-3xl flex-col gap-0 overflow-hidden p-0" style={{ '--selected-birth-color': color.code } as CSSProperties}>
    <header className="color-detail-header flex shrink-0 items-center gap-5 px-5 py-6 pr-10 sm:px-8">
      <span className="birth-color-jewel size-16 shrink-0 rounded-full" aria-hidden="true" />
      <div className="min-w-0"><p className="text-xs text-primary">{old.roles[role].label}</p><DialogTitle className="mt-1 break-words font-serif text-xl sm:text-2xl">{localizeBirthColorName(color.name, language)}</DialogTitle><DialogDescription className="mt-2 font-mono text-sm text-primary">{color.code}</DialogDescription></div>
    </header>
    <Tabs defaultValue="0" className="flex min-h-0 flex-1 flex-col">
      <TabsList className="mx-4 mb-3 grid h-auto shrink-0 grid-cols-3 gap-1 bg-transparent p-0 sm:mx-8" aria-label={old.open}>
        {copy.steps.map((label, i) => <TabsTrigger key={label} value={String(i)} className="color-step min-h-12 whitespace-normal px-2 py-3 text-xs sm:text-sm"><span className="mr-2 font-mono text-primary">0{i + 1}</span>{label}</TabsTrigger>)}
      </TabsList>
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pb-7 sm:px-8">
        <TabsContent value="0" className="space-y-6">
          <h3 className="flex items-center gap-2 font-serif text-lg"><Orbit className="size-5 text-primary" />{copy.titles[0]}</h3>
          <section className="border-b border-primary/20 pb-5"><h4 className="text-sm text-primary">{reference.light}</h4><p className="mt-2 text-sm leading-7">{reference.note}</p><p className="mt-3 font-mono text-sm text-primary">{essence.wavelength && essence.frequency ? `${essence.wavelength} nm · ${essence.frequency.toExponential(4)} Hz` : copy.nonSpectral}</p></section>
          <section><h4 className="text-sm text-primary">{reference.trigger}</h4><p className="mt-2 text-sm leading-7">{reference.cues[essence.index]}</p></section>
          <section><h4 className="text-sm text-primary">{reference.chakra}</h4><p className="mt-2 text-sm leading-7">{reference.areas[essence.chakra - 1]}</p></section>
          <section className="border-t border-primary/20 pt-5"><h4 className="text-sm text-primary">{copy.labels[3]}</h4><p className="mt-2 font-serif text-lg">{copy.elements[essence.index]}</p><p className="mt-2 text-xs leading-6">{copy.symbolNote}</p></section>
        </TabsContent>
        <TabsContent value="1" className="space-y-5">
          <h3 className="flex items-center gap-2 font-serif text-lg"><Sparkles className="size-5 text-primary" />{copy.titles[1]}</h3>
          <section className="border-b border-primary/20 pb-5"><h4 className="text-sm text-primary">{copy.labels[4]}</h4><p className="mt-2 text-sm leading-7">{copy.basis}</p>{palette.provisional && <p className="mt-2 text-xs text-primary">{copy.provisional}</p>}</section>
          <h4 className="text-sm text-primary">{copy.labels[5]}</h4>
          <div className="grid gap-3 sm:grid-cols-2">{sixRoles.map(r => {
            const available = r === 'main' || full;
            return <article key={r} className="min-w-0 rounded-md border border-primary/25 p-4"><div className="flex items-center gap-3">{available && <span className="size-7 shrink-0 rounded-full border border-primary/30" style={{ backgroundColor: palette[r].code }} aria-hidden="true" />}<h5 className="text-sm text-primary">{r === 'mind' ? copy.protect : old.roles[r].label}</h5></div><p className="mt-3 text-xs leading-6">{available ? r === 'mind' ? copy.protectNote : old.roles[r].detail : old.locked}</p>{available && <p className="mt-3 text-xs text-primary">{localizeBirthColorName(palette[r].name, language)} · {palette[r].code}</p>}</article>;
          })}</div>
          {full && <p className="text-xs leading-6"><Palette className="mr-2 inline size-4 text-primary" />{copy.palette} · {localizeBirthColorName(palette.sub.name, language)} · {palette.sub.code}</p>}
        </TabsContent>
        <TabsContent value="2" className="space-y-5">
          <h3 className="flex items-center gap-2 font-serif text-lg"><Leaf className="size-5 text-primary" />{copy.titles[2]}</h3>
          <h4 className="text-sm text-primary">{copy.labels[6]}</h4><ul className="space-y-3">{copy.daily.map(item => <li key={item} className="border-b border-primary/15 pb-3 text-sm leading-7">{item}</li>)}</ul>
          <h4 className="text-sm text-primary">{copy.labels[7]}</h4>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label={copy.labels[7]}>{copy.scenes.map((label, i) => { const Icon = [BriefcaseBusiness, Leaf, Heart][i] ?? Leaf; return <Button key={label} variant="outline" aria-pressed={scene === i} onClick={() => setScene(i)} className={`h-auto min-h-16 flex-col whitespace-normal px-2 text-xs ${scene === i ? 'border-primary bg-primary/15' : 'bg-transparent'}`}><Icon className="size-4 text-primary" />{label}</Button>; })}</div>
          <div aria-live="polite" className="border-l-2 border-primary pl-4"><p className="text-sm leading-7">{copy.sceneTips[scene]}</p>{full && <p className="mt-3 text-xs text-primary">{old.roles[sceneRole].label} · {localizeBirthColorName(palette[sceneRole].name, language)}</p>}</div>
        </TabsContent>
        <p className="mt-7 border-t border-primary/20 pt-4 text-xs leading-6">{old.dialogNote}</p>
      </div>
    </Tabs>
  </DialogContent>;
}
