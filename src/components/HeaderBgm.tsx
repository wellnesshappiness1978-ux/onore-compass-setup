import { useState, useSyncExternalStore } from "react";
import { BellRing, ChevronDown, Music2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import SolfeggioPlayer from "./SolfeggioPlayer";
import { getPianoState, playPiano, stopPiano, subscribePiano } from "@/lib/piano-store";
import { pianoExtraCopy } from "@/lib/piano-copy";
import { canPlayFullBgm, canUseBgmNotify } from '@/lib/daily-reminders';
import BgmReminderSettings from './BgmReminderSettings';
import { reminderUiCopy } from '@/lib/reminder-ui-copy';
import { reminderCopy } from '@/lib/reminder-copy';
import type { Plan } from "@/lib/design-modes";
import type { Language } from "@/lib/translations";

const labels: Record<Language, { title: string; play: string; stop: string }> = {
  ja: { title: "星音のBGM", play: "BGMを再生", stop: "BGMを停止" },
  en: { title: "Celestial BGM", play: "Play music", stop: "Stop music" },
  "zh-CN": { title: "星音BGM", play: "播放音乐", stop: "停止音乐" },
  "zh-TW": { title: "星音BGM", play: "播放音樂", stop: "停止音樂" },
  ko: { title: "별빛 BGM", play: "음악 재생", stop: "음악 정지" },
  es: { title: "BGM celeste", play: "Reproducir música", stop: "Detener música" },
  fr: { title: "BGM céleste", play: "Lire la musique", stop: "Arrêter la musique" },
};

export default function HeaderBgm({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const [open, setOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [upsell, setUpsell] = useState(false);
  const { playing, busy, hz } = useSyncExternalStore(subscribePiano, getPianoState, getPianoState);
  const sampleOnly = !canPlayFullBgm(plan);
  const text = labels[language];
  const extra = pianoExtraCopy[language];
  const sampleEnd = () => setUpsell(true);
  return <div className="flex min-w-0 items-center gap-0.5" data-no-swipe>
    <Button size="icon" variant="ghost" disabled={busy} aria-label={playing ? text.stop : text.play} title={playing ? text.stop : text.play} aria-pressed={playing} className="size-10 shrink-0 text-primary" onClick={() => playing ? stopPiano() : void playPiano(sampleOnly ? 528 : hz, sampleOnly ? 20 : undefined, sampleEnd)}>{playing ? <Pause /> : <Play />}</Button>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" aria-label={text.title} title={text.title} className="h-10 min-w-0 gap-1 border-primary/30 bg-background px-2 text-primary"><Music2 className="size-4 shrink-0" /><span className="hidden min-w-0 truncate sm:inline">{text.title}</span><ChevronDown className="size-3 shrink-0" /></Button></PopoverTrigger>
      <PopoverContent align="end" sideOffset={12} collisionPadding={12} onOpenAutoFocus={e => e.preventDefault()} className="z-[80] max-h-[calc(100dvh-var(--preview-bar-height)-90px)] w-[min(360px,calc(100vw-24px))] overflow-y-auto border-primary/35 bg-card text-foreground">
        <h2 className="mb-3 font-serif text-primary">{text.title}</h2>
        <SolfeggioPlayer controlsOnly language={language} sampleOnly={sampleOnly} onSampleEnd={sampleEnd} />
        {canUseBgmNotify(plan) && <Button variant="outline" className="mt-3 w-full whitespace-normal" onClick={() => { setOpen(false); setReminderOpen(true); }}><BellRing className="size-4" />{reminderUiCopy[language].daily}</Button>}
      </PopoverContent>
    </Popover>
    <Dialog open={reminderOpen && canUseBgmNotify(plan)} onOpenChange={setReminderOpen}><DialogContent className="z-[200] max-h-[85dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto border-primary/40"><DialogTitle>{reminderUiCopy[language].daily}</DialogTitle><DialogDescription>{reminderCopy[language].bgm}</DialogDescription><BgmReminderSettings language={language} /></DialogContent></Dialog>
    <Dialog open={upsell} onOpenChange={setUpsell}><DialogContent className="z-[200] max-w-sm border-primary/40"><DialogTitle>{extra.upgradeTitle}</DialogTitle><DialogDescription>{extra.upgradeBody}</DialogDescription><Button onClick={() => { setUpsell(false); setOpen(false); onUpgrade(); }}>{extra.seePlans}</Button></DialogContent></Dialog>
  </div>;
}