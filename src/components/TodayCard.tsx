import type { ReactNode, CSSProperties } from 'react';
import { ChevronDown, Crown, Eye, LockKeyhole } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { consultationUxCopy } from '@/lib/consultation-ux-copy';
import { focusCopy } from '@/lib/focus';
import type { Language } from '@/lib/translations';

/** Collapsible Today card: only the heading shows until the user taps it open. */
export function TodayCard({ id, title, children, className = '', style, summary, defaultOpen = false }: { id: string; title: string; children: ReactNode; className?: string; style?: CSSProperties | undefined; summary?: ReactNode; defaultOpen?: boolean }) {
  return <section id={id} aria-label={title} style={style} className={`today-feature design-daily-panel card-lux min-w-0 w-full max-w-full rounded-lg p-3 md:p-5 ${className}`}>
    <details open={defaultOpen || undefined} className="group">
      <summary className="flex cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">{summary ?? <h3 className="font-serif text-lg text-foreground">{title}</h3>}</div>
        <ChevronDown aria-hidden="true" className="mt-1.5 size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  </section>;
}

export function TodayLockedGuide({ language, title, teaser, onUpgrade, sampleText }: { language: Language; title: string; teaser: string; onUpgrade: () => void; sampleText?: string }) {
  const t = consultationUxCopy[language];
  return <div className="relative overflow-hidden rounded-md border border-primary/20 p-3">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-champagne-gradient opacity-10 blur-sm" />
    <div className="relative flex flex-col items-center gap-2 text-center">
      <LockKeyhole className="size-5 text-primary" /><p className="text-sm font-medium text-foreground">✦ {teaser}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className="border-primary/40"><Eye className="size-3.5" />{t.sample}</Button></DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto border-primary/35"><DialogHeader><DialogDescription>{t.sample}</DialogDescription><DialogTitle className="font-serif text-primary">{title}</DialogTitle></DialogHeader><p className="whitespace-pre-line text-sm leading-7">{sampleText ?? teaser}</p><Button variant="champagne" onClick={onUpgrade}><Crown className="size-4" />{focusCopy[language].seePlans}</Button></DialogContent>
        </Dialog>
        <Button size="sm" variant="champagne" onClick={onUpgrade}><Crown className="size-3.5" />{focusCopy[language].seePlans}</Button>
      </div>
    </div>
  </div>;
}