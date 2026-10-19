CREATE OR REPLACE FUNCTION public.consume_daily_usage(p_feature text, p_day date)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  current_plan text; previous_plan text; expires_at timestamptz;
  allowed integer; new_used integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
  IF p_feature NOT IN ('consultation','compatibility') THEN RAISE EXCEPTION 'Unknown feature' USING ERRCODE = '22023'; END IF;
  IF p_day < (now() AT TIME ZONE 'UTC')::date - 1 OR p_day > (now() AT TIME ZONE 'UTC')::date + 1 THEN
    RAISE EXCEPTION 'Invalid day' USING ERRCODE = '22023';
  END IF;
  SELECT plan, debug_previous_plan, debug_expires_at INTO current_plan, previous_plan, expires_at FROM public.plan_memberships WHERE user_id = uid;
  IF expires_at IS NOT NULL AND expires_at <= now() THEN current_plan := coalesce(previous_plan, 'free'); END IF;
  allowed := CASE coalesce(current_plan, 'free') WHEN 'standard' THEN 3 WHEN 'vip' THEN 10 WHEN 'b2b' THEN 30 WHEN 'b2b-premium' THEN NULL ELSE 1 END;
  INSERT INTO public.daily_usage (user_id, feature, usage_day, used) VALUES (uid, p_feature, p_day, 0)
    ON CONFLICT (user_id, feature, usage_day) DO NOTHING;
  SELECT used INTO new_used FROM public.daily_usage WHERE user_id = uid AND feature = p_feature AND usage_day = p_day FOR UPDATE;
  IF allowed IS NOT NULL AND new_used >= allowed THEN RAISE EXCEPTION 'Daily limit reached' USING ERRCODE = '23514'; END IF;
  UPDATE public.daily_usage SET used = used + 1, updated_at = now() WHERE user_id = uid AND feature = p_feature AND usage_day = p_day RETURNING used INTO new_used;
  RETURN new_used;
END;
$function$;
REVOKE ALL ON FUNCTION public.consume_daily_usage(text, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text, date) TO authenticated;