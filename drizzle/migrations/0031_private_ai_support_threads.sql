CREATE TABLE public.ai_support_threads (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 title text NOT NULL DEFAULT 'AI support' CHECK (char_length(title) BETWEEN 1 AND 120),
 messages jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(messages) = 'array'),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 pending_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_support_threads TO authenticated;
GRANT ALL ON public.ai_support_threads TO service_role;
ALTER TABLE public.ai_support_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_thread_owner ON public.ai_support_threads FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX ai_support_threads_owner_updated ON public.ai_support_threads(user_id, updated_at DESC);
CREATE TABLE public.ai_support_provider_blocks (
 provider text PRIMARY KEY,
 reason text NOT NULL,
 status integer NOT NULL DEFAULT 403,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_support_provider_blocks TO service_role;
ALTER TABLE public.ai_support_provider_blocks ENABLE ROW LEVEL SECURITY;