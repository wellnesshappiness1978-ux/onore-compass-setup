import { describe, expect, it } from 'vitest';
import { legacyLuckyName, monthlyLuckySchema, monthlyLuckyValue } from './monthly-lucky';

describe('monthly lucky name and explanation contract', () => {
  it.each(['朝の散歩', 'シルクのハンカチ', 'ひまわり'])('preserves the explicit concrete target %s separately from full advice', target_name => {
    const value = monthlyLuckyValue(monthlyLuckySchema.required().parse({ target_name, description: '週初めに取り入れる。月末に振り返る。', action: target_name, reason: '今月の目標を確認するため。', benefit: '予定の見落としを減らす。' }));
    expect(value.target_name).toBe(target_name);
    expect(value.description).toBe('週初めに取り入れる。月末に振り返る。\n\n今月の目標を確認するため。\n\n予定の見落としを減らす。');
  });
  it('restores a named legacy item without truncating its explanation or requesting regeneration', () => {
    const action = '今月の道具は、手元の月間予定表です。各週の欄に担当を書きます。月末に見直します。';
    const value = monthlyLuckyValue(monthlyLuckySchema.parse({ action, reason: '確認に役立ちます。', benefit: '引き継ぎが明確になります。' }));
    expect(value.target_name).toBe('月間予定表');
    expect(value.description).toContain(action);
    expect(value.description).toContain('引き継ぎが明確になります。');
  });
  it('takes an entire legacy action phrase rather than a character-clipped fragment', () => {
    expect(legacyLuckyName('朝の散歩。毎朝新しい道を選びます。')).toBe('朝の散歩');
    expect(legacyLuckyName("This month's item is a silk handkerchief. Carry it to meetings.")).toBe('a silk handkerchief');
  });
  it('extracts the actual practice from an older monthly recommendation introduction', () => {
    const action = '今月の振り返りは、週ごとに約束を1つ確認する形がおすすめです。月末に返事が必要な用件を見直します。';
    expect(monthlyLuckyValue({ action, reason: '理由', benefit: '効果' }).target_name).toBe('週ごとに約束を1つ確認');
    expect(monthlyLuckyValue({ action, reason: '理由', benefit: '効果' }).description).toContain(action);
  });
});