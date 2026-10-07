ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS name_kana text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS birth_time time without time zone,
  ADD COLUMN IF NOT EXISTS birth_time_unknown boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS birth_place text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS birth_city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS relationship text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS relationship_type text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.team_members.name_kana IS 'Phonetic reading of the related person name';
COMMENT ON COLUMN public.team_members.birth_time IS 'Known local birth time; null when unknown';
COMMENT ON COLUMN public.team_members.birth_time_unknown IS 'Whether the birth time is unknown';
COMMENT ON COLUMN public.team_members.birth_place IS 'Birth prefecture, region, or country';
COMMENT ON COLUMN public.team_members.birth_city IS 'Birth city or municipality';
COMMENT ON COLUMN public.team_members.relationship IS 'Free-form relationship or role label';
COMMENT ON COLUMN public.team_members.relationship_type IS 'Normalized relationship category for guidance';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;