DROP POLICY IF EXISTS "public read item-images" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'admin read item-images'
  ) THEN
    CREATE POLICY "admin read item-images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING ((bucket_id = 'item-images') AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;