import type { ReactNode, CSSProperties } from 'react';
import { Crown, Eye, LockKeyhole } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { consultationUxCopy } from '@/lib/consultation-ux-copy';
import { focusCopy } from '@/lib/focus';
import type { Language } from '@/lib/translations';

export function TodayCard({ id, title, children, className = '', style }: { id: string; title: string; children: ReactNode; className?: string; style?: CSSProperties | undefined }) {
  return <section id={id} aria-label={title} style={style} className={`today-feature design-daily-panel card-lux min-w-0 w-full max-w-full rounded-lg p-3 md:p-5 ${className}`}>{children}</section>;
}

export function TodayLockedGuide({ language, title, teaser, onUpgrade }: { language: Language; title: string; teaser: string; onUpgrade: () => void }) {
  const t = consultationUxCopy[language];
  return <div className="relative overflow-hidden rounded-md border border-primary/20 p-3">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-champagne-gradient opacity-10 blur-sm" />
    <div className="relative flex flex-col items-center gap-2 text-center">
      <LockKeyhole className="size-5 text-primary" /><p className="text-sm font-medium text-foreground">✦ {teaser}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Dialog><DialogTrigger asChild><Button size="sm" variant="outline" className="border-primary/40"><Eye className="size-3.5" />{t.sample}</Button></DialogTrigger>
          <DialogContent className="max-h-[90dvh] overflow-y-auto border-primary/35"><DialogHeader><DialogDescription>{t.sample}</DialogDescription><DialogTitle className="font-serif text-primary">{title}</DialogTitle></DialogHeader><p className="text-sm leading-7">{t.intro}</p><div className="relative h-36 overflow-hidden rounded-md border border-primary/15"><p aria-hidden="true" className="p-3 text-sm leading-7">{t.body}</p><div className="pointer-events-none absolute inset-0 bg-background/60 backdrop-blur-md" /><div className="absolute inset-0 flex items-center justify-center gap-2 px-3 text-xs text-primary"><LockKeyhole className="size-4" />{t.continuation}</div></div><Button variant="champagne" onClick={onUpgrade}><Crown className="size-4" />{focusCopy[language].seePlans}</Button></DialogContent>
        </Dialog>
        <Button size="sm" variant="champagne" onClick={onUpgrade}><Crown className="size-3.5" />{focusCopy[language].seePlans}</Button>
      </div>
    </div>
  </div>;
}