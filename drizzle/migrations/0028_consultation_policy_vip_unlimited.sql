CREATE OR REPLACE FUNCTION public.plan_consultation_usage_limit(p_plan text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT ('{"free":1,"standard":10,"vip":null,"b2b":null,"b2b-premium":null}'::jsonb ->> CASE WHEN public.plan_daily_usage_limit(p_plan) = 3 THEN 'standard' WHEN public.plan_daily_usage_limit(p_plan) IN (10,30,100) THEN 'vip' ELSE 'free' END)::integer;
$$;
REVOKE ALL ON FUNCTION public.plan_consultation_usage_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plan_consultation_usage_limit(text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.current_feature_daily_usage_limit(p_feature text)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE current_plan text; previous_plan text; expires_at timestamptz;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
 IF p_feature NOT IN ('consultation','compatibility') THEN RAISE EXCEPTION 'Unknown feature' USING ERRCODE = '22023'; END IF;
 SELECT public.expire_stripe_membership_plan(plan, stripe_customer_id, stripe_valid_until), public.expire_stripe_membership_plan(debug_previous_plan, stripe_customer_id, stripe_valid_until), debug_expires_at INTO current_plan, previous_plan, expires_at FROM public.plan_memberships WHERE user_id = auth.uid();
 IF expires_at IS NOT NULL AND expires_at <= now() THEN current_plan := coalesce(previous_plan, 'free'); END IF;
 IF p_feature = 'consultation' THEN RETURN public.plan_consultation_usage_limit(current_plan); END IF;
 RETURN public.plan_daily_usage_limit(current_plan);
END;
$$;
REVOKE ALL ON FUNCTION public.current_feature_daily_usage_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_feature_daily_usage_limit(text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.current_plan_daily_usage_limit()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT public.current_feature_daily_usage_limit('consultation'); $$;
REVOKE ALL ON FUNCTION public.current_plan_daily_usage_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_plan_daily_usage_limit() TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.consume_daily_usage(p_feature text, p_day date)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); allowed integer; new_used integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
 IF p_feature NOT IN ('consultation','compatibility') THEN RAISE EXCEPTION 'Unknown feature' USING ERRCODE = '22023'; END IF;
 IF p_day IS NULL OR p_day < (now() AT TIME ZONE 'UTC')::date - 1 OR p_day > (now() AT TIME ZONE 'UTC')::date + 1 THEN RAISE EXCEPTION 'Invalid day' USING ERRCODE = '22023'; END IF;
 allowed := public.current_feature_daily_usage_limit(p_feature);
 INSERT INTO public.daily_usage (user_id, feature, usage_day, used) VALUES (uid, p_feature, p_day, 0) ON CONFLICT (user_id, feature, usage_day) DO NOTHING;
 SELECT used INTO new_used FROM public.daily_usage WHERE user_id = uid AND feature = p_feature AND usage_day = p_day FOR UPDATE;
 IF allowed IS NOT NULL AND new_used >= allowed THEN RAISE EXCEPTION 'Daily limit reached' USING ERRCODE = '23514'; END IF;
 UPDATE public.daily_usage SET used = used + 1, updated_at = now() WHERE user_id = uid AND feature = p_feature AND usage_day = p_day RETURNING used INTO new_used;
 RETURN new_used;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_daily_usage(text,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text,date) TO authenticated, service_role;