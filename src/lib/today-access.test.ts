import { expect, it } from 'vitest';
import { birthColorLimit, luckyFoodLimit, canReadThreeWaves, planOrder } from './plans';
import { subjectSignals, subjectDirections } from './today-subject';
import { personal } from './day-compass';
import { cacheKey } from './today-fortune';
it('Free unlocks exactly one birth color', () => expect(birthColorLimit('free')).toBe(1));
it('Free unlocks one food', () => expect(luckyFoodLimit.free).toBe(1));
it('Standard unlocks three foods', () => expect(luckyFoodLimit.standard).toBe(3));
it('VIP and above unlock all five foods', () => expect(planOrder.slice(2).map(p => luckyFoodLimit[p])).toEqual([5, 5, 5]));
it('three-wave detail requires Family or above', () => expect(planOrder.map(canReadThreeWaves)).toEqual([false, false, false, true, true]));
it('a group uses both members rather than an owner birthday', () => {
  const date = new Date('2026-10-22T12:00:00');
  const members = [{ birthDate: '1985-06-15' }, { birthDate: '1990-01-01' }];
  const r = subjectSignals(members, date);
  expect(r.total).toBe((personal(members[0]?.birthDate ?? '', date).total + personal(members[1]?.birthDate ?? '', date).total) / 2);
  expect(r.total).not.toBe(personal('2000-05-01', date).total);
  expect(subjectDirections(members, date)).toHaveLength(8);
});
it('changing a member profile invalidates the cached daily reading', () => {
  const member = { nameKanji: '', nameKana: '', nameRomaji: '', birthDate: '1990-01-01', birthTime: '', birthTimeUnknown: true, birthPlace: '', birthCity: '', bloodType: '', siblingOrder: '' };
  const req = { subject: { key: 'g-1' }, language: 'ja', day: '2026-10-22', members: [member] };
  expect(cacheKey(req)).not.toBe(cacheKey({ ...req, members: [{ ...member, birthDate: '1991-01-01' }] }));
});