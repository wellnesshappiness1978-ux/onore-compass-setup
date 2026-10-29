import type { Plan } from './design-modes';

export const billingPlans = [
  { plan: 'standard', monthly: { amount: 333, price: 'price_1UVsYwC3Xvb52V8U65jw4t2o' }, yearly: { amount: 3333, price: 'price_1UVsYwC3Xvb52V8UgUZJ09N2' } },
  { plan: 'vip', monthly: { amount: 777, price: 'price_1UVsgjC3Xvb52V8UJ48fy9lJ' }, yearly: { amount: 7777, price: 'price_1UVsjcC3Xvb52V8Ueqg8gdOk' } },
  { plan: 'b2b', monthly: { amount: 3580, price: 'price_1UVsmNC3Xvb52V8Upn90G0yZ' }, yearly: { amount: 35800, price: 'price_1UVveCC3Xvb52V8UjXmZNMrT' } },
  { plan: 'b2b-premium', monthly: { amount: 8888, price: 'price_1UVspKC3Xvb52V8UXi9Zufip' }, yearly: { amount: 88888, price: 'price_1UVveDC3Xvb52V8U7LV4qZKw' } },
] as const;
export type BillingPlan = typeof billingPlans[number]['plan'];
export function billingPrice(plan: BillingPlan, yearly: boolean) {
  const entry = billingPlans.find(p => p.plan === plan);
  return yearly ? entry?.yearly : entry?.monthly;
}
export function verifiedBillingPlan(price: string, status: string, paid: boolean): Plan {
  if (!paid || status !== 'active') return 'free';
  return billingPlans.find(p => p.monthly.price === price || p.yearly?.price === price)?.plan ?? 'free';
}
export function unexpiredMembership(plan: unknown, customer: string | null, until: string | null, now = Date.now()): unknown {
  return customer && (!until || Date.parse(until) <= now) ? 'free' : plan;
}