import { getRequest } from '@tanstack/react-start/server';
import { billingPrice, verifiedBillingPlan, type BillingPlan } from './billing-plans';
import { normalizePlan } from './plan-identity';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { BillingError, stripeFailureCode } from './billing-errors';

type StripeCustomer = { id: string; metadata: { user_id?: string }; deleted?: boolean };
type Subscription = { id: string; status: string; customer: string; items: { data: { price: { id: string }; current_period_end: number }[] }; latest_invoice: { status: string; paid: boolean } | null };
type Session = { id: string; customer: string; client_reference_id: string; status: string; payment_status: string; subscription: string; url: string };

async function stripe<T>(path: string, form?: Record<string, string>, idempotency?: string): Promise<T> {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new BillingError('missing_key');
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: form ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2025-08-27.basil', ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...(idempotency ? { 'Idempotency-Key': idempotency } : {}) },
    ...(form ? { body: new URLSearchParams(form) } : {}),
    signal: AbortSignal.timeout(20000),
  }).catch(() => { throw new BillingError('network'); });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { code?: string; param?: string } } | null;
    const code = stripeFailureCode(response.status, body?.error?.code, body?.error?.param);
    console.error('Stripe request failed', response.status, code);
    throw new BillingError(code);
  }
  return response.json() as Promise<T>;
}

async function customerFor(userId: string) {
  const { data, error } = await supabaseAdmin.from('plan_memberships').select('stripe_customer_id').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data?.stripe_customer_id) return null;
  const customer = await stripe<StripeCustomer>(`customers/${encodeURIComponent(data.stripe_customer_id)}`);
  if (customer.deleted || customer.metadata.user_id !== userId) throw new Error('Customer ownership mismatch');
  return customer.id;
}

async function subscriptions(customer: string) {
  return (await stripe<{ data: Subscription[] }>(`subscriptions?customer=${encodeURIComponent(customer)}&status=all&limit=100&expand[]=data.latest_invoice`)).data;
}

export async function refreshBilling(userId: string, sessionId?: string) {
  const customer = await customerFor(userId);
  if (!customer) return { linked: false, plan: 'free' as const, status: '', until: null, pending: false };
  let pending = false;
  if (sessionId) {
    const session = await stripe<Session>(`checkout/sessions/${encodeURIComponent(sessionId)}`);
    if (session.customer !== customer || session.client_reference_id !== userId) throw new Error('Session ownership mismatch');
    pending = session.status !== 'complete' || session.payment_status !== 'paid';
  }
  const all = await subscriptions(customer);
  const active = all.find(s => verifiedBillingPlan(s.items.data[0]?.price.id ?? '', s.status, s.latest_invoice?.paid === true) !== 'free');
  const item = active?.items.data[0];
  const plan = verifiedBillingPlan(item?.price.id ?? '', active?.status ?? '', active?.latest_invoice?.paid === true);
  const until = item ? new Date(item.current_period_end * 1000).toISOString() : null;
  const { data: membership, error: readError } = await supabaseAdmin.from('plan_memberships').select('plan, debug_previous_plan, debug_expires_at, stripe_subscription_id, stripe_status, stripe_valid_until').eq('user_id', userId).maybeSingle();
  if (readError) throw readError;
  const debugging = membership?.debug_expires_at && Date.parse(membership.debug_expires_at) > Date.now();
  const patch = {
    ...(debugging ? { debug_previous_plan: plan } : { plan }),
    stripe_subscription_id: active?.id ?? null, stripe_status: active?.status ?? 'inactive', stripe_valid_until: until,
  };
  // Reads must not trigger another Realtime refresh when Stripe state is unchanged.
  const changed = (debugging ? membership?.debug_previous_plan : membership?.plan) !== plan
    || membership?.stripe_subscription_id !== patch.stripe_subscription_id
    || membership?.stripe_status !== patch.stripe_status
    || (membership?.stripe_valid_until ? Date.parse(membership.stripe_valid_until) : null) !== (until ? Date.parse(until) : null);
  if (changed) {
    const { error } = await supabaseAdmin.from('plan_memberships').update({ ...patch, updated_at: new Date().toISOString() }).eq('user_id', userId);
    if (error) throw error;
  }
  return { linked: true, plan, status: active?.status ?? 'inactive', until, pending };
}

export async function checkoutBilling(userId: string, plan: BillingPlan, yearly: boolean) {
  const price = billingPrice(plan, yearly);
  if (!price) throw new Error('Unsupported billing interval');
  let customer = await customerFor(userId);
  if (!customer) {
    // Stripe idempotency plus the unique owner row makes simultaneous clicks reuse one customer.
    const created = await stripe<StripeCustomer>('customers', { 'metadata[user_id]': userId }, `agolmen-customer-${userId}`);
    const { error } = await supabaseAdmin.from('plan_memberships').upsert({ user_id: userId, stripe_customer_id: created.id }, { onConflict: 'user_id' });
    if (error) throw error;
    customer = created.id;
  }
  const all = await subscriptions(customer);
  if (all.some(s => ['active','trialing','past_due','unpaid','incomplete','paused'].includes(s.status))) return { url: await portalBilling(userId), portal: true };
  const origin = new URL(getRequest().url).origin;
  const session = await stripe<Session>('checkout/sessions', {
    customer, client_reference_id: userId, mode: 'subscription',
    'line_items[0][price]': price.price, 'line_items[0][quantity]': '1',
    'subscription_data[metadata][user_id]': userId,
    'subscription_data[billing_mode][type]': 'flexible',
    success_url: `${origin}/purchase?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/purchase?canceled=true`,
    'automatic_tax[enabled]': 'true', 'customer_update[address]': 'auto',
  }, `agolmen-checkout-${userId}-${price.price}-${Math.floor(Date.now()/1800000)}`);
  if (!session.url?.startsWith('https://checkout.stripe.com/')) throw new BillingError('checkout');
  return { url: session.url, portal: false };
}

export async function portalBilling(userId: string) {
  const customer = await customerFor(userId);
  if (!customer) throw new Error('No Stripe customer');
  const origin = new URL(getRequest().url).origin;
  const session = await stripe<{ url: string }>('billing_portal/sessions', { customer, configuration: 'bpc_1UVv16C3Xvb52V8U0fMEFSeu', return_url: `${origin}/purchase` });
  return session.url;
}

export async function billingStatus(userId: string, sessionId?: string) {
  const status = await refreshBilling(userId, sessionId);
  if (status.linked) return status;
  const { data, error } = await supabaseAdmin.from('plan_memberships').select('plan').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return { ...status, plan: normalizePlan(data?.plan) };
}