CREATE TABLE public.plan_memberships (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'standard', 'vip', 'b2b', 'b2b-premium')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plan_memberships TO authenticated;
GRANT ALL ON public.plan_memberships TO service_role;
ALTER TABLE public.plan_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own membership" ON public.plan_memberships FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE FUNCTION public.enforce_team_member_plan_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_plan text;
  allowed_count integer;
  current_count integer;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Authenticated ownership required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));
  SELECT plan INTO current_plan FROM public.plan_memberships WHERE user_id = NEW.user_id;
  allowed_count := CASE coalesce(current_plan, 'free')
    WHEN 'standard' THEN 2 WHEN 'vip' THEN 5 WHEN 'b2b' THEN 30 WHEN 'b2b-premium' THEN 100 ELSE 0 END;
  SELECT count(*) INTO current_count FROM public.team_members WHERE user_id = NEW.user_id AND (TG_OP <> 'UPDATE' OR id <> NEW.id);
  IF current_count >= allowed_count THEN
    RAISE EXCEPTION 'Member limit reached for current plan' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_team_member_plan_limit BEFORE INSERT OR UPDATE OF user_id ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.enforce_team_member_plan_limit();