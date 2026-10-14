import { describe, expect, it } from 'vitest';
import { homeReadingCopy } from './home-reading-copy';

describe('integrated six-perspective copy', () => {
  it('provides complete dialog labels in every supported language', () => {
    expect(Object.keys(homeReadingCopy)).toHaveLength(7);
    for (const copy of Object.values(homeReadingCopy)) {
      for (const key of ['views', 'gift', 'guide', 'basis', 'loading', 'error', 'preview'] as const) {
        expect(copy[key].trim().length).toBeGreaterThan(0);
      }
    }
  });
  it('keeps Japanese labels supportive without promised destiny or medical effects', () => {
    expect(homeReadingCopy.ja.views).toBe('あなたを形づくる6つの視点');
    expect(homeReadingCopy.ja.gift).not.toMatch(/必ず|運命|治療/);
  });
});