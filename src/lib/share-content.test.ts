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
import { packShareLines, shareSectionsOf, withLockedSections } from './share-content';
import { consultationSections } from './consultation-card';
import { dailyLimitFor, remainingUses } from '@/hooks/use-daily-usage';
describe('three-action share v2', () => {
  it('short items share one page and nothing is dropped', () => {
    expect(packShareLines([['a'], ['b'], ['c']], 17)).toEqual([['a', '', 'b', '', 'c']]);
  });
  it('a block that does not fit starts a new page; oversize blocks continue', () => {
    const pages = packShareLines([['a', 'b'], Array.from({ length: 20 }, (_, i) => `x${i}`)], 17);
    expect(pages.flat().filter(Boolean)).toHaveLength(22);
    expect(pages.every(p => p.length <= 17)).toBe(true);
  });
  it('locked plan items are listed but marked locked', () => {
    const out = withLockedSections([{ id: 'message', title: 'M', text: 'x' }], [{ id: 'shopping', title: 'S', open: false }, { id: 'dailyLucky', title: 'L', open: true }]);
    expect(out.map(s => [s.id, Boolean(s.locked)])).toEqual([['message', false], ['shopping', true]]);
  });
  it('single-text readings become paragraph items', () => {
    expect(shareSectionsOf({ lines: ['one\n\ntwo'] }).map(s => s.text)).toEqual(['one', 'two']);
  });
  it('consultation answers split into all four sections without truncation or names', () => {
    const long = '深'.repeat(900);
    const s = consultationSections(`### ① 要約\n山田さんへ\n### ② 深層\n${long}\n### ③ 行動\nA\n### ④ 言葉\nB`, ['山田']);
    expect(s).toHaveLength(4);
    expect(s[1]?.text).toBe(long);
    expect(s[0]?.text).not.toContain('山田');
  });
  it('consultation remaining count follows each plan cap', () => {
    expect(remainingUses(dailyLimitFor('consultation', 'free'), 1)).toBe(0);
    expect(remainingUses(dailyLimitFor('consultation', 'standard'), 1)).toBe(9);
    expect(remainingUses(dailyLimitFor('consultation', 'vip'), 4)).toBe(Infinity);
    expect(remainingUses(dailyLimitFor('consultation', 'b2b'), 0)).toBe(Infinity);
    expect(remainingUses(dailyLimitFor('consultation', 'b2b-premium'), 99)).toBe(Infinity);
  });
});
