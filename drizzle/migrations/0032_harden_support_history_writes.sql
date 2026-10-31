REVOKE UPDATE ON public.ai_support_threads FROM authenticated;
DROP POLICY support_thread_owner ON public.ai_support_threads;
CREATE POLICY support_thread_owner_read ON public.ai_support_threads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY support_thread_owner_insert ON public.ai_support_threads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND messages = '[]'::jsonb AND pending_at IS NULL);
CREATE POLICY support_thread_owner_delete ON public.ai_support_threads FOR DELETE TO authenticated USING (user_id = auth.uid());