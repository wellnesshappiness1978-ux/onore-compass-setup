import { expect, it } from 'vitest';
import { colorEssence } from './color-essence';
import { colorExperienceCopy } from './color-experience-copy';
it('does not assign physical wavelengths to magenta or neutral mixtures', () => {
 expect(colorEssence('#FF00FF').spectral).toBeNull();
 expect(colorEssence('#FFFFFF').spectral).toBeNull();
 expect(colorEssence('#FF0000').spectral).toBe('620–750');
});
it('has complete three-step and scene copy in seven languages', () => {
 expect(Object.keys(colorExperienceCopy)).toHaveLength(7);
 for (const copy of Object.values(colorExperienceCopy)) {
  expect(copy.steps).toHaveLength(3); expect(copy.sceneTips).toHaveLength(3);
  expect(copy.psych).toHaveLength(8); expect(copy.appearance).toHaveLength(9);
  expect(copy.basis.length).toBeGreaterThan(20);
 }
});
