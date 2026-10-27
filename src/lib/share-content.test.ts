import { describe, expect, it } from 'vitest';
import { APP_SHARE_URL, shareText, unlockedShareSections } from './share-content';

describe('share content contract', () => {
  const sections = [{ id: 'message', title: 'Message', text: 'Personal message' }, { id: 'dailyLucky', title: 'Lucky', text: 'Color' }, { id: 'shopping', title: 'Shopping', text: 'Shopping advice' }, { id: 'monthlyLucky', title: 'Monthly', text: 'Flower' }, { id: 'familyRoadmap', title: 'Family', text: 'All members' }];
  it('Free excludes locked shopping, monthly and Family readings', () => {
    expect(unlockedShareSections('free', sections).map(s => s.id)).toEqual(['message', 'dailyLucky']);
  });
  it('Standard includes shopping but not VIP monthly readings', () => {
    expect(unlockedShareSections('standard', sections).map(s => s.id)).toEqual(['message', 'dailyLucky', 'shopping']);
  });
  it('Family Premium exposes every available section', () => {
    expect(unlockedShareSections('b2b-premium', sections)).toEqual(sections);
  });
  it('selection exports only chosen items including the full message', () => {
    expect(shareText({ title: 'Today', names: [], lines: [], sections }, ['message'])).toBe('Today\n\nMessage\nPersonal message');
  });
  it('unlocked lucky items can be independently selected', () => {
    const items = [{ id: 'luckyColor', feature: 'dailyLucky' as const, title: 'Color', text: 'Blue' }, { id: 'food-1', feature: 'dailyLucky' as const, title: 'Food', text: 'Soup' }];
    expect(unlockedShareSections('free', items)).toEqual(items);
    expect(shareText({ title: 'Today', names: [], lines: [], sections: items }, ['luckyColor'])).not.toContain('Soup');
  });
  it('names embedded in private reading prose require opt-in', () => {
    expect(shareText({ title: '山田の診断', names: ['山田'], lines: ['山田の強み'] })).not.toContain('山田');
    expect(shareText({ title: '診断', names: ['山田'], lines: ['山田の強み'] }, undefined, true)).toContain('山田の強み');
  });
  it('full compatibility prose and final advice are never truncated', () => {
    const passage = '詳細相性解説'.repeat(1000);
    const exported = shareText({ title: '相性', names: ['private'], lines: [passage, '各占術のバランス', '最終アドバイス全文'] });
    expect(exported).toContain(passage);
    expect(exported).toContain('最終アドバイス全文');
    expect(exported).not.toContain('private');
  });
  it('app introduction uses the public access URL rather than a private art URL', () => {
    expect(APP_SHARE_URL).toBe('https://cosmic-beginnings-onboard.lovable.app');
    expect(shareText({ title: 'アゴルメンの羅針盤', names: [], lines: ['自分を知り、今日を整える。'], url: APP_SHARE_URL })).toContain(APP_SHARE_URL);
  });
});