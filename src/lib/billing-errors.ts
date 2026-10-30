export type BillingErrorCode = 'missing_key' | 'credentials' | 'price' | 'tax_setup' | 'network' | 'ownership' | 'checkout' | 'unavailable';
export class BillingError extends Error {
  constructor(public readonly code: BillingErrorCode) { super(code); }
}
export const billingErrorCode = (error: unknown): BillingErrorCode => error instanceof BillingError ? error.code : error instanceof Error && /ownership/.test(error.message) ? 'ownership' : 'unavailable';
export function stripeFailureCode(status: number, code?: string, param?: string): BillingErrorCode {
  if (status === 401 || status === 403) return 'credentials';
  if (param?.includes('automatic_tax')) return 'tax_setup';
  if (code === 'resource_missing' && param?.includes('price')) return 'price';
  return 'unavailable';
}