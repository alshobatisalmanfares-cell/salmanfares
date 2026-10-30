CREATE TABLE public.user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_memories TO authenticated;
GRANT ALL ON public.user_memories TO service_role;
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memories select" ON public.user_memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own memories insert" ON public.user_memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own memories delete" ON public.user_memories FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX user_memories_user_idx ON public.user_memories(user_id, created_at DESC);