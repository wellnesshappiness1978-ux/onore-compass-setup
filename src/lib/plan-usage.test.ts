import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PLAN_CONSULTATION_LIMITS, getPlanConsultationLimit, remainingUses } from './plan-usage';
import { dailyUsageLimit, consultationDailyLimit } from './plans';
import { quickCompatibilityLimit } from './quick-compatibility';

describe('one daily diagnosis and consultation cap source', () => {
  it.each([['free', 1], ['standard', 10], ['vip', Infinity], ['family', Infinity], ['family_premium', Infinity]] as const)('%s stops at %i uses', (plan, cap) => {
    expect(getPlanConsultationLimit(plan)).toBe(cap);
    if (Number.isFinite(cap)) {
      expect(remainingUses(cap, cap - 1)).toBe(1);
      expect(remainingUses(cap, cap)).toBe(0);
    } else { expect(remainingUses(cap, 10000)).toBe(Infinity); }
  });
  it('all diagnosis and consultation callers share the identical table', () => {
    expect(dailyUsageLimit).toBe(quickCompatibilityLimit);
    expect(consultationDailyLimit).toBe(PLAN_CONSULTATION_LIMITS);
    expect(quickCompatibilityLimit).toEqual({free:1, standard:3, vip:10, b2b:30, 'b2b-premium':100});
  });
  it('deployed database lookup is compiled from the same configuration', () => {
    const sql = readFileSync('drizzle/migrations/0028_consultation_policy_vip_unlimited.sql', 'utf8');
    const payload = sql.match(/'({[^']+})'::jsonb/)?.[1];
    expect(payload).toBeDefined();
    expect(JSON.parse(payload ?? '{}')).toEqual(JSON.parse(readFileSync('src/lib/plan-consultation-limits.json','utf8')));
  });
});