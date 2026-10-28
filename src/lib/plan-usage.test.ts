import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PLAN_CONSULTATION_LIMITS, getPlanConsultationLimit, remainingUses } from './plan-usage';
import { dailyUsageLimit, consultationDailyLimit } from './plans';
import { quickCompatibilityLimit } from './quick-compatibility';

describe('one daily diagnosis and consultation cap source', () => {
  it.each([['free', 1], ['standard', 3], ['vip', 10], ['family', 30], ['family_premium', 100]] as const)('%s stops at %i uses', (plan, cap) => {
    expect(getPlanConsultationLimit(plan)).toBe(cap);
    expect(remainingUses(getPlanConsultationLimit(plan), cap - 1)).toBe(1);
    expect(remainingUses(getPlanConsultationLimit(plan), cap)).toBe(0);
    expect(remainingUses(getPlanConsultationLimit(plan), cap + 1)).toBe(0);
  });
  it('all diagnosis and consultation callers share the identical table', () => {
    expect(dailyUsageLimit).toBe(PLAN_CONSULTATION_LIMITS);
    expect(consultationDailyLimit).toBe(PLAN_CONSULTATION_LIMITS);
    expect(quickCompatibilityLimit).toBe(PLAN_CONSULTATION_LIMITS);
  });
  it('deployed database lookup is compiled from the same configuration', () => {
    const sql = readFileSync('drizzle/migrations/0025_unify_daily_caps_100.sql', 'utf8');
    const payload = sql.match(/'({[^']+})'::jsonb/)?.[1];
    expect(payload).toBeDefined();
    expect(JSON.parse(payload ?? '{}')).toEqual(PLAN_CONSULTATION_LIMITS);
  });
});