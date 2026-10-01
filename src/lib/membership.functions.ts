import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Plan } from "./design-modes";

const validPlans: Plan[] = ["free", "standard", "vip", "b2b", "b2b-premium"];

/** Only a server-verified administrator may assign a temporary test plan. */
export const getMyMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("plan_memberships")
      .select("plan, debug_expires_at").eq("user_id", context.userId).maybeSingle();
    if (error) throw error;
    if (data?.debug_expires_at && Date.parse(data.debug_expires_at) <= Date.now()) return "free";
    return validPlans.find((plan) => plan === data?.plan) ?? "free";
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
    const { error } = await supabaseAdmin.from("plan_memberships").upsert({
      user_id: context.userId,
      plan: data.plan,
      debug_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) throw error;
    return data.plan;
  });