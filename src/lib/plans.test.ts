import { describe, expect, it } from 'vitest';
import { isUpgradePlan, planOrder, canUse } from './plans';
describe('plan value display', () => {
  it('removes current and lower sales plans for every tier', () => {
    planOrder.forEach((current, i) => {
      expect(planOrder.filter(candidate => isUpgradePlan(current, candidate))).toEqual(planOrder.slice(i + 1));
    });
  });
  it('keeps paid calendar and enterprise gates distinct', () => {
    expect(canUse('free', 'helioPersonal')).toBe(false);
    expect(canUse('standard', 'helioPersonal')).toBe(true);
    expect(canUse('vip', 'helioBusiness')).toBe(false);
    expect(canUse('b2b', 'helioBusiness')).toBe(true);
  });
});