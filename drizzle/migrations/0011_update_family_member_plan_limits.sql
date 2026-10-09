CREATE OR REPLACE FUNCTION public.enforce_team_member_plan_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_plan text;
  previous_plan text;
  expires_at timestamptz;
  allowed_count integer;
  current_count integer;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Authenticated ownership required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));
  SELECT plan, debug_previous_plan, debug_expires_at INTO current_plan, previous_plan, expires_at FROM public.plan_memberships WHERE user_id = NEW.user_id;
  IF expires_at IS NOT NULL AND expires_at <= now() THEN current_plan := coalesce(previous_plan, 'free'); END IF;
  allowed_count := CASE coalesce(current_plan, 'free')
    WHEN 'standard' THEN 3 WHEN 'vip' THEN 10 WHEN 'b2b' THEN 30 WHEN 'b2b-premium' THEN 100 ELSE 0 END;
  SELECT count(*) INTO current_count FROM public.team_members WHERE user_id = NEW.user_id AND (TG_OP <> 'UPDATE' OR id <> NEW.id);
  IF current_count >= allowed_count THEN
    RAISE EXCEPTION 'Family member limit reached for current plan' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$function$;