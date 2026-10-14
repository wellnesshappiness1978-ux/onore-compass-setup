import { expect, it } from 'vitest';
import { colorReference, colorReferenceCopy } from './color-reference';
it('uses light frequency in Hz and never invents a single wavelength for mixtures', () => {
  expect(colorReference('#FF0000').wavelength).toBe(680);
  expect(colorReference('#0000FF').wavelength).toBe(460);
  expect(colorReference('#FF0000').frequency).toBeCloseTo(299792458 / 680e-9, -1);
  for (const code of ['#FF00FF', '#FFFFFF', '#000000']) expect(colorReference(code).wavelength).toBeNull();
});
it('has seven localized chakra regions and eight distinct hue cues', () => {
  expect(Object.keys(colorReferenceCopy)).toHaveLength(7);
  for (const copy of Object.values(colorReferenceCopy)) {
    expect(copy.areas).toHaveLength(7);
    expect(new Set(copy.cues).size).toBe(8);
  }
});