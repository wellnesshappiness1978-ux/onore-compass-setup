CREATE TABLE public.invitation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  plan_tier text NOT NULL DEFAULT 'family_premium',
  max_uses_ios integer NOT NULL DEFAULT 30,
  max_uses_android integer NOT NULL DEFAULT 30,
  current_uses_ios integer NOT NULL DEFAULT 0,
  current_uses_android integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.invitation_codes TO service_role;
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code_id uuid NOT NULL REFERENCES public.invitation_codes(id),
  platform text NOT NULL CHECK (platform IN ('ios','android')),
  used_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_invitations TO authenticated;
GRANT ALL ON public.user_invitations TO service_role;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own invitation" ON public.user_invitations FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

INSERT INTO public.invitation_codes (code, plan_tier, expires_at) VALUES ('AGOLMEN2026VIP', 'family_premium', '2026-12-31 23:59:59+09');

CREATE OR REPLACE FUNCTION public.redeem_invitation_code(p_code text, p_platform text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); c public.invitation_codes%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RETURN 'signin'; END IF;
  IF p_platform NOT IN ('ios','android') THEN RETURN 'app_only'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_invitations WHERE user_id = uid) THEN RETURN 'already'; END IF;
  SELECT * INTO c FROM public.invitation_codes WHERE code = upper(trim(coalesce(p_code,''))) FOR UPDATE;
  IF NOT FOUND OR NOT c.is_active OR (c.expires_at IS NOT NULL AND c.expires_at <= now()) THEN RETURN 'invalid'; END IF;
  IF p_platform = 'ios' THEN
    IF c.current_uses_ios >= c.max_uses_ios THEN RETURN 'full'; END IF;
    UPDATE public.invitation_codes SET current_uses_ios = current_uses_ios + 1 WHERE id = c.id;
  ELSE
    IF c.current_uses_android >= c.max_uses_android THEN RETURN 'full'; END IF;
    UPDATE public.invitation_codes SET current_uses_android = current_uses_android + 1 WHERE id = c.id;
  END IF;
  INSERT INTO public.user_invitations (user_id, code_id, platform) VALUES (uid, c.id, p_platform);
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.redeem_invitation_code(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_invitation_code(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.effective_membership_plan(p_user_id uuid)
 RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.plan_memberships%ROWTYPE; listed boolean; invited boolean;
BEGIN
  SELECT * INTO r FROM public.plan_memberships WHERE user_id = p_user_id;
  IF r.debug_expires_at IS NOT NULL AND r.debug_expires_at > now() THEN RETURN coalesce(r.plan, 'free'); END IF;
  SELECT EXISTS (SELECT 1 FROM auth.users u JOIN public.vip_whitelists w ON lower(trim(w.email)) = lower(trim(u.email)) WHERE u.id = p_user_id AND u.email IS NOT NULL) INTO listed;
  IF listed THEN RETURN 'b2b-premium'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.user_invitations i JOIN public.invitation_codes c ON c.id = i.code_id WHERE i.user_id = p_user_id AND c.is_active AND (c.expires_at IS NULL OR c.expires_at > now())) INTO invited;
  IF invited THEN RETURN 'b2b-premium'; END IF;
  IF r.debug_expires_at IS NOT NULL THEN RETURN public.expire_stripe_membership_plan(r.debug_previous_plan, r.stripe_customer_id, r.stripe_valid_until); END IF;
  RETURN public.expire_stripe_membership_plan(r.plan, r.stripe_customer_id, r.stripe_valid_until);
END $function$;