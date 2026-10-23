import { MessageCircleHeart } from 'lucide-react';
import { useFocus } from './FocusProvider';
import { TodayLockedGuide } from './TodayCard';
import FeatureNotifySwitch from './FeatureNotifySwitch';
import { todayAccessCopy } from '@/lib/today-access-copy';
import { canUseToday } from '@/lib/plans';
import { focusCopy, goalPresets, memberDisplayName, memberToProfile } from '@/lib/focus';
import { selfReadingLabel } from '@/lib/focus';
import { analyzeCompatibility, partnerSchema } from '@/lib/compatibility-analysis';
import { kindFromRelationshipType } from '@/lib/compatibility-context';
import { groupTodayCopy, memberToday } from '@/lib/group-today';
import { localIso } from '@/lib/day-compass';
import type { Plan } from '@/lib/design-modes';
import type { Language } from '@/lib/translations';
import { todaySample } from '@/lib/today-samples';
import { relationshipGoalText } from '@/lib/reminder-preferences';
import { useRelationshipPreferences } from '@/hooks/use-relationship-preferences';
import { reminderUiCopy } from '@/lib/reminder-ui-copy';
import { SacredDisclosure } from './ui/sacred-disclosure';
import { Input } from './ui/input';
import { reminderCopy } from '@/lib/reminder-copy';

export default function DailyRelationshipGuide({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const ctx = useFocus();
  const { picked, goal: ownGoal, savePerson, saveGoal } = useRelationshipPreferences();
  const ui = reminderUiCopy[language];
  const f = focusCopy[language];
  const c = todayAccessCopy[language];
  const target = ctx?.members.find(m => m.id === picked) ?? ctx?.members[0];
  const day = localIso(new Date());
  const goal = relationshipGoalText(ownGoal, language);
  const subjects = ctx?.group ? ctx.group.members.filter(m => m.id !== target?.id).map(m => ({ profile: memberToProfile(m), name: memberDisplayName(m) })) : ctx ? [{ profile: ctx.member?.id === target?.id ? ctx.owner : ctx.readingProfile, name: ctx.member?.id === target?.id ? selfReadingLabel[language] : ctx.label(language) }] : [];
  const partner = target ? memberToProfile(target) : null;
  const input = partner ? partnerSchema.safeParse({ name: partner.nameKanji, nameKana: partner.nameKana, birthDate: partner.birthDate, birthTime: partner.birthTimeUnknown ? '' : partner.birthTime, birthPlace: partner.birthPlace, birthCity: partner.birthCity, gender: partner.gender, bloodType: partner.bloodType, siblingOrder: partner.siblingOrder }) : null;
  const readings = target && input?.success ? subjects.map(({ profile: p, name }) => ({ name, reading: analyzeCompatibility({ ...p, name: p.nameKanji }, input.data, language, { relationship: kindFromRelationshipType(target.relationshipType ?? ''), concern: goal }) })) : [];
  const rhythm = target ? memberToday(target, day) : null;
  const subjectRhythms = subjects.map(s => ({ name: s.name, rhythm: memberToday({ id: s.name, name: s.name, birthDate: s.profile.birthDate, gender: s.profile.gender ?? 'undisclosed', bloodType: s.profile.bloodType, role: '', skills: [] }, day) }));
  const g = groupTodayCopy[language];
  const body = target && rhythm ? `${memberDisplayName(target)} · ${g.band[rhythm.band]} · ${g.caution[rhythm.caution]} · ${goal}` : c.none;
  return <div id="settings-relations"><SacredDisclosure closeLabel={reminderCopy[language].close} title={<span className="flex items-start gap-2"><MessageCircleHeart className="mt-1 size-4 shrink-0 text-primary" /><span>{c.relations}</span></span>}>
    {canUseToday(plan, 'relations') ? <>
      <label className="mb-4 block text-sm text-primary">{ui.independent}<select aria-label={ui.independent} value={ownGoal.goalPreset} onChange={e => saveGoal({ ...ownGoal, goalPreset: e.target.value })} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="">{ui.free}</option>{goalPresets.map(p => <option key={p} value={p}>{f.presets[p]}</option>)}</select><Input className="mt-2" aria-label={`${ui.independent} · ${f.goalLabel}`} placeholder={f.goalPlaceholder} maxLength={200} value={ownGoal.goal} onChange={e => saveGoal({ ...ownGoal, goal: e.target.value })} /></label>
      {target ? <><label className="block text-sm text-primary">{c.choose}<select value={target.id} onChange={e => savePerson(e.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground">{ctx?.members.map(m => <option value={m.id} key={m.id}>{memberDisplayName(m)}</option>)}</select></label>
        <p className="mt-3 text-xs text-muted-foreground">{day} · {subjects.map(s => s.name).join(' / ')} → {memberDisplayName(target)}</p>
        {goal && <p className="mt-2 border-l-2 border-primary pl-3 text-sm">{goal}</p>}
        {rhythm && <p className="mt-3 text-sm leading-7">{g.band[rhythm.band]} · {g.caution[rhythm.caution]}</p>}
        {subjectRhythms.map(s => <p key={s.name} className="mt-2 text-sm leading-7">{s.name}：{g.caution[s.rhythm.caution]} / {memberDisplayName(target)}：{rhythm ? g.caution[rhythm.caution] : ''}</p>)}
        <div className="mt-4 space-y-4">{readings.map(({ name, reading }, i) => reading ? <div key={name + i} className="border-t border-primary/20 pt-3"><h4 className="font-serif text-primary">{name || selfReadingLabel[language]} × {memberDisplayName(target)}</h4>{reading.sentences.map((s, j) => <p key={j} className="mt-2 text-sm leading-7">{s}</p>)}<p className="mt-2 text-xs text-muted-foreground">{reading.note}</p></div> : null)}</div>
      </> : <p className="text-sm">{c.none}</p>}
      <FeatureNotifySwitch id="relations" title={c.relations} body={body} language={language} disabled={!target} lockedNote={c.none} />
    </> : <TodayLockedGuide language={language} title={c.relations} teaser={c.choose} sampleText={`${c.sample} ${todaySample('relations', language)}`} onUpgrade={onUpgrade} />}
  </SacredDisclosure></div>;
}