import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { billingErrorCode } from './billing-errors';

export const getBillingStatus = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ sessionId: z.string().regex(/^cs_(test_|live_)?[a-zA-Z0-9]+$/).max(250).optional() }).parse(input))
  .handler(async ({ context, data }) => {
    try { const { billingStatus } = await import('./billing.server'); return { ok: true as const, ...await billingStatus(context.userId, data.sessionId) }; }
    catch (error) { return { ok: false as const, error: billingErrorCode(error) }; }
  });
export const createBillingCheckout = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ plan: z.enum(['standard','vip','b2b','b2b-premium']), yearly: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    try { const { checkoutBilling } = await import('./billing.server'); return { ok: true as const, ...await checkoutBilling(context.userId, data.plan, data.yearly) }; }
    catch (error) { return { ok: false as const, error: billingErrorCode(error) }; }
  });
export const createBillingPortal = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try { const { portalBilling } = await import('./billing.server'); return { ok: true as const, url: await portalBilling(context.userId) }; }
    catch (error) { return { ok: false as const, error: billingErrorCode(error) }; }
  });