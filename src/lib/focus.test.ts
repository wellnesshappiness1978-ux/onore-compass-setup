import { describe, expect, it } from 'vitest';
import { ownerFirstOptions, OWNER_OPTION_ID, ownerBadgeCopy } from './focus';
import type { TeamMember } from './team-analysis';
import type { UserProfile } from '@/components/Onboarding';

const owner = { nameKanji: '山田太郎', nameRomaji: 'Taro Yamada' } as UserProfile;
const members: TeamMember[] = [
  { id: 'm1', name: '花子', nickname: '', birthDate: '1992-04-12', gender: 'female', bloodType: 'A', role: '', skills: [] },
  { id: 'm2', name: '次郎', nickname: '', birthDate: '2015-08-01', gender: 'male', bloodType: '', role: '', skills: [] },
];

describe('owner-first subject options', () => {
  it('always puts the account owner first with the gold badge label', () => {
    const opts = ownerFirstOptions(members, owner, 'ja');
    expect(opts[0]!.id).toBe(OWNER_OPTION_ID);
    expect(opts[0]!.label).toContain('契約者本人');
    expect(opts[0]!.label).toContain('山田太郎');
    expect(opts.slice(1).map(o => o.id)).toEqual(['m1', 'm2']);
  });
  it('keeps the owner first even with no members', () => {
    const opts = ownerFirstOptions([], owner, 'en');
    expect(opts).toHaveLength(1);
    expect(opts[0]!.label).toContain('Account owner');
  });
  it('has a badge label in all seven languages', () => {
    expect(Object.keys(ownerBadgeCopy).sort()).toEqual(['en', 'es', 'fr', 'ja', 'ko', 'zh-CN', 'zh-TW'].sort());
  });
});
