import { describe, expect, it } from 'vitest';
import { savedPartner, savedGroupMembers } from './saved-compatibility';
import type { TeamMember } from './team-analysis';
const member: TeamMember = { id: 'one', name: '山田 花子', birthDate: '1990-03-12', gender: 'female', bloodType: 'A', role: '', skills: [], birthTime: '08:45:00', birthTimeUnknown: false, birthPlace: '東京都', birthCity: '渋谷区', nameKana: 'やまだ はなこ', siblingOrder: 'first' };
describe('saved compatibility targets', () => {
  it('uses stored birth details without re-entry and normalizes database time', () => {
    expect(savedPartner(member)).toEqual({ name: '山田 花子', nameKana: 'やまだ はなこ', gender: 'female', birthDate: '1990-03-12', birthTime: '08:45', birthPlace: '東京都', birthCity: '渋谷区', bloodType: 'A', siblingOrder: 'first' });
  });
  it('does not invent a time for unknown births', () => {
    expect(savedPartner({ ...member, birthTimeUnknown: true }).birthTime).toBe('');
  });
  it('compares only registered group members without synthesizing a group birth date', () => {
    const other = { ...member, id: 'two', birthDate: '1981-11-04' };
    expect(savedGroupMembers({ id: 'group', name: '家族', nickname: '', memberIds: ['two'] }, [member, other])).toEqual([other]);
  });
});