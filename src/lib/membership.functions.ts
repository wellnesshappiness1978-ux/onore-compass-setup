import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { normalizePlan } from './plan-identity';

/** Only server-verified administrators or whitelisted relatives may assign a temporary test plan. */
export const getMyMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Reconcile renewals on re-entry; offline failures never extend a paid expiry.
    try { const { refreshBilling } = await import('./billing.server'); await refreshBilling(context.userId); } catch { /* Use last verified, unexpired membership. */ }
    // Whitelisted relatives are promoted on every sign-in; the database resolves debug, whitelist and Stripe expiry in one place.
    try { await context.supabase.rpc("claim_vip_whitelist"); } catch { /* Resolution below still honours the whitelist. */ }
    const { data, error } = await context.supabase.rpc("my_membership_plan");
    if (error) throw error;
    return normalizePlan(data);
  });

export const canManageDebugPlan = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("can_switch_test_plan");
    if (error) throw error;
    return data === true;
  });

export const setMyDebugPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ plan: z.enum(["free", "standard", "vip", "b2b", "b2b-premium"]) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("can_switch_test_plan");
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