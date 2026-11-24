import { describe, expect, it } from 'vitest';
import { isImeInput } from './ime-input';
describe('IME keyboard actions', () => {
  it('does not treat Japanese conversion as a submit command', () => {
    expect(isImeInput({ isComposing: true, keyCode: 13 })).toBe(true);
    expect(isImeInput({ isComposing: false, keyCode: 229 })).toBe(true);
    expect(isImeInput({ keyCode: 13 }, true)).toBe(true);
    expect(isImeInput({ isComposing: false, keyCode: 13 })).toBe(false);
  });
});