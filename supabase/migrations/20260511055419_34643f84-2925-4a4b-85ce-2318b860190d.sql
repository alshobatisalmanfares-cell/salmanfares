-- Allow 'games' category and add gallery field
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_category_check;
ALTER TABLE public.items ADD CONSTRAINT items_category_check
  CHECK (category = ANY (ARRAY['apps'::text, 'websites'::text, 'games'::text]));

ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}'::text[];

-- Site settings table (single-row keyed by id='main')
CREATE TABLE IF NOT EXISTS public.site_settings (
  id text PRIMARY KEY DEFAULT 'main',
  hero_title_ar text NOT NULL DEFAULT 'اكتشف',
  hero_title_en text NOT NULL DEFAULT 'Discover',
  hero_highlight_ar text NOT NULL DEFAULT 'أفضل التطبيقات والمواقع والألعاب',
  hero_highlight_en text NOT NULL DEFAULT 'the best apps, websites & games',
  hero_subtitle_ar text NOT NULL DEFAULT 'مكتبة مختارة من الأدوات الرقمية المفيدة، تُحدَّث باستمرار.',
  hero_subtitle_en text NOT NULL DEFAULT 'A curated library of useful digital tools, updated regularly.',
  primary_color text NOT NULL DEFAULT '#7DD8FF',
  secondary_color text NOT NULL DEFAULT '#B891FF',
  accent_color text NOT NULL DEFAULT '#9FB7FF',
  bg_color_1 text NOT NULL DEFAULT '#7DD8FF',
  bg_color_2 text NOT NULL DEFAULT '#B891FF',
  base_font_size integer NOT NULL DEFAULT 16,
  heading_scale numeric NOT NULL DEFAULT 1.0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings public read" ON public.site_settings;
CREATE POLICY "site_settings public read" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin update site_settings" ON public.site_settings;
CREATE POLICY "admin update site_settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admin insert site_settings" ON public.site_settings;
CREATE POLICY "admin insert site_settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));