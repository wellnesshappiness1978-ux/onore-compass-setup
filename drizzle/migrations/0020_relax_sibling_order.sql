ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_sibling_order_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_sibling_order_length CHECK (char_length(sibling_order) <= 80);