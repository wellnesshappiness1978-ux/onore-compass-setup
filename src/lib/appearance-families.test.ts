import { describe, expect, it } from 'vitest';
import { appearanceForPlan } from './appearance-families';
import { memberLimit } from './plans';
describe('appearance is not membership', () => {
  it('maps the unchanged five plans', () => {
    expect(['free', 'standard', 'vip', 'b2b', 'b2b-premium'].map(p => appearanceForPlan(p as keyof typeof memberLimit))).toEqual(['minimal', 'celestial', 'sacred', 'harmony', 'sovereign']);
    expect(Object.values(memberLimit)).toEqual([0, 3, 10, 30, 100]);
  });
  it('never treats legacy Family as a corporate contract', () => {
    expect(appearanceForPlan('b2b')).toBe('harmony');
    expect(appearanceForPlan('b2b', true)).toBe('royal');
  });
});
