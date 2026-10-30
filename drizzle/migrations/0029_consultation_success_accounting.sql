CREATE OR REPLACE FUNCTION public.plan_consultation_usage_limit(p_plan text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT ('{"free":1,"standard":3,"vip":10,"b2b":30,"b2b-premium":null}'::jsonb ->> CASE public.plan_daily_usage_limit(p_plan) WHEN 3 THEN 'standard' WHEN 10 THEN 'vip' WHEN 30 THEN 'b2b' WHEN 100 THEN 'b2b-premium' ELSE 'free' END)::integer;
$$;
REVOKE ALL ON FUNCTION public.plan_consultation_usage_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plan_consultation_usage_limit(text) TO authenticated, service_role;
CREATE TABLE public.consultation_usage_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 usage_day date NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.consultation_usage_requests TO authenticated;
GRANT ALL ON public.consultation_usage_requests TO service_role;
ALTER TABLE public.consultation_usage_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own consultation requests" ON public.consultation_usage_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX consultation_pending_usage ON public.consultation_usage_requests(user_id, usage_day) WHERE status = 'pending';
CREATE OR REPLACE FUNCTION public.consultation_usage_status()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); tier text; previous text; expires timestamptz; cap integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 SELECT public.expire_stripe_membership_plan(plan,stripe_customer_id,stripe_valid_until), public.expire_stripe_membership_plan(debug_previous_plan,stripe_customer_id,stripe_valid_until), debug_expires_at INTO tier,previous,expires FROM public.plan_memberships WHERE user_id=uid;
 IF expires IS NOT NULL AND expires <= now() THEN tier:=coalesce(previous,'free'); END IF;
 cap:=public.plan_consultation_usage_limit(tier);
 RETURN jsonb_build_object('plan',coalesce(tier,'free'),'limit',cap,'counts',coalesce((SELECT jsonb_object_agg(usage_day::text,used) FROM public.daily_usage WHERE user_id=uid AND feature='consultation' AND usage_day BETWEEN (now() AT TIME ZONE 'UTC')::date-1 AND (now() AT TIME ZONE 'UTC')::date+1),'{}'::jsonb));
END;
$$;
REVOKE ALL ON FUNCTION public.consultation_usage_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consultation_usage_status() TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.reserve_consultation_usage(p_user_id uuid,p_day date)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE tier text; previous text; expires timestamptz; cap integer; used_count integer; pending_count integer; reservation uuid;
BEGIN
 IF p_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF p_day IS NULL OR p_day < (now() AT TIME ZONE 'UTC')::date-1 OR p_day > (now() AT TIME ZONE 'UTC')::date+1 THEN RAISE EXCEPTION 'Invalid day' USING ERRCODE='22023'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('consultation:'||p_user_id::text,0));
 SELECT public.expire_stripe_membership_plan(plan,stripe_customer_id,stripe_valid_until), public.expire_stripe_membership_plan(debug_previous_plan,stripe_customer_id,stripe_valid_until),debug_expires_at INTO tier,previous,expires FROM public.plan_memberships WHERE user_id=p_user_id;
 IF expires IS NOT NULL AND expires<=now() THEN tier:=coalesce(previous,'free'); END IF;
 cap:=public.plan_consultation_usage_limit(tier);
 SELECT coalesce(used,0) INTO used_count FROM public.daily_usage WHERE user_id=p_user_id AND feature='consultation' AND usage_day=p_day;
 SELECT count(*) INTO pending_count FROM public.consultation_usage_requests WHERE user_id=p_user_id AND usage_day=p_day AND status='pending' AND created_at>now()-interval '1 hour';
 IF cap IS NOT NULL AND coalesce(used_count,0)>=cap THEN RAISE EXCEPTION 'Daily limit reached' USING ERRCODE='23514'; END IF;
 IF cap IS NOT NULL AND coalesce(used_count,0)+pending_count>=cap THEN RAISE EXCEPTION 'Consultation already in progress' USING ERRCODE='55P03'; END IF;
 INSERT INTO public.consultation_usage_requests(user_id,usage_day) VALUES(p_user_id,p_day) RETURNING id INTO reservation;
 RETURN reservation;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_consultation_usage(uuid,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_consultation_usage(uuid,date) TO service_role;
CREATE OR REPLACE FUNCTION public.settle_consultation_usage(p_user_id uuid,p_request_id uuid,p_success boolean)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE row_data public.consultation_usage_requests; count_used integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('consultation:'||p_user_id::text,0));
 SELECT * INTO row_data FROM public.consultation_usage_requests WHERE id=p_request_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invalid consultation request' USING ERRCODE='42501'; END IF;
 IF row_data.status='pending' THEN
  IF p_success THEN
   INSERT INTO public.daily_usage(user_id,feature,usage_day,used) VALUES(p_user_id,'consultation',row_data.usage_day,1)
   ON CONFLICT(user_id,feature,usage_day) DO UPDATE SET used=daily_usage.used+1,updated_at=now();
  END IF;
  UPDATE public.consultation_usage_requests SET status=CASE WHEN p_success THEN 'succeeded' ELSE 'failed' END,updated_at=now() WHERE id=p_request_id;
 END IF;
 SELECT used INTO count_used FROM public.daily_usage WHERE user_id=p_user_id AND feature='consultation' AND usage_day=row_data.usage_day;
 RETURN coalesce(count_used,0);
END;
$$;
REVOKE ALL ON FUNCTION public.settle_consultation_usage(uuid,uuid,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.settle_consultation_usage(uuid,uuid,boolean) TO service_role;
CREATE OR REPLACE FUNCTION public.consume_daily_usage(p_feature text,p_day date)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=auth.uid(); allowed integer; new_used integer;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF p_feature<>'compatibility' THEN RAISE EXCEPTION 'Consultation usage is settled by the server' USING ERRCODE='42501'; END IF;
 IF p_day IS NULL OR p_day<(now() AT TIME ZONE 'UTC')::date-1 OR p_day>(now() AT TIME ZONE 'UTC')::date+1 THEN RAISE EXCEPTION 'Invalid day' USING ERRCODE='22023'; END IF;
 allowed:=public.current_feature_daily_usage_limit(p_feature);
 INSERT INTO public.daily_usage(user_id,feature,usage_day,used) VALUES(uid,p_feature,p_day,0) ON CONFLICT(user_id,feature,usage_day) DO NOTHING;
 SELECT used INTO new_used FROM public.daily_usage WHERE user_id=uid AND feature=p_feature AND usage_day=p_day FOR UPDATE;
 IF new_used>=allowed THEN RAISE EXCEPTION 'Daily limit reached' USING ERRCODE='23514'; END IF;
 UPDATE public.daily_usage SET used=used+1,updated_at=now() WHERE user_id=uid AND feature=p_feature AND usage_day=p_day RETURNING used INTO new_used;
 RETURN new_used;
END;
$$;
REVOKE ALL ON FUNCTION public.consume_daily_usage(text,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_daily_usage(text,date) TO authenticated,service_role;