import { describe, expect, it } from 'vitest';
import { savedPartner, savedGroupMembers, splitGroupReading } from './saved-compatibility';
import type { TeamMember } from './team-analysis';
const member: TeamMember = { id: 'one', name: '山田 花子', birthDate: '1990-03-12', gender: 'female', bloodType: 'A', role: '', skills: [], birthTime: '08:45:00', birthTimeUnknown: false, birthPlace: '東京都', birthCity: '渋谷区', nameKana: 'やまだ はなこ', siblingOrder: 'first' };
describe('saved compatibility targets', () => {
  it('retains full counted composition and prefers the saved nickname', () => {
    const siblingOrder = '10人・中間子・上に兄2人と姉・下に弟3人と妹3人';
    const p = savedPartner({ ...member, nickname: 'はなちゃん', siblingOrder });
    expect(p.name).toBe('はなちゃん');
    expect(p.siblingOrder).toBe(siblingOrder);
  });
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
  it('includes every group member across roster sources, once, excluding the owner', () => {
    const a = { ...member, id: 'a' }, b = { ...member, id: 'b' }, c = { ...member, id: 'c' };
    const g = { id: 'g', name: 'G', nickname: '', memberIds: ['00000000-0000-0000-0000-000000000000', 'a', 'b', 'c', 'a'] };
    expect(savedGroupMembers(g, [a, b], [b, c]).map(m => m.id)).toEqual(['a', 'b', 'c']);
  });
  it('shows owner traits once and keeps member text pair-specific', () => {
    const s = splitGroupReading('あなたは、熱意が魅力です。お相手は、丁寧さが魅力です。\n\n二人は近い。');
    expect(s.owner).toBe('あなたは、熱意が魅力です。');
    expect(s.pair).not.toContain('あなたは');
    expect(s.pair).toContain('二人は近い。');
  });

});