CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'محادثة جديدة',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_chat_sessions TO authenticated;
GRANT ALL ON public.ai_chat_sessions TO service_role;

ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_chat_sessions'
      AND policyname = 'Users can view their own AI chat sessions'
  ) THEN
    CREATE POLICY "Users can view their own AI chat sessions"
    ON public.ai_chat_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_chat_sessions'
      AND policyname = 'Users can create their own AI chat sessions'
  ) THEN
    CREATE POLICY "Users can create their own AI chat sessions"
    ON public.ai_chat_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_chat_sessions'
      AND policyname = 'Users can update their own AI chat sessions'
  ) THEN
    CREATE POLICY "Users can update their own AI chat sessions"
    ON public.ai_chat_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_chat_sessions'
      AND policyname = 'Users can delete their own AI chat sessions'
  ) THEN
    CREATE POLICY "Users can delete their own AI chat sessions"
    ON public.ai_chat_sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS ai_chat_sessions_user_updated_idx
ON public.ai_chat_sessions (user_id, updated_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_ai_chat_sessions_updated_at'
  ) THEN
    CREATE TRIGGER set_ai_chat_sessions_updated_at
    BEFORE UPDATE ON public.ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;