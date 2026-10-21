CREATE TABLE public.push_devices (
  token text PRIMARY KEY,
  user_id uuid NOT NULL,
  timezone text NOT NULL DEFAULT 'Asia/Tokyo',
  language text NOT NULL DEFAULT 'ja',
  reminders jsonb NOT NULL DEFAULT '{}'::jsonb,
  paused boolean NOT NULL DEFAULT false,
  last_sent jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_devices TO authenticated;
GRANT ALL ON public.push_devices TO service_role;
ALTER TABLE public.push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own devices select" ON public.push_devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own devices insert" ON public.push_devices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own devices update" ON public.push_devices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own devices delete" ON public.push_devices FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX push_devices_user_idx ON public.push_devices(user_id);