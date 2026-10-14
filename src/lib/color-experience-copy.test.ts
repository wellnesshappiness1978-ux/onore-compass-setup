import { describe, expect, it } from 'vitest';
import { colorExperienceCopy } from './color-experience-copy';
import { colorReferenceCopy } from './color-reference';
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
  it('describes all color families positively with truthful scientific guidance', () => {
    for (const copy of Object.values(colorExperienceCopy)) {
      expect(new Set(copy.psych).size).toBe(8);
      for (const passage of copy.psych) expect(passage.length).toBeGreaterThan(35);
    }
    const copy = colorExperienceCopy.ja;
    expect([copy.science, copy.basis, copy.symbolNote, copy.protectNote, ...copy.psych, ...copy.daily, ...copy.sceneTips, colorReferenceCopy.ja.note].join(' ')).not.toMatch(/しません|できません|ありません|不可能です/);
    expect(copy.science).toContain('混ぜ');
    expect(copy.basis).toContain('象徴');
    expect(colorReferenceCopy.ja.note).toContain('医療');
  });
});