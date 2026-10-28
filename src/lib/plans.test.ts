import { describe, expect, it } from 'vitest';
import { hasFeature, memberLimit, isUpgradePlan, planForCount, planOrder, canUse, consultationDailyLimit, dailyUsageLimit, currentAndHigherPlans, nextPlan } from './plans';
describe('consultation limits', () => {
  it.each([['free', 1], ['standard', 3], ['vip', 10], ['b2b', 30], ['b2b-premium', 100]] as const)('%s allows %s consultations per day', (plan, cap) => {
    expect(consultationDailyLimit[plan]).toBe(cap);
  });
  it('does not change compatibility limits', () => {
    expect(planOrder.map(plan => dailyUsageLimit[plan])).toEqual([1, 3, 10, 30, 100]);
  });
});
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
  it('unlocks the mandala at Standard and Cosmic Genesis at VIP', () => {
    expect(planOrder.map(plan => canUse(plan, 'mandalaArt'))).toEqual([false, true, true, true, true]);
    expect(planOrder.map(plan => canUse(plan, 'cosmicGenesisArt'))).toEqual([false, false, true, true, true]);
  });
});describe('today features', () => {
  it('keeps the requested order and plan gates', async () => {
    const { todayFeatures, canUseToday } = await import('./plans');
    expect(todayFeatures.map(f => f.id)).toEqual(['decision','starPath','dailyLucky','direction','shopping','health','monthlyLucky','relations','biorhythm365','helio']);
    const order = ['free','standard','vip','b2b','b2b-premium'];
    const ranks = todayFeatures.map(f => order.indexOf(f.min));
    const ordered = ranks.slice(0, -1); expect([...ordered].sort((a, b) => a - b)).toEqual(ordered);
    expect(canUseToday('standard', 'relations')).toBe(false);
    expect(canUseToday('vip', 'relations')).toBe(true);
    expect(canUseToday('standard', 'monthlyLucky')).toBe(false);
    expect(canUseToday('vip', 'monthlyLucky')).toBe(true);
    expect(canUseToday('free', 'helio')).toBe(true);
    expect(canUseToday('free', 'dailyLucky')).toBe(true);
  });
});

describe('unified AI daily caps', () => {
  it('consultation and compatibility share 1/3/10/30/100', () => {
    expect(planOrder.map(p => consultationDailyLimit[p])).toEqual([1, 3, 10, 30, 100]);
    expect(planOrder.map(p => dailyUsageLimit[p])).toEqual([1, 3, 10, 30, 100]);
  });
  it('Family tools need Family, 100 members only Premium', () => {
    expect(hasFeature('vip', 'teamDiagnosis')).toBe(false);
    expect(hasFeature('b2b', 'teamDiagnosis')).toBe(true);
    expect(memberLimit.b2b).toBe(30);
    expect(memberLimit['b2b-premium']).toBe(100);
  });
});

describe('plan comparison visibility', () => {
  it('shows the current plan and higher tiers only, never lower ones', () => {
    expect(currentAndHigherPlans('free')).toEqual(planOrder);
    expect(currentAndHigherPlans('standard')).toEqual(['standard', 'vip', 'b2b', 'b2b-premium']);
    expect(currentAndHigherPlans('vip')).toEqual(['vip', 'b2b', 'b2b-premium']);
    expect(currentAndHigherPlans('b2b')).toEqual(['b2b', 'b2b-premium']);
    expect(currentAndHigherPlans('b2b-premium')).toEqual(['b2b-premium']);
  });
  it('has no upgrade beyond the top plan', () => {
    expect(nextPlan('b2b-premium')).toBeNull();
    expect(nextPlan('standard')).toBe('vip');
  });
});
