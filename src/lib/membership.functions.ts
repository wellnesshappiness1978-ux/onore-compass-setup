import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Plan } from "./design-modes";

const validPlans: Plan[] = ["free", "standard", "vip", "b2b", "b2b-premium"];

/** Read-only entitlement: the browser cannot assign itself a paid plan. */
export const getMyMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("plan_memberships")
      .select("plan").eq("user_id", context.userId).maybeSingle();
    if (error) throw error;
    return validPlans.find((plan) => plan === data?.plan) ?? "free";
  });