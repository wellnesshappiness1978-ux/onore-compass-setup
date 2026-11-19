import { describe, expect, it, vi } from 'vitest';
import { withPurchaseConsent } from './purchase-consent';

describe('purchase consent', () => {
  it('blocks an unchecked purchase and gives explicit feedback on every attempt', () => {
    const missing = vi.fn();
    const purchase = vi.fn();
    expect(withPurchaseConsent(false, missing, purchase)).toBe(false);
    expect(withPurchaseConsent(false, missing, purchase)).toBe(false);
    expect(missing).toHaveBeenCalledTimes(2);
    expect(purchase).not.toHaveBeenCalled();
  });
  it('allows a checked purchase once without showing an agreement warning', () => {
    const missing = vi.fn();
    const purchase = vi.fn();
    expect(withPurchaseConsent(true, missing, purchase)).toBe(true);
    expect(purchase).toHaveBeenCalledTimes(1);
    expect(missing).not.toHaveBeenCalled();
  });
});