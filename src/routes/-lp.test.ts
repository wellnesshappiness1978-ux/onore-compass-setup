import { describe, expect, it } from 'vitest';
import { billingPlans } from '@/lib/billing-plans';
import { getPlanConsultationLimit } from '@/lib/plan-usage';

describe('Official LP plan facts', () => {
  it('keeps Standard monthly pricing at 333 yen', () => { expect(billingPlans.find(p => p.plan === 'standard')?.monthly.amount).toBe(333); });
  it('keeps VIP monthly pricing at 777 yen', () => { expect(billingPlans.find(p => p.plan === 'vip')?.monthly.amount).toBe(777); });
  it('preserves the confirmed VIP cap of ten consultations per day', () => { expect(getPlanConsultationLimit('vip')).toBe(10); });
});