import { describe, expect, it } from 'vitest';
import { allowedAppearance, allowedDesign, canUseAppearance, readAppearance, readDesign } from './appearance-customization';
describe('saved customization is independent of membership', () => {
  it('does not replace lower-tier choices on upgrade', () => {
    const saved = { background: 'celestial', parts: 'minimal', icons: 'sacred' } as const;
    expect(allowedAppearance(saved, 'vip')).toEqual(saved);
    expect(allowedAppearance(saved, 'b2b-premium')).toEqual(saved);
    expect(allowedDesign('masculine', 'b2b-premium')).toBe('masculine');
  });
  it('uses safe fallbacks without mutating locked saved selections', () => {
    const saved = readAppearance('{"background":"sacred","parts":"royal","icons":"celestial"}');
    expect(allowedAppearance(saved, 'free')).toEqual({ background: 'minimal', parts: 'minimal', icons: 'minimal' });
    expect(saved.background).toBe('sacred');
    expect(canUseAppearance('b2b-premium', 'royal')).toBe(false);
    expect(canUseAppearance('free', 'royal', true)).toBe(true);
  });
  it('rejects corrupted storage and unknown palettes', () => {
    expect(readAppearance('broken').icons).toBe('minimal');
    expect(readDesign('constructor')).toBe('classic');
  });
  it('unlocks exactly five cumulative decorative grades without corporate access', () => {
    const families = ['minimal', 'celestial', 'sacred', 'harmony', 'sovereign'] as const;
    const plans = ['free', 'standard', 'vip', 'b2b', 'b2b-premium'] as const;
    plans.forEach((plan, index) => {
      expect(families.map(family => canUseAppearance(plan, family))).toEqual(families.map((_, i) => i <= index));
      expect(canUseAppearance(plan, 'royal')).toBe(false);
    });
    expect(readAppearance('{"background":"harmony","parts":"sovereign","icons":"royal"}')).toEqual({ background: 'harmony', parts: 'sovereign', icons: 'royal' });
  });
});