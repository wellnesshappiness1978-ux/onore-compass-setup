import { describe, expect, it } from 'vitest';
import { normalizeInvitationCode, toInvitationResult } from './invitation-code';
describe('invitation code', () => {
  it('trims and ignores case', () => expect(normalizeInvitationCode('  agolmen2026vip ')).toBe('AGOLMEN2026VIP'));
  it('maps unknown server results to error', () => { expect(toInvitationResult('full')).toBe('full'); expect(toInvitationResult('x')).toBe('error'); });
});
