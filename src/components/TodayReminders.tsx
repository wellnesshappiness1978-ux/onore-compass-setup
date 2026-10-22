import { useEffect, useState } from 'react';
import { Moon, Music2 } from 'lucide-react';
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
import { TodayCard, TodayLockedGuide } from './TodayCard';
import SolfeggioPlayer from './SolfeggioPlayer';
import { todayAccessCopy } from '@/lib/today-access-copy';
import { todaySample } from '@/lib/today-samples';
import { getPianoState, setPianoHz, setPianoVolume, subscribePiano } from '@/lib/piano-store';
import { BGM_PREF_KEY, validBgmPreference } from '@/lib/reminder-preferences';

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

export default function TodayReminders({ language, plan, onUpgrade, kind }: { language: Language; plan: Plan; onUpgrade: () => void; kind: 'bgm' | 'evening' }) {
  const t = reminderCopy[language];
  const focus = useFocus();
  useEffect(() => {
    if (kind !== 'bgm' || !canUseBgmNotify(plan)) return;
    try { const saved = validBgmPreference(JSON.parse(localStorage.getItem(BGM_PREF_KEY) ?? 'null')); if (saved && !getPianoState().playing) { setPianoHz(saved.hz); setPianoVolume(saved.volume); } } catch { /* retain defaults */ }
    return subscribePiano(() => { const { hz, volume } = getPianoState(); try { localStorage.setItem(BGM_PREF_KEY, JSON.stringify({ hz, volume })); } catch { /* storage disabled */ } });
  }, [kind, plan]);
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const members = focus?.group?.members;
  const total = members?.length ? members.reduce((sum, m) => sum + personal(m.birthDate, today).total, 0) / members.length : personal(focus?.readingProfile.birthDate ?? '', today).total;
  const next = members?.length ? members.reduce((sum, m) => sum + personal(m.birthDate, tomorrow).total, 0) / members.length : personal(focus?.readingProfile.birthDate ?? '', tomorrow).total;
  const sections = eveningReading(language, { name: focus?.label(language) ?? '', date: localIso(today), tomorrow: Math.round(next), day: Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()) - Date.UTC(today.getFullYear(),0,1)) / 86400000) + 1, goal: focus ? goalText(focus.focus,language) : '' });
  if (kind === 'bgm') return <TodayCard id="today-bgm" title={t.bgm}>
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"><h3 className="flex min-w-0 items-start gap-2 font-serif text-lg text-foreground"><Music2 className="mt-1 size-4 shrink-0 text-primary" /><span className="min-w-0 break-words">{t.bgm}</span></h3>{!canUseBgmNotify(plan) && <span className="rounded-md border border-primary/30 px-2 py-0.5 text-[10px] text-primary">VIP+</span>}</div>
      {canUseBgmNotify(plan) ? <><p className="text-sm leading-7 text-foreground">{t.bgmBody}</p><SolfeggioPlayer controlsOnly language={language} /><FeatureNotifySwitch id="bgm" title={t.bgm} body={t.bgmBody} language={language} /></> : <TodayLockedGuide language={language} title={t.bgm} teaser={t.bgmBody} sampleText={t.bgmBody} onUpgrade={onUpgrade} />}
      <FeatureNotifySwitch id="biorhythmAlert" title={t.alert} body={total < 45 ? t.alertLow : t.alertOk} language={language} variant="center" />
    </TodayCard>;
  return <TodayCard id="today-evening-reset" title={t.night}>
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2"><h3 className="flex min-w-0 items-start gap-2 font-serif text-lg text-foreground"><Moon className="mt-1 size-4 shrink-0 text-primary" /><span className="min-w-0 break-words">{t.night}</span></h3>{!canUseEveningReset(plan) && <span className="rounded-md border border-primary/30 px-2 py-0.5 text-[10px] text-primary">VIP+</span>}</div>
      {canUseEveningReset(plan) ? <><p className="mt-2 text-xs text-muted-foreground">{localIso(today)} · {focus?.label(language)}</p><div className="mt-5 space-y-5">{sections.map((s,i) => <article key={i} className="border-l border-primary/40 pl-3"><h4 className="font-serif text-base text-primary">{s.title}</h4><p className="mt-2 text-sm leading-7 text-foreground">{s.body}</p></article>)}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">{eveningCopy[language].disclaimer}</p><FeatureNotifySwitch id="eveningReset" title={t.night} body={t.nightTeaser} language={language} /></> : <TodayLockedGuide language={language} title={t.night} teaser={t.nightTeaser} sampleText={`${todayAccessCopy[language].sample} ${todaySample('evening', language)}`} onUpgrade={onUpgrade} />}
    </TodayCard>;
}