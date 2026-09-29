CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  gender text NOT NULL DEFAULT 'undisclosed',
  blood_type text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own members" ON public.team_members FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Add own members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Update own members" ON public.team_members FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Delete own members" ON public.team_members FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE INDEX team_members_user_idx ON public.team_members(user_id);