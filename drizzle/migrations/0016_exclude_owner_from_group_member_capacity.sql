CREATE OR REPLACE FUNCTION public.enforce_team_group_member_capacity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE current_plan text; previous_plan text; expires_at timestamptz; allowed_count integer; used_count integer;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Authenticated ownership required' USING ERRCODE = '42501';
  END IF;
  SELECT plan, debug_previous_plan, debug_expires_at INTO current_plan, previous_plan, expires_at
    FROM public.plan_memberships WHERE user_id = NEW.user_id;
  IF expires_at IS NOT NULL AND expires_at <= now() THEN current_plan := coalesce(previous_plan, 'free'); END IF;
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
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_team_group_member_capacity() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_team_group_member_capacity() TO service_role;
CREATE TRIGGER team_groups_member_capacity BEFORE INSERT OR UPDATE OF member_ids ON public.team_groups
FOR EACH ROW EXECUTE FUNCTION public.enforce_team_group_member_capacity();
COMMENT ON FUNCTION public.enforce_team_group_member_capacity() IS 'Counts distinct non-owner participants only; account-holder nil UUID consumes no slot. Group-count caps remain separate.';