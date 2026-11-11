import { describe, expect, it } from 'vitest';
import { languages } from './translations';
import { readingFallback } from './reading-fallback';

describe('reading fallback', () => {
  it('provides every sample section in all seven languages', () => {
    for (const { code } of languages) for (const key of ['note', 'manualCore', 'manualDecision', 'manualTiming', 'axisSummary'] as const) expect(readingFallback[code][key].length).toBeGreaterThan(10);
  });
});
