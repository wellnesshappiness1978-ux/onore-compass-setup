CREATE TABLE public.consultation_bookmarks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 message_id text NOT NULL,
 content text NOT NULL,
 language text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (user_id, message_id)
);
GRANT SELECT, INSERT, DELETE ON public.consultation_bookmarks TO authenticated;
GRANT ALL ON public.consultation_bookmarks TO service_role;
ALTER TABLE public.consultation_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own consultation favorites" ON public.consultation_bookmarks FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Save own consultation favorites" ON public.consultation_bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Delete own consultation favorites" ON public.consultation_bookmarks FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE INDEX consultation_bookmarks_owner_created ON public.consultation_bookmarks (user_id, created_at DESC);