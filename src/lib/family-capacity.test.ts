import { describe, expect, it } from 'vitest';
import { fitsMemberCapacity, groupInput, registeredMemberCount } from './family-capacity';
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