import { expect, it } from 'vitest';
import { familyPlanning, familyDirectionDay, rhythmWindow } from './family-planning';
import type { TeamMember } from './team-analysis';
const member = (id: string, birthDate: string, gender = 'male'): TeamMember => ({ id, name: id, birthDate, gender, bloodType: '', role: '', skills: [] });
it('compares every member on the same 30-day timeline and retains individual waves', () => {
  const result = familyPlanning([member('a','1980-02-12'),member('b','1988-08-10')], '2026-10-26');
  expect(result.timeline).toHaveLength(30);
  expect(result.timeline[29]?.day).toBe('2026-11-24');
  expect(result.timeline.every(d => d.readings.map(r => r.id).join(',') === 'a,b')).toBe(true);
  expect(result.timeline.every(d => d.synchrony <= d.mean + 1)).toBe(true);
});
it('never calls a direction common when gender-dependent inputs are missing', () => {
  const result = familyDirectionDay([member('a','1980-02-12'),member('b','1988-08-10','undisclosed')], '2026-10-26');
  expect(result.common).toEqual([]); expect(result.missing).toEqual(['b']);
  expect(result.ranked).toHaveLength(8);
});
it('common directions require agreement from every calculated member', () => {
  const result = familyDirectionDay([member('a','1980-02-12'),member('b','1980-02-12')], '2026-10-26');
  expect(result.common).toHaveLength(4);
  expect(result.ranked.filter(r => r.common).every(r => r.perMember.every(p => p.favorable))).toBe(true);
});
it('highest synchrony requires every member to meet the high-wave threshold', () => {
  const days = rhythmWindow([member('a','1980-02-12'),member('b','1988-08-10')], '2026-10-26');
  expect(days.every(d => !d.allHigh || d.readings.every(r => r.total >= 65 && r.emotional > 0))).toBe(true);
  expect(days.some(d => d.caution)).toBe(true);
  expect(familyPlanning([], '2026-10-26').dates.every(d => d.score === 0)).toBe(true);
});