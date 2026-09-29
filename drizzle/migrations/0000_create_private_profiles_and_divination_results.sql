CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  name_kanji text NOT NULL DEFAULT '',
  name_kana text NOT NULL DEFAULT '',
  name_romaji text NOT NULL DEFAULT '',
  gender text NOT NULL DEFAULT 'undisclosed' CHECK (gender IN ('female', 'male', 'other', 'undisclosed')),
  birth_city text NOT NULL DEFAULT '',
  birth_date date,
  birth_time time,
  birth_time_unknown boolean NOT NULL DEFAULT false,
  birth_place text NOT NULL DEFAULT '',
  blood_type text NOT NULL DEFAULT '' CHECK (blood_type IN ('', 'A', 'B', 'O', 'AB')),
  sibling_order text NOT NULL DEFAULT '' CHECK (sibling_order IN ('', 'first', 'middle', 'last', 'only')),
  profile_version uuid NOT NULL DEFAULT gen_random_uuid(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "Create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "Delete own profile" ON public.profiles FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

CREATE TABLE public.divination_results (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 art_id text NOT NULL CHECK (art_id IN ('four_pillars','numerology','western_astrology','tarot','name_analysis','nine_star_ki','runes','palmistry','animal_astrology','color_reading','sanmeigaku','lunar_mansion','i_ching','kabbalah_numerology','zi_wei_dou_shu')),
 profile_version uuid NOT NULL,
 methodology text NOT NULL,
 result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (user_id, art_id, profile_version)
);
GRANT SELECT ON public.divination_results TO authenticated;
GRANT ALL ON public.divination_results TO service_role;
ALTER TABLE public.divination_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own validated results" ON public.divination_results FOR SELECT TO authenticated USING (user_id = (select auth.uid()) AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = (select auth.uid()) AND p.profile_version = divination_results.profile_version));
CREATE INDEX divination_results_user_version_idx ON public.divination_results (user_id, profile_version);