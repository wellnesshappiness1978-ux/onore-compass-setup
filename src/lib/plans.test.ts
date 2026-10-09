import { describe, expect, it } from 'vitest';
import { isUpgradePlan, planForCount, planOrder, canUse } from './plans';
describe('plan value display', () => {
  it('removes current and lower sales plans for every tier', () => {
    planOrder.forEach((current, i) => {
      expect(planOrder.filter(candidate => isUpgradePlan(current, candidate))).toEqual(planOrder.slice(i + 1));
    });
  });
  it('maps Family registration boundaries to the smallest fitting plan', () => {
    expect([3, 4, 10, 11, 30, 31, 100, 101].map(planForCount)).toEqual([
      'standard', 'vip', 'vip', 'b2b', 'b2b', 'b2b-premium', 'b2b-premium', null,
    ]);
  });
  it('keeps paid calendar and family gates distinct', () => {
    expect(canUse('free', 'helioPersonal')).toBe(false);
    expect(canUse('standard', 'helioPersonal')).toBe(true);
    expect(canUse('vip', 'helioBusiness')).toBe(false);
    expect(canUse('b2b', 'helioBusiness')).toBe(true);
  });
});