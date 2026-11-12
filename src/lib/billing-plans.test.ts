import { describe,it,expect } from 'vitest';
import { billingPrice,verifiedBillingPlan,unexpiredMembership } from './billing-plans';
import { planOrder, memberLimit, canUse } from './plans';
describe('fixed membership prices',()=>{
 it('Standard monthly is 333 JPY and yearly 3333',()=>{expect(billingPrice('standard',false)?.amount).toBe(333);expect(billingPrice('standard',true)?.amount).toBe(3333);});
 it('VIP monthly is 777 JPY and yearly 7777',()=>{expect(billingPrice('vip',false)?.amount).toBe(777);expect(billingPrice('vip',true)?.amount).toBe(7777);});
 it('Family is monthly 3580 and yearly 38500',()=>{expect(billingPrice('b2b',false)?.amount).toBe(3580);expect(billingPrice('b2b',true)?.amount).toBe(38500);});
 it('Premium is monthly 8888 and yearly 88888',()=>{expect(billingPrice('b2b-premium',false)?.amount).toBe(8888);expect(billingPrice('b2b-premium',true)?.amount).toBe(88888);});
 it('requires an allowed price, active subscription and paid invoice',()=>{
 const price=billingPrice('vip',false)?.price??'';
 expect(verifiedBillingPlan(price,'active',true)).toBe('vip');
 expect(verifiedBillingPlan(price,'active',false)).toBe('free');
 expect(verifiedBillingPlan(price,'canceled',true)).toBe('free');
 expect(verifiedBillingPlan('price_unknown','active',true)).toBe('free');
 });
 it('does not extend an expired Stripe membership or alter non-Stripe membership',()=>{
 expect(unexpiredMembership('vip','cus_test','2026-10-29T00:00:00Z',Date.parse('2026-10-30T00:00:00Z'))).toBe('free');
 expect(unexpiredMembership('vip',null,null)).toBe('vip');
 expect(unexpiredMembership('vip','cus_test',null)).toBe('free');
 });
});describe('official plan catalogue 2026-11', () => {
  it('Standard 333/3333, VIP 777/7777, Family Premium 8888/88888', () => {
    expect([billingPrice('standard',false)?.amount, billingPrice('standard',true)?.amount]).toEqual([333,3333]);
    expect([billingPrice('vip',false)?.amount, billingPrice('vip',true)?.amount]).toEqual([777,7777]);
    expect([billingPrice('b2b-premium',false)?.amount, billingPrice('b2b-premium',true)?.amount]).toEqual([8888,88888]);
  });
  it('old Family yearly subscribers keep Family', () => { expect(verifiedBillingPlan('price_1UVveCC3Xvb52V8UjXmZNMrT','active',true)).toBe('b2b'); });
  it('registration caps 0/3/10/30/100 and art gates', () => {
    expect(planOrder.map(p => memberLimit[p])).toEqual([0,3,10,30,100]);
    expect([canUse('free','mandalaArt'),canUse('standard','mandalaArt')]).toEqual([false,true]);
    expect([canUse('standard','cosmicGenesisArt'),canUse('vip','cosmicGenesisArt')]).toEqual([false,true]);
  });
});
