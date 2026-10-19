import { describe, expect, it } from 'vitest';
import { todayBenefitCategories, todayBenefitCount, higherTodayBenefits } from './today-benefits';
import { canUseToday, planOrder } from './plans';
describe('twelve grouped Today benefits', () => {
  it.each([['free',2],['standard',6],['vip',10],['b2b',11],['b2b-premium',12]] as const)('%s shows %i of twelve', (plan,count) => {
    expect(todayBenefitCategories).toHaveLength(12);
    expect(todayBenefitCount(plan)).toBe(count);
  });
  it('VIP still has Family and Premium categories ahead', () => {
    expect(higherTodayBenefits('vip').map(v=>v.tier)).toEqual(['b2b','b2b-premium']);
  });
  it('the display catalogue does not remove Free lucky picks or calendar access', () => {
    expect(canUseToday('free','dailyLucky')).toBe(true);
    expect(canUseToday('free','helio')).toBe(true);
    expect(planOrder.map(p=>canUseToday(p,'familyRoadmap'))).toEqual([false,false,false,true,true]);
  });
});