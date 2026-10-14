import { describe, expect, it } from 'vitest';
import { colorExperienceCopy } from './color-experience-copy';
describe('Seven-language color experience', () => {
  it('keeps every stage, theme, reference and scene present in each language', () => {
    expect(Object.keys(colorExperienceCopy)).toHaveLength(7);
    for (const copy of Object.values(colorExperienceCopy)) {
      expect(copy.steps).toHaveLength(3);
      expect(copy.titles).toHaveLength(3);
      expect(copy.labels).toHaveLength(8);
      expect(copy.psych).toHaveLength(8);
      expect(copy.elements).toHaveLength(8);
      expect(copy.scenes).toHaveLength(3);
      expect(copy.sceneTips).toHaveLength(3);
      expect(copy.appearance).toHaveLength(9);
      for (const value of Object.values(copy)) {
        for (const text of Array.isArray(value) ? value : [value]) expect(text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});