ALTER TABLE public.team_members
ADD COLUMN sibling_order text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.team_members.sibling_order IS 'Optional sibling-order context for private related-person readings.';