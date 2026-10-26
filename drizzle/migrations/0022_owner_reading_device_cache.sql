CREATE TABLE public.reading_device_cache (user_id uuid NOT NULL, cache_key text NOT NULL, result jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,cache_key));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_device_cache TO authenticated;
GRANT ALL ON public.reading_device_cache TO service_role;
ALTER TABLE public.reading_device_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own reading cache" ON public.reading_device_cache FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
COMMENT ON TABLE public.reading_device_cache IS 'Private device cache copies only, not validated divination results or entitlements';
ALTER PUBLICATION supabase_realtime ADD TABLE public.reading_device_cache;