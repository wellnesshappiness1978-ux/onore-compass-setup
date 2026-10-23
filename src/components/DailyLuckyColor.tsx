import type { CSSProperties } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { dailyColorCopy } from '@/lib/daily-color-copy';
import { colorReference, colorReferenceCopy } from '@/lib/color-reference';
import { todayAccessCopy } from '@/lib/today-access-copy';
import type { Language } from '@/lib/translations';

export default function DailyLuckyColor({ hex, name, reason, language }: { hex: string; name: string; reason?: string; language: Language }) {
  const safeHex = /^#[0-9a-f]{6}$/i.test(hex) ? hex : 'var(--primary)';
  const t = dailyColorCopy[language];
  const cue = colorReferenceCopy[language].cues[colorReference(/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#D4AF37').index];
  const colorStyle = { '--daily-color': safeHex } as CSSProperties;
  return <Dialog><DialogTrigger asChild><Button variant="outline" style={colorStyle} className="lucky-color-surface grid h-auto min-h-28 w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] gap-3 whitespace-normal p-4 text-left text-foreground">
    <span className="lucky-color-chip grid size-14 shrink-0 place-items-center rounded-full" aria-hidden><Sparkles className="size-5 text-foreground" /></span>
    <span className="min-w-0"><span className="block text-sm text-primary">{todayAccessCopy[language].color}</span><strong className="mt-1 block break-words font-serif text-xl">{name}</strong>{reason && <span className="mt-2 block text-sm font-normal leading-6">{reason}</span>}</span><ChevronRight className="size-4 shrink-0 text-primary" />
  </Button></DialogTrigger><DialogContent style={colorStyle} className="lucky-color-surface"><DialogTitle>{name}</DialogTitle><DialogDescription>{todayAccessCopy[language].color}</DialogDescription><span aria-hidden className="lucky-color-chip mx-auto block size-20 rounded-full" /><section><h3 className="font-serif text-primary">{t.meaning}</h3><p className="mt-2 text-sm leading-7">{reason}</p><p className="mt-2 text-sm leading-7">{cue}</p></section><section><h3 className="font-serif text-primary">{t.wear}</h3><p className="mt-2 text-sm leading-7">{t.idea}</p></section><p className="text-xs leading-6 text-muted-foreground">{t.note}</p></DialogContent></Dialog>;
}