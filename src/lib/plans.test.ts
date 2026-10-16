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
