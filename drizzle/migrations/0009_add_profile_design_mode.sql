ALTER TABLE public.profiles
ADD COLUMN design_mode text NOT NULL DEFAULT 'classic';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_design_mode_valid CHECK (design_mode IN (
  'classic', 'pure-white', 'masculine', 'feminine', 'masculine-luxe',
  'feminine-luxe', 'aura-gold-luxe', 'business-night', 'business-day',
  'business-platinum', 'business-cosmos', 'business-emperor',
  'business-geometry', 'business-dragon', 'business-zero'
));

COMMENT ON COLUMN public.profiles.design_mode IS 'User-selected appearance ID; entitlement is enforced separately at render time.';