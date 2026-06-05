ALTER TABLE public.items ADD COLUMN categories text[] NOT NULL DEFAULT '{}';
UPDATE public.items SET categories = ARRAY[category]::text[] WHERE category IS NOT NULL AND category <> '';
ALTER TABLE public.items DROP COLUMN category;
ALTER TABLE public.items ADD CONSTRAINT items_categories_valid CHECK (
  categories <@ ARRAY['apps','games','websites','ai']::text[]
);
CREATE INDEX IF NOT EXISTS items_categories_gin ON public.items USING GIN (categories);