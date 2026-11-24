import { describe, expect, it } from 'vitest';
import { purchaseSelection, purchaseAction } from './purchase-access';
describe('public plan selection with verified subscription ownership', () => {
  it('allows guests to select every paid plan', () => {
    for (const plan of ['standard', 'vip', 'b2b', 'b2b-premium']) expect(purchaseSelection(plan)).toBe(plan);
    expect(purchaseSelection('invalid')).toBeNull();
  });
  it('checks identity only when entering recurring checkout', () => {
    expect(purchaseAction(false)).toBe('signin');
    expect(purchaseAction(true)).toBe('checkout');
  });
});