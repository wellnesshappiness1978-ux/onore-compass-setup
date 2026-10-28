CREATE OR REPLACE FUNCTION public.current_plan_daily_usage_limit()
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE current_plan text; previous_plan text; expires_at timestamptz;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
 SELECT plan, debug_previous_plan, debug_expires_at INTO current_plan, previous_plan, expires_at FROM public.plan_memberships WHERE user_id = auth.uid();
 IF expires_at IS NOT NULL AND expires_at <= now() THEN current_plan := coalesce(previous_plan, 'free'); END IF;
 RETURN public.plan_daily_usage_limit(current_plan);
END;
$$;
REVOKE ALL ON FUNCTION public.current_plan_daily_usage_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_plan_daily_usage_limit() TO authenticated, service_role;