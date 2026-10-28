CREATE OR REPLACE FUNCTION public.plan_daily_usage_limit(p_plan text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT CASE regexp_replace(lower(trim(coalesce(p_plan, 'free'))), '[[:space:]_-]+', '', 'g')
 WHEN 'standard' THEN 3 WHEN 'standardmember' THEN 3 WHEN 'スタンダード' THEN 3 WHEN 'スタンダード会員' THEN 3
 WHEN 'vip' THEN 10 WHEN 'vipmember' THEN 10 WHEN 'vip会員' THEN 10
 WHEN 'b2b' THEN 30 WHEN 'business' THEN 30 WHEN 'corporate' THEN 30 WHEN 'family' THEN 30 WHEN 'familymember' THEN 30 WHEN 'ファミリー' THEN 30 WHEN 'ファミリー会員' THEN 30
 WHEN 'b2bpremium' THEN NULL WHEN 'businesspremium' THEN NULL WHEN 'corporatepremium' THEN NULL WHEN 'familypremium' THEN NULL WHEN 'familypremiummember' THEN NULL WHEN 'ファミリープレミアム' THEN NULL WHEN 'ファミリープレミアム会員' THEN NULL
 ELSE 1 END;
$$;
REVOKE ALL ON FUNCTION public.plan_daily_usage_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plan_daily_usage_limit(text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.consume_daily_usage(p_feature text, p_day date)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
 uid uuid := auth.uid();
 current_plan text; previous_plan text; expires_at timestamptz;
 allowed integer; new_used integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
 IF p_feature NOT IN ('consultation','compatibility') THEN RAISE EXCEPTION 'Unknown feature' USING ERRCODE = '22023'; END IF;
 IF p_day < (now() AT TIME ZONE 'UTC')::date - 1 OR p_day > (now() AT TIME ZONE 'UTC')::date + 1 THEN RAISE EXCEPTION 'Invalid day' USING ERRCODE = '22023'; END IF;
 SELECT plan, debug_previous_plan, debug_expires_at INTO current_plan, previous_plan, expires_at FROM public.plan_memberships WHERE user_id = uid;
 IF expires_at IS NOT NULL AND expires_at <= now() THEN current_plan := coalesce(previous_plan, 'free'); END IF;
 allowed := public.plan_daily_usage_limit(current_plan);
 INSERT INTO public.daily_usage (user_id, feature, usage_day, used) VALUES (uid, p_feature, p_day, 0) ON CONFLICT (user_id, feature, usage_day) DO NOTHING;
 SELECT used INTO new_used FROM public.daily_usage WHERE user_id = uid AND feature = p_feature AND usage_day = p_day FOR UPDATE;
 IF allowed IS NOT NULL AND new_used >= allowed THEN RAISE EXCEPTION 'Daily limit reached' USING ERRCODE = '23514'; END IF;
 UPDATE public.daily_usage SET used = used + 1, updated_at = now() WHERE user_id = uid AND feature = p_feature AND usage_day = p_day RETURNING used INTO new_used;
 RETURN new_used;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_daily_usage(text,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text,date) TO authenticated, service_role;