import { describe, expect, it } from 'vitest';
import { consumeReadingStream, readingCacheKey } from './reading-cache';
import { RECIPE_SERVINGS, readingDate } from './reading-presentation';

describe('progressive readings', () => {
  it('separates dates, owners, goals and full profile details', () => {
    const profile = { birthDate: '1990-05-05', father: { birthDate: '1960-05-05' } };
    const key = readingCacheKey('full', '2026-10-23', { profile, goal: '健康' }, 'a');
    expect(readingCacheKey('full', '2026-10-24', { profile, goal: '健康' }, 'a')).not.toBe(key);
    expect(readingCacheKey('full', '2026-10-23', { profile, goal: '健康' }, 'b')).not.toBe(key);
    expect(readingCacheKey('full', '2026-10-23', { profile, goal: '仕事' }, 'a')).not.toBe(key);
    expect(readingCacheKey('full', '2026-10-23', { profile: { ...profile, father: { birthDate: '1961-05-05' } }, goal: '健康' }, 'a')).not.toBe(key);
  });
  it('emits actual partial frames before the completion frame with split UTF-8', async () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode('{"type":"partial","value":{"headline":"今日"}}\n{"type":"complete","value":{"headline":"今日の回答"}}\n');
    const seen: unknown[] = [];
    let offset = 0;
    const body = new ReadableStream<Uint8Array>({ pull(controller) { if (offset === bytes.length) { controller.close(); return; } controller.enqueue(bytes.slice(offset, ++offset)); } });
    const result = await consumeReadingStream(new Response(body), value => seen.push(value));
    expect(seen).toEqual([{ headline: '今日' }]);
    expect(result).toEqual({ headline: '今日の回答' });
  });
  it('uses Arabic digits for the requested Japanese calendar date', () => {
    expect(readingDate('2026-10-23', 'ja')).toBe('2026年10月23日');
  });
  it('requires two servings for generated recipes', () => { expect(RECIPE_SERVINGS).toBe(2); });
});