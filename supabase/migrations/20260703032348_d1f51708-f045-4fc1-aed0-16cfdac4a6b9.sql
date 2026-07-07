-- Add slug + featured to items (additive only)
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- Slugify helper: transliteration-lite; keeps Arabic + latin + digits, replaces others with '-'
CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(_input, '')), '[^a-z0-9\u0600-\u06FF]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- Backfill: base slug from title, append short id suffix to guarantee uniqueness
UPDATE public.items
SET slug = COALESCE(NULLIF(public.slugify(title), ''), 'item') || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL OR slug = '';

-- Enforce uniqueness going forward
CREATE UNIQUE INDEX IF NOT EXISTS items_slug_key ON public.items (slug);

-- Trigger: auto-fill slug on insert/update when missing
CREATE OR REPLACE FUNCTION public.items_set_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base := COALESCE(NULLIF(public.slugify(NEW.title), ''), 'item');
    candidate := base;
    WHILE EXISTS (SELECT 1 FROM public.items WHERE slug = candidate AND id <> NEW.id) LOOP
      n := n + 1;
      candidate := base || '-' || n::text;
    END LOOP;
    NEW.slug := candidate;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS items_set_slug_trg ON public.items;
CREATE TRIGGER items_set_slug_trg
BEFORE INSERT OR UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.items_set_slug();