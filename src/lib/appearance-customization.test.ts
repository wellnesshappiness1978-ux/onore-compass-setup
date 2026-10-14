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
});