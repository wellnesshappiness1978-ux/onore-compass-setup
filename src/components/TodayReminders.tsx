import { useEffect, useState } from 'react';
import { Crown, Moon, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { canUseToday, todayFeatures } from '@/lib/plans';
import { canUseBgmNotify, canUseEveningReset } from '@/lib/daily-reminders';
import { reminderCopy } from '@/lib/reminder-copy';
import { eveningCopy, eveningReading } from '@/lib/evening-reset';
import { localIso, personal } from '@/lib/day-compass';
import { goalText } from '@/lib/focus';
import type { Language } from '@/lib/translations';
import type { Plan } from '@/lib/design-modes';
import { useFocus } from './FocusProvider';
import FeatureNotifySwitch, { registerReminderFallbacks } from './FeatureNotifySwitch';

/** Keeps one allowed reminder catalogue active across tab navigation, not just while Today is mounted. */
export function DailyReminderCatalogue({ language, plan }: { language: Language; plan: Plan }) {
  const focus = useFocus();
  const t = reminderCopy[language];
  const [day, setDay] = useState(() => '');
  useEffect(() => { const tick = () => setDay(localIso(new Date())); tick(); const id = setInterval(tick, 30_000); return () => clearInterval(id); }, []);
  useEffect(() => {
    const members = focus?.group?.members;
    const date = new Date();
    const total = members?.length ? members.reduce((sum, member) => sum + personal(member.birthDate, date).total, 0) / members.length : personal(focus?.readingProfile.birthDate ?? '', date).total;
    const entries: Record<string, { title: string; body: string }> = Object.fromEntries(todayFeatures.filter(f => canUseToday(plan, f.id)).map(f => [f.id, { title: t.today, body: `${day} · ${focus?.label(language) ?? ''} · ${t.today}` }]));
    entries['biorhythmAlert'] = { title: t.alert, body: total < 45 ? t.alertLow : t.alertOk };
    if (canUseBgmNotify(plan)) entries['bgm'] = { title: t.bgm, body: t.bgmBody };
    if (canUseEveningReset(plan)) entries['eveningReset'] = { title: t.night, body: t.nightTeaser };
    return registerReminderFallbacks(entries);
  }, [language, plan, t, day, focus?.readingProfile, focus?.group, focus?.label]);
  return null;
}

export default function TodayReminders({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const t = reminderCopy[language];
  const focus = useFocus();
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const members = focus?.group?.members;
  const total = members?.length ? members.reduce((sum, m) => sum + personal(m.birthDate, today).total, 0) / members.length : personal(focus?.readingProfile.birthDate ?? '', today).total;
  const next = members?.length ? members.reduce((sum, m) => sum + personal(m.birthDate, tomorrow).total, 0) / members.length : personal(focus?.readingProfile.birthDate ?? '', tomorrow).total;
  const sections = eveningReading(language, { name: focus?.label(language) ?? '', date: localIso(today), tomorrow: Math.round(next), day: Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()) - Date.UTC(today.getFullYear(),0,1)) / 86400000) + 1, goal: focus ? goalText(focus.focus,language) : '' });
  const locked = (title: string) => <><p className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"><Crown className="size-4 shrink-0" />{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{t.nightTeaser}</p><Button variant="outline" size="sm" className="mt-3" onClick={onUpgrade}><Crown className="size-4" />{t.plans}</Button></>;
  return <>
    <section id="today-bgm" className="border-y border-primary/25 py-5">
      <h3 className="flex items-center gap-2 font-serif text-lg text-primary"><Music2 className="size-5 shrink-0" />{t.bgm}</h3>
      {canUseBgmNotify(plan) ? <FeatureNotifySwitch id="bgm" title={t.bgm} body={t.bgmBody} language={language} /> : <><p className="mt-2 text-sm leading-6">{t.vipBenefit}</p><Button variant="outline" size="sm" className="mt-3" onClick={onUpgrade}>{t.plans}</Button></>}
      <FeatureNotifySwitch id="biorhythmAlert" title={t.alert} body={total < 45 ? t.alertLow : t.alertOk} language={language} variant="center" />
    </section>
    <section id="today-evening-reset" className="border-b border-primary/25 py-5">
      <h3 className="flex items-center gap-2 font-serif text-xl text-primary"><Moon className="size-5 shrink-0" />{t.night}</h3>
      {canUseEveningReset(plan) ? <><p className="mt-2 text-xs text-muted-foreground">{localIso(today)} · {focus?.label(language)}</p><div className="mt-5 space-y-5">{sections.map((s,i) => <article key={i} className="border-l border-primary/40 pl-3"><h4 className="font-serif text-base text-primary">{s.title}</h4><p className="mt-2 text-sm leading-7 text-foreground">{s.body}</p></article>)}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">{eveningCopy[language].disclaimer}</p><FeatureNotifySwitch id="eveningReset" title={t.night} body={t.nightTeaser} language={language} /></> : locked(t.nightLocked)}
    </section>
  </>;
}