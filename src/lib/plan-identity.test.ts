import { describe, expect, it } from 'vitest';
import { normalizePlan, parsePlanIdentity } from './plan-identity';
import { parsePlan } from './preview-plan';
import { getPlanConsultationLimit } from './plans';
import { remainingUses } from '@/hooks/use-daily-usage';

describe('AI consultation plan identities', () => {
  it.each([
    ['free', 1], ['Free', 1], ['無料会員', 1],
    ['standard', 3], ['Standard', 3], ['スタンダード会員', 3],
    ['vip', 10], ['VIP', 10], ['VIP会員', 10],
    ['b2b', 30], ['Family', 30], ['ファミリー会員', 30],
    ['b2b-premium', Infinity], ['family_premium', Infinity], ['family-premium', Infinity],
    ['Family Premium', Infinity], ['ファミリープレミアム', Infinity], ['ファミリープレミアム会員', Infinity],
    ['business_premium', Infinity], ['corporate-premium', Infinity],
  ])('%s has the requested daily limit %s', (label, limit) => {
    expect(getPlanConsultationLimit(label)).toBe(limit);
    expect(parsePlan(label)).toBe(normalizePlan(label));
  });
  it('unlimited remains available after one or many consultations', () => {
    expect(remainingUses(getPlanConsultationLimit('Family Premium'), 1)).toBe(Infinity);
    expect(remainingUses(getPlanConsultationLimit('family_premium'), 10000)).toBe(Infinity);
  });
  it('switching plans changes the cap without erasing used consultations', () => {
    expect(['free', 'standard', 'vip', 'family', 'family_premium'].map(p => remainingUses(getPlanConsultationLimit(p), 1))).toEqual([0, 2, 9, 29, Infinity]);
  });
  it('missing or unknown membership stays Free rather than granting access', () => {
    expect(parsePlanIdentity('admin')).toBeNull();
    expect(parsePlanIdentity('constructor')).toBeNull();
    expect(normalizePlan(null)).toBe('free');
    expect(getPlanConsultationLimit('premium')).toBe(1);
  });
});
import { isDailyLimitError } from "@/hooks/use-daily-usage";
describe("daily usage error fallback", () => {
  it("blocks only on a confirmed daily-limit error", () => {
    expect(isDailyLimitError({ code: "23514" })).toBe(true);
    expect(isDailyLimitError({ code: "500" })).toBe(false);
    expect(isDailyLimitError(null)).toBe(false);
  });
});
