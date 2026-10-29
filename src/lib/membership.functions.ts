import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { normalizePlan } from './plan-identity';
import { unexpiredMembership } from './billing-plans';

/** Only a server-verified administrator may assign a temporary test plan. */
export const getMyMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Reconcile renewals on re-entry; offline failures never extend a paid expiry.
    try { const { refreshBilling } = await import('./billing.server'); await refreshBilling(context.userId); } catch { /* Use last verified, unexpired membership. */ }
    const { data, error } = await context.supabase.from("plan_memberships")
      .select("plan, debug_expires_at, debug_previous_plan, stripe_customer_id, stripe_valid_until").eq("user_id", context.userId).maybeSingle();
    if (error) throw error;
    const effective = data?.debug_expires_at && Date.parse(data.debug_expires_at) <= Date.now()
      ? data.debug_previous_plan : data?.plan;
    const debugging = data?.debug_expires_at && Date.parse(data.debug_expires_at) > Date.now();
    return normalizePlan(debugging ? effective : unexpiredMembership(effective, data?.stripe_customer_id ?? null, data?.stripe_valid_until ?? null));
  });

export const canManageDebugPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) throw error;
    return data === true;
  });

export const setMyDebugPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ plan: z.enum(["free", "standard", "vip", "b2b", "b2b-premium"]) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (roleError || !allowed) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: current, error: readError } = await context.supabase.from("plan_memberships")
      .select("plan, debug_expires_at, debug_previous_plan").eq("user_id", context.userId).maybeSingle();
    if (readError) throw readError;
    const originalPlan = normalizePlan(current?.debug_expires_at ? current.debug_previous_plan : current?.plan);
    const { error } = await supabaseAdmin.from("plan_memberships").upsert({
      user_id: context.userId,
      plan: data.plan,
      debug_previous_plan: originalPlan,
      debug_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;
    return data.plan;
  });