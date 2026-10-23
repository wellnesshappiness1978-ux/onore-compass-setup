import { useEffect } from 'react';
import FeatureNotifySwitch from './FeatureNotifySwitch';
import SolfeggioPlayer from './SolfeggioPlayer';
import { getPianoState, setPianoHz, setPianoVolume, subscribePiano } from '@/lib/piano-store';
import { BGM_PREF_KEY, validBgmPreference } from '@/lib/reminder-preferences';
import { reminderCopy } from '@/lib/reminder-copy';
import type { Language } from '@/lib/translations';
export default function BgmReminderSettings({ language }: { language: Language }) {
 const t = reminderCopy[language];
 useEffect(() => {
  try { const saved = validBgmPreference(JSON.parse(localStorage.getItem(BGM_PREF_KEY) ?? 'null')); if (saved && !getPianoState().playing) { setPianoHz(saved.hz); setPianoVolume(saved.volume); } } catch { /* defaults */ }
  return subscribePiano(() => { const { hz, volume } = getPianoState(); try { localStorage.setItem(BGM_PREF_KEY, JSON.stringify({ hz, volume })); } catch { /* storage unavailable */ } });
 }, []);
 return <div className="min-w-0 space-y-3"><p className="text-sm leading-7 text-foreground">{t.bgmBody}</p><SolfeggioPlayer controlsOnly frequencySelect language={language} /><FeatureNotifySwitch id="bgm" title={t.bgm} body={t.bgmBody} language={language} /></div>;
}
