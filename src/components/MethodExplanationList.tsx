import type { ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { integratedArts } from '@/lib/integrated-arts';
import type { ApproachKey } from '@/lib/trait-reading';
import type { Language } from '@/lib/translations';
import { allBranches, allSigns } from '@/lib/zodiac-signs';

export default function MethodExplanationList({ language, detail }: { language: Language; detail?: (key: ApproachKey) => ReactNode }) {
  return <Accordion type="multiple" className="mt-3 space-y-2">
    {integratedArts(language).map((method, i) => <AccordionItem key={method.key} value={method.key} className="min-w-0 rounded-md border border-primary/25 bg-background/40 px-4">
      <AccordionTrigger onMouseDown={e => e.preventDefault()} className="min-h-16 min-w-0 gap-3 text-left hover:no-underline"><span className="flex min-w-0 items-center gap-3"><span className="shrink-0 font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span><span className="min-w-0 break-words font-serif text-base text-foreground">{method.title}</span></span></AccordionTrigger>
      <AccordionContent className="min-w-0 space-y-4 text-[15px] leading-7 text-foreground [overflow-wrap:anywhere]">
        <p>{method.overview}</p>{method.background && <p>{method.background}</p>}{method.scope && <p className="border-l-2 border-primary/40 pl-3">{method.scope}</p>}
        {(method.key === 'western' || method.key === 'eastern') && <div className="grid grid-cols-1 gap-2 border-t border-primary/20 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {(method.key === 'western' ? allSigns(language).map(s => ({ name: `${s.symbol} ${s.name}`, caption: `${s.element} · ${s.quality}`, text: s.traits })) : allBranches(language).map(b => ({ name: `${b.name} (${b.animal})`, caption: `${b.element} · ${b.yinYang}`, text: b.traits }))).map(s => <div key={s.name} className="min-w-0 rounded-md border border-primary/20 bg-card/50 p-3"><p className="font-serif text-base text-foreground">{s.name}</p><p className="text-xs text-primary">{s.caption}</p><p className="mt-1 text-sm leading-6">{s.text}</p></div>)}
        </div>}
        {detail?.(method.key)}
      </AccordionContent>
    </AccordionItem>)}
  </Accordion>;
}