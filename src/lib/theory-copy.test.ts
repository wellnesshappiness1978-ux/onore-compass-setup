import { describe, expect, it } from 'vitest';
import { theoryCopy } from './theory-copy';
import { artsGuideCopy } from './arts-guide-copy';
import { artsLogics } from './arts-logic-copy';
import { translate } from './ui-i18n';
import type { Language } from './translations';
describe('Theory explanations', () => {
  it('shares complete seven-language copy across every display path', () => {
    expect(Object.keys(theoryCopy)).toHaveLength(7);
    for (const [locale, copy] of Object.entries(theoryCopy)) {
      const language = locale as Language;
      expect(artsGuideCopy[language].origin).toBe(copy.origin);
      expect(translate(language, 'arts.origin')).toBe(copy.origin);
      const color = artsLogics(language).find(method => method.id === 'birthColor');
      expect(color?.background).toBe(copy.birthColor);
      expect(color?.scope).toBe(copy.colorScope);
      for (const text of Object.values(copy)) expect(text.trim().length).toBeGreaterThan(40);
    }
  });
  it('distinguishes symbolic vibration from natural gravity and actual color inputs', () => {
    expect(theoryCopy.ja.origin).toContain('引力');
    expect(theoryCopy.ja.birthColor).toContain('固有波動');
    expect(theoryCopy.ja.birthColor).toContain('象徴');
    expect(theoryCopy.ja.birthColor).toContain('血液型は別');
    expect(Object.values(theoryCopy.ja).join(' ')).not.toMatch(/しません|できません|ありません|不可能です/);
  });
});