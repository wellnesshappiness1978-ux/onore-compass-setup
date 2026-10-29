ALTER TABLE public.plan_memberships ADD COLUMN stripe_customer_id text UNIQUE, ADD COLUMN stripe_subscription_id text UNIQUE, ADD COLUMN stripe_status text, ADD COLUMN stripe_valid_until timestamptz;
GRANT SELECT ON public.plan_memberships TO authenticated;
GRANT ALL ON public.plan_memberships TO service_role;
CREATE OR REPLACE FUNCTION public.expire_stripe_membership_plan(p_plan text, p_customer text, p_until timestamptz) RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$ SELECT CASE WHEN p_customer IS NOT NULL AND (p_until IS NULL OR p_until <= now()) THEN 'free' ELSE coalesce(p_plan, 'free') END $$;
REVOKE ALL ON FUNCTION public.expire_stripe_membership_plan(text,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_stripe_membership_plan(text,text,timestamptz) TO authenticated, service_role;
DO $$ DECLARE f regprocedure; body text; BEGIN
 FOREACH f IN ARRAY ARRAY['public.consume_daily_usage(text,date)'::regprocedure,'public.current_plan_daily_usage_limit()'::regprocedure,'public.enforce_team_member_plan_limit()'::regprocedure] LOOP
 body := pg_get_functiondef(f);
 body := replace(body, 'SELECT plan, debug_previous_plan, debug_expires_at', 'SELECT public.expire_stripe_membership_plan(plan, stripe_customer_id, stripe_valid_until), public.expire_stripe_membership_plan(debug_previous_plan, stripe_customer_id, stripe_valid_until), debug_expires_at');
 EXECUTE body;
 END LOOP;
END $$;