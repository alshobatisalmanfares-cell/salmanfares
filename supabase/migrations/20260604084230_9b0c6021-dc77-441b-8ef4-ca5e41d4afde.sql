
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS developer text,
  ADD COLUMN IF NOT EXISTS license text,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS os text,
  ADD COLUMN IF NOT EXISTS file_type text,
  ADD COLUMN IF NOT EXISTS file_size text,
  ADD COLUMN IF NOT EXISTS update_date text;
