import { personal, directionEnergy } from './day-compass';
import type { TodayFortuneRequest } from './today-fortune';

/** Never substitute the owner's birthday for a group: aggregate each available member separately. */
export function subjectSignals(members: { birthDate: string }[], date: Date) {
  const values = members.filter(m => m.birthDate).map(m => personal(m.birthDate, date));
  const mean = (key: 'total' | 'physical' | 'emotional' | 'intellectual') => values.length ? values.reduce((s, r) => s + r[key], 0) / values.length : 0;
  return { total: mean('total'), physical: mean('physical'), emotional: mean('emotional'), intellectual: mean('intellectual') };
}
export function subjectDirections(members: { birthDate: string }[], date: Date) {
  const lists = members.filter(m => m.birthDate).map(m => directionEnergy(m.birthDate, date));
  return (lists[0] ?? directionEnergy('', date)).map(e => ({ ...e, score: lists.length ? Math.round(lists.reduce((s, list) => s + (list.find(x => x.dir === e.dir)?.score ?? 0), 0) / lists.length) : e.score })).sort((a, b) => b.score - a.score);
}
/** Complete input fingerprint prevents stale owner/member/group readings after profile changes. */
export function fortuneFingerprint(r: Pick<TodayFortuneRequest, 'members' | 'subject'>) {
  return JSON.stringify({ subject: r.subject, members: r.members });
}