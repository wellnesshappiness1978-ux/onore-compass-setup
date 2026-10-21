import { useEffect, useState } from 'react';
import { BellOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PAUSE_KEY, REMINDER_EVENT, remindersPaused, setRemindersPaused } from '@/lib/daily-reminders';
import { reminderCopy } from '@/lib/reminder-copy';
import type { Language } from '@/lib/translations';

export default function ReminderMasterSwitch({ language }: { language: Language }) {
  const [paused, setPaused] = useState(false);
  const t = reminderCopy[language];
  useEffect(() => {
    const sync = () => setPaused(remindersPaused());
    const storage = (event: StorageEvent) => { if (event.key === PAUSE_KEY || event.key === null) sync(); };
    sync(); window.addEventListener(REMINDER_EVENT, sync); window.addEventListener('storage', storage);
    return () => { window.removeEventListener(REMINDER_EVENT, sync); window.removeEventListener('storage', storage); };
  }, []);
  return <section className="mt-5 border-t border-primary/20 pt-4">
    <label className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
      <span className="flex min-w-0 items-center gap-2"><BellOff className="size-5 shrink-0" />{t.pause}</span>
      <Switch checked={paused} aria-label={t.pause} onCheckedChange={value => { try { setRemindersPaused(value); } catch { /* retain current state if storage unavailable */ } }} />
    </label>
    <p className="mt-2 text-xs leading-6 text-muted-foreground">{t.pauseNote}</p>
    <p className="mt-1 text-xs text-muted-foreground">{t.openOnly}</p>
  </section>;
}