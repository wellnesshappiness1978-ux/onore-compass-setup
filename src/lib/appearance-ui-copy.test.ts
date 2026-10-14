import { describe, expect, it } from 'vitest';
import { appearanceUiCopy, appearanceTabLabels } from './appearance-ui-copy';
import { appearanceForPlan } from './appearance-families';

describe('localized appearance controls', () => {
  it('provides all seven languages and all independent labels', () => {
    expect(Object.keys(appearanceUiCopy)).toHaveLength(7);
    for (const language of Object.keys(appearanceUiCopy) as (keyof typeof appearanceUiCopy)[]) {
      const copy = appearanceUiCopy[language];
      expect(Object.values(copy.plans)).toHaveLength(7);
      expect(Object.values(copy.plans).every(value => value.length > 0)).toBe(true);
      expect(Object.values(appearanceTabLabels(language)).flat().sort()).toEqual(Object.values(copy.plans).sort());
    }
  });
  it('uses Family display labels while keeping legacy aliases independent', () => {
    for (const copy of Object.values(appearanceUiCopy)) {
      expect(copy.plans.business).toBe(copy.plans.b2b);
      expect(copy.plans.corporate).toBe(copy.plans['b2b-premium']);
    }
  });
  it('keeps Family designs and Corporate independent', () => {
    expect(appearanceForPlan('b2b')).toBe('harmony');
    expect(appearanceForPlan('b2b-premium')).toBe('sovereign');
    expect(appearanceForPlan('b2b', true)).toBe('royal');
    expect(appearanceUiCopy.ja.plans.b2b).toBe('ファミリー');
    expect(appearanceUiCopy.ja.plans.free).toBe('フリー');
  });
});