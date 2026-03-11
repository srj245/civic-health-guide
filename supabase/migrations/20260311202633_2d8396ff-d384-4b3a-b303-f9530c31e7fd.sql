
CREATE TABLE public.comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_id uuid REFERENCES public.bill_comments(id) ON DELETE CASCADE NOT NULL,
  vote smallint NOT NULL CHECK (vote IN (-1, 1)),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);

ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view votes"
ON public.comment_votes FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert their own votes"
ON public.comment_votes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.comment_votes FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.comment_votes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
