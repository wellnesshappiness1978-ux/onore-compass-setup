import { describe,it,expect } from 'vitest';
import { billingPrice,verifiedBillingPlan,unexpiredMembership } from './billing-plans';
describe('fixed membership prices',()=>{
 it('Standard monthly is 333 JPY and yearly 3333',()=>{expect(billingPrice('standard',false)?.amount).toBe(333);expect(billingPrice('standard',true)?.amount).toBe(3333);});
 it('VIP monthly is 777 JPY and yearly 7777',()=>{expect(billingPrice('vip',false)?.amount).toBe(777);expect(billingPrice('vip',true)?.amount).toBe(7777);});
 it('Family is monthly 3580 only',()=>{expect(billingPrice('b2b',false)?.amount).toBe(3580);expect(billingPrice('b2b',true)).toBeNull();});
 it('Premium is monthly 8888 only',()=>{expect(billingPrice('b2b-premium',false)?.amount).toBe(8888);expect(billingPrice('b2b-premium',true)).toBeNull();});
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
});