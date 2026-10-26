import { describe, expect, it } from 'vitest';
import { familyRegistrationAccess, fitsMemberCapacity, groupInput, registeredMemberCount } from './family-capacity';
import { SELF_MEMBER_ID } from './group-insight';
const ids = Array.from({ length: 101 }, (_, i) => `11111111-1111-4111-8111-${String(i).padStart(12,'0')}`);
describe('owner-excluded family and group capacity', () => {
  it('the owner alone consumes zero family/member slots', () => {
    expect(registeredMemberCount([SELF_MEMBER_ID])).toBe(0);
    expect(fitsMemberCapacity([SELF_MEMBER_ID], 0)).toBe(true);
  });
  it('five slots allow the owner plus five other members, not six', () => {
    expect(registeredMemberCount([SELF_MEMBER_ID, ...ids.slice(0,5)])).toBe(5);
    expect(fitsMemberCapacity([SELF_MEMBER_ID, ...ids.slice(0,5)], 5)).toBe(true);
    expect(fitsMemberCapacity([SELF_MEMBER_ID, ...ids.slice(0,6)], 5)).toBe(false);
  });
  it('legacy groups without the owner retain their full non-owner count', () => {
    expect(registeredMemberCount(ids.slice(0,5))).toBe(5);
  });
  it('the largest group accepts 100 others plus the owner and rejects 101 others', () => {
    const base = { name: 'Test', nickname: '' };
    expect(groupInput.safeParse({ ...base, memberIds: [SELF_MEMBER_ID, ...ids.slice(0,100)] }).success).toBe(true);
    expect(groupInput.safeParse({ ...base, memberIds: ids }).success).toBe(false);
  });
  it('duplicate IDs consume one slot and normalize before saving', () => {
    expect(registeredMemberCount([SELF_MEMBER_ID, ids[0] ?? '', ids[0] ?? ''])).toBe(1);
  });
});
 describe('registration independent of Family analytics', () => {
  it.each([['standard', 3], ['vip', 10], ['b2b', 30], ['b2b-premium', 100]] as const)('%s registers through its %s slots', (plan, limit) => {
    expect(familyRegistrationAccess(true, plan, 'free', 0)).toEqual({ plan, limit, canAdd: true });
    expect(familyRegistrationAccess(true, plan, 'free', limit - 1).canAdd).toBe(true);
    expect(familyRegistrationAccess(true, plan, 'free', limit).canAdd).toBe(false);
  });
  it('preview Standard never grants writes to a signed-in Free account', () => {
    expect(familyRegistrationAccess(true, 'free', 'standard', 0)).toEqual({ plan: 'free', limit: 0, canAdd: false });
  });
});
import { limitUpgradeTarget } from './family-capacity';
describe('test preview plan bar drives registration', () => {
  it('preview Family Premium on a signed-in Free account allows 100 test members', () => {
    expect(familyRegistrationAccess(true, 'free', 'b2b-premium', 0, true)).toEqual({ plan: 'b2b-premium', limit: 100, canAdd: true });
  });
  it('preview Standard allows adding until 3', () => {
    expect(familyRegistrationAccess(true, 'free', 'standard', 2, true).canAdd).toBe(true);
    expect(familyRegistrationAccess(true, 'free', 'standard', 3, true).canAdd).toBe(false);
  });
  it('limit suggestion is always a higher plan', () => {
    expect(limitUpgradeTarget('standard', 4)).toBe('vip');
    expect(limitUpgradeTarget('vip', 11)).toBe('b2b');
    expect(limitUpgradeTarget('b2b-premium', 101)).toBe('max');
  });
});
