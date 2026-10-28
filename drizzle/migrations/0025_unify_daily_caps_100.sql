-- Generated from src/lib/plan-consultation-limits.json; regression tests verify this payload.
CREATE OR REPLACE FUNCTION public.plan_daily_usage_limit(p_plan text)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
 SELECT ('{"free":1,"standard":3,"vip":10,"b2b":30,"b2b-premium":100}'::jsonb ->> CASE regexp_replace(lower(normalize(trim(coalesce(p_plan, 'free')), NFKC)), '[[:space:]_-]+', '', 'g')
 WHEN 'standard' THEN 'standard' WHEN 'standardmember' THEN 'standard' WHEN 'スタンダード' THEN 'standard' WHEN 'スタンダード会員' THEN 'standard'
 WHEN 'vip' THEN 'vip' WHEN 'vipmember' THEN 'vip' WHEN 'vip会員' THEN 'vip'
 WHEN 'b2b' THEN 'b2b' WHEN 'business' THEN 'b2b' WHEN 'corporate' THEN 'b2b' WHEN 'family' THEN 'b2b' WHEN 'familymember' THEN 'b2b' WHEN 'ファミリー' THEN 'b2b' WHEN 'ファミリー会員' THEN 'b2b'
 WHEN 'b2bpremium' THEN 'b2b-premium' WHEN 'businesspremium' THEN 'b2b-premium' WHEN 'corporatepremium' THEN 'b2b-premium' WHEN 'familypremium' THEN 'b2b-premium' WHEN 'familypremiummember' THEN 'b2b-premium' WHEN 'ファミリープレミアム' THEN 'b2b-premium' WHEN 'ファミリープレミアム会員' THEN 'b2b-premium'
 ELSE 'free' END)::integer;
$$;
REVOKE ALL ON FUNCTION public.plan_daily_usage_limit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.plan_daily_usage_limit(text) TO authenticated, service_role;