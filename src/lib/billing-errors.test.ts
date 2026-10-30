import { describe, expect, it } from 'vitest';
import { BillingError, billingErrorCode, stripeFailureCode } from './billing-errors';
describe('safe actionable billing errors', () => {
  it('identifies unavailable credentials without returning provider messages', () => { expect(stripeFailureCode(401)).toBe('credentials'); expect(billingErrorCode(new Error('private provider detail'))).toBe('unavailable'); });
  it('identifies missing prices', () => { expect(stripeFailureCode(400, 'resource_missing', 'line_items[0][price]')).toBe('price'); });
  it('identifies tax setup without removing tax collection', () => { expect(stripeFailureCode(400, undefined, 'automatic_tax[enabled]')).toBe('tax_setup'); });
  it('preserves network failure for retry', () => { expect(billingErrorCode(new BillingError('network'))).toBe('network'); });
});