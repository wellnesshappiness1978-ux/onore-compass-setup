ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS nickname text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal_preset text NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_kind text NOT NULL DEFAULT 'self';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_id uuid;

CREATE TABLE public.team_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  nickname text NOT NULL DEFAULT '',
  member_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_groups TO authenticated;
GRANT ALL ON public.team_groups TO service_role;
ALTER TABLE public.team_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own groups" ON public.team_groups FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Add own groups" ON public.team_groups FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Update own groups" ON public.team_groups FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Delete own groups" ON public.team_groups FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.enforce_team_group_plan_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_plan text; v_limit int; v_count int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('team_groups:' || NEW.user_id::text));
  SELECT plan INTO v_plan FROM public.plan_memberships WHERE user_id = NEW.user_id;
  v_limit := CASE coalesce(v_plan, 'free') WHEN 'standard' THEN 1 WHEN 'vip' THEN 3 WHEN 'b2b' THEN 10 WHEN 'b2b-premium' THEN 30 ELSE 0 END;
  SELECT count(*) INTO v_count FROM public.team_groups WHERE user_id = NEW.user_id;
  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'group limit reached' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER team_groups_plan_limit BEFORE INSERT ON public.team_groups FOR EACH ROW EXECUTE FUNCTION public.enforce_team_group_plan_limit();