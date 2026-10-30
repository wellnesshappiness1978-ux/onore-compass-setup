CREATE TABLE public.vip_whitelists (
  email text PRIMARY KEY,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.vip_whitelists TO service_role;
ALTER TABLE public.vip_whitelists ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.effective_membership_plan(p_user_id uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.plan_memberships%ROWTYPE; listed boolean;
BEGIN
  SELECT * INTO r FROM public.plan_memberships WHERE user_id = p_user_id;
  IF r.debug_expires_at IS NOT NULL AND r.debug_expires_at > now() THEN RETURN coalesce(r.plan, 'free'); END IF;
  SELECT EXISTS (SELECT 1 FROM auth.users u JOIN public.vip_whitelists w ON lower(trim(w.email)) = lower(trim(u.email)) WHERE u.id = p_user_id AND u.email IS NOT NULL) INTO listed;
  IF listed THEN RETURN 'b2b-premium'; END IF;
  IF r.debug_expires_at IS NOT NULL THEN RETURN public.expire_stripe_membership_plan(r.debug_previous_plan, r.stripe_customer_id, r.stripe_valid_until); END IF;
  RETURN public.expire_stripe_membership_plan(r.plan, r.stripe_customer_id, r.stripe_valid_until);
END $$;
REVOKE ALL ON FUNCTION public.effective_membership_plan(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.my_membership_plan()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  RETURN public.effective_membership_plan(auth.uid());
END $$;
REVOKE ALL ON FUNCTION public.my_membership_plan() FROM anon;
GRANT EXECUTE ON FUNCTION public.my_membership_plan() TO authenticated;

CREATE OR REPLACE FUNCTION public.am_i_vip_whitelisted()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM auth.users u JOIN public.vip_whitelists w ON lower(trim(w.email)) = lower(trim(u.email)) WHERE u.id = auth.uid() AND u.email IS NOT NULL)
$$;
REVOKE ALL ON FUNCTION public.am_i_vip_whitelisted() FROM anon;
GRANT EXECUTE ON FUNCTION public.am_i_vip_whitelisted() TO authenticated;

CREATE OR REPLACE FUNCTION public.can_switch_test_plan()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND (public.has_role(auth.uid(), 'admin') OR public.am_i_vip_whitelisted())
$$;
REVOKE ALL ON FUNCTION public.can_switch_test_plan() FROM anon;
GRANT EXECUTE ON FUNCTION public.can_switch_test_plan() TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_vip_whitelist()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR NOT public.am_i_vip_whitelisted() THEN RETURN false; END IF;
  INSERT INTO public.plan_memberships(user_id, plan) VALUES (uid, 'b2b-premium')
  ON CONFLICT (user_id) DO UPDATE SET plan = 'b2b-premium', updated_at = now()
    WHERE public.plan_memberships.plan IS DISTINCT FROM 'b2b-premium'
      AND (public.plan_memberships.debug_expires_at IS NULL OR public.plan_memberships.debug_expires_at <= now());
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.claim_vip_whitelist() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_vip_whitelist() TO authenticated;

CREATE OR REPLACE FUNCTION public.consultation_usage_status()
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE uid uuid := auth.uid(); tier text; cap integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 tier := public.effective_membership_plan(uid);
 cap:=public.plan_consultation_usage_limit(tier);
 RETURN jsonb_build_object('plan',coalesce(tier,'free'),'limit',cap,'counts',coalesce((SELECT jsonb_object_agg(usage_day::text,used) FROM public.daily_usage WHERE user_id=uid AND feature='consultation' AND usage_day BETWEEN (now() AT TIME ZONE 'UTC')::date-1 AND (now() AT TIME ZONE 'UTC')::date+1),'{}'::jsonb));
END; $function$;

CREATE OR REPLACE FUNCTION public.current_feature_daily_usage_limit(p_feature text)
 RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE current_plan text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501'; END IF;
 IF p_feature NOT IN ('consultation','compatibility') THEN RAISE EXCEPTION 'Unknown feature' USING ERRCODE = '22023'; END IF;
 current_plan := public.effective_membership_plan(auth.uid());
 IF p_feature = 'consultation' THEN RETURN public.plan_consultation_usage_limit(current_plan); END IF;
 RETURN public.plan_daily_usage_limit(current_plan);
END; $function$;

CREATE OR REPLACE FUNCTION public.reserve_consultation_usage(p_user_id uuid, p_day date)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE tier text; cap integer; used_count integer; pending_count integer; reservation uuid;
BEGIN
 IF p_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF p_day IS NULL OR p_day < (now() AT TIME ZONE 'UTC')::date-1 OR p_day > (now() AT TIME ZONE 'UTC')::date+1 THEN RAISE EXCEPTION 'Invalid day' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('consultation:'||p_user_id::text,0));
 tier := public.effective_membership_plan(p_user_id);
 cap:=public.plan_consultation_usage_limit(tier);
 SELECT coalesce(used,0) INTO used_count FROM public.daily_usage WHERE user_id=p_user_id AND feature='consultation' AND usage_day=p_day;
 SELECT count(*) INTO pending_count FROM public.consultation_usage_requests WHERE user_id=p_user_id AND usage_day=p_day AND status='pending' AND created_at>now()-interval '1 hour';
 IF cap IS NOT NULL AND coalesce(used_count,0)>=cap THEN RAISE EXCEPTION 'Daily limit reached' USING ERRCODE='23514'; END IF;
 IF cap IS NOT NULL AND coalesce(used_count,0)+pending_count>=cap THEN RAISE EXCEPTION 'Consultation already in progress' USING ERRCODE='55P03'; END IF;
 INSERT INTO public.consultation_usage_requests(user_id,usage_day) VALUES(p_user_id,p_day) RETURNING id INTO reservation;
 RETURN reservation;
END; $function$;

CREATE OR REPLACE FUNCTION public.enforce_team_member_plan_limit()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE current_plan text; allowed_count integer; current_count integer;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Authenticated ownership required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));
  current_plan := public.effective_membership_plan(NEW.user_id);
  allowed_count := CASE coalesce(current_plan, 'free')
    WHEN 'standard' THEN 3 WHEN 'vip' THEN 10 WHEN 'b2b' THEN 30 WHEN 'b2b-premium' THEN 100 ELSE 0 END;
  SELECT count(*) INTO current_count FROM public.team_members WHERE user_id = NEW.user_id AND (TG_OP <> 'UPDATE' OR id <> NEW.id);
  IF current_count >= allowed_count THEN
    RAISE EXCEPTION 'Family member limit reached for current plan' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END; $function$;

