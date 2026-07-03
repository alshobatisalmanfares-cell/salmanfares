-- Make slugify a plain invoker function with fixed search_path, restrict execution
CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(_input, '')), '[^a-z0-9\u0600-\u06FF]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

REVOKE ALL ON FUNCTION public.slugify(text) FROM PUBLIC, anon, authenticated;

-- items_set_slug is a trigger function; keep SECURITY DEFINER but restrict direct EXECUTE
REVOKE ALL ON FUNCTION public.items_set_slug() FROM PUBLIC, anon, authenticated;