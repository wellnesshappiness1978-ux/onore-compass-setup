// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest';
import { FONT_SIZE_KEY, fontSizes, readFontSize, saveFontSize } from './font-size';

afterEach(() => localStorage.clear());
it('defaults to medium when no valid preference is saved', () => {
  expect(readFontSize()).toBe('medium');
  localStorage.setItem(FONT_SIZE_KEY, 'extra-large');
  expect(readFontSize()).toBe('medium');
});
it('persists all three sizes and applies each immediately', () => {
  expect(fontSizes).toEqual(['small', 'medium', 'large']);
  for (const size of fontSizes) {
    saveFontSize(size);
    expect(readFontSize()).toBe(size);
    expect(document.documentElement.dataset.fontSize).toBe(size);
  }
});