CREATE OR REPLACE FUNCTION public.enforce_team_group_plan_limit()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_plan text; v_limit int; v_count int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('team_groups:' || NEW.user_id::text));
  v_plan := public.effective_membership_plan(NEW.user_id);
  v_limit := CASE coalesce(v_plan, 'free') WHEN 'standard' THEN 1 WHEN 'vip' THEN 3 WHEN 'b2b' THEN 10 WHEN 'b2b-premium' THEN 30 ELSE 0 END;
  SELECT count(*) INTO v_count FROM public.team_groups WHERE user_id = NEW.user_id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'group limit reached' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.enforce_team_group_member_capacity()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE current_plan text; allowed_count integer; used_count integer;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Authenticated ownership required' USING ERRCODE = '42501';
  END IF;
  current_plan := public.effective_membership_plan(NEW.user_id);
  allowed_count := CASE coalesce(current_plan, 'free') WHEN 'standard' THEN 3 WHEN 'vip' THEN 10 WHEN 'b2b' THEN 30 WHEN 'b2b-premium' THEN 100 ELSE 0 END;
  SELECT count(DISTINCT id) INTO used_count FROM unnest(NEW.member_ids) AS selected(id)
    WHERE id <> '00000000-0000-0000-0000-000000000000'::uuid;
  IF used_count > allowed_count THEN
    RAISE EXCEPTION 'GROUP_MEMBER_LIMIT: family participant capacity reached' USING ERRCODE = '23514';
  END IF;
  IF EXISTS (SELECT 1 FROM unnest(NEW.member_ids) AS selected(id)
    WHERE id IS NULL OR (id <> '00000000-0000-0000-0000-000000000000'::uuid
      AND NOT EXISTS (SELECT 1 FROM public.team_members m WHERE m.id = selected.id AND m.user_id = NEW.user_id))) THEN
    RAISE EXCEPTION 'Invalid group member ownership' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END; $function$;