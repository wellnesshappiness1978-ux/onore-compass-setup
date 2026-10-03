CREATE TABLE public.support_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), category text NOT NULL CHECK (category IN ('bug','account','privacy','other')), subject text NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 120), message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 4000), status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','in_progress','resolved')), created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT ON public.support_requests TO authenticated;
GRANT ALL ON public.support_requests TO service_role;
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own support requests" ON public.support_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users submit own support requests" ON public.support_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'received');
CREATE INDEX support_requests_owner_created ON public.support_requests(user_id, created_at DESC);