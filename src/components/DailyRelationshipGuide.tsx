import { useState } from 'react';
import { MessageCircleHeart } from 'lucide-react';
import { useFocus } from './FocusProvider';
import { TodayCard, TodayLockedGuide } from './TodayCard';
import FeatureNotifySwitch from './FeatureNotifySwitch';
import { todayAccessCopy } from '@/lib/today-access-copy';
import { canUseToday } from '@/lib/plans';
import { goalText, memberDisplayName, memberToProfile } from '@/lib/focus';
import { selfReadingLabel } from '@/lib/focus';
import { analyzeCompatibility, partnerSchema } from '@/lib/compatibility-analysis';
import { kindFromRelationshipType } from '@/lib/compatibility-context';
import { groupTodayCopy, memberToday } from '@/lib/group-today';
import { localIso } from '@/lib/day-compass';
import type { Plan } from '@/lib/design-modes';
import type { Language } from '@/lib/translations';
import { todaySample } from '@/lib/today-samples';

export default function DailyRelationshipGuide({ language, plan, onUpgrade }: { language: Language; plan: Plan; onUpgrade: () => void }) {
  const ctx = useFocus();
  const [picked, setPicked] = useState('');
  const c = todayAccessCopy[language];
  const target = ctx?.members.find(m => m.id === picked) ?? ctx?.members[0];
  const day = localIso(new Date());
  const goal = ctx ? goalText(ctx.focus, language) : '';
  const subjects = ctx?.group ? ctx.group.members.filter(m => m.id !== target?.id).map(m => ({ profile: memberToProfile(m), name: memberDisplayName(m) })) : ctx ? [{ profile: ctx.readingProfile, name: ctx.label(language) }] : [];
  const partner = target ? memberToProfile(target) : null;
  const input = partner ? partnerSchema.safeParse({ name: partner.nameKanji, nameKana: partner.nameKana, birthDate: partner.birthDate, birthTime: partner.birthTimeUnknown ? '' : partner.birthTime, birthPlace: partner.birthPlace, birthCity: partner.birthCity, gender: partner.gender, bloodType: partner.bloodType, siblingOrder: partner.siblingOrder }) : null;
  const readings = target && input?.success ? subjects.map(({ profile: p, name }) => ({ name, reading: analyzeCompatibility({ ...p, name: p.nameKanji }, input.data, language, { relationship: kindFromRelationshipType(target.relationshipType ?? ''), concern: goal }) })) : [];
  const rhythm = target ? memberToday(target, day) : null;
  const g = groupTodayCopy[language];
  const body = target && rhythm ? `${memberDisplayName(target)} · ${g.band[rhythm.band]} · ${g.caution[rhythm.caution]} · ${goal}` : c.none;
  return <TodayCard id="settings-relations" title={c.relations}>
    <h3 className="mb-3 flex items-start gap-2 font-serif text-lg"><MessageCircleHeart className="mt-1 size-4 shrink-0 text-primary" />{c.relations}</h3>
    {canUseToday(plan, 'relations') ? <>
      {target ? <><label className="block text-sm text-primary">{c.choose}<select value={target.id} onChange={e => setPicked(e.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground">{ctx?.members.map(m => <option value={m.id} key={m.id}>{memberDisplayName(m)}</option>)}</select></label>
        <p className="mt-3 text-xs text-muted-foreground">{day} · {ctx?.label(language)} → {memberDisplayName(target)}</p>
        {goal && <p className="mt-2 border-l-2 border-primary pl-3 text-sm">{goal}</p>}
        {rhythm && <p className="mt-3 text-sm leading-7">{g.band[rhythm.band]} · {g.caution[rhythm.caution]}</p>}
        <div className="mt-4 space-y-4">{readings.map(({ name, reading }, i) => reading ? <div key={name + i} className="border-t border-primary/20 pt-3"><h4 className="font-serif text-primary">{name || selfReadingLabel[language]} × {memberDisplayName(target)}</h4>{reading.sentences.map((s, j) => <p key={j} className="mt-2 text-sm leading-7">{s}</p>)}<p className="mt-2 text-xs text-muted-foreground">{reading.note}</p></div> : null)}</div>
      </> : <p className="text-sm">{c.none}</p>}
      <FeatureNotifySwitch id="relations" title={c.relations} body={body} language={language} disabled={!target} lockedNote={c.none} />
    </> : <TodayLockedGuide language={language} title={c.relations} teaser={c.choose} sampleText={`${c.sample} ${todaySample('relations', language)}`} onUpgrade={onUpgrade} />}
  </TodayCard>;
}